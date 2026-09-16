<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Normalisasi nomor telepon ke format internasional (62xxx).
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
     * Kirim SMS melalui gateway provider (misal Fonnte/Twilio/Mock).
     */
    public function send(string $target, string $message): array
    {
        $normalizedTarget = $this->normalizePhoneNumber($target);
        $enabled = config('services.sms.enabled', false);
        $token = config('services.sms.token', config('services.fonnte.token'));
        $url = config('services.sms.url', 'https://api.fonnte.com/send');

        if (!$enabled || empty($token)) {
            Log::info("SMS [Mock/Simulated] to {$normalizedTarget}: {$message}");
            return [
                'status' => true,
                'mock' => true,
                'target' => $normalizedTarget,
                'message' => 'SMS simulated (service disabled or provider mock)',
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
                    'type' => 'sms',
                ]);

            $body = $response->json();

            Log::info("SMS sent to {$normalizedTarget}", [
                'status' => $response->status(),
                'response' => $body,
            ]);

            return [
                'status' => $response->successful(),
                'response' => $body,
            ];
        } catch (\Throwable $e) {
            Log::error("SMS failed to send to {$normalizedTarget}: {$e->getMessage()}");

            return [
                'status' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
