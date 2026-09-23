<?php

namespace App\Services;

use App\Models\Aspirasi;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    /**
     * Prioritas model Gemini sesuai instruksi rotasi:
     * 1. gemini-3.5-flash
     * 2. gemini-3-flash
     * 3. gemini-2.5-flash
     * 4. gemini-3.1-flash-lite
     * 5. gemini-2.5-flash-lite
     * 6. gemma-4-26b
     * 7. gemma-4-31b
     * 8. gemini-1.5-flash (Fallback)
     */
    protected array $modelPool = [
        'gemini-3.5-flash',
        'gemini-3-flash',
        'gemini-2.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-2.5-flash-lite',
        'gemma-4-26b',
        'gemma-4-31b',
        'gemini-1.5-flash',
    ];

    /**
     * Mengambil pool API key yang bersih dari konfigurasi/environment.
     * Menerima format murni `KEY1,KEY2,...` maupun `UserAccount|KEY|true`.
     */
    public function getKeyPool(): array
    {
        $rawKeys = config('services.gemini.keys', []);
        if (empty($rawKeys)) {
            $envKeys = env('GEMINI_API_KEYS', '');
            if (!empty($envKeys)) {
                $rawKeys = explode(',', $envKeys);
            }
        }

        $cleanKeys = [];
        foreach ($rawKeys as $item) {
            $trimmed = trim($item);
            if (empty($trimmed)) {
                continue;
            }

            // Jika format pipe: Name|Key|Enabled
            if (str_contains($trimmed, '|')) {
                $parts = explode('|', $trimmed);
                if (isset($parts[1]) && !empty(trim($parts[1]))) {
                    $cleanKeys[] = trim($parts[1]);
                    continue;
                }
            }

            $cleanKeys[] = $trimmed;
        }

        $singleKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
        if (!empty($singleKey)) {
            $cleanSingle = trim($singleKey);
            if (str_contains($cleanSingle, '|')) {
                $parts = explode('|', $cleanSingle);
                if (isset($parts[1]) && !empty(trim($parts[1]))) {
                    $cleanSingle = trim($parts[1]);
                }
            }
            if (!in_array($cleanSingle, $cleanKeys)) {
                array_unshift($cleanKeys, $cleanSingle);
            }
        }

        return array_values(array_unique(array_filter($cleanKeys)));
    }

    /**
     * Mengambil API key aktif berikutnya dengan strategi Round-Robin bergantian.
     */
    public function getNextApiKey(): ?string
    {
        $pool = $this->getKeyPool();
        if (empty($pool)) {
            return null;
        }

        try {
            $current = (int) Cache::get('gemini_key_rotation_idx', 0);
            $next = ($current + 1) % count($pool);
            Cache::put('gemini_key_rotation_idx', $next, now()->addDays(7));
            return $pool[$current % count($pool)];
        } catch (\Throwable) {
            $idx = random_int(0, count($pool) - 1);
            return $pool[$idx];
        }
    }

    /**
     * Mengambil ringkasan konteks langsung dari database MySQL (Profil Desa, Pos Kebutuhan, Aspirasi).
     */
    public function getDatabaseContextSummary(): array
    {
        try {
            $desaList = ProfilDesa::select('id', 'nama_desa', 'kecamatan', 'kabupaten')->get();
            $posList = PosKebutuhan::with('desa')->latest()->take(5)->get();
            $aspirasiCount = Aspirasi::count();

            return [
                'total_desa' => $desaList->count(),
                'desa_list' => $desaList,
                'desa_names' => $desaList->pluck('nama_desa')->all(),
                'pos_kebutuhan' => $posList,
                'total_aspirasi' => $aspirasiCount,
            ];
        } catch (\Throwable $e) {
            Log::warning("Gagal mengambil context database: " . $e->getMessage());
            return [
                'total_desa' => 0,
                'desa_list' => collect([]),
                'desa_names' => ['Desa Sukamaju', 'Desa Berkah Makmur', 'Desa Cempaka Putih'],
                'pos_kebutuhan' => collect([]),
                'total_aspirasi' => 0,
            ];
        }
    }

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
        if ($this->isCancelIntent($lower)) {
            Cache::forget($cacheKey);
            $nama = $senderName ?: 'Bapak/Ibu';
            return [
                'reply' => "Baik {$nama}, sesi percakapan/aduan sebelumnya telah di-reset. 👍\n\nJika nanti Anda ingin menanyakan info desa, melihat program KKN, menyampaikan aspirasi warga, atau mengecek tiket aduan, silakan chat AIIRA kapan saja ya! 😊",
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 2. INTENT: CEK STATUS / PROGRES TIKET
        if ($this->isStatusQuery($lower)) {
            return $this->handleStatusCheck($cleanSender, $trimmed, $senderName);
        }

        // 3. INTENT: KONFIRMASI PEMBUATAN TIKET RESMI (Hanya jika sedang menunggu konfirmasi)
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
                    'reply' => "Baik, penerbitan tiket aduan dibatalkan dan draf telah dihapus. 👍\n\nApakah ada hal lain seputar info desa atau program KKN yang ingin Anda tanyakan kepada AIIRA? 😊",
                    'action' => 'none',
                    'ticket_data' => null,
                ];
            }
        }

        // 4. INTENT: OUT-OF-DOMAIN CHECK (Menolak topik politik, resep, cinta umum secara santun)
        if ($this->isOutOfDomain($lower)) {
            return [
                'reply' => $this->formatOutOfDomainReply($trimmed),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 5. INTENT: TANYA KEMAMPUAN / FITUR AIIRA ("apa yang bisa anda lakukan", "kamu bisa apa aja sih", dll.)
        if ($this->isCapabilitiesQuery($lower)) {
            return [
                'reply' => $this->handleCapabilitiesInquiry($senderName, $session),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 6. INTENT: TANYA DAFTAR DESA / PROFIL DESA LANGSUNG DARI DATABASE
        if ($this->isDesaQuery($lower)) {
            return [
                'reply' => $this->handleDesaInquiry(),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 7. INTENT: TANYA PROGRAM KKN / POS KEBUTUHAN LANGSUNG DARI DATABASE
        if ($this->isProgramQuery($lower)) {
            return [
                'reply' => $this->handleProgramInquiry(),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 8. INTENT: GREETING / SAPAAN RAMAH ("halo", "hai", "selamat pagi", "p")
        if ($this->isGreeting($lower)) {
            return [
                'reply' => $this->handleGreeting($senderName, $session),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 9. INTENT: PELAPORAN / DRAF ASPIRASI WARGA
        // Cek apakah pesan benar-benar mengindikasikan keluhan/aduan warga atau respon nama desa
        if ($this->isAspirasiReportIntent($lower, $trimmed, $session)) {
            return $this->processAspirasiConversation($cleanSender, $trimmed, $senderName, $session);
        }

        // 10. CHAT UMUM / KONSULTASI SEPUTAR DESA & KKN (GEMINI MODEL ROTATION + SMART LOCAL FALLBACK)
        return [
            'reply' => $this->handleGeneralChatWithAI($trimmed, $cleanSender, $senderName, $session),
            'action' => 'none',
            'ticket_data' => null,
        ];
    }

    /**
     * Memeriksa apakah pesan merupakan pembatalan/reset.
     */
    protected function isCancelIntent(string $lower): bool
    {
        $cancelWords = ['batal', 'cancel', 'gak jadi', 'nggak jadi', 'reset', 'ulang', 'stop', 'batalin'];
        foreach ($cancelWords as $w) {
            if ($lower === $w || str_starts_with($lower, $w . ' ')) {
                return true;
            }
        }
        return false;
    }

    /**
     * Memeriksa apakah pesan merupakan sapaan/greeting.
     */
    protected function isGreeting(string $lower): bool
    {
        $greetings = [
            'halo', 'halo aiira', 'halo aira', 'hai', 'hai aiira', 'hi', 'hi aiira',
            'p', 'assalamualaikum', 'assalamu alaikum', 'assalamu\'alaikum',
            'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
            'pagi', 'siang', 'sore', 'malam', 'menu', 'bantuan', 'help', 'start'
        ];

        $clean = trim(preg_replace('/[^a-z0-9\s]/', '', $lower));
        if (in_array($clean, $greetings)) {
            return true;
        }

        foreach (['halo', 'hai', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum'] as $lead) {
            if (str_starts_with($clean, $lead) && strlen($clean) <= strlen($lead) + 12) {
                return true;
            }
        }

        return false;
    }

    /**
     * Memeriksa apakah user bertanya tentang kemampuan / kapabilitas AIIRA.
     */
    protected function isCapabilitiesQuery(string $lower): bool
    {
        $patterns = [
            'apa yang bisa anda lakukan',
            'apa yang bisa kamu lakukan',
            'kamu bisa apa aja sih',
            'kamu bisa apa aja',
            'bisa apa aja',
            'bisa ngapain aja',
            'fitur apa saja',
            'fitur apa aja',
            'bisa bantu apa',
            'bisa bantu apa saja',
            'apa fungsi kamu',
            'fungsi aiira',
            'siapa kamu',
            'tugas kamu apa',
            'kamu siapa',
            'siapa anda',
        ];

        foreach ($patterns as $pattern) {
            if (str_contains($lower, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Memeriksa apakah user menanyakan daftar atau info desa di sistem.
     */
    protected function isDesaQuery(string $lower): bool
    {
        $patterns = [
            'desa apa saja',
            'ada desa apa saja',
            'desa apa aja',
            'ada desa apa aja',
            'daftar desa',
            'desa terdaftar',
            'desa mitra',
            'info desa',
            'lihat desa',
            'sebutkan desa',
            'desa mana saja',
        ];

        foreach ($patterns as $pattern) {
            if (str_contains($lower, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Memeriksa apakah user menanyakan program KKN atau pos kebutuhan di sistem.
     */
    protected function isProgramQuery(string $lower): bool
    {
        $patterns = [
            'program kkn apa saja',
            'program kkn apa aja',
            'pos kebutuhan apa saja',
            'pos kebutuhan apa aja',
            'program apa saja',
            'program apa aja',
            'ada program apa',
            'lowongan kkn',
            'info kkn',
            'daftar program',
            'pos kkn',
        ];

        foreach ($patterns as $pattern) {
            if (str_contains($lower, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Menentukan apakah pesan merupakan intensi pengaduan / aspirasi masyarakat.
     */
    protected function isAspirasiReportIntent(string $lower, string $message, array $session): bool
    {
        // 1. Jika dalam tahap gathering_info dan user menyebutkan nama desa
        if ($session['step'] === 'gathering_info') {
            $desa = $this->findDesaByName($message);
            if ($desa) {
                return true;
            }
            // Jika user memberikan teks keterangan masalah
            if (strlen($message) >= 10 && !preg_match('/\b(apa|siapa|kenapa|mengapa|halo|hai)\b/i', $message)) {
                return true;
            }
        }

        // 2. Deteksi kata kunci pengaduan / permasalahan
        $complaintKeywords = [
            'lapor', 'aduan', 'mengadu', 'keluhan', 'menyampaikan aspirasi', 'usulan warga',
            'jalan rusak', 'jalan berlubang', 'jalan amblas', 'jembatan rusak', 'jembatan putus',
            'lampu mati', 'penerangan mati', 'lampu jalan mati', 'gelap',
            'sampah menumpuk', 'sungai kotor', 'banjir', 'limbah', 'polusi',
            'stunting', 'posyandu', 'air bersih', 'pipa bocor', 'saluran mampet', 'drainase',
            'umkm butuh', 'bantuan modal', 'pelatihan digital',
        ];

        foreach ($complaintKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                return true;
            }
        }

        // 3. Pola frasa "saya warga desa ... mau lapor ..."
        if (preg_match('/(?:warga|desa|lapor|keluhan|aspirasi)/i', $lower) && $this->findDesaByName($message)) {
            return true;
        }

        return false;
    }

    /**
     * Penjelasan kapabilitas cerdas AIIRA dengan live data database.
     */
    protected function handleCapabilitiesInquiry(?string $senderName, array $session): string
    {
        $db = $this->getDatabaseContextSummary();
        $nama = $senderName ? "Kak *{$senderName}*" : "Bapak/Ibu";
        $contohDesa = !empty($db['desa_names']) ? implode(', ', array_slice($db['desa_names'], 0, 3)) : 'Desa Sukamaju, Desa Berkah Makmur';

        $draftNote = "";
        if ($session['step'] === 'gathering_info' && !empty($session['draft']['deskripsi'])) {
            $draftNote = "\n\n💡 _Catatan: Anda memiliki draf aduan yang belum selesai. Ketik *BATAL* untuk mereset, atau sebutkan nama desa untuk melanjutkan._";
        }

        return "Halo {$nama}! Saya *AIIRA* — Asisten AI Resmi & Cerdas Platform BaktiNusantara. 🇮🇩✨\n\n" .
            "Saya terhubung langsung ke basis data realtime BaktiNusantara dan dapat membantu Anda dengan berbagai hal berikut:\n\n" .
            "1️⃣ 🏡 *Informasi & Penelusuran Desa Mitra*\n" .
            "• Mengetahui desa binaan yang terdaftar (Total saat ini: *{$db['total_desa']} Desa*, contoh: {$contohDesa}).\n" .
            "• Ketik: _\"Ada desa apa saja?\"_ untuk melihat daftar lengkap.\n\n" .
            "2️⃣ 🎓 *Katalog Program KKN & Pos Kebutuhan*\n" .
            "• Melihat lowongan program pengabdian mahasiswa di bidang UMKM, Kesehatan/Stunting, Lingkungan, Fasilitas, dan Pendidikan.\n" .
            "• Ketik: _\"Program KKN apa saja yang ada?\"_.\n\n" .
            "3️⃣ 📢 *Layanan Aspirasi & Pengaduan Warga Desa (Auto-Ticketing)*\n" .
            "• Anda dapat langsung menceritakan keluhan infrastruktur, jalan berlubang, lampu padam, atau kebutuhan warga desa.\n" .
            "• AIIRA akan menganalisis, mengklasifikasikan kategori & urgensinya, lalu menerbitkan *Tiket Aduan Resmi* ke Perangkat Desa terkait tanpa perlu membuka web!\n" .
            "• Contoh: _\"Saya warga Desa Sukamaju mau lapor jalan dusun 2 berlubang parah\"_.\n\n" .
            "4️⃣ 🔍 *Pemantauan Status Tiket Realtime*\n" .
            "• Cukup ketik *STATUS* atau *CEK #TIKET* untuk melihat progres tindak lanjut aduan Anda.\n\n" .
            "Ada yang ingin Anda tanyakan atau butuh bantuan AIIRA sekarang? 😊" . $draftNote;
    }

    /**
     * Respons sapaan ramah AIIRA.
     */
    protected function handleGreeting(?string $senderName, array $session): string
    {
        $nama = $senderName ? " *{$senderName}*" : "";
        $draftNote = "";
        if ($session['step'] === 'gathering_info' && !empty($session['draft']['deskripsi'])) {
            $draftNote = "\n\n💡 _Catatan: Draf aduan Anda sebelumnya masih tersimpan. Ketik *BATAL* jika ingin membatalkannya, atau ceritakan hal yang ingin Anda tanyakan._";
        }

        return "Halo{$nama}! Salam hangat dari *AIIRA* — Asisten AI Resmi Platform BaktiNusantara. 🇮🇩👋\n\n" .
            "Saya siap mendampingi Anda 24/7. Anda dapat:\n" .
            "• Bertanya seputar fitur & data desa mitra (_Ketik: *Desa apa saja?*_)\n" .
            "• Melihat program kerja KKN mahasiswa (_Ketik: *Program KKN apa saja?*_)\n" .
            "• Menyampaikan keluhan fasilitas atau potensi desa secara langsung\n" .
            "• Mengecek status aduan Anda (_Ketik: *STATUS*)\n\n" .
            "Ada yang bisa AIIRA bantu untuk Anda hari ini? 😊" . $draftNote;
    }

    /**
     * Handler penelusuran desa langsung dari tabel `profil_desa`.
     */
    protected function handleDesaInquiry(): string
    {
        $db = $this->getDatabaseContextSummary();
        $desaList = $db['desa_list'];

        if ($desaList->isEmpty()) {
            return "Saat ini belum ada data profil desa yang terdaftar di database sistem BaktiNusantara.";
        }

        $reply = "🏡 *Daftar Desa Mitra Terdaftar di BaktiNusantara*:\n\n";
        foreach ($desaList as $idx => $d) {
            $num = $idx + 1;
            $reply .= "{$num}. *{$d->nama_desa}*\n" .
                "   📍 Lokasi: Kec. {$d->kecamatan}, {$d->kabupaten}\n";
        }

        $reply .= "\n💡 _Untuk menyampaikan aspirasi warga ke desa terkait, Anda cukup menyebutkan nama desanya di sini (contoh: \"Saya mau lapor lampu mati di {$desaList->first()->nama_desa}\")._";

        return $reply;
    }

    /**
     * Handler penelusuran program KKN / pos kebutuhan langsung dari tabel `pos_kebutuhan`.
     */
    protected function handleProgramInquiry(): string
    {
        $posList = PosKebutuhan::with('desa')->latest()->take(5)->get();

        if ($posList->isEmpty()) {
            return "Saat ini belum ada Pos Kebutuhan KKN aktif yang dipublikasikan oleh perangkat desa.";
        }

        $reply = "🎓 *Program KKN & Pos Kebutuhan Terbuka Terkini*:\n\n";
        foreach ($posList as $idx => $p) {
            $num = $idx + 1;
            $desaNama = $p->desa?->nama_desa ?? 'Desa Binaan';
            $kat = strtoupper($p->kategori);
            $reply .= "{$num}. *{$p->judul}*\n" .
                "   🏡 Desa: {$desaNama}\n" .
                "   📂 Bidang: {$kat}\n" .
                "   👥 Kuota: {$p->kuota_kelompok} Kelompok\n\n";
        }

        $reply .= "_Informasi selengkapnya dan pendaftaran tim KKN dapat diakses melalui portal GayatamaWeb._";

        return $reply;
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
        try {
            $parsed = $this->callGeminiForAspirasiWithRotation($message);
        } catch (\Throwable $e) {
            Log::warning("Gemini AI API call failed, falling back to rule engine: " . $e->getMessage());
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
            // Jika sebelumnya deskripsi sudah ada dan pesan sekarang bukan sekadar menyebut nama desa
            if (!$desa && strlen($message) > 15) {
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
            $reply = "Terima kasih atas laporannya! 🙏\n\n" .
                "Aduan Anda: *\"{$draft['deskripsi']}\"*\n\n" .
                "Agar aduan ini dapat diteruskan secara tepat ke perangkat desa terkait, mohon sebutkan *nama desa* Anda ya.\n\n" .
                "_Contoh_: *\"Desa Sukamaju\"* atau *\"Desa Berkah Makmur\"*.\n" .
                "(Desa terdaftar di sistem: {$contohDesa})\n\n" .
                "_Ketik *BATAL* jika ingin membatalkan laporan ini._";

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
                'reply' => "Desa sasaran Anda telah tercatat sebagai *{$draft['desa_nama']}*. 🏡\n\n" .
                    "Mohon ceritakan lebih rinci mengenai keluhan, fasilitas, atau kebutuhan warga yang ingin Anda sampaikan ke pihak desa.\n\n" .
                    "_Ketik *BATAL* jika ingin membatalkan laporan ini._",
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
            "👉 Balas *YA* atau *KIRIM* untuk menerbitkan tiket aduan resmi.\n" .
            "👉 Atau ketik koreksi Anda jika ada yang perlu diperbaiki (contoh: _\"ganti urgensi mendesak\"_).\n" .
            "👉 Ketik *BATAL* untuk membatalkan.";

        return [
            'reply' => $reply,
            'action' => 'confirm_needed',
            'ticket_data' => $draft,
        ];
    }

    /**
     * Menangani chat umum seputar platform BaktiNusantara & desa menggunakan rotasi model Gemini dan database context.
     */
    protected function handleGeneralChatWithAI(string $message, string $cleanSender, ?string $senderName, array $session): string
    {
        $db = $this->getDatabaseContextSummary();
        $desaNames = implode(', ', $db['desa_names']);

        $systemInstruction = "Anda adalah AIIRA, asisten AI cerdas resmi platform BaktiNusantara (GayatamaWeb). " .
            "Fokus keahlian Anda: program Kuliah Kerja Nyata (KKN), kemitraan desa binaan, dan aspirasi pembangunan desa. " .
            "Desa mitra yang saat ini terdaftar di database sistem kami adalah: [{$desaNames}]. " .
            "Jawablah dengan bahasa Indonesia yang ramah, sopan, bersahabat, terstruktur rapi, dan informatif. " .
            "Gunakan WhatsApp styling (cetak tebal dengan *, miring dengan _) dan emoji yang pas.";

        // Coba rotasi model Gemini & rotasi API Key
        $reply = $this->callGeminiTextWithRotation($message, $systemInstruction);
        if (!empty($reply)) {
            return $reply;
        }

        // Fallback cerdas lokal jika remote API sedang tidak dapat diakses
        return $this->handleLocalIntelligentChat($message, $senderName, $db);
    }

    /**
     * Pemanggilan Gemini AI untuk percakapan teks dengan rotasi Model dan rotasi API Key.
     */
    public function callGeminiTextWithRotation(string $prompt, string $systemInstruction): ?string
    {
        $models = $this->modelPool;
        $keys = $this->getKeyPool();

        if (empty($keys)) {
            return null;
        }

        foreach ($models as $model) {
            $key = $this->getNextApiKey();
            if (empty($key)) {
                continue;
            }

            try {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}";
                $response = Http::timeout(6)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'X-goog-api-key' => $key,
                    ])
                    ->post($url, [
                        'contents' => [
                            [
                                'role' => 'user',
                                'parts' => [['text' => $prompt]],
                            ]
                        ],
                        'systemInstruction' => [
                            'parts' => [['text' => $systemInstruction]],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'maxOutputTokens' => 1024,
                        ]
                    ]);

                if ($response->successful()) {
                    $text = $response->json('candidates.0.content.parts.0.text');
                    if (!empty($text)) {
                        return trim($text);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("Gemini model {$model} call failed: " . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Pemanggilan Gemini AI untuk parsing aspirasi dengan rotasi model dan API key.
     */
    public function callGeminiForAspirasiWithRotation(string $text): ?array
    {
        $keys = $this->getKeyPool();
        if (empty($keys)) {
            return null;
        }

        $models = $this->modelPool;

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

        foreach ($models as $model) {
            $key = $this->getNextApiKey();
            if (empty($key)) {
                continue;
            }

            try {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}";
                $response = Http::timeout(5)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'X-goog-api-key' => $key,
                    ])
                    ->post($url, [
                        'contents' => [
                            [
                                'parts' => [['text' => $prompt]]
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
            } catch (\Throwable $e) {
                Log::warning("Gemini aspirasi parser model {$model} failed: " . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Fallback cerdas lokal berpengetahuan luas tentang platform BaktiNusantara & data database.
     */
    protected function handleLocalIntelligentChat(string $message, ?string $senderName, array $db): string
    {
        $nama = $senderName ? "Kak *{$senderName}*" : "Bapak/Ibu";
        $desaSample = !empty($db['desa_names']) ? implode(', ', array_slice($db['desa_names'], 0, 3)) : 'Desa Sukamaju, Berkah Makmur';

        return "Halo {$nama}! Saya mendengarkan pesan Anda: *\"{$message}\"*.\n\n" .
            "Sebagai asisten resmi BaktiNusantara, saya siap mendampingi Anda seputar pemberdayaan desa dan program KKN mahasiswa. 🇮🇩\n\n" .
            "Beberapa hal praktis yang dapat langsung Anda tanyakan ke saya:\n" .
            "• 🏡 *Desa Terdaftar*: Ketik _\"Desa apa saja?\"_ untuk melihat daftar {$db['total_desa']} desa mitra kami.\n" .
            "• 🎓 *Program KKN*: Ketik _\"Program KKN apa saja?\"_ untuk melihat pos pengabdian yang sedang buka.\n" .
            "• 📢 *Kirim Aduan*: Sampaikan keluhan fasilitas desa (contoh: _\"Saya mau lapor jalan berlubang di {$desaSample}\"_).\n" .
            "• 🔍 *Cek Tiket*: Ketik *STATUS* untuk melihat perkembangan aduan Anda.";
    }

    /**
     * Memeriksa apakah pesan merupakan pertanyaan status tiket.
     */
    protected function isStatusQuery(string $lower): bool
    {
        $clean = trim($lower);

        if (preg_match('/(?:tiket|cek|status|progres|lapor(?:an)?|#)\s*#?\s*\d+/i', $clean)) {
            return true;
        }

        if (
            str_contains($clean, 'status') ||
            str_contains($clean, 'cek tiket') ||
            str_contains($clean, 'progres') ||
            str_contains($clean, 'aduan saya') ||
            str_contains($clean, 'laporan saya') ||
            str_contains($clean, 'cek aduan') ||
            str_contains($clean, 'cek laporan')
        ) {
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
     * Deteksi pertanyaan di luar domain.
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
                if (!str_contains($lower, 'desa') && !str_contains($lower, 'kkn')) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Respons penolakan santun 3 tahap.
     */
    protected function formatOutOfDomainReply(string $text): string
    {
        return "Untuk pertanyaan topik umum seperti itu, AIIRA belum bisa membantu ya Kak 😊.\n\n" .
            "Fokus utama AIIRA adalah mendampingi warga dan mahasiswa seputar platform BaktiNusantara, penyampaian aspirasi pembangunan desa, dan program KKN terpadu.\n\n" .
            "AIIRA siap membantu Anda untuk hal-hal berikut:\n" .
            "• 📝 Menyampaikan keluhan fasilitas atau potensi desa (jalan, kesehatan, UMKM, lingkungan)\n" .
            "• 🔍 Mengecek status dan tindak lanjut tiket aspirasi warga (*ketik STATUS*)\n" .
            "• 💡 Mencari informasi desa mitra dan program KKN mahasiswa\n\n" .
            "Yuk, ceritakan apa yang bisa AIIRA bantu untuk kemajuan desa Anda!";
    }

    /**
     * Mencari desa berdasarkan pencocokan nama di tabel `profil_desa`.
     */
    public function findDesaByName(string $text): ?ProfilDesa
    {
        $cleanText = strtolower($text);

        try {
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
        } catch (\Throwable $e) {
            Log::warning("Error query findDesaByName: " . $e->getMessage());
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