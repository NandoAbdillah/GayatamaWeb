<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $otp,
        public string $purpose = 'registration',
        public int $expiresInMinutes = 15
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->purpose) {
            'forgot_password' => 'Kode OTP Reset Kata Sandi - BaktiNusantara',
            'forgot_email' => 'Informasi Pemulihan Akun - BaktiNusantara',
            default => 'Kode Verifikasi OTP Registrasi - BaktiNusantara',
        };

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
