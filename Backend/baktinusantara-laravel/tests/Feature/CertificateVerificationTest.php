<?php

namespace Tests\Feature;

use App\Models\AnggotaKelompok;
use App\Models\Kelompok;
use App\Models\LuaranAkhir;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilDosen;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\Proposal;
use App\Models\SertifikatKkn;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificateVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Storage::fake('local');
    }

    private function setupFullScenario(): array
    {
        // 1. Universitas
        $univUser = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $univ = ProfilUniversitas::create([
            'user_id' => $univUser->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        // 2. DPL
        $dosenUser = User::factory()->create(['name' => 'Dr. Budi Santoso', 'role' => 'dosen', 'is_verified' => true]);
        $dosen = ProfilDosen::create([
            'user_id' => $dosenUser->id,
            'universitas_id' => $univ->id,
            'ditambahkan_oleh' => $univUser->id,
            'nip' => '198001012005011001',
        ]);

        // 3. Desa Mitra
        $desaUser = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $desa = ProfilDesa::create([
            'user_id' => $desaUser->id,
            'nama_desa' => 'Desa Sukamaju',
            'kecamatan' => 'Mojowarno',
            'kabupaten' => 'Kabupaten Jombang',
            'provinsi' => 'Jawa Timur',
            'latitude' => -7.6358,
            'longitude' => 112.2965,
            'sk_file_url' => 'sk/desa.pdf',
            'verified_at' => now(),
        ]);

        // 4. Pos Kebutuhan
        $pos = PosKebutuhan::create([
            'desa_id' => $desa->id,
            'judul' => 'Digitalisasi Branding & E-Commerce UMKM',
            'deskripsi' => 'Program pemberdayaan kemasan dan toko daring UMKM',
            'kategori' => 'umkm',
            'sdg_codes' => [8, 9],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(30),
            'jurusan_dibutuhkan' => ['Teknik Informatika' => 1, 'DKV' => 1],
            'status' => 'open',
        ]);

        // 5. Mahasiswa Ketua & Anggota (2 Orang)
        $mhsKetuaUser = User::factory()->create(['name' => 'Ahmad Fauzi', 'role' => 'mahasiswa', 'is_verified' => true]);
        ProfilMahasiswa::create([
            'user_id' => $mhsKetuaUser->id,
            'universitas_id' => $univ->id,
            'nim' => '21051204001',
            'jurusan' => 'Teknik Informatika',
            'ktm_file_url' => 'ktm/ahmad.pdf',
            'verified_at' => now(),
        ]);

        $mhsAnggotaUser = User::factory()->create(['name' => 'Siti Aminah', 'role' => 'mahasiswa', 'is_verified' => true]);
        ProfilMahasiswa::create([
            'user_id' => $mhsAnggotaUser->id,
            'universitas_id' => $univ->id,
            'nim' => '21051204002',
            'jurusan' => 'Desain Komunikasi Visual',
            'ktm_file_url' => 'ktm/siti.pdf',
            'verified_at' => now(),
        ]);

        // 6. Kelompok
        $kelompok = Kelompok::create([
            'nama_kelompok' => 'KKN UNESA 01 Sukamaju',
            'ketua_id' => $mhsKetuaUser->id,
            'dosen_id' => $dosen->id,
        ]);

        AnggotaKelompok::create([
            'kelompok_id' => $kelompok->id,
            'user_id' => $mhsKetuaUser->id,
            'jurusan_kontribusi' => 'Teknik Informatika',
            'role_in_group' => 'ketua',
        ]);

        AnggotaKelompok::create([
            'kelompok_id' => $kelompok->id,
            'user_id' => $mhsAnggotaUser->id,
            'jurusan_kontribusi' => 'Desain Komunikasi Visual',
            'role_in_group' => 'anggota',
        ]);

        // 7. Proposal Diterima
        $proposal = Proposal::create([
            'kelompok_id' => $kelompok->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Branding dan Toko Online',
            'file_proposal_url' => 'proposal/dummy.pdf',
            'status' => 'diterima',
            'matching_score' => 100.0,
            'jarak_km' => 63.5,
        ]);

        // 8. Submit Luaran oleh Mahasiswa
        $fileLuaran = UploadedFile::fake()->create('deliverables.zip', 1000, 'application/zip');
        $path = $fileLuaran->store('luaran-deliverables', 'local');

        $luaran = LuaranAkhir::create([
            'proposal_id' => $proposal->id,
            'file_deliverable_url' => $path,
            'deskripsi' => 'Paket Master Desain & Marketplace',
            'status_verifikasi' => 'menunggu',
        ]);

        return compact(
            'univUser', 'univ', 'dosenUser', 'dosen', 'desaUser', 'desa', 'pos',
            'mhsKetuaUser', 'mhsAnggotaUser', 'kelompok', 'proposal', 'luaran'
        );
    }

    public function test_village_verification_automatically_issues_certificates_for_all_group_members(): void
    {
        $data = $this->setupFullScenario();

        // Perangkat desa memverifikasi luaran
        $response = $this->actingAs($data['desaUser'], 'sanctum')
            ->patchJson("/api/desa/luaran/{$data['luaran']->id}/verify", [
                'ringkasan_dampak' => 'Meningkatkan penjualan UMKM desa hingga 65%.',
                'testimoni_desa' => 'Mahasiswa sangat membantu dan komunikatif.',
            ]);

        $response->assertStatus(200);

        // Pastikan sertifikat diterbitkan untuk 2 anggota kelompok
        $this->assertDatabaseCount('sertifikat_kkn', 2);

        // Cek sertifikat Ketua
        $certKetua = SertifikatKkn::where('user_id', $data['mhsKetuaUser']->id)->first();
        $this->assertNotNull($certKetua);
        $this->assertEquals('Ahmad Fauzi', $certKetua->recipient_name);
        $this->assertEquals('21051204001', $certKetua->recipient_nim);
        $this->assertEquals('Teknik Informatika', $certKetua->recipient_jurusan);
        $this->assertEquals('Desa Sukamaju', $certKetua->nama_desa);
        $this->assertEquals('Universitas Negeri Surabaya', $certKetua->nama_universitas);
        $this->assertStringStartsWith('BN-KKN-', $certKetua->certificate_code);
        $this->assertEquals(64, strlen($certKetua->verification_hash));
        $this->assertNotNull($certKetua->pdf_download_url);

        // Cek sertifikat Anggota
        $certAnggota = SertifikatKkn::where('user_id', $data['mhsAnggotaUser']->id)->first();
        $this->assertNotNull($certAnggota);
        $this->assertEquals('Siti Aminah', $certAnggota->recipient_name);
        $this->assertEquals('21051204002', $certAnggota->recipient_nim);
    }

    public function test_public_can_verify_certificate_authenticity_by_code(): void
    {
        $data = $this->setupFullScenario();

        // Trigger verifikasi desa
        $this->actingAs($data['desaUser'], 'sanctum')
            ->patchJson("/api/desa/luaran/{$data['luaran']->id}/verify", [
                'ringkasan_dampak' => 'Dampak nyata UMKM',
                'testimoni_desa' => 'Sangat memuaskan',
            ]);

        $cert = SertifikatKkn::where('user_id', $data['mhsKetuaUser']->id)->first();

        // Akses endpoint publik tanpa auth
        $response = $this->getJson("/api/certificate/verify/{$cert->certificate_code}");

        $response->assertStatus(200)
            ->assertJson([
                'is_authentic' => true,
                'status' => 'VALID & TERVERIFIKASI',
                'certificate_code' => $cert->certificate_code,
                'verification_hash' => $cert->verification_hash,
                'recipient' => [
                    'name' => 'Ahmad Fauzi',
                    'nim' => '21051204001',
                    'jurusan' => 'Teknik Informatika',
                ],
                'academic' => [
                    'universitas' => 'Universitas Negeri Surabaya',
                    'dosen_pembimbing' => 'Dr. Budi Santoso',
                ],
                'village' => [
                    'nama_desa' => 'Desa Sukamaju',
                ],
            ]);
    }

    public function test_invalid_or_tampered_certificate_code_returns_404(): void
    {
        $response = $this->getJson('/api/certificate/verify/BN-KKN-PALSU-99999');

        $response->assertStatus(404)
            ->assertJson([
                'is_authentic' => false,
                'status' => 'INVALID_OR_NOT_FOUND',
            ]);
    }

    public function test_public_can_download_generated_pdf_certificate(): void
    {
        $data = $this->setupFullScenario();

        $this->actingAs($data['desaUser'], 'sanctum')
            ->patchJson("/api/desa/luaran/{$data['luaran']->id}/verify", [
                'ringkasan_dampak' => 'Dampak nyata UMKM',
                'testimoni_desa' => 'Sangat memuaskan',
            ]);

        $cert = SertifikatKkn::where('user_id', $data['mhsKetuaUser']->id)->first();

        // Download via public endpoint
        $response = $this->get("/api/certificate/{$cert->certificate_code}/download");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('%PDF-1.4', $response->getContent());
    }

    public function test_mahasiswa_can_view_their_issued_certificates(): void
    {
        $data = $this->setupFullScenario();

        $this->actingAs($data['desaUser'], 'sanctum')
            ->patchJson("/api/desa/luaran/{$data['luaran']->id}/verify", [
                'ringkasan_dampak' => 'Dampak nyata UMKM',
                'testimoni_desa' => 'Sangat memuaskan',
            ]);

        // Mahasiswa login dan melihat sertifikat miliknya
        $response = $this->actingAs($data['mhsKetuaUser'], 'sanctum')
            ->getJson('/api/certificate/mine');

        $response->assertStatus(200)
            ->assertJson([
                'total' => 1,
            ])
            ->assertJsonPath('certificates.0.recipient_name', 'Ahmad Fauzi');
    }

    public function test_user_can_view_all_certificates_for_a_proposal(): void
    {
        $data = $this->setupFullScenario();

        $this->actingAs($data['desaUser'], 'sanctum')
            ->patchJson("/api/desa/luaran/{$data['luaran']->id}/verify", [
                'ringkasan_dampak' => 'Dampak nyata UMKM',
                'testimoni_desa' => 'Sangat memuaskan',
            ]);

        // Cek daftar seluruh sertifikat pada proposal tersebut (Ketua + Anggota = 2)
        $response = $this->actingAs($data['mhsKetuaUser'], 'sanctum')
            ->getJson("/api/certificate/proposal/{$data['proposal']->id}");

        $response->assertStatus(200)
            ->assertJson([
                'proposal_id' => $data['proposal']->id,
                'total_issued' => 2,
            ]);
    }
}
