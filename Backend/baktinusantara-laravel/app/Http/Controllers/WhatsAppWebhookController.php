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

        $sender = $request->input('sender') ?? $request->input('from') ?? $request->input('phone');
        $message = $request->input('message') ?? $request->input('text') ?? $request->input('caption');
        $name = $request->input('name') ?? $request->input('pushname');

        if (empty($sender) || empty($message)) {
            return response()->json([
                'status' => false,
                'message' => 'Sender atau message tidak boleh kosong',
            ], 400);
        }

        // Proses pesan melalui Bot Service
        $reply = $this->botService->handleIncoming($sender, $message, $name);

        // Kirimkan balasan otomatis kembali ke pengirim via WhatsApp API
        $this->whatsAppService->send($sender, $reply);

        return response()->json([
            'status' => true,
            'reply' => $reply,
        ]);
    }
}