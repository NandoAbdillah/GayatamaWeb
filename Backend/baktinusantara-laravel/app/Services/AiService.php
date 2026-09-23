<?php

namespace App\Services;

use App\Models\Aspirasi;
use App\Models\ProfilDesa;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    /**
     * Layanan percakapan interaktif multi-turn AIIRA untuk WhatsApp.
     * Mengembalikan array dengan:
     * - reply: string (teks WhatsApp)
     * - action: 'none' | 'check_status' | 'confirm_needed' | 'create_ticket'
     * - ticket_data: array|null (jika action === 'create_ticket')
     */
    public function chatWithAiira(string $sender, string $message, ?string $senderName = null): array
    {
        $cleanSender = preg_replace('/[^0-9]/', '', $sender);
        $cacheKey = "wa_session_{$cleanSender}";

        // Ambil sesi multi-turn sebelumnya dari Cache (TTL 2 jam)
        $session = Cache::get($cacheKey, [
            'step' => 'idle', // 'idle' | 'gathering_info' | 'awaiting_confirmation'
            'draft' => [
                'pelapor_nama' => $senderName,
                'desa_id' => null,
                'desa_nama' => null,
                'kategori' => null,
                'urgensi' => 'sedang',
                'deskripsi' => null,
            ],
            'history' => [],
        ]);

        $trimmed = trim($message);
        $lower = strtolower($trimmed);

        // 1. INTENT: BATAL / RESET SESI
        if (in_array($lower, ['batal', 'cancel', 'gak jadi', 'nggak jadi', 'reset', 'ulang', 'stop', 'batalin'])) {
            Cache::forget($cacheKey);
            $nama = $senderName ?: 'Bapak/Ibu';
            return [
                'reply' => "Baik {$nama}, sesi aduan sebelumnya telah dibatalkan. 👍\n\nJika nanti Anda ingin menyampaikan aspirasi warga desa atau mengecek status tiket aduan yang sudah ada, silakan hubungi AIIRA kapan saja ya! 😊",
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 2. INTENT: CEK STATUS / PROGRES TIKET
        if ($this->isStatusQuery($lower)) {
            return $this->handleStatusCheck($cleanSender, $trimmed, $senderName);
        }

        // 3. INTENT: KONFIRMASI PEMBUATAN TIKET RESMI
        if ($session['step'] === 'awaiting_confirmation') {
            if ($this->isConfirmationAffirmative($lower)) {
                // User menyetujui penerbitan tiket
                $draft = $session['draft'];
                Cache::forget($cacheKey);

                return [
                    'reply' => '', // Akan diformat oleh WhatsAppBotService setelah insert DB
                    'action' => 'create_ticket',
                    'ticket_data' => [
                        'desa_id' => $draft['desa_id'],
                        'desa_nama' => $draft['desa_nama'],
                        'pelapor_nama' => $draft['pelapor_nama'] ?: ($senderName ?: 'Warga ' . ($draft['desa_nama'] ?? 'Desa')),
                        'pelapor_wa' => $cleanSender,
                        'kategori' => $draft['kategori'] ?: 'fasilitas',
                        'urgensi' => $draft['urgensi'] ?: 'sedang',
                        'deskripsi' => $draft['deskripsi'] ?: $trimmed,
                    ],
                ];
            } elseif ($this->isRejectionOrCancel($lower)) {
                Cache::forget($cacheKey);
                return [
                    'reply' => "Baik, penerbitan tiket aduan dibatalkan. Draf telah dihapus.\n\nApakah ada hal lain yang bisa AIIRA bantu seputar desa atau KKN? 😊",
                    'action' => 'none',
                    'ticket_data' => null,
                ];
            }
        }

        // 4. INTENT: OUT-OF-DOMAIN CHECK (Menolak topik di luar GayatamaWeb / Desa / KKN secara santun)
        if ($this->isOutOfDomain($lower)) {
            return [
                'reply' => $this->formatOutOfDomainReply($trimmed),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 5. INTENT: GREETING / MENU BANTUAN DASAR
        if ($session['step'] === 'idle' && in_array($lower, ['halo', 'hai', 'hi', 'menu', 'bantuan', 'help', 'info', 'p', 'start', 'assalamualaikum', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam'])) {
            $nama = $senderName ? " *{$senderName}*" : "";
            $reply = "Halo{$nama}! Salam hangat dari *AIIRA* — Asisten AI Resmi Platform BaktiNusantara. 🇮🇩👋\n\nSaya siap mendampingi Anda 24/7 untuk layanan desa terpadu:\n\n1️⃣ *Sampaikan Aspirasi Desa*: Ceritakan keluhan atau usulan fasilitas desa Anda secara langsung (contoh: _\"Saya warga Desa Sukamaju mau lapor jalan dusun 3 berlubang dan minim penerangan\"_).\n\n2️⃣ *Cek Progres Aduan*: Ketik *STATUS* atau *CEK #TIKET* untuk memantau tindak lanjut laporan Anda.\n\n3️⃣ *Info Program KKN & Desa*: Tanyakan potensi desa atau program kerja pengabdian mahasiswa.\n\nAda yang bisa AIIRA bantu untuk desa Anda hari ini?";
            return [
                'reply' => $reply,
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 6. INTENT: ANALISIS & PENYUSUNAN ADUAN (DUAL-ENGINE: GEMINI + LOCAL ENGINE)
        return $this->processAspirasiConversation($cleanSender, $trimmed, $senderName, $session);
    }

    /**
     * Memproses percakapan aspirasi (ekstraksi entitas, melengkapi info yang kurang, dan meminta konfirmasi).
     */
    protected function processAspirasiConversation(string $cleanSender, string $message, ?string $senderName, array $session): array
    {
        $cacheKey = "wa_session_{$cleanSender}";
        $draft = $session['draft'];

        // Coba ekstraksi via Gemini API jika key terkonfigurasi
        $parsed = null;
        $geminiKey = config('services.gemini.key');
        if (!empty($geminiKey) && !str_starts_with($geminiKey, 'AQ.')) {
            try {
                $parsed = $this->callGeminiForAspirasi($message, $geminiKey);
            } catch (\Throwable $e) {
                Log::warning("Gemini API call failed, falling back to local engine: " . $e->getMessage());
            }
        }

        if (!$parsed) {
            $parsed = $this->ruleBasedParseAspirasi($message);
        }

        // 1. Identifikasi Desa
        $desa = null;
        if (!empty($parsed['desa_nama'])) {
            $desa = $this->findDesaByName($parsed['desa_nama']);
        }

        if (!$desa) {
            $desa = $this->findDesaByName($message);
        }

        if ($desa) {
            $draft['desa_id'] = $desa->id;
            $draft['desa_nama'] = $desa->nama_desa;
        } elseif (!empty($draft['desa_id'])) {
            $desa = ProfilDesa::find($draft['desa_id']);
            if ($desa) {
                $draft['desa_nama'] = $desa->nama_desa;
            }
        }

        // 2. Identifikasi Kategori & Urgensi
        if (!empty($parsed['kategori'])) {
            $draft['kategori'] = $parsed['kategori'];
        }
        if (!empty($parsed['urgensi'])) {
            $draft['urgensi'] = $parsed['urgensi'];
        }

        // 3. Identifikasi Nama Pelapor
        if (preg_match('/(?:nama\s+saya|atas\s+nama)\s+([A-Za-z\s]{2,25})/i', $message, $m)) {
            $candidateName = trim($m[1]);
            if (!in_array(strtolower($candidateName), ['warga', 'ingin', 'mau', 'lapor', 'desa', 'masyarakat'])) {
                $draft['pelapor_nama'] = ucwords($candidateName);
            }
        }
        if (empty($draft['pelapor_nama'])) {
            $draft['pelapor_nama'] = $senderName ?: ('Warga ' . ($draft['desa_nama'] ?? 'Desa'));
        }

        // 4. Identifikasi Deskripsi
        if (empty($draft['deskripsi'])) {
            $draft['deskripsi'] = $parsed['deskripsi'] ?: $message;
        } else {
            // Jika sedang melengkapi desa, gabungkan atau pertahankan deskripsi lama
            if (strlen($message) > 15 && !preg_match('/^(desa\s+[a-z\s]+)$/i', trim($message))) {
                $draft['deskripsi'] .= ". " . $message;
            }
        }

        // Evaluasi kelengkapan data:
        // Syarat 1: Desa harus teridentifikasi dari database ProfilDesa
        if (empty($draft['desa_id'])) {
            $session['step'] = 'gathering_info';
            $session['draft'] = $draft;
            Cache::put($cacheKey, $session, now()->addHours(2));

            $contohDesa = ProfilDesa::take(3)->pluck('nama_desa')->implode(', ');
            $reply = "Terima kasih atas laporannya! 🙏\n\nAduan Anda: *\"{$draft['deskripsi']}\"*\n\nAgar aduan ini dapat kami teruskan secara tepat ke perangkat desa terkait, mohon sebutkan *nama desa* Anda ya.\n\n_Contoh_: *\"Desa Sukamaju\"* atau *\"Desa Berkah Makmur\"*.\n(Desa terdaftar di sistem: {$contohDesa})";

            return [
                'reply' => $reply,
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // Syarat 2: Deskripsi harus memiliki substansi masalah
        if (empty($draft['deskripsi']) || strlen($draft['deskripsi']) < 8) {
            $session['step'] = 'gathering_info';
            $session['draft'] = $draft;
            Cache::put($cacheKey, $session, now()->addHours(2));

            return [
                'reply' => "Desa sasaran Anda telah tercatat sebagai *{$draft['desa_nama']}*. 🏡\n\nMohon ceritakan lebih rinci mengenai keluhan, permasalahan fasilitas, atau kebutuhan warga yang ingin Anda sampaikan ke pihak desa.",
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // Jika data utama sudah lengkap -> Minta Konfirmasi Resmi (Awaiting Confirmation)
        $session['step'] = 'awaiting_confirmation';
        $session['draft'] = $draft;
        Cache::put($cacheKey, $session, now()->addHours(2));

        $namaPelapor = $draft['pelapor_nama'] ?: ($senderName ?: 'Warga ' . $draft['desa_nama']);
        $kat = strtoupper($draft['kategori'] ?? 'FASILITAS');
        $urg = strtoupper($draft['urgensi'] ?? 'SEDANG');

        $reply = "Baik Kak *{$namaPelapor}*, AIIRA telah menyusun draf aduan Anda sebagai berikut:\n\n" .
            "🏡 *Desa Sasaran*: {$draft['desa_nama']}\n" .
            "📂 *Kategori*: {$kat}\n" .
            "⚡ *Tingkat Urgensi*: {$urg}\n" .
            "📝 *Uraian Masalah*: \"{$draft['deskripsi']}\"\n\n" .
            "Apakah rincian aduan di atas sudah sesuai dan Anda yakin ingin menerbitkan tiket aduan resmi ke Perangkat Desa?\n\n" .
            "👉 Balas *YA* atau *KIRIM* untuk menerbitkan tiket aduan.\n" .
            "👉 Atau ketik koreksi Anda jika ada yang perlu diperbaiki (contoh: _\"ganti urgensi mendesak\"_).\n" .
            "👉 Ketik *BATAL* untuk membatalkan.";

        return [
            'reply' => $reply,
            'action' => 'confirm_needed',
            'ticket_data' => $draft,
        ];
    }

    /**
     * Memeriksa apakah pesan merupakan pertanyaan status tiket.
     */
    protected function isStatusQuery(string $lower): bool
    {
        $clean = trim($lower);

        // 1. Nomor tiket spesifik (misal: "tiket #12", "cek 7", "status #7", "#7")
        if (preg_match('/(?:tiket|cek|status|progres|lapor(?:an)?|#)\s*#?\s*\d+/i', $clean)) {
            return true;
        }

        // 2. Mengandung kata kunci inquiry status
        if (
            str_contains($clean, 'status') ||
            str_contains($clean, 'cek tiket') ||
            str_contains($clean, 'progres') ||
            str_contains($clean, 'aduan saya') ||
            str_contains($clean, 'laporan saya') ||
            str_contains($clean, 'cek aduan') ||
            str_contains($clean, 'cek laporan')
        ) {
            // Pastikan bukan pelaporan keluhan baru
            if (!preg_match('/\b(jalan|sampah|jembatan|lampu|banjir|posyandu|sekolah|stunting|umkm|rusak|lubang|amblas)\b/i', $clean)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Menangani pengecekan status tiket secara cerdas dari database.
     */
    protected function handleStatusCheck(string $cleanSender, string $message, ?string $senderName): array
    {
        $phoneVariants = [
            $cleanSender,
            ltrim($cleanSender, '62'),
            '0' . substr($cleanSender, 2),
            '+' . $cleanSender,
        ];

        // 1. Jika ada nomor tiket spesifik
        if (preg_match('/(?:tiket|cek|status|progres|lapor(?:an)?|#)\s*#?\s*(\d+)/i', $message, $m)) {
            $ticketId = (int) $m[1];
            $aspirasi = Aspirasi::with('desa', 'posKebutuhan')->find($ticketId);

            if (!$aspirasi) {
                return [
                    'reply' => "❌ *Tiket #{$ticketId} Tidak Ditemukan*\n\nMohon pastikan nomor tiket yang Anda masukkan sudah benar. Anda juga dapat mengetik *STATUS* untuk melihat riwayat aduan yang terdaftar dengan nomor WhatsApp ini.",
                    'action' => 'check_status',
                    'ticket_data' => null,
                ];
            }

            return [
                'reply' => $this->formatTicketDetailNarrative($aspirasi),
                'action' => 'check_status',
                'ticket_data' => $aspirasi->toArray(),
            ];
        }

        // 2. Cari semua tiket milik pengirim berdasarkan nomor WhatsApp
        $tickets = Aspirasi::with('desa', 'posKebutuhan')
            ->where(function ($q) use ($phoneVariants) {
                foreach ($phoneVariants as $p) {
                    $q->orWhere('pelapor_wa', 'LIKE', "%{$p}%");
                }
            })
            ->latest()
            ->take(3)
            ->get();

        if ($tickets->isEmpty()) {
            return [
                'reply' => "📋 Saat ini belum ditemukan tiket aduan aktif yang terdaftar dengan nomor WhatsApp Anda (*+{$cleanSender}*).\n\nJika Anda ingin menyampaikan keluhan atau usulan untuk desa Anda, ceritakan langsung masalahnya di sini ya (contoh: _\"Saya mau lapor jalan rusak di Desa Sukamaju\"_). AIIRA siap membantu! 😊",
                'action' => 'check_status',
                'ticket_data' => null,
            ];
        }

        $reply = "📄 *Status Tiket Aspirasi Anda*:\n\n";
        foreach ($tickets as $idx => $t) {
            $num = $idx + 1;
            $statusText = match ($t->status) {
                'menunggu' => '⏳ *SEDANG DITINJAU* oleh Perangkat Desa',
                'terverifikasi' => '✅ *DISETUJUI & DITERBITKAN* sebagai Pos Kebutuhan KKN Mahasiswa',
                'ditolak' => "❌ *DITOLAK* (Alasan: " . ($t->alasan_tolak ?: 'Tidak memenuhi kriteria desa') . ")",
                default => strtoupper($t->status),
            };

            $desaNama = $t->desa?->nama_desa ?? 'Desa';
            $reply .= "{$num}. *Tiket #{$t->id}* ({$desaNama})\n" .
                "   📂 Kategori: " . strtoupper($t->kategori) . "\n" .
                "   ⚡ Urgensi: " . strtoupper($t->urgensi) . "\n" .
                "   📊 Status: {$statusText}\n" .
                "   📝 \"{$t->deskripsi}\"\n\n";
        }

        $reply .= "_Ketik *STATUS #NOMOR* (contoh: *STATUS #{$tickets->first()->id}*) untuk melihat rincian lebih detail._";

        return [
            'reply' => $reply,
            'action' => 'check_status',
            'ticket_data' => $tickets->toArray(),
        ];
    }

    /**
     * Memformat rincian narasi status tiket resmi.
     */
    protected function formatTicketDetailNarrative(Aspirasi $aspirasi): string
    {
        $desaNama = $aspirasi->desa?->nama_desa ?? 'Desa Mitra';

        $statusNarrative = match ($aspirasi->status) {
            'menunggu' => "⏳ *SEDANG DITINJAU OLEH PERANGKAT DESA*\nLaporan Anda saat ini sedang dalam antrean verifikasi oleh Pemerintah Desa {$desaNama}. Tim desa akan meninjau kelayakan dan kesesuaian prioritas pembangunan desa.",
            'terverifikasi' => "✅ *DISETUJUI & RESMI DIJADIKAN PROGRAM KKN MAHASISWA*\nAspirasi Anda telah lolos verifikasi dan diangkat menjadi Pos Kebutuhan KKN nyata untuk direalisasikan bersama mahasiswa perguruan tinggi mitra!" . ($aspirasi->posKebutuhan ? "\n📌 *Nama Program*: {$aspirasi->posKebutuhan->judul}" : ""),
            'ditolak' => "❌ *DITOLAK OLEH PERANGKAT DESA*\n📋 *Catatan Desa*: " . ($aspirasi->alasan_tolak ?: 'Belum memenuhi kriteria program prioritas desa tahun berjalan.'),
            default => strtoupper($aspirasi->status),
        };

        return "📄 *Rincian Status Tiket Aspirasi (#{$aspirasi->id})*\n\n" .
            "🏡 *Desa Sasaran*: {$desaNama}\n" .
            "👤 *Pelapor*: {$aspirasi->pelapor_nama}\n" .
            "📂 *Kategori*: " . strtoupper($aspirasi->kategori) . "\n" .
            "⚡ *Tingkat Urgensi*: " . strtoupper($aspirasi->urgensi) . "\n" .
            "📝 *Uraian Aduan*: {$aspirasi->deskripsi}\n\n" .
            "📊 *Perkembangan Terkini*:\n{$statusNarrative}\n\n" .
            "💡 _Anda dapat menanyakan kembali perkembangan tiket ini kapan saja di nomor WhatsApp ini._";
    }

    /**
     * Cek apakah user mengonfirmasi persetujuan penerbitan tiket.
     */
    protected function isConfirmationAffirmative(string $lower): bool
    {
        $affirmativeWords = [
            'ya', 'iya', 'kirim', 'setuju', 'benar', 'betul', 'ok', 'oke', 'okee',
            'yes', 'yup', 'siap', 'proses', 'terbitkan', 'lanjut', 'lanjutkan', 'deal', 'gass', 'gas'
        ];

        $clean = preg_replace('/[^a-z0-9\s]/', '', $lower);
        $tokens = explode(' ', trim($clean));

        foreach ($tokens as $token) {
            if (in_array($token, $affirmativeWords)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Cek apakah user membatalkan pada langkah konfirmasi.
     */
    protected function isRejectionOrCancel(string $lower): bool
    {
        $rejectWords = ['tidak', 'gak', 'nggak', 'batal', 'cancel', 'bukan', 'salah', 'stop'];
        foreach ($rejectWords as $rw) {
            if (str_starts_with($lower, $rw)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Deteksi pertanyaan di luar domain (Level 5 Out-of-Domain).
     */
    protected function isOutOfDomain(string $lower): bool
    {
        $forbiddenKeywords = [
            'presiden', 'pilpres', 'politik', 'partai', 'pemilu', 'dpr',
            'puisi cinta', 'cerpen cinta', 'novel romantis',
            'resep masakan', 'cara masak', 'cara bikin kue',
            'jadwal bola', 'skor bola', 'film bioskop', 'game android',
            'kalkulus', 'matematika sma', 'integral', 'turunan',
            'coding react', 'flutter app', 'buat website jualan',
        ];

        foreach ($forbiddenKeywords as $word) {
            if (str_contains($lower, $word)) {
                // Kecuali jika ada kata desa atau kkn
                if (!str_contains($lower, 'desa') && !str_contains($lower, 'kkn')) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Respons penolakan santun 3 tahap (Acknowledge -> Soft Redirection -> Relevant Options).
     */
    protected function formatOutOfDomainReply(string $text): string
    {
        return "Untuk pertanyaan topik umum seperti itu, AIIRA belum bisa membantu ya Kak 😊.\n\nFokus utama AIIRA adalah mendampingi warga dan mahasiswa seputar platform BaktiNusantara, penyampaian aspirasi pembangunan desa, dan program KKN terpadu.\n\nAIIRA siap membantu Anda untuk hal-hal berikut:\n• 📝 Menyampaikan keluhan fasilitas atau potensi desa (jalan, kesehatan, UMKM, lingkungan)\n• 🔍 Mengecek status dan tindak lanjut tiket aspirasi warga (*ketik STATUS*)\n• 💡 Mencari informasi desa mitra dan program KKN mahasiswa\n\nYuk, ceritakan apa yang bisa AIIRA bantu untuk kemajuan desa Anda!";
    }

    /**
     * Mencari desa berdasarkan pencocokan nama di tabel `profil_desa`.
     */
    public function findDesaByName(string $text): ?ProfilDesa
    {
        $cleanText = strtolower($text);

        $semuaDesa = ProfilDesa::select('id', 'nama_desa', 'kecamatan', 'kabupaten', 'latitude', 'longitude')->get();

        // 1. Exact match / Contains
        foreach ($semuaDesa as $desa) {
            $namaClean = strtolower(trim(str_ireplace(['desa', 'kelurahan'], '', $desa->nama_desa)));
            if (!empty($namaClean) && str_contains($cleanText, $namaClean)) {
                return $desa;
            }
        }

        // 2. Kecamatan match
        foreach ($semuaDesa as $desa) {
            if (!empty($desa->kecamatan) && str_contains($cleanText, strtolower($desa->kecamatan))) {
                return $desa;
            }
        }

        return null;
    }

    /**
     * Analisis deskripsi aspirasi warga untuk mengekstrak desa, kategori, urgensi, dan SDGs.
     */
    public function parseAspirasi(string $text): array
    {
        $geminiKey = config('services.gemini.key');

        if (!empty($geminiKey) && !str_starts_with($geminiKey, 'AQ.')) {
            try {
                $aiResult = $this->callGeminiForAspirasi($text, $geminiKey);
                if ($aiResult) {
                    return $aiResult;
                }
            } catch (\Throwable $e) {
                Log::warning("Gemini AI API call failed, falling back to rule engine: " . $e->getMessage());
            }
        }

        return $this->ruleBasedParseAspirasi($text);
    }

    /**
     * Pemanggilan Gemini AI via REST API.
     */
    protected function callGeminiForAspirasi(string $text, string $key): ?array
    {
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $prompt = <<<PROMPT
Anda adalah AIIRA, asisten AI klasifikasi aspirasi masyarakat desa untuk platform BaktiNusantara.
Analisis pesan berikut dan ekstrak data ke dalam format JSON murni tanpa markdown:
{
  "desa_nama": "nama desa yang disebut atau null jika tidak ada",
  "kategori": "salah satu dari: umkm, kesehatan, lingkungan, pendidikan, fasilitas",
  "deskripsi": "ringkasan keluhan/masalah warga yang jelas",
  "urgensi": "salah satu dari: rendah, sedang, mendesak",
  "sdg_codes": ["array nomor SDG misal 3, 4, 8, 11, 13"]
}

Pesan warga:
"{$text}"
PROMPT;

        $response = Http::timeout(5)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.1,
                ]
            ]);

        if ($response->successful()) {
            $jsonText = $response->json('candidates.0.content.parts.0.text');
            $data = json_decode($jsonText, true);
            if (is_array($data) && isset($data['kategori'])) {
                return $data;
            }
        }

        return null;
    }

    /**
     * Rule-based engine fallback (cepat, akurat, dan tidak bergantung koneksi eksternal).
     */
    public function ruleBasedParseAspirasi(string $text): array
    {
        $lower = strtolower($text);

        // 1. Ekstrak Kategori & SDGs
        $kategori = 'fasilitas';
        $sdgCodes = [11];

        if (preg_match('/\b(umkm|jualan|dagang|produk|kemasan|logo|pembukuan|pasar|modal|bisnis|keripik|usaha|omzet|toko|warung)\b/i', $lower)) {
            $kategori = 'umkm';
            $sdgCodes = [8, 1];
        } elseif (preg_match('/\b(kesehatan|stunting|posyandu|gizi|balita|ibu hamil|sakit|puskesmas|imunisasi|sanitasi|jamban|bidan|obat)\b/i', $lower)) {
            $kategori = 'kesehatan';
            $sdgCodes = [3, 6];
        } elseif (preg_match('/\b(lingkungan|sampah|sungai|banjir|polusi|biogas|daur ulang|kebersihan|saluran air|got|limbah|pencemaran)\b/i', $lower)) {
            $kategori = 'lingkungan';
            $sdgCodes = [13, 15, 6];
        } elseif (preg_match('/\b(pendidikan|sekolah|les|belajar|bimbingan|literasi|anak|mengajar|guru|paud|sd|buku|perpustakaan)\b/i', $lower)) {
            $kategori = 'pendidikan';
            $sdgCodes = [4];
        } elseif (preg_match('/\b(jalan|rusak|lubang|lampu|penerangan|jembatan|gapura|balai|gedung|aspal|paving|lapangan|gor|drainase|air bersih|pipa)\b/i', $lower)) {
            $kategori = 'fasilitas';
            $sdgCodes = [9, 11];
        }

        // 2. Ekstrak Urgensi
        $urgensi = 'sedang';
        if (preg_match('/\b(darurat|bahaya|parah|segera|mendesak|urgent|roboh|putus|kecelakaan|amblas|banjir bandang|longsor|kritis)\b/i', $lower)) {
            $urgensi = 'mendesak';
        } elseif (preg_match('/\b(usulan|rencana|saran|kalau bisa|ide|ke depan|nanti)\b/i', $lower)) {
            $urgensi = 'rendah';
        }

        // 3. Deteksi Desa
        $desa = $this->findDesaByName($text);

        return [
            'desa_nama' => $desa?->nama_desa,
            'kategori' => $kategori,
            'deskripsi' => $text,
            'urgensi' => $urgensi,
            'sdg_codes' => $sdgCodes,
        ];
    }
}