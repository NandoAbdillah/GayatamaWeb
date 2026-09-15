<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Normalisasi nomor telepon ke format 62xxx.
     */
    public function normalizePhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^\d+]/', '', trim($phone));

        if (str_starts_with($cleaned, '+62')) {
            $cleaned = '62' . substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '0')) {
            $cleaned = '62' . substr($cleaned, 1);
        } elseif (str_starts_with($cleaned, '8')) {
            $cleaned = '62' . $cleaned;
        }

        return ltrim($cleaned, '+');
    }

    /**
     * Kirim pesan WhatsApp melalui Fonnte API.
     */
    public function send(string $target, string $message): array
    {
        $normalizedTarget = $this->normalizePhoneNumber($target);

        $enabled = config('services.fonnte.enabled', true);
        $token = config('services.fonnte.token');
        $url = config('services.fonnte.url', 'https://api.fonnte.com/send');

        if (! $enabled || empty($token)) {
            Log::info("WhatsApp [Mock/Disabled] to {$normalizedTarget}: {$message}");
            return [
                'status' => true,
                'mock' => true,
                'target' => $normalizedTarget,
                'message' => 'WhatsApp simulated (service disabled or token empty)',
            ];
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => $token,
                ])
                ->post($url, [
                    'target' => $normalizedTarget,
                    'message' => $message,
                ]);

            $body = $response->json();

            Log::info("WhatsApp sent to {$normalizedTarget}", [
                'status' => $response->status(),
                'response' => $body,
            ]);

            return [
                'status' => $response->successful(),
                'response' => $body,
            ];
        } catch (\Throwable $e) {
            Log::error("WhatsApp failed to send to {$normalizedTarget}: {$e->getMessage()}");

            return [
                'status' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}