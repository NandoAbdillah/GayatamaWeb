<?php

namespace App\Services;

use App\Models\User;
use App\Models\Kelompok;
use App\Models\AnggotaKelompok;
use Illuminate\Validation\ValidationException;

class KelompokService
{
    protected function assertBelumPunyaKelompok(User $user): void
    {
        if (AnggotaKelompok::where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages([
                'kelompok' => 'Kamu sudah tergabung di kelompok lain. 1 mahasiswa hanya boleh 1 kelompok.',
            ]);
        }
    }

    protected function assertSudahVerified(User $user): void
    {
        if (!$user->profilMahasiswa || !$user->profilMahasiswa->verified_at) {
            throw ValidationException::withMessages([
                'akun' => 'Akun mahasiswa kamu belum diverifikasi admin.',
            ]);
        }
    }

    public function create(User $user, array $data): Kelompok
    {
        $this->assertSudahVerified($user);
        $this->assertBelumPunyaKelompok($user);

        $kelompok = Kelompok::create([
            'nama_kelompok' => $data['nama_kelompok'],
            'ketua_id' => $user->id,
            'status' => 'aktif',
        ]);

        AnggotaKelompok::create([
            'kelompok_id' => $kelompok->id,
            'user_id' => $user->id,
            'jurusan_kontribusi' => $data['jurusan_kontribusi'],
            'role_in_group' => 'ketua',
        ]);

        return $kelompok;
    }

    public function join(User $user, Kelompok $kelompok, string $jurusanKontribusi): AnggotaKelompok
    {
        $this->assertSudahVerified($user);
        $this->assertBelumPunyaKelompok($user);

        if ($kelompok->status !== 'aktif') {
            throw ValidationException::withMessages(['kelompok' => 'Kelompok ini sudah tidak aktif.']);
        }

        return AnggotaKelompok::create([
            'kelompok_id' => $kelompok->id,
            'user_id' => $user->id,
            'jurusan_kontribusi' => $jurusanKontribusi,
            'role_in_group' => 'anggota',
        ]);
    }
}