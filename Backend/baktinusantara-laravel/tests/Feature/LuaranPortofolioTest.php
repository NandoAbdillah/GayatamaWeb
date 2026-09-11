<?php

namespace Tests\Feature;

use App\Models\Kelompok;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilMahasiswa;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LuaranPortofolioTest extends TestCase
{
    use RefreshDatabase;

    protected function setupScenario()
    {
        Storage::fake('public');
        Storage::fake('local');

        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Sukamaju',
            'kecamatan' => 'Kecamatan A',
            'kabupaten' => 'Kabupaten B',
            'provinsi' => 'Jawa Timur',
            'latitude' => -7.2575,
            'longitude' => 112.7521,
            'sk_file_url' => 'sk/secret_desa_sk.pdf',
            'verified_at' => now(),
        ]);

        $desaLainUser = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $desaLain = ProfilDesa::create([
            'user_id' => $desaLainUser->id,
            'nama_desa' => 'Desa Lain',
            'kecamatan' => 'Kecamatan C',
            'kabupaten' => 'Kabupaten D',
            'provinsi' => 'Jawa Tengah',
            'latitude' => -7.5000,
            'longitude' => 110.5000,
            'sk_file_url' => 'sk/secret_desa_lain_sk.pdf',
            'verified_at' => now(),
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $profilDesa->id,
            'judul' => 'Digitalisasi Katalog UMKM',
            'deskripsi' => 'Pengembangan branding dan katalog UMKM',
            'kategori' => 'umkm',
            'sdg_codes' => [8, 9],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(30),
            'jurusan_dibutuhkan' => ['Desain Komunikasi Visual' => 2],
            'status' => 'open',
        ]);

        $userUniv = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $profilUniv = \App\Models\ProfilUniversitas::create([
            'user_id' => $userUniv->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA-01',
            'verified_at' => now(),
        ]);

        $ketua = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true]);
        ProfilMahasiswa::create([
            'user_id' => $ketua->id,
            'universitas_id' => $profilUniv->id,
            'nim' => '25091397019',
            'jurusan' => 'Desain Komunikasi Visual',
            'semester' => 6,
            'ktm_file_url' => 'ktm/secret_ktm_ketua.jpg',
            'verified_at' => now(),
        ]);

        $anggota = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true]);
        ProfilMahasiswa::create([
            'user_id' => $anggota->id,
            'universitas_id' => $profilUniv->id,
            'nim' => '25091397020',
            'jurusan' => 'Desain Komunikasi Visual',
            'semester' => 6,
            'ktm_file_url' => 'ktm/secret_ktm_anggota.jpg',
            'verified_at' => now(),
        ]);

        $mahasiswaLain = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true]);

        $kelompok = Kelompok::create([
            'nama_kelompok' => 'Kelompok 10 KKN',
            'ketua_id' => $ketua->id,
            'status' => 'aktif',
        ]);
        $kelompok->anggota()->create([
            'user_id' => $anggota->id,
            'role_in_group' => 'anggota',
        ]);

        $proposal = Proposal::create([
            'kelompok_id' => $kelompok->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Program kerja branding digital',
            'file_proposal_url' => 'proposals/dummy.pdf',
            'status' => 'diterima',
            'submitted_at' => now(),
        ]);

        return compact('userDesa', 'profilDesa', 'desaLainUser', 'desaLain', 'pos', 'ketua', 'anggota', 'mahasiswaLain', 'kelompok', 'proposal');
    }

    public function test_mahasiswa_can_submit_luaran_akhir_stored_in_private_disk()
    {
        $data = $this->setupScenario();

        $response = $this->actingAs($data['ketua'], 'sanctum')->postJson('/api/luaran', [
            'proposal_id' => $data['proposal']->id,
            'file_deliverable' => UploadedFile::fake()->create('laporan_akhir_dan_desain.pdf', 1024, 'application/pdf'),
            'deskripsi' => 'Laporan akhir penyelesaian logo, kemasan, dan website katalog UMKM Desa Sukamaju.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status_verifikasi', 'menunggu')
            ->assertJsonPath('data.proposal_id', $data['proposal']->id);

        $this->assertDatabaseHas('luaran_akhir', [
            'proposal_id' => $data['proposal']->id,
            'status_verifikasi' => 'menunggu',
        ]);

        // File deliverable harus ada di private storage (local) dan belum ada di public disk
        $localPath = $response->json('data.file_deliverable_url');
        Storage::disk('local')->assertExists($localPath);
    }

    public function test_cannot_submit_luaran_if_proposal_not_accepted()
    {
        $data = $this->setupScenario();
        $data['proposal']->update(['status' => 'menunggu']);

        $response = $this->actingAs($data['ketua'], 'sanctum')->postJson('/api/luaran', [
            'proposal_id' => $data['proposal']->id,
            'file_deliverable' => UploadedFile::fake()->create('laporan.pdf', 500, 'application/pdf'),
            'deskripsi' => 'Laporan akhir percobaan.',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['proposal']);
    }

    public function test_desa_can_verify_luaran_and_auto_generate_public_portfolio_and_pdf()
    {
        $data = $this->setupScenario();

        // Mahasiswa submit luaran
        $submitRes = $this->actingAs($data['ketua'], 'sanctum')->postJson('/api/luaran', [
            'proposal_id' => $data['proposal']->id,
            'file_deliverable' => UploadedFile::fake()->create('laporan.pdf', 500, 'application/pdf'),
            'deskripsi' => 'Master deliverable UMKM.',
        ]);
        $luaranId = $submitRes->json('data.id');

        // Desa mitra memverifikasi luaran
        $verifyRes = $this->actingAs($data['userDesa'], 'sanctum')->patchJson("/api/desa/luaran/{$luaranId}/verify", [
            'ringkasan_dampak' => 'Program berhasil mendigitalkan 15 UMKM lokal dan meningkatkan omzet rata-rata 30%.',
            'testimoni_desa' => 'Kelompok 10 sangat profesional, inovatif, dan solutif bagi warga Sukamaju.',
        ]);

        $verifyRes->assertStatus(200)
            ->assertJsonPath('message', 'Luaran akhir berhasil diverifikasi dan portofolio publik telah diterbitkan')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'luaran_id',
                    'slug_public',
                    'ringkasan_dampak',
                    'testimoni_desa',
                    'sertifikat_pdf_url',
                    'published_at',
                ]
            ]);

        $slug = $verifyRes->json('data.slug_public');

        $this->assertDatabaseHas('luaran_akhir', [
            'id' => $luaranId,
            'status_verifikasi' => 'verified',
            'disahkan_oleh' => $data['userDesa']->id,
        ]);

        $this->assertDatabaseHas('portofolio_publik', [
            'luaran_id' => $luaranId,
            'slug_public' => $slug,
        ]);

        // File PDF Sertifikat Asli harus terbentuk di storage public
        Storage::disk('public')->assertExists("certificates/{$slug}.pdf");
    }

    public function test_unauthorized_desa_cannot_verify_other_village_luaran()
    {
        $data = $this->setupScenario();

        $submitRes = $this->actingAs($data['ketua'], 'sanctum')->postJson('/api/luaran', [
            'proposal_id' => $data['proposal']->id,
            'file_deliverable' => UploadedFile::fake()->create('laporan.pdf', 500, 'application/pdf'),
            'deskripsi' => 'Deliverables',
        ]);
        $luaranId = $submitRes->json('data.id');

        // Desa lain coba verifikasi -> 403
        $response = $this->actingAs($data['desaLainUser'], 'sanctum')->patchJson("/api/desa/luaran/{$luaranId}/verify", [
            'ringkasan_dampak' => 'Dampak',
            'testimoni_desa' => 'Testimoni',
        ]);

        $response->assertStatus(403);
    }

    public function test_public_can_view_verified_portfolio_without_sensitive_data_leaks()
    {
        $data = $this->setupScenario();

        $submitRes = $this->actingAs($data['ketua'], 'sanctum')->postJson('/api/luaran', [
            'proposal_id' => $data['proposal']->id,
            'file_deliverable' => UploadedFile::fake()->create('laporan.pdf', 500, 'application/pdf'),
            'deskripsi' => 'Deliverables',
        ]);
        $luaranId = $submitRes->json('data.id');

        $verifyRes = $this->actingAs($data['userDesa'], 'sanctum')->patchJson("/api/desa/luaran/{$luaranId}/verify", [
            'ringkasan_dampak' => 'Ringkasan dampak sukses.',
            'testimoni_desa' => 'Sangat memuaskan.',
        ]);
        $slug = $verifyRes->json('data.slug_public');

        // Guest tanpa auth hit endpoint publik portofolio
        $publicRes = $this->getJson("/api/portofolio/{$slug}");

        $publicRes->assertStatus(200)
            ->assertJsonPath('data.slug_public', $slug)
            ->assertJsonPath('data.ringkasan_dampak', 'Ringkasan dampak sukses.')
            ->assertJsonPath('data.testimoni_desa', 'Sangat memuaskan.');

        // Proteksi kebocoran data sensitif: response JSON tidak boleh mengandung URL KTM atau SK Desa
        $content = $publicRes->getContent();
        $this->assertStringNotContainsString('secret_ktm_ketua.jpg', $content);
        $this->assertStringNotContainsString('secret_ktm_anggota.jpg', $content);
        $this->assertStringNotContainsString('secret_desa_sk.pdf', $content);
        $this->assertStringNotContainsString('ktm_file_url', $content);
        $this->assertStringNotContainsString('sk_file_url', $content);
    }

    public function test_desa_can_list_incoming_luaran()
    {
        $data = $this->setupScenario();

        $this->actingAs($data['ketua'], 'sanctum')->postJson('/api/luaran', [
            'proposal_id' => $data['proposal']->id,
            'file_deliverable' => UploadedFile::fake()->create('laporan.pdf', 500, 'application/pdf'),
            'deskripsi' => 'Deliverables',
        ]);

        $response = $this->actingAs($data['userDesa'], 'sanctum')->getJson('/api/desa/luaran');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }
}
