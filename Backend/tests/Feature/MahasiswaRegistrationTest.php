<?php

namespace Tests\Feature;

use App\Models\ProfilUniversitas;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MahasiswaRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_get_list_of_verified_universities_only()
    {
        // 1. Verified University
        $userUniv1 = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $univVerified = ProfilUniversitas::create([
            'user_id' => $userUniv1->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA-01',
            'verified_at' => now(),
        ]);

        // 2. Unverified University
        $userUniv2 = User::factory()->create(['role' => 'universitas', 'is_verified' => false]);
        $univPending = ProfilUniversitas::create([
            'user_id' => $userUniv2->id,
            'nama_universitas' => 'Universitas Belum Terverifikasi',
            'kode_univ' => 'UNIV-PENDING',
            'verified_at' => null,
        ]);

        $response = $this->getJson('/api/universitas');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $univVerified->id, 'nama_universitas' => 'Universitas Negeri Surabaya'])
            ->assertJsonMissing(['nama_universitas' => 'Universitas Belum Terverifikasi']);
    }

    public function test_mahasiswa_can_register_with_verified_university_id()
    {
        Storage::fake('local');

        $userUniv = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $univ = ProfilUniversitas::create([
            'user_id' => $userUniv->id,
            'nama_universitas' => 'Institut Teknologi Sepuluh Nopember',
            'kode_univ' => 'ITS-01',
            'verified_at' => now(),
        ]);

        $response = $this->postJson('/api/register/mahasiswa', [
            'name' => 'Lionel Jevon',
            'email' => 'lionel@mhs.its.ac.id',
            'password' => 'secret12345',
            'nim' => '5025211001',
            'universitas_id' => $univ->id,
            'jurusan' => 'Teknik Informatika',
            'semester' => 6,
            'ktm_file' => UploadedFile::fake()->image('ktm_lionel.jpg'),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.nim', '5025211001')
            ->assertJsonPath('data.universitas_id', $univ->id);

        $this->assertDatabaseHas('profil_mahasiswa', [
            'nim' => '5025211001',
            'universitas_id' => $univ->id,
        ]);
    }

    public function test_mahasiswa_cannot_register_with_unverified_university_id()
    {
        Storage::fake('local');

        $userUniv = User::factory()->create(['role' => 'universitas', 'is_verified' => false]);
        $unverifiedUniv = ProfilUniversitas::create([
            'user_id' => $userUniv->id,
            'nama_universitas' => 'Kampus Bodong',
            'kode_univ' => 'BODONG-01',
            'verified_at' => null,
        ]);

        $response = $this->postJson('/api/register/mahasiswa', [
            'name' => 'John Doe',
            'email' => 'john@bodong.ac.id',
            'password' => 'secret12345',
            'nim' => '123456',
            'universitas_id' => $unverifiedUniv->id,
            'jurusan' => 'Hukum',
            'ktm_file' => UploadedFile::fake()->image('ktm.jpg'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['universitas_id']);
    }
}
