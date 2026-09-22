<?php

namespace Tests\Feature;

use App\Models\ProfilDesa;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleAuthGovernanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_lppm_can_register_mahasiswa_and_dosen(): void
    {
        $univUser = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $univ = ProfilUniversitas::create([
            'user_id' => $univUser->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        // LPPM registers single Mahasiswa
        $responseMhs = $this->actingAs($univUser)->postJson('/api/universitas/mahasiswa', [
            'name' => 'Aditya Pratama',
            'email' => 'aditya.pratama@mhs.unesa.ac.id',
            'nim' => '22051204001',
            'jurusan' => 'S1 Teknik Informatika',
            'semester' => 5,
            'phone_wa' => '081234567890',
        ]);

        $responseMhs->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'aditya.pratama@mhs.unesa.ac.id',
            'role' => 'mahasiswa',
            'is_verified' => true,
            'account_status' => 'active',
        ]);
        $this->assertDatabaseHas('profil_mahasiswa', [
            'nim' => '22051204001',
            'universitas_id' => $univ->id,
        ]);

        // LPPM registers batch Mahasiswa
        $responseBatchMhs = $this->actingAs($univUser)->postJson('/api/universitas/mahasiswa/batch', [
            'students' => [
                [
                    'name' => 'Budi Setiawan',
                    'email' => 'budi.setiawan@mhs.unesa.ac.id',
                    'nim' => '22051204002',
                    'jurusan' => 'S1 Sistem Informasi',
                    'semester' => 5,
                    'phone_wa' => '081234567891',
                ],
                [
                    'name' => 'Citra Lestari',
                    'email' => 'citra.lestari@mhs.unesa.ac.id',
                    'nim' => '22051204003',
                    'jurusan' => 'S1 Pendidikan Teknologi Informasi',
                    'semester' => 5,
                    'phone_wa' => '081234567892',
                ],
            ],
        ]);

        $responseBatchMhs->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'budi.setiawan@mhs.unesa.ac.id']);
        $this->assertDatabaseHas('users', ['email' => 'citra.lestari@mhs.unesa.ac.id']);
    }

    public function test_pre_registered_mahasiswa_can_login_with_google(): void
    {
        $univUser = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $univ = ProfilUniversitas::create([
            'user_id' => $univUser->id,
            'nama_universitas' => 'UNESA',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $mhsUser = User::factory()->create([
            'name' => 'Dwi Handayani',
            'email' => 'dwi.handayani@mhs.unesa.ac.id',
            'role' => 'mahasiswa',
            'is_verified' => true,
            'account_status' => 'active',
        ]);

        ProfilMahasiswa::create([
            'user_id' => $mhsUser->id,
            'universitas_id' => $univ->id,
            'nim' => '22051204010',
            'jurusan' => 'Teknik Informatika',
            'verified_at' => now(),
        ]);

        // Login via Mock Google Token
        $response = $this->postJson('/api/auth/google/token', [
            'id_token' => 'mock_token_dwi.handayani@mhs.unesa.ac.id',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('role', 'mahasiswa');
        $response->assertJsonPath('redirect_route', '/mahasiswa/dashboard');
        $this->assertNotEmpty($response->json('token'));

        $this->assertDatabaseHas('users', [
            'id' => $mhsUser->id,
            'google_id' => 'google_mock_' . md5('dwi.handayani@mhs.unesa.ac.id'),
        ]);
    }

    public function test_unregistered_google_account_is_rejected_with_404(): void
    {
        $response = $this->postJson('/api/auth/google/token', [
            'id_token' => 'mock_token_stranger.person@gmail.com',
        ]);

        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('error_code', 'UNREGISTERED_ACCOUNT');
        $this->assertStringContainsString('belum terdaftar', $response->json('message'));
        $this->assertEquals(['perangkat_desa', 'universitas'], $response->json('can_register_as'));
    }

    public function test_suspended_account_cannot_login_with_google(): void
    {
        $user = User::factory()->create([
            'email' => 'suspended.user@gmail.com',
            'role' => 'perangkat_desa',
            'is_verified' => true,
            'account_status' => 'suspended',
        ]);

        $response = $this->postJson('/api/auth/google/token', [
            'id_token' => 'mock_token_suspended.user@gmail.com',
        ]);

        $response->assertStatus(403);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('error_code', 'ACCOUNT_SUSPENDED');
    }

    public function test_super_admin_can_suspend_and_activate_desa_and_univ(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_verified' => true]);

        // Desa
        $desaUser = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true, 'account_status' => 'active']);
        $desa = ProfilDesa::create([
            'user_id' => $desaUser->id,
            'nama_desa' => 'Desa Karangploso',
            'latitude' => -7.25,
            'longitude' => 112.75,
            'sk_file_url' => 'sk-desa/sample.pdf',
        ]);

        // Universitas
        $univUser = User::factory()->create(['role' => 'universitas', 'is_verified' => true, 'account_status' => 'active']);
        $univ = ProfilUniversitas::create([
            'user_id' => $univUser->id,
            'nama_universitas' => 'Universitas Airlangga',
            'kode_univ' => 'UNAIR',
            'verified_at' => now(),
        ]);

        // 1. Suspend Desa
        $resSuspendDesa = $this->actingAs($admin)->patchJson("/api/admin/desa/{$desa->id}/suspend");
        $resSuspendDesa->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $desaUser->id,
            'account_status' => 'suspended',
        ]);

        // 2. Activate Desa
        $resActivateDesa = $this->actingAs($admin)->patchJson("/api/admin/desa/{$desa->id}/activate");
        $resActivateDesa->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $desaUser->id,
            'account_status' => 'active',
        ]);

        // 3. Suspend Univ
        $resSuspendUniv = $this->actingAs($admin)->patchJson("/api/admin/universitas/{$univ->id}/suspend");
        $resSuspendUniv->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $univUser->id,
            'account_status' => 'suspended',
        ]);

        // 4. Activate Univ
        $resActivateUniv = $this->actingAs($admin)->patchJson("/api/admin/universitas/{$univ->id}/activate");
        $resActivateUniv->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $univUser->id,
            'account_status' => 'active',
        ]);
    }
}
