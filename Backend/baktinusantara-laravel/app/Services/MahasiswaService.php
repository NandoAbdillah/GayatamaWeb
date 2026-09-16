<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProfilMahasiswa;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class MahasiswaService
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    public function register(array $data, $ktmFile): ProfilMahasiswa
    {
        return DB::transaction(function () use ($data, $ktmFile) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone_wa' => $data['phone_wa'] ?? null,
                'role' => 'mahasiswa',
                'is_verified' => false,
            ]);

            $path = $ktmFile->store('ktm-mahasiswa', 'local');

            $mhs = ProfilMahasiswa::create([
                'user_id' => $user->id,
                'universitas_id' => $data['universitas_id'],
                'nim' => $data['nim'],
                'jurusan' => $data['jurusan'],
                'semester' => $data['semester'] ?? null,
                'ktm_file_url' => $path,
            ])->load('universitas', 'user');

            // Dispatch OTP registrasi ke nomor WhatsApp/Email mahasiswa
            $target = $user->phone_wa ?: $user->email;
            if ($target) {
                $this->otpService->generateAndSend($target, 'registration', 'whatsapp', $user);
            }

            return $mhs;
        });
    }

    public function verify(ProfilMahasiswa $mhs): ProfilMahasiswa
    {
        $mhs->update(['verified_at' => now()]);
        $mhs->user()->update(['is_verified' => true]);
        return $mhs->load('universitas', 'user');
    }
}