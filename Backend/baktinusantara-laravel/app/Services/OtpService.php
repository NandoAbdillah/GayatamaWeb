<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\ProfilDosen;
use App\Models\ProfilMahasiswa;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function __construct(
        protected WhatsAppService $whatsAppService,
        protected SmsService $smsService
    ) {}

    /**
     * Menghasilkan dan mengirimkan kode OTP 6 digit melalui channel WhatsApp, SMS, atau Email.
     */
    public function generateAndSend(
        string $identifier,
        string $purpose = 'registration',
        string $channel = 'whatsapp',
        ?User $user = null
    ): array {
        $channel = strtolower(trim($channel));
        if (!in_array($channel, ['whatsapp', 'sms', 'email'])) {
            $channel = 'whatsapp';
        }

        // Generate 6-digit cryptographic OTP
        $otpCode = (string) random_int(100000, 999999);
        $expiresAt = now()->addMinutes(15);

        // Hapus OTP aktif sebelumnya untuk identifier & purpose yang sama
        Otp::where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->delete();

        // Simpan OTP baru
        Otp::create([
            'identifier' => $identifier,
            'otp' => $otpCode,
            'purpose' => $purpose,
            'channel' => $channel,
            'expires_at' => $expiresAt,
        ]);

        // Siapkan template pesan
        $actionName = match ($purpose) {
            'forgot_password' => 'pemulihan kata sandi',
            'forgot_email' => 'pemulihan informasi email',
            default => 'verifikasi pendaftaran akun baru',
        };

        $message = "🔐 *[BaktiNusantara]*\nKode OTP {$actionName} Anda adalah: *{$otpCode}*\n\nKode ini berlaku selama 15 menit.\n⚠️ *JANGAN bagikan kode ini kepada siapapun demi keamanan akun Anda.*";

        // Pengiriman sesuai channel
        if ($channel === 'email' || filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $targetEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? $identifier : ($user?->email);
            if ($targetEmail) {
                Mail::to($targetEmail)->send(new OtpMail($otpCode, $purpose, 15));
            }
        } elseif ($channel === 'sms') {
            $this->smsService->send($identifier, $message);
        } else {
            // Default WhatsApp
            $this->whatsAppService->send($identifier, $message);
        }

        $response = [
            'success' => true,
            'message' => "Kode OTP telah berhasil dikirimkan melalui " . strtoupper($channel) . ".",
            'target' => $this->maskIdentifier($identifier),
            'channel' => $channel,
            'purpose' => $purpose,
            'expires_in_minutes' => 15,
        ];

        if (config('app.debug')) {
            $response['dev_otp'] = $otpCode;
        }

        return $response;
    }

    /**
     * Memverifikasi kode OTP yang diinput pengguna.
     */
    public function verify(string $identifier, string $otp, string $purpose = 'registration'): bool
    {
        $otpRecord = Otp::where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->where('otp', trim($otp))
            ->where('expires_at', '>', now())
            ->first();

        if (!$otpRecord) {
            return false;
        }

        // Single-use: langsung hapus setelah diverifikasi
        $otpRecord->delete();
        return true;
    }

    /**
     * Cari akun berdasarkan Nomor Telepon / WA / NIM / NIP dan kirimkan info email ke WhatsApp/SMS.
     */
    public function lookupAndSendAccountInfo(string $searchKey, string $channel = 'whatsapp'): array
    {
        $channel = strtolower(trim($channel));
        if (!in_array($channel, ['whatsapp', 'sms', 'email'])) {
            $channel = 'whatsapp';
        }

        $normalizedPhone = $this->whatsAppService->normalizePhoneNumber($searchKey);

        // 1. Cari via phone_wa atau email
        $user = User::where('phone_wa', $searchKey)
            ->orWhere('phone_wa', $normalizedPhone)
            ->orWhere('email', $searchKey)
            ->first();

        // 2. Jika tidak ditemukan, cari via NIM Mahasiswa
        if (!$user) {
            $mhs = ProfilMahasiswa::where('nim', $searchKey)->with('user')->first();
            if ($mhs && $mhs->user) {
                $user = $mhs->user;
            }
        }

        // 3. Jika tidak ditemukan, cari via NIP Dosen
        if (!$user) {
            $dosen = ProfilDosen::where('nip', $searchKey)->with('user')->first();
            if ($dosen && $dosen->user) {
                $user = $dosen->user;
            }
        }

        if (!$user) {
            throw ValidationException::withMessages([
                'identifier' => 'Akun dengan identitas tersebut tidak ditemukan dalam sistem.',
            ]);
        }

        $targetPhone = $user->phone_wa ?: $searchKey;
        $message = "ℹ️ *[BaktiNusantara - Info Akun]*\nHalo {$user->name},\n\nAlamat email terdaftar untuk akun Anda adalah:\n📧 *{$user->email}*\nPeran Akun: *" . strtoupper($user->role) . "*\n\nSilakan gunakan alamat email di atas untuk masuk ke sistem.";

        if ($channel === 'sms') {
            $this->smsService->send($targetPhone, $message);
        } elseif ($channel === 'email' && $user->email) {
            Mail::to($user->email)->send(new OtpMail('INFO-AKUN', 'forgot_email', 0));
        } else {
            $this->whatsAppService->send($targetPhone, $message);
        }

        return [
            'success' => true,
            'message' => "Informasi email terdaftar telah dikirimkan ke " . strtoupper($channel) . " pemilik akun.",
            'masked_email' => $this->maskIdentifier($user->email),
            'name' => $user->name,
            'role' => $user->role,
        ];
    }

    /**
     * Masking identifier untuk menjaga privasi data (GDPR / Data Protection).
     */
    public function maskIdentifier(string $identifier): string
    {
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $parts = explode('@', $identifier);
            $name = $parts[0];
            $domain = $parts[1] ?? '';
            $len = strlen($name);
            if ($len <= 2) {
                $maskedName = substr($name, 0, 1) . '***';
            } else {
                $maskedName = substr($name, 0, 3) . '***';
            }
            return $maskedName . '@' . $domain;
        }

        // Phone number masking: 081234567890 -> 0812****7890
        $len = strlen($identifier);
        if ($len > 8) {
            return substr($identifier, 0, 4) . '****' . substr($identifier, -4);
        }

        return substr($identifier, 0, 2) . '***';
    }
}
