<?php

namespace App\Http\Controllers;

use App\Services\WhatsAppBotService;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function __construct(
        protected WhatsAppBotService $botService,
        protected WhatsAppService $whatsAppService
    ) {}

    /**
     * Menerima webhook pesan masuk dari Fonnte / WhatsApp Gateway.
     */
    public function handle(Request $request): JsonResponse
    {
        Log::info('WhatsApp Webhook received', $request->all());

        // [SEC-02] Webhook Secret / Signature Verification
        $configuredSecret = config('services.whatsapp.webhook_secret')
            ?? config('services.fonnte.webhook_secret')
            ?? env('FONNTE_WEBHOOK_SECRET')
            ?? env('WHATSAPP_WEBHOOK_SECRET');
        if (!empty($configuredSecret)) {
            $providedSecret = $request->header('X-Fonnte-Signature')
                ?? $request->header('X-Webhook-Secret')
                ?? $request->header('Authorization')
                ?? $request->query('token');

            if ($providedSecret && str_starts_with($providedSecret, 'Bearer ')) {
                $providedSecret = substr($providedSecret, 7);
            }

            if ($providedSecret !== $configuredSecret) {
                Log::warning('WhatsApp Webhook unauthorized attempt', [
                    'ip' => $request->ip(),
                    'provided_token' => $providedSecret,
                ]);

                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized: Invalid webhook secret token',
                ], 401);
            }
        }

        $sender = $request->input('sender') ?? $request->input('from') ?? $request->input('phone');
        $message = $request->input('message') ?? $request->input('text') ?? $request->input('caption');
        $name = $request->input('name') ?? $request->input('pushname');

        if (empty($sender) || empty($message)) {
            return response()->json([
                'status' => false,
                'message' => 'Sender atau message tidak boleh kosong',
            ], 400);
        }

        // Validate sender phone format (digits only, min 8 chars)
        $cleanSender = preg_replace('/[^0-9]/', '', (string)$sender);
        if (strlen($cleanSender) < 8) {
            return response()->json([
                'status' => false,
                'message' => 'Format nomor pengirim tidak valid',
            ], 422);
        }

        // Proses pesan melalui Bot Service
        $reply = $this->botService->handleIncoming($cleanSender, (string)$message, $name ? (string)$name : null);

        // Kirimkan balasan otomatis kembali ke pengirim via WhatsApp API
        $this->whatsAppService->send($cleanSender, $reply);

        return response()->json([
            'status' => true,
            'reply' => $reply,
        ]);
    }
}