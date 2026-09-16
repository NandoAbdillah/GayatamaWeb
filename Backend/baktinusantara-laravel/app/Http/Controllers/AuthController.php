<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\Otp;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)
            ->orWhere('phone_wa', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        return response()->json([
            'token' => $user->createToken('auth-token')->plainTextToken,
            'role' => $user->role,
            'is_verified' => $user->is_verified,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_wa' => $user->phone_wa,
                'role' => $user->role,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    /**
     * Verifikasi kode OTP registrasi untuk mengaktifkan kontak user.
     */
    public function verifyRegisterOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $verified = $this->otpService->verify($request->identifier, $request->otp, 'registration');

        if (!$verified) {
            return response()->json([
                'message' => 'Kode OTP tidak valid atau telah kadaluwarsa.',
            ], 422);
        }

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_wa', $request->identifier)
            ->first();

        if ($user) {
            $user->update([
                'email_verified_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi OTP berhasil. Akun Anda telah diverifikasi.',
            'user' => $user,
        ]);
    }

    /**
     * Kirim ulang kode OTP dengan pilihan channel (whatsapp, sms, email).
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'purpose' => 'nullable|string|in:registration,forgot_password,forgot_email',
            'channel' => 'nullable|string|in:whatsapp,sms,email',
        ]);

        $purpose = $request->input('purpose', 'registration');
        $channel = $request->input('channel', 'whatsapp');

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_wa', $request->identifier)
            ->first();

        $result = $this->otpService->generateAndSend($request->identifier, $purpose, $channel, $user);

        return response()->json($result);
    }

    /**
     * Permintaan OTP untuk Forgot Password.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'channel' => 'nullable|string|in:whatsapp,sms,email',
        ]);

        $channel = $request->input('channel', 'whatsapp');
        $user = User::where('email', $request->identifier)
            ->orWhere('phone_wa', $request->identifier)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Akun dengan email atau nomor WhatsApp tersebut tidak ditemukan.',
            ], 404);
        }

        $target = ($channel === 'email') ? $user->email : ($user->phone_wa ?: $user->email);
        $result = $this->otpService->generateAndSend($target, 'forgot_password', $channel, $user);

        return response()->json($result);
    }

    /**
     * Verifikasi kode OTP sebelum eksekusi reset kata sandi.
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
            'purpose' => 'nullable|string|in:registration,forgot_password,forgot_email',
        ]);

        $purpose = $request->input('purpose', 'forgot_password');

        $otpRecord = Otp::where('identifier', $request->identifier)
            ->where('purpose', $purpose)
            ->where('otp', trim($request->otp))
            ->where('expires_at', '>', now())
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode OTP salah atau telah kadaluwarsa.',
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Kode OTP valid.',
        ]);
    }

    /**
     * Eksekusi reset kata sandi baru menggunakan verifikasi OTP.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $verified = $this->otpService->verify($request->identifier, $request->otp, 'forgot_password');

        if (!$verified) {
            return response()->json([
                'message' => 'Kode OTP tidak valid atau telah kadaluwarsa.',
            ], 422);
        }

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_wa', $request->identifier)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        // Update password baru
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Revoke semua Sanctum token aktif untuk keamanan (security best practice)
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.',
        ]);
    }

    /**
     * Fitur Forgot Email: mencari akun via WhatsApp / NIM / NIP dan mengirimkan info email.
     */
    public function forgotEmail(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'channel' => 'nullable|string|in:whatsapp,sms,email',
        ]);

        try {
            $result = $this->otpService->lookupAndSendAccountInfo(
                $request->identifier,
                $request->input('channel', 'whatsapp')
            );

            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->validator->errors()->first('identifier'),
            ], 404);
        }
    }
}
