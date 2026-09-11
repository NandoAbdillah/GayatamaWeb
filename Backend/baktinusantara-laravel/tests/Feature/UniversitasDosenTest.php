<?php

namespace Tests\Feature;

use App\Models\Kelompok;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilDosen;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UniversitasDosenTest extends TestCase
{
    use RefreshDatabase;

    protected function setupScenario()
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_verified' => true]);

        // Universitas 1: UNESA
        $userUniv = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $profilUniv = ProfilUniversitas::create([
            'user_id' => $userUniv->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA-01',
            'verified_at' => now(),
        ]);

        // Universitas 2: ITB
        $userUniv2 = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $profilUniv2 = ProfilUniversitas::create([
            'user_id' => $userUniv2->id,
            'nama_universitas' => 'Institut Teknologi Bandung',
            'kode_univ' => 'ITB-01',
            'verified_at' => now(),
        ]);

        // Dosen 1 (UNESA)
        $userDosen = User::factory()->create(['role' => 'dosen', 'is_verified' => true]);
        $profilDosen = ProfilDosen::create([
            'user_id' => $userDosen->id,
            'universitas_id' => $profilUniv->id,
            'ditambahkan_oleh' => $userUniv->id,
            'nip' => '198501012010121001',
            'no_hp' => '08123456789',
        ]);

        // Dosen 2 (UNESA)
        $dosenLainUser = User::factory()->create(['role' => 'dosen', 'is_verified' => true]);
        $profilDosenLain = ProfilDosen::create([
            'user_id' => $dosenLainUser->id,
            'universitas_id' => $profilUniv->id,
            'ditambahkan_oleh' => $userUniv->id,
            'nip' => '198802022012121002',
            'no_hp' => '08987654321',
        ]);

        // Dosen 3 (ITB - Beda Kampus)
        $dosenBedaKampusUser = User::factory()->create(['role' => 'dosen', 'is_verified' => true]);
        $profilDosenBedaKampus = ProfilDosen::create([
            'user_id' => $dosenBedaKampusUser->id,
            'universitas_id' => $profilUniv2->id,
            'ditambahkan_oleh' => $userUniv2->id,
            'nip' => '199003032015121003',
            'no_hp' => '08111222333',
        ]);

        $userDesa = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $profilDesa = ProfilDesa::create([
            'user_id' => $userDesa->id,
            'nama_desa' => 'Desa Sukamaju',
            'kecamatan' => 'Kecamatan A',
            'kabupaten' => 'Kabupaten B',
            'provinsi' => 'Jawa Timur',
            'latitude' => -7.2575,
            'longitude' => 112.7521,
            'sk_file_url' => 'sk/dummy.pdf',
            'verified_at' => now(),
        ]);

        $pos = PosKebutuhan::create([
            'desa_id' => $profilDesa->id,
            'judul' => 'Inovasi BUMDes',
            'deskripsi' => 'Pengembangan unit usaha desa',
            'kategori' => 'umkm',
            'sdg_codes' => [8],
            'kuota_kelompok' => 2,
            'deadline' => now()->addDays(30),
            'jurusan_dibutuhkan' => ['Manajemen' => 2],
            'status' => 'open',
        ]);

        $ketua = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true]);
        ProfilMahasiswa::create([
            'user_id' => $ketua->id,
            'universitas_id' => $profilUniv->id,
            'nim' => '25091397019',
            'jurusan' => 'Manajemen',
            'semester' => 6,
            'verified_at' => now(),
        ]);

        $anggota = User::factory()->create(['role' => 'mahasiswa', 'is_verified' => true]);
        ProfilMahasiswa::create([
            'user_id' => $anggota->id,
            'universitas_id' => $profilUniv->id,
            'nim' => '25091397020',
            'jurusan' => 'Manajemen',
            'semester' => 6,
            'verified_at' => now(),
        ]);

        $kelompok = Kelompok::create([
            'nama_kelompok' => 'Kelompok Penggerak Desa',
            'ketua_id' => $ketua->id,
            'dosen_id' => $profilDosen->id,
            'status' => 'aktif',
        ]);
        $kelompok->anggota()->create([
            'user_id' => $anggota->id,
            'role_in_group' => 'anggota',
        ]);

        $proposal = Proposal::create([
            'kelompok_id' => $kelompok->id,
            'pos_kebutuhan_id' => $pos->id,
            'draf_proker' => 'Draf program kerja pemberdayaan BUMDes',
            'file_proposal_url' => 'proposals/dummy.pdf',
            'status' => 'menunggu',
            'submitted_at' => now(),
        ]);

        return compact(
            'admin',
            'userUniv',
            'profilUniv',
            'profilUniv2',
            'userDosen',
            'profilDosen',
            'dosenLainUser',
            'profilDosenLain',
            'profilDosenBedaKampus',
            'userDesa',
            'profilDesa',
            'pos',
            'ketua',
            'anggota',
            'kelompok',
            'proposal'
        );
    }

    public function test_universitas_registration_and_admin_verification()
    {
        $data = $this->setupScenario();

        // 1. Registrasi universitas
        $regResponse = $this->postJson('/api/register/universitas', [
            'name' => 'Admin UI',
            'email' => 'admin@ui.ac.id',
            'password' => 'password123',
            'nama_universitas' => 'Universitas Indonesia',
            'kode_univ' => 'UI-01',
            'phone_wa' => '081299998888',
        ]);

        $regResponse->assertStatus(201)
            ->assertJsonPath('data.nama_universitas', 'Universitas Indonesia');

        $univId = $regResponse->json('data.id');

        // 2. Admin memverifikasi universitas
        $verifyResponse = $this->actingAs($data['admin'], 'sanctum')
            ->patchJson("/api/admin/universitas/{$univId}/verify");

        $verifyResponse->assertStatus(200)
            ->assertJsonPath('message', 'Institusi universitas berhasil diverifikasi');

        $this->assertDatabaseHas('users', [
            'email' => 'admin@ui.ac.id',
            'is_verified' => 1,
        ]);
    }

    public function test_verified_universitas_can_create_dosen()
    {
        $data = $this->setupScenario();

        $response = $this->actingAs($data['userUniv'], 'sanctum')->postJson('/api/universitas/dosen', [
            'name' => 'Dr. Budi Santoso, M.Kom.',
            'email' => 'budi.santoso@unesa.ac.id',
            'password' => 'dosen12345',
            'nip' => '197505052000031001',
            'no_hp' => '081333444555',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Dosen pembimbing lapangan berhasil ditambahkan')
            ->assertJsonPath('data.nip', '197505052000031001');

        $this->assertDatabaseHas('users', [
            'email' => 'budi.santoso@unesa.ac.id',
            'role' => 'dosen',
            'is_verified' => 1,
        ]);

        $this->assertDatabaseHas('profil_dosen', [
            'nip' => '197505052000031001',
            'universitas_id' => $data['profilUniv']->id,
        ]);
    }

    public function test_kelompok_can_assign_dosen_pembimbing_from_same_university_only()
    {
        $data = $this->setupScenario();

        // 1. Sukses jika memilih dosen dari universitas yang sama (UNESA)
        $response = $this->actingAs($data['ketua'], 'sanctum')->postJson("/api/kelompok/{$data['kelompok']->id}/set-dosen", [
            'dosen_id' => $data['profilDosenLain']->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Dosen pembimbing lapangan berhasil ditetapkan')
            ->assertJsonPath('data.dosen_id', $data['profilDosenLain']->id);

        // 2. Ditolak (422) jika memilih dosen dari kampus berbeda (ITB)
        $diffUnivResponse = $this->actingAs($data['ketua'], 'sanctum')->postJson("/api/kelompok/{$data['kelompok']->id}/set-dosen", [
            'dosen_id' => $data['profilDosenBedaKampus']->id,
        ]);
        $diffUnivResponse->assertStatus(422)
            ->assertJsonValidationErrors(['dosen_id']);

        // 3. Anggota non-ketua mencoba ganti dosen -> 403
        $unauth = $this->actingAs($data['anggota'], 'sanctum')->postJson("/api/kelompok/{$data['kelompok']->id}/set-dosen", [
            'dosen_id' => $data['profilDosen']->id,
        ]);
        $unauth->assertStatus(403);
    }

    public function test_dosen_can_view_kelompok_binaan_and_validate_proposal_with_structured_columns()
    {
        $data = $this->setupScenario();

        // Dosen melihat kelompok binaan
        $listRes = $this->actingAs($data['userDosen'], 'sanctum')->getJson('/api/dosen/kelompok');
        $listRes->assertStatus(200)
            ->assertJsonCount(1);

        // Dosen memvalidasi kelayakan proposal kelompok binaan
        $validateRes = $this->actingAs($data['userDosen'], 'sanctum')->patchJson("/api/dosen/proposal/{$data['proposal']->id}/kelayakan", [
            'status_kelayakan' => 'layak',
            'catatan_dosen' => 'Draf program kerja sangat baik dan sesuai target kompetensi mahasiswa.',
        ]);

        $validateRes->assertStatus(200)
            ->assertJsonPath('message', 'Validasi kelayakan proposal oleh dosen pembimbing berhasil disimpan');

        // Pastikan kolom terstruktur terisi di database
        $this->assertDatabaseHas('proposal', [
            'id' => $data['proposal']->id,
            'status_kelayakan_dosen' => 'layak',
            'catatan_dosen' => 'Draf program kerja sangat baik dan sesuai target kompetensi mahasiswa.',
        ]);

        // Dosen lain mencoba validasi -> 403
        $unauth = $this->actingAs($data['dosenLainUser'], 'sanctum')->patchJson("/api/dosen/proposal/{$data['proposal']->id}/kelayakan", [
            'status_kelayakan' => 'layak',
            'catatan_dosen' => 'Bukan kelompok saya.',
        ]);
        $unauth->assertStatus(403);
    }

    public function test_desa_can_send_laporan_dosen_and_universitas_reviews_it()
    {
        $data = $this->setupScenario();

        // 1. Desa mengirim laporan/evaluasi dosen
        $laporRes = $this->actingAs($data['userDesa'], 'sanctum')->postJson('/api/desa/laporan-dosen', [
            'dosen_id' => $data['profilDosen']->id,
            'proposal_id' => $data['proposal']->id,
            'isi' => 'DPL sangat aktif mendampingi mahasiswa saat survei lapangan dan rapat koordinasi.',
        ]);

        $laporRes->assertStatus(201)
            ->assertJsonPath('message', 'Laporan kinerja dosen berhasil dikirim ke pihak universitas');

        $laporanId = $laporRes->json('data.id');

        // 2. Universitas melihat laporan dosen masuk
        $listLaporan = $this->actingAs($data['userUniv'], 'sanctum')->getJson('/api/universitas/laporan-dosen');
        $listLaporan->assertStatus(200)
            ->assertJsonCount(1);

        // 3. Universitas memperbarui status laporan
        $updateStatus = $this->actingAs($data['userUniv'], 'sanctum')->patchJson("/api/universitas/laporan-dosen/{$laporanId}/status", [
            'status' => 'ditinjau',
        ]);

        $updateStatus->assertStatus(200)
            ->assertJsonPath('data.status', 'ditinjau');
    }
}
