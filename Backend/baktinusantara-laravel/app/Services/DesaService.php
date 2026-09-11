<?php

// app/Services/DesaService.php
namespace App\Services;

use App\Models\User;
use App\Models\ProfilDesa;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DesaService
{
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

            return ProfilDesa::create([
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
        });
    }

    public function verify(ProfilDesa $desa): ProfilDesa
    {
        $desa->update(['verified_at' => now()]);
        $desa->user()->update(['is_verified' => true]);
        return $desa;
    }
}