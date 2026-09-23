<?php

// app/Services/DesaService.php
namespace App\Services;

use App\Models\User;
use App\Models\ProfilDesa;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DesaService
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    public function register(array $data, $skFile): ProfilDesa
    {
        return DB::transaction(function () use ($data, $skFile) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone_wa' => $data['phone_wa'] ?? null,
                'role' => 'perangkat_desa',
                'is_verified' => false,
            ]);

            // 'local' disk = private by default di Laravel 11+ (storage/app/private)
            $path = $skFile->store('sk-desa', 'local');

            $desa = ProfilDesa::create([
                'user_id' => $user->id,
                'nama_desa' => $data['nama_desa'],
                'kecamatan' => $data['kecamatan'] ?? null,
                'kabupaten' => $data['kabupaten'] ?? null,
                'provinsi' => $data['provinsi'] ?? null,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'sk_file_url' => $path,
                'kontak_resmi' => $data['kontak_resmi'] ?? null,
            ]);

            // Dispatch OTP registrasi
            $target = $user->phone_wa ?: $user->email;
            if ($target) {
                $this->otpService->generateAndSend($target, 'registration', 'whatsapp', $user);
            }

            return $desa;
        });
    }

    public function verify(ProfilDesa $desa): ProfilDesa
    {
        $desa->update(['verified_at' => now()]);
        $desa->user()->update([
            'is_verified' => true,
            'account_status' => 'active',
        ]);
        return $desa;
    }

    public function suspend(ProfilDesa $desa): ProfilDesa
    {
        $desa->user()->update(['account_status' => 'suspended']);
        $desa->user->tokens()->delete();
        return $desa;
    }

    public function activate(ProfilDesa $desa): ProfilDesa
    {
        $desa->user()->update([
            'is_verified' => true,
            'account_status' => 'active',
        ]);
        return $desa;
    }

    public function listVerifiedPublic(?string $keyword = null)
    {
        $query = ProfilDesa::withCount([
            'aspirasi as total_aspirasi',
            'aspirasi as aspirasi_selesai' => fn($q) => $q->where('status', 'terverifikasi'),
            'posKebutuhan as total_pos',
            'posKebutuhan as pos_aktif' => fn($q) => $q->where('status', 'open'),
        ])->whereNotNull('verified_at');

        if ($keyword) {
            $k = strtolower(trim($keyword));
            $query->where(function ($q) use ($k) {
                $q->whereRaw('LOWER(nama_desa) LIKE ?', ["%{$k}%"])
                  ->orWhereRaw('LOWER(kecamatan) LIKE ?', ["%{$k}%"])
                  ->orWhereRaw('LOWER(kabupaten) LIKE ?', ["%{$k}%"])
                  ->orWhereRaw('LOWER(provinsi) LIKE ?', ["%{$k}%"]);
            });
        }

        return $query->get()->map(function ($desa) {
            return [
                'id' => $desa->id,
                'nama' => $desa->nama_desa,
                'nama_desa' => $desa->nama_desa,
                'kecamatan' => $desa->kecamatan,
                'kabupaten' => $desa->kabupaten,
                'provinsi' => $desa->provinsi,
                'latitude' => (float) $desa->latitude,
                'longitude' => (float) $desa->longitude,
                'kontak_resmi' => $desa->kontak_resmi,
                'total_aspirasi' => $desa->total_aspirasi,
                'aspirasi_selesai' => $desa->aspirasi_selesai,
                'total_pos' => $desa->total_pos,
                'pos_aktif' => $desa->pos_aktif,
                'pos_tersedia' => $desa->pos_aktif,
            ];
        });
    }
}