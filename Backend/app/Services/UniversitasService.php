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
}
