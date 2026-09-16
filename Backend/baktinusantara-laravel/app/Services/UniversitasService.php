<?php

namespace App\Services;

use App\Models\LaporanDosen;
use App\Models\ProfilDosen;
use App\Models\ProfilUniversitas;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UniversitasService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function register(array $data): ProfilUniversitas
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone_wa' => $data['phone_wa'] ?? null,
            'role' => 'universitas',
            'is_verified' => false,
        ]);

        return ProfilUniversitas::create([
            'user_id' => $user->id,
            'nama_universitas' => $data['nama_universitas'],
            'kode_univ' => $data['kode_univ'],
            'verified_at' => null,
        ])->load('user');
    }

    public function verifyByAdmin(ProfilUniversitas $univ): ProfilUniversitas
    {
        $univ->update(['verified_at' => now()]);
        $univ->user()->update(['is_verified' => true]);

        return $univ->load('user');
    }

    public function createDosen(User $userUniv, array $data): ProfilDosen
    {
        $univ = $userUniv->profilUniversitas;

        if (!$univ || !$univ->verified_at) {
            throw ValidationException::withMessages([
                'universitas' => 'Institusi universitas belum diverifikasi oleh admin platform.',
            ]);
        }

        $userDosen = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone_wa' => $data['no_hp'] ?? null,
            'role' => 'dosen',
            'is_verified' => true,
        ]);

        return ProfilDosen::create([
            'user_id' => $userDosen->id,
            'universitas_id' => $univ->id,
            'ditambahkan_oleh' => $userUniv->id,
            'nip' => $data['nip'],
            'no_hp' => $data['no_hp'] ?? null,
        ])->load('user', 'universitas');
    }

    public function listDosenByUniv(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        return ProfilDosen::where('universitas_id', $univId)
            ->with('user', 'kelompokBinaan')
            ->get();
    }

    public function listLaporanDosen(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        return LaporanDosen::whereHas('dosen', fn($q) => $q->where('universitas_id', $univId))
            ->with('dosen.user', 'desa', 'proposal.posKebutuhan')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function updateStatusLaporan(LaporanDosen $laporan, User $userUniv, string $status): LaporanDosen
    {
        $laporan->load('dosen');

        if (!$userUniv->profilUniversitas || $laporan->dosen->universitas_id !== $userUniv->profilUniversitas->id) {
            abort(403, 'Anda tidak memiliki wewenang untuk meninjau laporan ini.');
        }

        $laporan->update(['status' => $status]);

        $laporan->load('dosen.user', 'desa.user');
        if ($laporan->desa && $laporan->desa->user_id) {
            $this->notificationService->send(
                $laporan->desa->user_id,
                "Universitas telah meninjau laporan evaluasi kinerja DPL dengan status: " . strtoupper($status) . "."
            );
        }

        return $laporan;
    }

    public function listVerifiedPublic()
    {
        return ProfilUniversitas::whereNotNull('verified_at')
            ->select('id', 'nama_universitas', 'kode_univ')
            ->get();
    }

    /**
     * Metrik & statistik KKN khusus lingkup institusi kampus sendiri (LPPM).
     */
    public function getCampusMetrics(User $userUniv): array
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        // 1. Dosen & Mahasiswa internal kampus
        $totalDosen = ProfilDosen::where('universitas_id', $univId)->count();
        $totalMahasiswa = \App\Models\ProfilMahasiswa::where('universitas_id', $univId)->count();

        // 2. Kelompok KKN bimbingan dosen kampus atau mahasiswa kampus
        $kelompokQuery = \App\Models\Kelompok::where(function ($q) use ($univId) {
            $q->whereHas('dosen', fn($dq) => $dq->where('universitas_id', $univId))
              ->orWhereHas('ketua.profilMahasiswa', fn($mq) => $mq->where('universitas_id', $univId));
        });

        $totalKelompok = $kelompokQuery->count();
        $kelompokIds = (clone $kelompokQuery)->pluck('id');

        // 3. Jam Pengabdian Mahasiswa Kampus
        $progressReports = \App\Models\ProgressMingguan::whereHas('proposal', function ($q) use ($kelompokIds) {
            $q->whereIn('kelompok_id', $kelompokIds);
        })->with('proposal.kelompok.anggota')->get();

        $totalJamPengabdian = (int) $progressReports->sum(function ($p) {
            $anggotaCount = $p->proposal?->kelompok?->anggota?->count() ?: 1;
            return $anggotaCount * 40;
        });

        // 4. Status Proposal Kampus
        $proposals = \App\Models\Proposal::whereIn('kelompok_id', $kelompokIds)->get();
        $proposalBreakdown = [
            'total' => $proposals->count(),
            'menunggu' => $proposals->where('status', 'menunggu')->count(),
            'diterima' => $proposals->where('status', 'diterima')->count(),
            'ditolak' => $proposals->where('status', 'ditolak')->count(),
        ];

        // 5. Luaran Terverifikasi
        $totalLuaranTerverifikasi = \App\Models\LuaranAkhir::where('status_verifikasi', 'verified')
            ->whereHas('proposal', fn($q) => $q->whereIn('kelompok_id', $kelompokIds))
            ->count();

        // 6. Desa Terbantu Mitra Kampus
        $desaTerbantu = \App\Models\PosKebutuhan::whereHas('proposal', function ($q) use ($kelompokIds) {
            $q->whereIn('kelompok_id', $kelompokIds)->where('status', 'diterima');
        })->distinct('desa_id')->count('desa_id');

        // 7. Kontribusi SDGs Kampus
        $sdgCodes = \App\Models\PosKebutuhan::whereHas('proposal', function ($q) use ($kelompokIds) {
            $q->whereIn('kelompok_id', $kelompokIds)->where('status', 'diterima');
        })->pluck('sdg_codes');

        $sdgsDistribution = [];
        foreach ($sdgCodes as $codes) {
            if (is_array($codes)) {
                foreach ($codes as $c) {
                    $key = is_numeric($c) ? 'SDG ' . $c : (string) $c;
                    $sdgsDistribution[$key] = ($sdgsDistribution[$key] ?? 0) + 1;
                }
            }
        }
        ksort($sdgsDistribution);

        return [
            'campus_name' => $userUniv->profilUniversitas?->nama_universitas,
            'kode_univ' => $userUniv->profilUniversitas?->kode_univ,
            'total_dosen' => $totalDosen,
            'total_mahasiswa' => $totalMahasiswa,
            'total_kelompok_kkn' => $totalKelompok,
            'total_desa_terbantu' => $desaTerbantu,
            'total_jam_pengabdian' => $totalJamPengabdian,
            'total_luaran_terverifikasi' => $totalLuaranTerverifikasi,
            'status_proposal_breakdown' => $proposalBreakdown,
            'sdgs_distribution' => $sdgsDistribution,
        ];
    }

    /**
     * Monitoring kelompok KKN khusus bimbingan kampus sendiri.
     */
    public function listKelompokByUniv(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        return \App\Models\Kelompok::where(function ($q) use ($univId) {
            $q->whereHas('dosen', fn($dq) => $dq->where('universitas_id', $univId))
              ->orWhereHas('ketua.profilMahasiswa', fn($mq) => $mq->where('universitas_id', $univId));
        })
        ->with([
            'ketua.profilMahasiswa',
            'dosen.user',
            'anggota.user.profilMahasiswa',
            'proposal.posKebutuhan.desa',
            'proposal.progressMingguan',
            'proposal.luaranAkhir'
        ])
        ->get();
    }

    /**
     * Audit log & rekam jejak aktivitas civitas kampus sendiri.
     */
    public function listAuditLogsByUniv(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        $userUnivIds = User::where('id', $userUniv->id)
            ->orWhereHas('profilDosen', fn($q) => $q->where('universitas_id', $univId))
            ->orWhereHas('profilMahasiswa', fn($q) => $q->where('universitas_id', $univId))
            ->pluck('id');

        return \App\Models\Notifikasi::whereIn('user_id', $userUnivIds)
            ->with('user')
            ->latest()
            ->take(50)
            ->get();
    }
}
