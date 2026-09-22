<?php

namespace App\Services;

use App\Models\AnggotaKelompok;
use App\Models\Kelompok;
use App\Models\LuaranAkhir;
use App\Models\PortofolioPublik;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilUniversitas;
use App\Models\ProgressMingguan;
use App\Models\Proposal;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Calculate and return national aggregated impact metrics.
     */
    public function getNationalMetrics(): array
    {
        // 1. Total Desa Terbantu (desa dengan pos kebutuhan aktif / selesai / luaran terverifikasi)
        $desaFromPos = PosKebutuhan::whereIn('status', ['in_progress', 'completed'])
            ->orWhereHas('proposal', function ($q) {
                $q->where('status', 'diterima');
            })
            ->pluck('desa_id');

        $desaFromLuaran = LuaranAkhir::where('luaran_akhir.status_verifikasi', 'verified')
            ->join('proposal', 'luaran_akhir.proposal_id', '=', 'proposal.id')
            ->join('pos_kebutuhan', 'proposal.pos_kebutuhan_id', '=', 'pos_kebutuhan.id')
            ->pluck('pos_kebutuhan.desa_id');

        $totalDesaTerbantu = $desaFromPos->merge($desaFromLuaran)->unique()->filter()->count();

        // 2. Total UMKM Terdigitalisasi (pos kategori UMKM yang sedang berjalan / selesai / luaran terverifikasi)
        $totalUmkmTerdigitalisasi = PosKebutuhan::whereRaw('LOWER(kategori) = ?', ['umkm'])
            ->where(function ($query) {
                $query->whereIn('status', ['in_progress', 'completed'])
                    ->orWhereHas('proposal', function ($q) {
                        $q->where('status', 'diterima');
                    });
            })
            ->count();

        // 3. Kelompok KKN & Mahasiswa Terlibat
        $totalKelompokKkn = Kelompok::count();
        $totalMahasiswaTerlibat = AnggotaKelompok::distinct('user_id')->count('user_id');

        // 4. Estimasi Total Jam Pengabdian
        // Standard KKN: 1 minggu laporan progress = ~40 jam pengabdian per mahasiswa dalam kelompok
        $progressReports = ProgressMingguan::with('proposal.kelompok.anggota')->get();
        $totalJamPengabdian = (int) $progressReports->sum(function ($p) {
            $anggotaCount = $p->proposal?->kelompok?->anggota?->count() ?: 1;
            return $anggotaCount * 40;
        });

        // 5. Total Pos Kebutuhan & Status Breakdown
        $totalPosKebutuhan = PosKebutuhan::count();
        $posKebutuhanBreakdown = [
            'open' => PosKebutuhan::where('status', 'open')->count(),
            'in_progress' => PosKebutuhan::where('status', 'in_progress')->count(),
            'completed' => PosKebutuhan::where('status', 'completed')->count(),
        ];

        // 6. Luaran & Portofolio
        $totalLuaranTerverifikasi = LuaranAkhir::where('status_verifikasi', 'verified')->count();
        $totalPortofolioPublik = PortofolioPublik::count();

        // 7. Desa & Universitas Terdaftar (from database, verified only)
        $totalDesaTerdaftar = ProfilDesa::whereNotNull('verified_at')->count();
        $totalDesaAll = ProfilDesa::count();
        $totalUniversitasTerdaftar = ProfilUniversitas::whereNotNull('verified_at')->count();
        $totalUniversitasAll = ProfilUniversitas::count();
        // Universitas sedang KKN = distinct kampus yang punya kelompok dengan proposal diterima / in_progress
        $univAktifIds = Kelompok::whereHas('proposal', fn($q) => $q->where('status', 'diterima'))
            ->whereNotNull('dosen_id')
            ->with('dosen.universitas')
            ->get()
            ->pluck('dosen.universitas_id')
            ->filter()
            ->unique()
            ->count();
        // fallback: jika belum ada kelompok, hitung dari ProfilUniversitas yang punya dosen dengan kelompok
        if ($univAktifIds === 0) {
            $univAktifIds = \App\Models\ProfilDosen::whereHas('kelompokBinaan', fn($q) => $q->whereHas('proposal', fn($qq) => $qq->where('status', 'diterima')))
                ->distinct('universitas_id')
                ->count('universitas_id');
        }

        // 8. Kategori Breakdown
        $kategoriBreakdown = PosKebutuhan::select('kategori', DB::raw('count(*) as total'))
            ->groupBy('kategori')
            ->pluck('total', 'kategori')
            ->toArray();

        // 9. SDGs Distribution
        $allSdgs = PosKebutuhan::whereNotNull('sdg_codes')->pluck('sdg_codes');
        $sdgsDistribution = [];
        foreach ($allSdgs as $sdgList) {
            if (is_array($sdgList)) {
                foreach ($sdgList as $code) {
                    $key = is_numeric($code) ? 'SDG ' . $code : (string) $code;
                    $sdgsDistribution[$key] = ($sdgsDistribution[$key] ?? 0) + 1;
                }
            }
        }
        ksort($sdgsDistribution);

        return [
            'total_desa_terbantu' => $totalDesaTerbantu,
            'total_desa_terdaftar' => $totalDesaTerdaftar,
            'total_desa_all' => $totalDesaAll,
            'total_umkm_terdigitalisasi' => $totalUmkmTerdigitalisasi,
            'total_kelompok_kkn' => $totalKelompokKkn,
            'total_mahasiswa_terlibat' => $totalMahasiswaTerlibat,
            'total_jam_pengabdian' => $totalJamPengabdian,
            'total_pos_kebutuhan' => $totalPosKebutuhan,
            'status_pos_breakdown' => $posKebutuhanBreakdown,
            'total_luaran_terverifikasi' => $totalLuaranTerverifikasi,
            'total_portofolio_publik' => $totalPortofolioPublik,
            'total_universitas_terdaftar' => $totalUniversitasTerdaftar,
            'total_universitas_all' => $totalUniversitasAll,
            'total_universitas_aktif_kkn' => $univAktifIds,
            'kategori_breakdown' => $kategoriBreakdown,
            'sdgs_distribution' => $sdgsDistribution,
        ];
    }
}