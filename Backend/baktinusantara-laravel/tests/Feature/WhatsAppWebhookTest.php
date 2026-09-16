<?php

namespace Tests\Feature;

use App\Models\Aspirasi;
use App\Models\Kelompok;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();
    }

    public function test_warga_can_submit_aspirasi_via_whatsapp_webhook_and_saved_to_mysql(): void
    {
        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Sukamaju',
            'latitude' => -7.5361,
            'longitude' => 112.2811,
            'verified_at' => now(),
        ]);

        $response = $this->postJson('/api/webhook/whatsapp', [
            'sender' => '081234567890',
            'message' => 'Saya warga Sukamaju mau lapor jalan berlubang parah di dusun krajan',
            'name' => 'Pak Budi',
        ]);

        $response->assertStatus(200);
        $reply = $response->json('reply');

        $this->assertStringContainsString('Nomor Tiket', $reply);
        $this->assertStringContainsString('Desa Sukamaju', $reply);
        $this->assertStringContainsString('FASILITAS', $reply);

        // Verifikasi data benar-benar tersimpan di database MySQL
        $this->assertDatabaseHas('aspirasi', [
            'desa_id' => $profilDesa->id,
            'pelapor_nama' => 'Pak Budi',
            'kategori' => 'fasilitas',
            'status' => 'menunggu',
        ]);
    }

    public function test_warga_can_check_ticket_status_via_whatsapp(): void
    {
        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Sukamaju',
            'verified_at' => now(),
        ]);

        $aspirasi = Aspirasi::create([
            'desa_id' => $profilDesa->id,
            'pelapor_nama' => 'Siti',
            'pelapor_wa' => '085712345678',
            'kategori' => 'umkm',
            'deskripsi' => 'Pelatihan foto produk makanan ringan.',
            'latitude' => -7.5,
            'longitude' => 112.5,
            'urgensi' => 'sedang',
            'status' => 'terverifikasi',
        ]);

        $response = $this->postJson('/api/webhook/whatsapp', [
            'sender' => '085712345678',
            'message' => "TIKET #{$aspirasi->id}",
            'name' => 'Siti',
        ]);

        $response->assertStatus(200);
        $reply = $response->json('reply');

        $this->assertStringContainsString((string) $aspirasi->id, $reply);
        $this->assertStringContainsString('DISETUJUI & DITERBITKAN', $reply);
    }

    public function test_mahasiswa_can_check_proposal_status_via_whatsapp(): void
    {
        $univ = ProfilUniversitas::create([
            'user_id' => User::factory()->create(['role' => 'universitas', 'is_verified' => true])->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Berkah Makmur',
            'verified_at' => now(),
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $profilDesa->id,
            'judul' => 'Instalasi Biogas Limbah Ternak',
            'deskripsi' => 'Energi terbarukan desa',
            'kategori' => 'lingkungan',
            'kuota_kelompok' => 2,
            'deadline' => now()->addMonth(),
            'status' => 'in_progress',
        ]);

        $mhs = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true, 'phone_wa' => '081299990000']);
        ProfilMahasiswa::create([
            'user_id' => $mhs->id,
            'universitas_id' => $univ->id,
            'nim' => '23051204001',
            'jurusan' => 'Teknik Elektro',
            'semester' => 6,
        ]);

        $kelompok = Kelompok::create([
            'nama_kelompok' => 'Tim Biogas UNESA',
            'ketua_id' => $mhs->id,
        ]);

        Proposal::create([
            'kelompok_id' => $kelompok->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Pengadaan digester biogas',
            'file_proposal_url' => 'proposal/dummy.pdf',
            'status' => 'diterima',
            'matching_score' => 95,
            'jarak_km' => 15,
        ]);

        $response = $this->postJson('/api/webhook/whatsapp', [
            'sender' => '081299990000',
            'message' => 'STATUS',
            'name' => 'Ahmad',
        ]);

        $response->assertStatus(200);
        $reply = $response->json('reply');

        $this->assertStringContainsString('DITERIMA', $reply);
        $this->assertStringContainsString('95%', $reply);
        $this->assertStringContainsString('Instalasi Biogas Limbah Ternak', $reply);
    }

    public function test_perangkat_desa_can_check_incoming_proposals_via_whatsapp(): void
    {
        $univ = ProfilUniversitas::create([
            'user_id' => User::factory()->create(['role' => 'universitas', 'is_verified' => true])->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true, 'phone_wa' => '081288881111']);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Sukamaju',
            'verified_at' => now(),
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $profilDesa->id,
            'judul' => 'Digitalisasi UMKM Desa',
            'deskripsi' => 'E-Commerce desa',
            'kategori' => 'umkm',
            'kuota_kelompok' => 2,
            'deadline' => now()->addMonth(),
            'status' => 'open',
        ]);

        $mhs = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true]);
        $kelompok = Kelompok::create([
            'nama_kelompok' => 'Kelompok 1 DKV UNESA',
            'ketua_id' => $mhs->id,
        ]);

        Proposal::create([
            'kelompok_id' => $kelompok->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Branding dan Katalog',
            'file_proposal_url' => 'proposal/dummy.pdf',
            'status' => 'menunggu',
            'matching_score' => 88,
            'jarak_km' => 20,
        ]);

        $response = $this->postJson('/api/webhook/whatsapp', [
            'sender' => '081288881111',
            'message' => 'PROPOSAL',
            'name' => 'Kepala Desa',
        ]);

        $response->assertStatus(200);
        $reply = $response->json('reply');

        $this->assertStringContainsString('Kelompok 1 DKV UNESA', $reply);
        $this->assertStringContainsString('88%', $reply);
        $this->assertStringContainsString('Digitalisasi UMKM Desa', $reply);
    }
}