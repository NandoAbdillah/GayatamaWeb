<?php

namespace App\Console\Commands;

use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestWhatsAppCommand extends Command
{
    protected $signature = 'wa:test {target : Nomor WhatsApp tujuan (misal 081234567890)}';
    protected $description = 'Kirim pesan uji coba WhatsApp via Fonnte API';

    public function handle(WhatsAppService $whatsAppService): int
    {
        $target = $this->argument('target');
        $message = "Halo! 👋\n\nIni adalah pesan uji coba integrasi *WhatsApp Gateway BaktiNusantara* via Fonnte API 🚀.\n\nSistem notifikasi siap digunakan!\n\n_Waktu: " . now()->format('d M Y H:i:s') . "_";

        $this->info("Mengirim pesan ke: {$target} ...");

        $result = $whatsAppService->send($target, $message);

        if (!empty($result['status'])) {
            $this->info("✅ Pesan BERHASIL dikirim!");
            $this->line(json_encode($result, JSON_PRETTY_PRINT));
            return Command::SUCCESS;
        } else {
            $this->error("❌ Pesan GAGAL dikirim.");
            $this->line(json_encode($result, JSON_PRETTY_PRINT));
            return Command::FAILURE;
        }
    }
}