<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OtpAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Mail::fake();
        Http::fake([
            'api.fonnte.com/*' => Http::response(['status' => true, 'id' => 'msg-12345'], 200),
        ]);
    }

    public function test_registration_generates_and_sends_otp_via_whatsapp_for_mahasiswa(): void
    {
        $univUser = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $univ = ProfilUniversitas::create([
            'user_id' => $univUser->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $payload = [
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@unesa.ac.id',
            'password' => 'Password123!',
            'phone_wa' => '081234567890',
            'universitas_id' => $univ->id,
            'nim' => '21051204001',
            'jurusan' => 'S1 Teknik Informatika',
            'semester' => 7,
            'ktm_file' => UploadedFile::fake()->create('ktm.pdf', 500, 'application/pdf'),
        ];

        $response = $this->postJson('/api/register/mahasiswa', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'budi.santoso@unesa.ac.id']);

        // Pastikan OTP otomatis ter-generate di tabel otps
        $this->assertDatabaseHas('otps', [
            'identifier' => '081234567890',
            'purpose' => 'registration',
            'channel' => 'whatsapp',
        ]);
    }

    public function test_warga_and_super_admin_do_not_require_otp_on_registration(): void
    {
        // 1. Warga mengajukan aspirasi langsung tanpa blokir OTP registrasi
        $desaUser = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $desa = \App\Models\ProfilDesa::create([
            'user_id' => $desaUser->id,
            'nama_desa' => 'Desa Sugihwaras',
            'latitude' => -7.472,
            'longitude' => 112.715,
            'sk_file_url' => 'sk/desa.pdf',
        ]);

        $aspirasiPayload = [
            'desa_id' => $desa->id,
            'pelapor_nama' => 'Pak Joko',
            'pelapor_wa' => '081987654321',
            'kategori' => 'lingkungan',
            'deskripsi' => 'Saluran irigasi primer membutuhkan perbaikan untuk panen raya',
            'latitude' => -7.472,
            'longitude' => 112.715,
            'urgensi' => 'mendesak',
        ];

        $response = $this->postJson('/api/aspirasi', $aspirasiPayload);
        $response->assertStatus(201);

        // 2. Super Admin langsung aktif dan verified
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_verified' => true,
        ]);

        $this->assertTrue($admin->is_verified);
        $this->assertEquals('admin', $admin->role);
    }

    public function test_user_can_request_otp_via_sms_and_email_channels(): void
    {
        $user = User::factory()->create([
            'email' => 'siti@example.com',
            'phone_wa' => '081333444555',
            'is_verified' => false,
        ]);

        // 1. Request kirim via SMS
        $responseSms = $this->postJson('/api/otp/resend', [
            'identifier' => '081333444555',
            'purpose' => 'registration',
            'channel' => 'sms',
        ]);

        $responseSms->assertStatus(200)
            ->assertJson([
                'success' => true,
                'channel' => 'sms',
            ]);

        $this->assertDatabaseHas('otps', [
            'identifier' => '081333444555',
            'purpose' => 'registration',
            'channel' => 'sms',
        ]);

        // 2. Request kirim via Email
        $responseEmail = $this->postJson('/api/otp/resend', [
            'identifier' => 'siti@example.com',
            'purpose' => 'registration',
            'channel' => 'email',
        ]);

        $responseEmail->assertStatus(200)
            ->assertJson([
                'success' => true,
                'channel' => 'email',
            ]);

        $this->assertDatabaseHas('otps', [
            'identifier' => 'siti@example.com',
            'purpose' => 'registration',
            'channel' => 'email',
        ]);

        Mail::assertSent(OtpMail::class);
    }

    public function test_user_can_verify_registration_otp(): void
    {
        $user = User::factory()->create([
            'email' => 'dewi@example.com',
            'phone_wa' => '081555666777',
            'email_verified_at' => null,
        ]);

        Otp::create([
            'identifier' => '081555666777',
            'otp' => '654321',
            'purpose' => 'registration',
            'channel' => 'whatsapp',
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/register/verify-otp', [
            'identifier' => '081555666777',
            'otp' => '654321',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Verifikasi OTP berhasil. Akun Anda telah diverifikasi.',
            ]);

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertDatabaseMissing('otps', ['identifier' => '081555666777']);
    }

    public function test_invalid_or_expired_otp_is_rejected(): void
    {
        Otp::create([
            'identifier' => '081222333444',
            'otp' => '111222',
            'purpose' => 'registration',
            'channel' => 'whatsapp',
            'expires_at' => now()->subMinutes(5), // Kadaluwarsa
        ]);

        // Coba verifikasi dengan OTP expired
        $responseExpired = $this->postJson('/api/register/verify-otp', [
            'identifier' => '081222333444',
            'otp' => '111222',
        ]);

        $responseExpired->assertStatus(422);

        // Coba verifikasi dengan OTP salah
        $responseWrong = $this->postJson('/api/register/verify-otp', [
            'identifier' => '081222333444',
            'otp' => '999999',
        ]);

        $responseWrong->assertStatus(422);
    }

    public function test_forgot_password_flow_and_token_revocation(): void
    {
        $user = User::factory()->create([
            'email' => 'ahmad.dosen@unesa.ac.id',
            'phone_wa' => '081234567800',
            'password' => Hash::make('PasswordLama123'),
        ]);

        // Buat Sanctum token aktif (sesi login lama)
        $oldToken = $user->createToken('test-token')->plainTextToken;
        $this->assertCount(1, $user->tokens);

        // 1. Request Forgot Password
        $responseForgot = $this->postJson('/api/forgot-password', [
            'identifier' => 'ahmad.dosen@unesa.ac.id',
            'channel' => 'whatsapp',
        ]);

        $responseForgot->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $otpRecord = Otp::where('identifier', '081234567800')
            ->where('purpose', 'forgot_password')
            ->first();

        $this->assertNotNull($otpRecord);
        $otpCode = $otpRecord->otp;

        // 2. Verifikasi kode OTP sebelum reset
        $responseVerify = $this->postJson('/api/otp/verify', [
            'identifier' => '081234567800',
            'otp' => $otpCode,
            'purpose' => 'forgot_password',
        ]);

        $responseVerify->assertStatus(200)
            ->assertJson(['valid' => true]);

        // 3. Eksekusi Reset Password
        $responseReset = $this->postJson('/api/reset-password', [
            'identifier' => '081234567800',
            'otp' => $otpCode,
            'password' => 'PasswordBaru#2026',
            'password_confirmation' => 'PasswordBaru#2026',
        ]);

        $responseReset->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // Pastikan password user telah diperbarui
        $user->refresh();
        $this->assertTrue(Hash::check('PasswordBaru#2026', $user->password));

        // Pastikan semua token sesi lama telah di-revoke demi keamanan
        $this->assertCount(0, $user->tokens);

        // Pastikan OTP telah dihapus (single-use)
        $this->assertDatabaseMissing('otps', ['identifier' => '081234567800']);
    }

    public function test_forgot_email_sends_account_info_to_user_whatsapp(): void
    {
        $univUser = User::factory()->create(['role' => 'universitas', 'is_verified' => true]);
        $univ = ProfilUniversitas::create([
            'user_id' => $univUser->id,
            'nama_universitas' => 'Universitas Negeri Surabaya',
            'kode_univ' => 'UNESA',
            'verified_at' => now(),
        ]);

        $mhsUser = User::factory()->create([
            'name' => 'Fajar Pratama',
            'email' => 'fajar.pratama@mhs.unesa.ac.id',
            'phone_wa' => '082199887766',
            'role' => 'mahasiswa',
        ]);

        ProfilMahasiswa::create([
            'user_id' => $mhsUser->id,
            'universitas_id' => $univ->id,
            'nim' => '21051204099',
            'jurusan' => 'S1 Sistem Informasi',
            'ktm_file_url' => 'ktm/sample.pdf',
        ]);

        // 1. Lookup via nomor WhatsApp
        $responseByPhone = $this->postJson('/api/forgot-email', [
            'identifier' => '082199887766',
            'channel' => 'whatsapp',
        ]);

        $responseByPhone->assertStatus(200)
            ->assertJson([
                'success' => true,
                'name' => 'Fajar Pratama',
                'role' => 'mahasiswa',
            ]);

        $this->assertStringContainsString('faj***@mhs.unesa.ac.id', $responseByPhone->json('masked_email'));

        // 2. Lookup via NIM Mahasiswa
        $responseByNim = $this->postJson('/api/forgot-email', [
            'identifier' => '21051204099',
            'channel' => 'whatsapp',
        ]);

        $responseByNim->assertStatus(200)
            ->assertJson([
                'success' => true,
                'name' => 'Fajar Pratama',
            ]);

        // 3. Lookup identifier yang tidak ada
        $responseNotFound = $this->postJson('/api/forgot-email', [
            'identifier' => '089999999999',
        ]);

        $responseNotFound->assertStatus(404);
    }
}
