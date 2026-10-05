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
     * Prioritas model Gemini resmi terkini:
     * 1. gemini-1.5-flash
     * 2. gemini-1.5-flash-latest
     * 3. gemini-2.0-flash
     * 4. gemini-2.0-flash-exp
     * 5. gemini-1.5-pro
     */
    protected array $modelPool = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
    ];

    /**
     * Deteksi bahasa secara otomatis (Indonesian vs English) dengan dukungan peralihan bahasa eksplisit.
     */
    public function detectLanguage(string $text, string $default = 'id'): string
    {
        $lower = strtolower(trim($text));

        // 0. Deteksi permintaan pergantian bahasa secara eksplisit
        if (preg_match('/\b(switch to english|speak in english|in english|english please|use english|change language to english|speak english|talk in english|switch english|can you speak english|do you speak english)\b/i', $lower)) {
            return 'en';
        }
        if (preg_match('/\b(pakai bahasa inggris|bisa bahasa inggris|bahasa inggris ya|bahasa inggris dong|ke bahasa inggris|ngomong bahasa inggris|pake bahasa inggris|ganti ke bahasa inggris|ganti bahasa inggris)\b/i', $lower)) {
            return 'en';
        }
        if (preg_match('/\b(switch to indonesian|in indonesian|indonesian please|use indonesian|change language to indonesian|speak indonesian|talk in indonesian|switch indonesian|can you speak indonesian)\b/i', $lower)) {
            return 'id';
        }
        if (preg_match('/\b(pakai bahasa indonesia|bahasa indonesia|bahasa indonesia aja|bahasa indonesia dong|ke bahasa indonesia|bicara bahasa indonesia|pake bahasa indonesia|ganti ke bahasa indonesia|ganti bahasa indonesia|bisa bahasa indonesia)\b/i', $lower)) {
            return 'id';
        }

        // Single word language commands
        if ($lower === 'english' || $lower === 'bahasa inggris') {
            return 'en';
        }
        if ($lower === 'indonesian' || $lower === 'bahasa indonesia') {
            return 'id';
        }

        // 1. Frasa kunci spesifik Bahasa Indonesia (dieksekusi lebih dulu agar kata serapan/teknis seperti "matching score" dalam kalimat bahasa Indonesia tetap akurat)
        $idPhrases = [
            'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
            'siapa kamu', 'siapa namamu', 'kamu siapa', 'apa itu', 'ada desa apa', 'desa apa', 'desa nya apa', 'desanya apa',
            'daftar desa', 'desa mitra', 'saya mau lapor', 'mau lapor', 'tolong bantu', 'bisa bantu',
            'jalan rusak', 'jalan berlubang', 'jembatan roboh', 'lampu mati', 'terima kasih', 'makasih banyak',
            'cek tiket', 'status tiket', 'cek aduan', 'aduan saya', 'gimana cara', 'bagaimana cara', 'cara kerja',
            'apakah gratis', 'apakah bayar', 'hubungi admin', 'kontak admin', 'kami kekurangan', 'lupa submit',
            'program kkn apa saja', 'pos kebutuhan apa saja', 'skor kecocokan', 'izin orang tua', 'aturan 1000 km'
        ];
        foreach ($idPhrases as $p) {
            if (str_contains($lower, $p)) {
                return 'id';
            }
        }

        // 2. Frasa kunci spesifik Bahasa Inggris
        $enPhrases = [
            'good morning', 'good afternoon', 'good evening', 'good night',
            'how are you', 'who are you', 'what is', 'what are', 'tell me', 'tell us',
            'list of', 'which village', 'which villages', 'i want to report', 'i would like to',
            'broken bridge', 'broken road', 'stunting', 'thank you', 'thanks a lot',
            'check status', 'check ticket', 'my ticket', 'track ticket', 'help me', 'can you help',
            'how to register', 'how does it work', 'what can you do', 'where is', 'where are', 'is it free',
            'contact admin', 'contact support', 'please help', 'we lack', 'how to submit', 'forgot to submit',
            'what villages', 'available villages', 'show me', 'kkn programs', 'open positions',
            'how matching works', 'matching score', 'parental consent', '1000 km rule'
        ];
        foreach ($enPhrases as $p) {
            if (str_contains($lower, $p)) {
                return 'en';
            }
        }

        // 3. Skor kata per kata
        $tokens = preg_split('/[^a-z0-9]+/i', $lower);
        $enKeywords = [
            'the', 'is', 'are', 'was', 'were', 'am',
            'what', 'who', 'how', 'why', 'where', 'when', 'which', 'can',
            'could', 'would', 'should', 'you', 'your', 'my', 'our', 'we',
            'village', 'villages', 'student', 'students', 'community', 'service',
            'report', 'complaint', 'problem', 'issue', 'ticket', 'status',
            'broken', 'bridge', 'road', 'light', 'flood', 'trash',
            'submit', 'proposal', 'matching', 'score', 'certificate', 'verify',
            'free', 'cost', 'fee', 'contact', 'admin', 'help', 'please', 'thanks', 'thank',
            'open', 'need', 'lack', 'counseling'
        ];

        $idKeywords = [
            'halo', 'hai', 'hello', 'hi', 'hey', 'yang', 'di', 'ke', 'dari', 'pada', 'dalam', 'untuk',
            'dengan', 'dan', 'atau', 'ini', 'itu', 'adalah', 'saya', 'kami', 'kita',
            'kamu', 'anda', 'mereka', 'dia', 'apa', 'siapa', 'bagaimana', 'kenapa',
            'mengapa', 'dimana', 'kapan', 'bisa', 'ada', 'tidak', 'nggak', 'gak',
            'bukan', 'mau', 'ingin', 'lapor', 'aduan', 'desa', 'keluhan', 'jalan',
            'jembatan', 'rusak', 'roboh', 'mati', 'lampu', 'sampah', 'banjir',
            'terima', 'kasih', 'makasih', 'tiket', 'cek', 'status', 'lupa', 'daftar',
            'kontak', 'hubungi', 'bantuan', 'layanan', 'binaan', 'mitra', 'admin', 'kkn', 'gizi', 'warga'
        ];

        $enScore = 0;
        $idScore = 0;

        foreach ($tokens as $token) {
            if (in_array($token, $enKeywords)) {
                $enScore++;
            }
            if (in_array($token, $idKeywords)) {
                $idScore++;
            }
        }

        if ($enScore >= 2 && $enScore > $idScore) {
            return 'en';
        }

        return 'id';
    }

    /**
     * Mengambil pool API key yang bersih dari konfigurasi/environment.
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
            $posList = PosKebutuhan::with('desa')->latest()->take(6)->get();
            $aspirasiCount = Aspirasi::count();

            return [
                'total_desa' => $desaList->count(),
                'desa_list' => $desaList,
                'desa_names' => $desaList->pluck('nama_desa')->all(),
                'desa_names_sample' => $desaList->pluck('nama_desa')->take(4)->implode(', '),
                'pos_kebutuhan' => $posList,
                'total_aspirasi' => $aspirasiCount,
            ];
        } catch (\Throwable $e) {
            Log::warning("Gagal mengambil context database: " . $e->getMessage());
            return [
                'total_desa' => 7,
                'desa_list' => collect([]),
                'desa_names' => ['Desa Sukamaju', 'Desa Berkah Makmur', 'Desa Cempaka Putih', 'Desa Maju Bersama'],
                'desa_names_sample' => 'Desa Sukamaju, Desa Berkah Makmur, Desa Cempaka Putih, Desa Maju Bersama',
                'pos_kebutuhan' => collect([]),
                'total_aspirasi' => 0,
            ];
        }
    }

    /**
     * Layanan percakapan interaktif multi-turn AIIRA untuk WhatsApp (Dukungan Bilingual Indonesia & Inggris).
     */
    public function chatWithAiira(string $sender, string $message, ?string $senderName = null): array
    {
        $cleanSender = preg_replace('/[^0-9]/', '', $sender);
        $cacheKey = "wa_session_{$cleanSender}";

        // Ambil sesi multi-turn sebelumnya dari Cache (TTL 2 jam)
        $session = Cache::get($cacheKey, [
            'step' => 'idle',
            'lang' => 'id', // 'id' | 'en'
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

        // Deteksi bahasa pengguna (ID vs EN)
        $lang = $this->detectLanguage($trimmed, $session['lang'] ?? 'id');
        $session['lang'] = $lang;
        Cache::put($cacheKey, $session, now()->addHours(2));

        // 1. INTENT: BATAL / RESET SESI
        if ($this->isCancelIntent($lower)) {
            Cache::forget($cacheKey);
            $nama = $senderName ?: ($lang === 'en' ? 'Friend' : 'Kakak');
            $reply = $lang === 'en'
                ? "Alright {$nama}, your previous conversation/draft has been reset. 👍\n\nWhenever you would like to explore partner villages, browse KKN programs, submit a citizen report, or check your ticket status, feel free to chat with AIIRA anytime! 😊"
                : "Baik {$nama}, sesi percakapan/aduan sebelumnya telah di-reset. 👍\n\nJika nanti Anda ingin menanyakan info desa, melihat program KKN, menyampaikan aspirasi warga, atau mengecek tiket aduan, silakan chat AIIRA kapan saja ya! 😊";

            return [
                'reply' => $reply,
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 1B. INTENT: PERGANTIAN MODE BAHASA EKSPLISIT (EXPLICIT LANGUAGE SWITCH)
        if ($this->isLanguageSwitchQuery($lower)) {
            $session['lang'] = $lang;
            Cache::put($cacheKey, $session, now()->addHours(2));

            $sName = $senderName ? " *{$senderName}*" : "";
            if ($lang === 'en') {
                $reply = "Of course! AIIRA has switched the conversation to **English**. 🇬🇧✨\n\n" .
                    "I am **AIIRA**, the official intelligent assistant for BaktiNusantara. How may I assist you today,{$sName}?\n\n" .
                    "Here are several things you can ask me:\n" .
                    "• 🏡 *Partner Villages*: Type _\"What villages are available?\"_\n" .
                    "• 🎓 *KKN Programs*: Type _\"What programs are open?\"_\n" .
                    "• 📢 *Report an Issue*: Directly describe village facility issues (e.g. _\"In Posyandu Dusun Krajan Desa Sukamaju we lack counseling staff for toddler stunting prevention\"_)\n" .
                    "• 🔍 *Check Status*: Type *STATUS* or *CHECK #4*\n" .
                    "• 💬 *Consultation*: Ask about KKN registration, AI matching, or cryptographic certificates\n\n" .
                    "What would you like to explore? 😊";
            } else {
                $kName = $senderName ? "Kak *{$senderName}*" : "Kakak";
                $reply = "Tentu! AIIRA telah mengalihkan bahasa percakapan ke **Bahasa Indonesia**. 🇮🇩✨\n\n" .
                    "Saya **AIIRA**, asisten AI cerdas resmi Platform BaktiNusantara. Ada yang bisa saya bantu untuk {$kName} hari ini?\n\n" .
                    "Beberapa hal praktis yang bisa langsung ditanyakan:\n" .
                    "• 🏡 *Desa Terdaftar*: Ketik _\"Desa apa saja?\"_\n" .
                    "• 🎓 *Program KKN*: Ketik _\"Program KKN apa saja?\"_\n" .
                    "• 📢 *Kirim Aduan*: Langsung ceritakan masalah fasilitas (contoh: _\"Saya mau lapor jalan berlubang di Desa Sukamaju\"_)\n" .
                    "• 🔍 *Cek Tiket*: Ketik *STATUS* atau *CEK #4*\n" .
                    "• 💬 *Konsultasi*: Tanya alur pendaftaran KKN, sistem AI matching, atau sertifikat kriptografis\n\n" .
                    "Silakan sampaikan pertanyaan atau keluhan Anda! 😊";
            }

            return [
                'reply' => $reply,
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 1C. INTENT: PILIHAN MENU NOMOR CEPAT (QUICK ACTION 1, 2, 3, 4, 5)
        if (in_array($lower, ['1', 'menu 1', '1.', 'opsi 1', 'pilihan 1', 'desa', 'daftar desa'])) {
            return [
                'reply' => $this->handleDesaInquiry($lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        if (in_array($lower, ['2', 'menu 2', '2.', 'opsi 2', 'pilihan 2', 'program', 'kkn', 'pos'])) {
            return [
                'reply' => $this->handleProgramInquiry($lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        if (in_array($lower, ['3', 'menu 3', '3.', 'opsi 3', 'pilihan 3', 'lapor', 'aspirasi', 'aduan', 'buat aduan', 'lapor aspirasi'])) {
            $session['step'] = 'gathering_info';
            $session['draft'] = [
                'pelapor_nama' => $senderName,
                'desa_id' => null,
                'desa_nama' => null,
                'kategori' => null,
                'urgensi' => 'sedang',
                'deskripsi' => null,
            ];
            Cache::put($cacheKey, $session, now()->addHours(2));

            $db = $this->getDatabaseContextSummary();
            $contohDesa = !empty($db['desa_names']) ? implode(', ', array_slice($db['desa_names'], 0, 4)) : 'Desa Sukamaju, Desa Berkah Makmur, Desa Cibodas';
            $nama = $senderName ? "Kak *{$senderName}*" : "Kakak";

            $reply = $lang === 'en'
                ? "📢 *Citizen Aspiration & Village Reporting Service* 🇮🇩\n\n" .
                  "Please describe your village facility issue, health/stunting concern, environmental problem, or MSME needs along with your *Village Name*.\n\n" .
                  "👉 *Example Format*:\n" .
                  "_\"I am a resident of Desa Sukamaju reporting a heavily damaged bridge and broken road in Dusun Krajan\"_\n\n" .
                  "(Registered partner villages: {$contohDesa})\n\n" .
                  "AIIRA will automatically log and issue an official ticket directly to the Village Administration! 📝\n\n_Type *CANCEL* anytime to stop._"
                : "📢 *Layanan Aspirasi & Pengaduan Warga Desa* 🇮🇩\n\n" .
                  "Halo {$nama}! Silakan ceritakan permasalahan fasilitas umum, kesehatan/stunting, lingkungan, atau kebutuhan UMKM desa Anda beserta *Nama Desa* Anda.\n\n" .
                  "👉 *Contoh Format*:\n" .
                  "_\"Saya warga Desa Sukamaju ingin lapor jalan berlubang dan jembatan rusak di Dusun Krajan\"_\n\n" .
                  "(Beberapa desa mitra terdaftar: {$contohDesa})\n\n" .
                  "AIIRA akan langsung memproses laporan dan menerbitkan nomor tiket resmi ke Perangkat Desa! 📝\n\n_Ketik *BATAL* kapan saja jika ingin membatalkan._";

            return [
                'reply' => $reply,
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        if (in_array($lower, ['4', 'menu 4', '4.', 'opsi 4', 'pilihan 4'])) {
            $statusRes = $this->handleStatusCheck($cleanSender, 'STATUS', $senderName, $lang);
            $statusRes['lang'] = $lang;
            return $statusRes;
        }

        if (in_array($lower, ['5', 'menu 5', '5.', 'opsi 5', 'pilihan 5', 'konsultasi', 'help', 'bantuan'])) {
            return [
                'reply' => $this->handleCapabilitiesInquiry($senderName, $session, $lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 2. INTENT: CEK STATUS / PROGRES TIKET (#4, STATUS, ASP-2026-SKM-01)
        if ($this->isStatusQuery($lower)) {
            $statusRes = $this->handleStatusCheck($cleanSender, $trimmed, $senderName, $lang);
            $statusRes['lang'] = $lang;
            return $statusRes;
        }

        // 3. INTENT: KONFIRMASI PEMBUATAN TIKET RESMI
        if ($session['step'] === 'awaiting_confirmation') {
            if ($this->isConfirmationAffirmative($lower)) {
                $draft = $session['draft'];
                Cache::forget($cacheKey);

                return [
                    'reply' => '', // Diformat oleh WhatsAppBotService
                    'action' => 'create_ticket',
                    'ticket_data' => [
                        'desa_id' => $draft['desa_id'],
                        'desa_nama' => $draft['desa_nama'],
                        'pelapor_nama' => $draft['pelapor_nama'] ?: ($senderName ?: ($lang === 'en' ? 'Citizen of ' : 'Warga ') . ($draft['desa_nama'] ?? 'Desa')),
                        'pelapor_wa' => $cleanSender,
                        'kategori' => $draft['kategori'] ?: 'fasilitas',
                        'urgensi' => $draft['urgensi'] ?: 'sedang',
                        'deskripsi' => $draft['deskripsi'] ?: $trimmed,
                    ],
                    'lang' => $lang,
                ];
            } elseif ($this->isRejectionOrCancel($lower)) {
                Cache::forget($cacheKey);
                $reply = $lang === 'en'
                    ? "Understood, ticket issuance has been cancelled and draft cleared. 👍\n\nIs there anything else regarding village information or KKN programs AIIRA can assist you with? 😊"
                    : "Baik, penerbitan tiket aduan dibatalkan dan draf telah dihapus. 👍\n\nApakah ada hal lain seputar info desa atau program KKN yang ingin Anda tanyakan kepada AIIRA? 😊";

                return [
                    'reply' => $reply,
                    'action' => 'none',
                    'ticket_data' => null,
                    'lang' => $lang,
                ];
            }
        }

        // 4. INTENT: OUT-OF-DOMAIN CHECK
        if ($this->isOutOfDomain($lower)) {
            return [
                'reply' => $this->formatOutOfDomainReply($trimmed, $lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 5. INTENT: TANYA KEMAMPUAN / SIAPA NAMAMU / IDENTITAS AIIRA
        if ($this->isCapabilitiesQuery($lower)) {
            return [
                'reply' => $this->handleCapabilitiesInquiry($senderName, $session, $lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 6. INTENT: TANYA DAFTAR DESA / PROFIL DESA LANGSUNG DARI DATABASE
        if ($this->isDesaQuery($lower)) {
            return [
                'reply' => $this->handleDesaInquiry($lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 7. INTENT: TANYA PROGRAM KKN / POS KEBUTUHAN TERBUKA
        if ($this->isProgramQuery($lower)) {
            return [
                'reply' => $this->handleProgramInquiry($lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 8. INTENT: GREETING / SAPAAN RAMAH
        if ($this->isGreeting($lower)) {
            return [
                'reply' => $this->handleGreeting($senderName, $session, $lang),
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // 9. INTENT: PELAPORAN / DRAF ASPIRASI WARGA
        if ($this->isAspirasiReportIntent($lower, $trimmed, $session)) {
            $reportRes = $this->processAspirasiConversation($cleanSender, $trimmed, $senderName, $session, $lang);
            $reportRes['lang'] = $lang;
            return $reportRes;
        }

        // 10. CHAT UMUM / QNA LENGKAP KONSULTASI (BILINGUAL SMART KNOWLEDGE BASE + GEMINI ROTATION)
        return [
            'reply' => $this->handleGeneralChatWithAI($trimmed, $cleanSender, $senderName, $session, $lang),
            'action' => 'none',
            'ticket_data' => null,
            'lang' => $lang,
        ];
    }

    /**
     * Memeriksa apakah user meminta pergantian mode bahasa secara eksplisit.
     */
    protected function isLanguageSwitchQuery(string $lower): bool
    {
        $clean = trim($lower);

        if (in_array($clean, ['english', 'bahasa inggris', 'indonesian', 'bahasa indonesia'])) {
            return true;
        }

        $patterns = [
            'switch to english', 'speak in english', 'in english', 'english please', 'use english',
            'change language to english', 'speak english', 'talk in english', 'switch english',
            'can you speak english', 'do you speak english',
            'pakai bahasa inggris', 'bisa bahasa inggris', 'bahasa inggris ya', 'bahasa inggris dong',
            'ke bahasa inggris', 'ngomong bahasa inggris', 'pake bahasa inggris', 'ganti ke bahasa inggris',
            'ganti bahasa inggris',
            'switch to indonesian', 'in indonesian', 'indonesian please', 'use indonesian',
            'change language to indonesian', 'speak indonesian', 'talk in indonesian', 'switch indonesian',
            'can you speak indonesian',
            'pakai bahasa indonesia', 'bahasa indonesia aja', 'bahasa indonesia dong',
            'ke bahasa indonesia', 'bicara bahasa indonesia', 'pake bahasa indonesia',
            'ganti ke bahasa indonesia', 'ganti bahasa indonesia', 'bisa bahasa indonesia'
        ];

        foreach ($patterns as $pattern) {
            if (str_contains($clean, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Memeriksa apakah pesan merupakan pembatalan/reset.
     */
    protected function isCancelIntent(string $lower): bool
    {
        $cancelWords = ['batal', 'cancel', 'gak jadi', 'nggak jadi', 'reset', 'ulang', 'stop', 'batalin', 'abort', 'nevermind', 'never mind'];
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
            'ola', 'halo', 'haloo', 'halooo', 'halo aiira', 'halo aira', 'hai', 'hai aiira', 'hi', 'hi aiira',
            'hello', 'hey', 'helo', 'p', 'ping', 'tes', 'test', 'cek',
            'assalamualaikum', 'assalamu alaikum', 'assalamu\'alaikum', 'sampurasun', 'kulonuwun',
            'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
            'good morning', 'good afternoon', 'good evening', 'good day',
            'pagi', 'siang', 'sore', 'malam', 'menu', 'bantuan', 'help', 'start'
        ];

        $clean = trim(preg_replace('/[^a-z0-9\s]/', '', $lower));
        if (in_array($clean, $greetings)) {
            return true;
        }

        foreach (['halo', 'hai', 'helo', 'hello', 'good morning', 'good afternoon', 'good evening', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum'] as $lead) {
            if (str_starts_with($clean, $lead) && strlen($clean) <= strlen($lead) + 14) {
                return true;
            }
        }

        return false;
    }

    /**
     * Memeriksa apakah user bertanya tentang kemampuan / kapabilitas / identitas AIIRA.
     */
    protected function isCapabilitiesQuery(string $lower): bool
    {
        $patterns = [
            'siapa namamu', 'nama kamu siapa', 'namamu siapa', 'siapa kamu', 'kamu siapa', 'kamu siapa sih', 'siapa anda',
            'who are you', 'what is your name', 'what\'s your name', 'tell me about yourself', 'who is aiira',
            'what can you do', 'what do you do', 'what can i do here', 'what can you help with', 'can you help me',
            'bisa bantu apa', 'kamu bisa apa', 'fitur apa saja', 'fitur apa aja', 'fungsi kamu apa', 'fungsi aiira',
            'tugas kamu apa', 'kenalan dong', 'kenalan', 'features', 'help me'
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
            'desa nya apa', 'desanya apa', 'desa nya apa saja', 'desanya apa saja', 'desa apa saja', 'ada desa apa saja',
            'desa apa aja', 'ada desa apa aja', 'desa apa', 'daftar desa', 'list desa', 'daftardesa', 'desa terdaftar',
            'desa mitra', 'desa binaan', 'info desa', 'lihat desa', 'sebutkan desa', 'desa mana saja', 'rekomendasi desa',
            'what villages', 'what are the villages', 'which villages', 'list of villages', 'show villages',
            'partner villages', 'registered villages', 'village list', 'available villages', 'tell me about village'
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
            'program kkn apa saja', 'program kkn apa aja', 'pos kebutuhan apa saja', 'pos kebutuhan apa aja',
            'program apa saja', 'program apa aja', 'ada program apa', 'lowongan kkn', 'info kkn', 'daftar program',
            'pos kkn', 'proker kkn', 'program kerja',
            'what programs are open', 'kkn programs', 'open positions', 'available programs', 'show programs',
            'community service programs', 'need posts', 'list of programs'
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
        if ($session['step'] === 'gathering_info') {
            $desa = $this->findDesaByName($message);
            if ($desa) {
                return true;
            }
            if (strlen($message) >= 8 && !preg_match('/\b(apa|siapa|kenapa|mengapa|halo|hai|batal|what|who|why|how)\b/i', $message)) {
                return true;
            }
        }

        $complaintKeywords = [
            'lapor', 'aduan', 'mengadu', 'keluhan', 'aspirasi', 'usulan warga', 'tolong', 'bantu',
            'jalan rusak', 'jalan berlubang', 'jalan amblas', 'jembatan rusak', 'jembatan putus', 'jembatan roboh', 'jembatan robohh',
            'roboh', 'robohh', 'rusak', 'rusakk', 'amblas', 'lubang', 'berlubang', 'hancur',
            'lampu mati', 'penerangan mati', 'lampu padam', 'padam', 'gelap', 'lampu jalan',
            'sampah menumpuk', 'sampah', 'sungai kotor', 'sungai', 'banjir', 'limbah', 'polusi', 'pencemaran',
            'stunting', 'posyandu', 'gizi buruk', 'kekurangan tenaga', 'air bersih', 'pipa bocor', 'saluran mampet', 'drainase', 'got mampet',
            'umkm butuh', 'bantuan modal', 'pelatihan digital', 'keripik', 'izin bpom', 'legalitas umkm',
            // English Keywords
            'report', 'complaint', 'broken road', 'pothole', 'broken bridge', 'bridge collapsed', 'collapsed',
            'streetlight', 'street light off', 'blackout', 'dark', 'trash', 'garbage', 'dirty river', 'flood',
            'pollution', 'stunting', 'posyandu', 'malnutrition', 'counseling staff', 'lack counseling', 'we lack',
            'water pipe leak', 'drainage clogged', 'msme needs', 'village issue', 'facility damage'
        ];

        foreach ($complaintKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                return true;
            }
        }

        if (preg_match('/(?:warga|desa|dusun|citizen|village|from)\s+[a-z0-9\s]+/i', $lower) && (
            str_contains($lower, 'lapor') || str_contains($lower, 'rusak') || str_contains($lower, 'butuh') || str_contains($lower, 'roboh') || str_contains($lower, 'masalah') || str_contains($lower, 'jembatan') ||
            str_contains($lower, 'report') || str_contains($lower, 'broken') || str_contains($lower, 'need') || str_contains($lower, 'damage') || str_contains($lower, 'issue')
        )) {
            return true;
        }

        return false;
    }

    /**
     * Penjelasan kapabilitas cerdas AIIRA dengan data interaktif (Bilingual).
     */
    protected function handleCapabilitiesInquiry(?string $senderName, array $session, string $lang = 'id'): string
    {
        $db = $this->getDatabaseContextSummary();
        $contohDesa = !empty($db['desa_names']) ? implode(', ', array_slice($db['desa_names'], 0, 4)) : 'Desa Sukamaju, Desa Berkah Makmur';

        if ($lang === 'en') {
            $nama = $senderName ? " *{$senderName}*" : "";
            return "Hello{$nama}! Nice to meet you! I am *AIIRA* (Artificial Intelligence for Integrated Rural Advancement) — the Official Intelligent AI Assistant of the BaktiNusantara platform. 🇮🇩✨\n\n" .
                "Developed by *Team Gayatama 5 from Universitas Negeri Surabaya (UNESA)*, I bridge rural communities, university KKN students, village administrations, and higher education institutions in real-time.\n\n" .
                "Here is what I can do for you:\n" .
                "1️⃣ 🏡 *Explore Partner Villages*: Discover information about {$db['total_desa']} active partner villages in East Java (e.g. {$contohDesa}).\n" .
                "   👉 _Type: \"What villages are available?\"_\n\n" .
                "2️⃣ 📢 *Citizen Aspirations (Auto-Ticketing)*: Report damaged roads, bridge collapse, streetlights, stunting, or MSME needs directly via WhatsApp without opening any website! AIIRA automatically logs and issues official tickets for village heads.\n" .
                "   👉 _Example: \"In Posyandu Dusun Krajan Desa Sukamaju we lack counseling staff for toddler stunting prevention\"_\n\n" .
                "3️⃣ 🔍 *Track Ticket Status*: Monitor verification and action progress anytime.\n" .
                "   👉 _Type: \"STATUS\" or \"CHECK #4\"_\n\n" .
                "4️⃣ 🎓 *KKN Program Catalog*: View open community service posts for students.\n" .
                "   👉 _Type: \"What programs are open?\"_\n\n" .
                "5️⃣ 💬 *Customer Service & Q&A*: Ask anything about student team registration, Aira AI matching engine, Haversine geospatial mapping, or SHA-256 cryptographic E-Certificates.\n\n" .
                "How may AIIRA assist you right now? 😊";
        }

        $nama = $senderName ? "Kak *{$senderName}*" : "Kakak";
        return "Halo {$nama}! Salam kenal, saya *AIIRA* (Artificial Intelligence for Integrated Rural Advancement) — Asisten AI Cerdas resmi Platform BaktiNusantara. 🇮🇩✨\n\n" .
            "Saya dikembangkan oleh *Tim Gayatama 5 dari Universitas Negeri Surabaya (UNESA)* untuk menjembatani warga desa, mahasiswa KKN, perangkat desa, dan perguruan tinggi secara realtime.\n\n" .
            "Berikut kemampuan utama yang bisa AIIRA bantu:\n" .
            "1️⃣ 🏡 *Eksplorasi Desa Mitra*: Cari informasi {$db['total_desa']} desa binaan aktif di Jawa Timur (contoh: {$contohDesa}).\n" .
            "   👉 _Ketik: \"Desa apa saja?\"_\n\n" .
            "2️⃣ 📢 *Layanan Aspirasi Warga (Auto-Ticketing)*: Lapor jalan rusak, jembatan roboh, penerangan, stunting, atau kebutuhan UMKM langsung via WhatsApp tanpa perlu buka web! AIIRA langsung mencatat dan menerbitkan tiket resmi ke Perangkat Desa.\n" .
            "   👉 _Contoh: \"Saya warga Desa Sukamaju mau lapor lampu mati\"_\n\n" .
            "3️⃣ 🔍 *Cek Status Aduan*: Pantau perkembangan tindak lanjut tiket kapan saja.\n" .
            "   👉 _Ketik: \"STATUS\" atau \"CEK #TIKET\"_\n\n" .
            "4️⃣ 🎓 *Katalog Program KKN*: Lihat pos pengabdian mahasiswa yang sedang buka.\n" .
            "   👉 _Ketik: \"Program KKN apa saja?\"_\n\n" .
            "5️⃣ 💬 *Customer Service & Konsultasi*: Tanya jawab seputar alur pendaftaran KKN, sistem AI matching, peta spasial Haversine, hingga E-Sertifikat Kriptografis SHA-256.\n\n" .
            "Ada yang bisa AIIRA bantu untuk Kakak saat ini? 😊";
    }

    /**
     * Respons sapaan ramah AIIRA (Bilingual).
     */
    protected function handleGreeting(?string $senderName, array $session, string $lang = 'id'): string
    {
        if ($lang === 'en') {
            $nama = $senderName ? " *{$senderName}*" : "";
            return "Hello{$nama}! Warm greetings from *AIIRA* — the Official Intelligent AI Assistant of BaktiNusantara. 🇮🇩👋\n\n" .
                "I am thrilled to assist you 24/7 with rural empowerment and student community service programs.\n\n" .
                "You can easily ask me about:\n" .
                "• 🏡 *Registered Villages*: _Type: \"What villages are available?\"_\n" .
                "• 🎓 *KKN Programs*: _Type: \"What programs are open?\"_\n" .
                "• 📢 *Citizen Aspirations*: Directly report public facility issues or village needs\n" .
                "• 🔍 *Check Ticket*: _Type: \"STATUS\" or \"CHECK #4\"_\n" .
                "• 💬 *Q&A & Consultation*: Ask about student registration, AI matching, or cryptographic certificates\n\n" .
                "How may AIIRA assist you today? 😊";
        }

        $nama = $senderName ? "Kak *{$senderName}*" : "Kakak";
        return "Halo {$nama}! Salam hangat dari *AIIRA* — Asisten AI Cerdas resmi Platform BaktiNusantara. 🇮🇩👋\n\n" .
            "Senang bisa menyapa Kakak! Saya siap mendampingi kebutuhan informasi dan pengabdian desa 24/7.\n\n" .
            "Kakak bisa langsung menanyakan ke saya:\n" .
            "• 🏡 *Desa Terdaftar*: _Ketik: \"Desa apa saja?\"_\n" .
            "• 🎓 *Program KKN*: _Ketik: \"Program KKN apa saja?\"_\n" .
            "• 📢 *Kirim Aspirasi*: Ceritakan keluhan fasilitas atau kebutuhan desa secara langsung\n" .
            "• 🔍 *Cek Tiket*: _Ketik: \"STATUS\"_\n" .
            "• 💬 *Tanya Jawab*: Konsultasi seputar pendaftaran KKN & fitur sistem\n\n" .
            "Ada yang ingin AIIRA bantu untuk Kakak hari ini? 😊";
    }

    /**
     * Handler penelusuran desa langsung dari database (Bilingual).
     */
    protected function handleDesaInquiry(string $lang = 'id'): string
    {
        $db = $this->getDatabaseContextSummary();
        $desaList = $db['desa_list'];

        if ($desaList->isEmpty()) {
            return $lang === 'en'
                ? "Currently there are no registered village profiles in the BaktiNusantara system database."
                : "Saat ini belum ada data profil desa yang terdaftar di database sistem BaktiNusantara.";
        }

        if ($lang === 'en') {
            $reply = "🏡 *Official Partner Villages Registered in BaktiNusantara* 🇮🇩\n\n" .
                "Currently, there are *{$desaList->count()} Partner Villages* actively connected to our student community service network:\n\n";

            foreach ($desaList as $idx => $d) {
                $num = $idx + 1;
                $fokus = match ($d->id) {
                    1 => 'Stunting Prevention, Child Health & Sanitation',
                    2 => 'MSME Empowerment, Ecotourism & Organic Packaging',
                    3 => 'Organic Farming & Clean Water Supply',
                    4 => 'Sanitation, Waste Management & Environment',
                    5 => 'Village Digitalization & Youth Literacy',
                    6 => 'Rural Infrastructure & Farm Roads',
                    7 => 'Urban Farming & Technological Innovation',
                    default => 'Community Empowerment & Village Economy',
                };

                $reply .= "{$num}. *{$d->nama_desa}*\n" .
                    "   📍 Location: {$d->kecamatan}, {$d->kabupaten}\n" .
                    "   🎯 Strategic Focus: {$fokus}\n\n";
            }

            $reply .= "💡 *How to Submit a Citizen Report*:\n" .
                "To report an issue or suggest development in any village above, simply type your message here.\n" .
                "Example: _\"In Posyandu Dusun Krajan Desa Sukamaju we lack counseling staff for toddler stunting prevention\"_.\n\n" .
                "AIIRA will immediately process and issue an official ticket! 🚀";

            return $reply;
        }

        $reply = "🏡 *Daftar Desa Mitra Terdaftar di BaktiNusantara* 🇮🇩\n\n" .
            "Saat ini terdapat *{$desaList->count()} Desa Binaan* yang aktif terhubung dengan platform pengabdian mahasiswa:\n\n";

        foreach ($desaList as $idx => $d) {
            $num = $idx + 1;
            $fokus = match ($d->id) {
                1 => 'Pencegahan Stunting, Kesehatan & Sanitasi',
                2 => 'Pemberdayaan UMKM, Ekowisata & Kemasan',
                3 => 'Pertanian Organik & Air Bersih',
                4 => 'Sanitasi, Sampah & Lingkungan Hidup',
                5 => 'Digitalisasi Desa & Literasi Pemuda',
                6 => 'Infrastruktur Pedesaan & Jalan Usaha Tani',
                7 => 'Urban Farming & Inovasi Teknologi',
                default => 'Pemberdayaan Masyarakat Desa',
            };

            $reply .= "{$num}. *{$d->nama_desa}*\n" .
                "   📍 Lokasi: Kec. {$d->kecamatan}, {$d->kabupaten}\n" .
                "   🎯 Fokus: {$fokus}\n\n";
        }

        $reply .= "💡 *Cara Menyampaikan Aspirasi Warga*:\n" .
            "Untuk menyampaikan keluhan atau kebutuhan pembangunan desa di atas, Kakak cukup ketik langsung di sini.\n" .
            "Contoh: _\"Saya mau lapor kekurangan tenaga gizi stunting di Desa Sukamaju\"_.\n\n" .
            "AIIRA akan langsung memproses dan menerbitkan nomor tiket resmi! 🚀";

        return $reply;
    }

    /**
     * Handler penelusuran program KKN dari database (Bilingual).
     */
    protected function handleProgramInquiry(string $lang = 'id'): string
    {
        $posList = PosKebutuhan::with('desa')->latest()->take(6)->get();

        if ($posList->isEmpty()) {
            return $lang === 'en'
                ? "Currently there are no active KKN Need Posts published by village governments."
                : "Saat ini belum ada Pos Kebutuhan KKN aktif yang dipublikasikan oleh perangkat desa.";
        }

        if ($lang === 'en') {
            $reply = "🎓 *Currently Open KKN Programs & Village Needs*:\n\n";
            foreach ($posList as $idx => $p) {
                $num = $idx + 1;
                $desaNama = $p->desa?->nama_desa ?? 'Partner Village';
                $kat = strtoupper($p->kategori);
                $sdgText = !empty($p->sdg_codes) ? ' (SDG ' . implode(', ', (array)$p->sdg_codes) . ')' : '';
                $reply .= "{$num}. *{$p->judul}*\n" .
                    "   🏡 Village: {$desaNama}\n" .
                    "   📂 Category: {$kat}{$sdgText}\n" .
                    "   👥 Quota: {$p->kuota_kelompok} Team(s)\n\n";
            }
            $reply .= "_Full details and team registration can be accessed on the BaktiNusantara web portal._";
            return $reply;
        }

        $reply = "🎓 *Program KKN & Pos Kebutuhan Terbuka Terkini*:\n\n";
        foreach ($posList as $idx => $p) {
            $num = $idx + 1;
            $desaNama = $p->desa?->nama_desa ?? 'Desa Binaan';
            $kat = strtoupper($p->kategori);
            $sdgText = !empty($p->sdg_codes) ? ' (SDG ' . implode(', ', (array)$p->sdg_codes) . ')' : '';
            $reply .= "{$num}. *{$p->judul}*\n" .
                "   🏡 Desa: {$desaNama}\n" .
                "   📂 Bidang: {$kat}{$sdgText}\n" .
                "   👥 Kuota: {$p->kuota_kelompok} Kelompok\n\n";
        }
        $reply .= "_Informasi lengkap dan pendaftaran tim KKN dapat diakses melalui portal web BaktiNusantara._";
        return $reply;
    }

    /**
     * Memproses percakapan aspirasi (ekstraksi entitas, desa luar mitra, dan direct auto-ticketing bilingual).
     */
    protected function processAspirasiConversation(string $cleanSender, string $message, ?string $senderName, array $session, string $lang = 'id'): array
    {
        $cacheKey = "wa_session_{$cleanSender}";
        $draft = $session['draft'];

        $parsed = null;
        try {
            $parsed = $this->callGeminiForAspirasiWithRotation($message);
        } catch (\Throwable $e) {
            Log::warning("Gemini AI API call failed, falling back to rule engine: " . $e->getMessage());
        }

        if (!$parsed) {
            $parsed = $this->ruleBasedParseAspirasi($message);
        }

        // 1. Identifikasi Desa di Database
        $desa = null;
        if (!empty($parsed['desa_nama'])) {
            $desa = $this->findDesaByName($parsed['desa_nama']);
        }
        if (!$desa) {
            $desa = $this->findDesaByName($message);
        }

        // Jika desa TIDAK ditemukan di database, tetapi user menyebutkan nama desa di luar mitra
        if (!$desa && empty($draft['desa_id'])) {
            if (preg_match('/(?:desa|kelurahan|dusun|village)\s+([a-zA-Z]{3,25})/i', $message, $matchDesaLuar)) {
                $candidateDesa = trim($matchDesaLuar[1]);
                $ignoreWords = ['sukamaju', 'berkah', 'cempaka', 'maju', 'sukarelawan', 'kedung', 'saya', 'kami', 'yang', 'ini', 'itu', 'anda', 'kamu', 'mana', 'apa', 'the', 'this', 'that', 'our', 'my'];
                if (!in_array(strtolower($candidateDesa), $ignoreWords)) {
                    $namaDesaLuar = ucwords($candidateDesa);
                    $db = $this->getDatabaseContextSummary();
                    $desaSample = implode(', ', array_slice($db['desa_names'], 0, 4));

                    if ($lang === 'en') {
                        $salutation = $senderName ? "Hello *{$senderName}*!" : "Hello!";
                        $reply = "{$salutation} Thank you for reporting the situation regarding *Desa {$namaDesaLuar}* ({$parsed['deskripsi']}). 🙏\n\n" .
                            "Currently, *Desa {$namaDesaLuar}* is not yet registered as one of our 7 official partner villages in BaktiNusantara. Our active partner villages include: *{$desaSample}*.\n\n" .
                            "⚠️ *Emergency Safety Advisory*:\n" .
                            "If this report involves urgent public safety or critical infrastructure damage (such as bridge collapse, landslides, or flash floods), we strongly advise citizens to immediately contact local neighborhood heads (RT/RW), the local Village/Sub-district Office, or the Regional Disaster Management Agency (BPBD) / Public Works Department.\n\n" .
                            "💡 *New Village Partnership*:\n" .
                            "If the Village Government of {$namaDesaLuar} would like to partner with BaktiNusantara so university KKN student teams can be deployed to assist, official registration can be completed on our web portal: https://baktinusantara.up.railway.app.";
                    } else {
                        $salutation = $senderName ? "Halo Kak *{$senderName}*!" : "Halo Kakak!";
                        $reply = "{$salutation} Terima kasih banyak telah mengabarkan kondisi di *Desa {$namaDesaLuar}* ({$parsed['deskripsi']}). 🙏\n\n" .
                            "Saat ini, *Desa {$namaDesaLuar}* belum terdaftar sebagai salah satu dari 7 desa mitra resmi BaktiNusantara. Desa mitra aktif kami meliputi: *{$desaSample}*.\n\n" .
                            "⚠️ *Tindakan Keselamatan Darurat*:\n" .
                            "Jika masalah yang dilaporkan menyangkut keselamatan fasilitas vital atau keadaan darurat (seperti jembatan roboh/putus, tanah longsor, atau banjir bandang), kami sangat menyarankan warga untuk segera melapor langsung ke pihak RT/RW, Pemerintah Desa/Kelurahan setempat, atau Badan Penanggulangan Bencana Daerah (BPBD) / Dinas PUPR setempat.\n\n" .
                            "💡 *Kemitraan Desa Baru*:\n" .
                            "Bagi Pemerintah Desa {$namaDesaLuar} yang ingin bermitra dengan BaktiNusantara agar mahasiswa KKN perguruan tinggi dapat diterjunkan membantu pembangunan desa, pendaftaran dapat dilakukan secara resmi melalui platform web kami di https://baktinusantara.up.railway.app.";
                    }

                    return [
                        'reply' => $reply,
                        'action' => 'none',
                        'ticket_data' => null,
                        'lang' => $lang,
                    ];
                }
            }
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

        // 2. Kategori & Urgensi
        if (!empty($parsed['kategori'])) {
            $draft['kategori'] = $parsed['kategori'];
        }
        if (!empty($parsed['urgensi'])) {
            $draft['urgensi'] = $parsed['urgensi'];
        }

        // 3. Nama Pelapor
        if (preg_match('/(?:nama\s+saya|atas\s+nama|my\s+name\s+is)\s+([A-Za-z\s]{2,25})/i', $message, $m)) {
            $candidateName = trim($m[1]);
            if (!in_array(strtolower($candidateName), ['warga', 'citizen', 'ingin', 'mau', 'lapor', 'desa', 'masyarakat'])) {
                $draft['pelapor_nama'] = ucwords($candidateName);
            }
        }
        if (empty($draft['pelapor_nama'])) {
            $draft['pelapor_nama'] = $senderName ?: (($lang === 'en' ? 'Citizen of ' : 'Warga ') . ($draft['desa_nama'] ?? 'Desa'));
        }

        // 4. Deskripsi
        if (empty($draft['deskripsi'])) {
            $draft['deskripsi'] = $parsed['deskripsi'] ?: $message;
        } else {
            if (!$desa && strlen($message) > 15) {
                $draft['deskripsi'] .= ". " . $message;
            }
        }

        // Syarat 1: Jika desa belum teridentifikasi
        if (empty($draft['desa_id'])) {
            $session['step'] = 'gathering_info';
            $session['draft'] = $draft;
            Cache::put($cacheKey, $session, now()->addHours(2));

            $contohDesa = ProfilDesa::take(4)->pluck('nama_desa')->implode(', ');
            $reply = $lang === 'en'
                ? "Thank you for the report! 🙏\n\nIssue recorded: *\"{$draft['deskripsi']}\"*\n\nTo route this report to the appropriate village administration, please state your *village name* (e.g. *\"Desa Sukamaju\"* or *\"Desa Berkah Makmur\"*).\n\n(Registered villages in system: {$contohDesa})\n\n_Type *CANCEL* to discard this draft._"
                : "Terima kasih atas laporannya Kak! 🙏\n\nKeluhan yang dicatat: *\"{$draft['deskripsi']}\"*\n\nAgar aduan ini dapat diteruskan secara tepat ke perangkat desa terkait, mohon sebutkan *nama desa* Anda ya.\n\n_Contoh_: *\"Desa Sukamaju\"* atau *\"Desa Berkah Makmur\"*.\n(Desa terdaftar di sistem: {$contohDesa})\n\n_Ketik *BATAL* jika ingin membatalkan laporan ini._";

            return [
                'reply' => $reply,
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // Syarat 2: Deskripsi harus ada substansi
        if (empty($draft['deskripsi']) || strlen($draft['deskripsi']) < 8) {
            $session['step'] = 'gathering_info';
            $session['draft'] = $draft;
            Cache::put($cacheKey, $session, now()->addHours(2));

            $reply = $lang === 'en'
                ? "Your target village has been recorded as *{$draft['desa_nama']}*. 🏡\n\nPlease describe in more detail the facility damage or community needs you wish to report.\n\n_Type *CANCEL* to discard this draft._"
                : "Desa sasaran Anda telah tercatat sebagai *{$draft['desa_nama']}*. 🏡\n\nMohon ceritakan lebih rinci mengenai keluhan, fasilitas, atau kebutuhan warga yang ingin Anda sampaikan ke pihak desa.\n\n_Ketik *BATAL* jika ingin membatalkan laporan ini._";

            return [
                'reply' => $reply,
                'action' => 'none',
                'ticket_data' => null,
                'lang' => $lang,
            ];
        }

        // Minta konfirmasi penerbitan tiket resmi ke warga
        $session['step'] = 'awaiting_confirmation';
        $session['draft'] = $draft;
        Cache::put($cacheKey, $session, now()->addHours(2));

        $namaPelapor = $draft['pelapor_nama'] ?: ($senderName ?: (($lang === 'en' ? 'Citizen of ' : 'Warga ') . $draft['desa_nama']));
        $kat = strtoupper($draft['kategori'] ?? 'FASILITAS');
        $urg = strtoupper($draft['urgensi'] ?? 'SEDANG');

        $reply = $lang === 'en'
            ? "Alright *{$namaPelapor}*, AIIRA has prepared your report draft:\n\n" .
              "🏡 *Target Village*: {$draft['desa_nama']}\n" .
              "📂 *Category*: {$kat}\n" .
              "⚡ *Urgency Level*: {$urg}\n" .
              "📝 *Issue Summary*: \"{$draft['deskripsi']}\"\n\n" .
              "Are the details above correct and do you want to submit this official ticket to the Village Government?\n\n" .
              "👉 Reply *YES* or *SUBMIT* to issue the ticket.\n" .
              "👉 Reply *CANCEL* to discard."
            : "Baik Kak *{$namaPelapor}*, AIIRA telah menyusun draf aduan Anda sebagai berikut:\n\n" .
              "🏡 *Desa Sasaran*: {$draft['desa_nama']}\n" .
              "📂 *Kategori*: {$kat}\n" .
              "⚡ *Tingkat Urgensi*: {$urg}\n" .
              "📝 *Uraian Masalah*: \"{$draft['deskripsi']}\"\n\n" .
              "Apakah rincian aduan di atas sudah sesuai dan Anda yakin ingin menerbitkan tiket aduan resmi ke Perangkat Desa?\n\n" .
              "👉 Balas *YA* atau *KIRIM* untuk menerbitkan tiket aduan resmi.\n" .
              "👉 Ketik *BATAL* untuk membatalkan.";

        return [
            'reply' => $reply,
            'action' => 'confirm_needed',
            'ticket_data' => $draft,
            'lang' => $lang,
        ];
    }

    /**
     * Menangani chat umum seputar platform BaktiNusantara & desa menggunakan rotasi model Gemini dan database context.
     */
    protected function handleGeneralChatWithAI(string $message, string $cleanSender, ?string $senderName, array $session, string $lang = 'id'): string
    {
        $db = $this->getDatabaseContextSummary();

        // 1. Cek Smart Local Knowledge Base Bilingual terlebih dahulu
        $smartKb = $this->handleSmartKnowledgeBase($message, $senderName, $db, $lang);
        if (!empty($smartKb)) {
            return $smartKb;
        }

        $desaNames = implode(', ', $db['desa_names']);
        $langInstruction = $lang === 'en'
            ? "You MUST answer strictly in English. "
            : "Anda WAJIB menjawab dalam Bahasa Indonesia yang santun dan ramah. ";

        $systemInstruction = "You are AIIRA, the official smart AI assistant and customer service of BaktiNusantara platform (developed by Team Gayatama 5 from Universitas Negeri Surabaya - UNESA). " .
            "Domain focus: university community service (KKN Tematik), partner village empowerment, and citizen public aspirations. " .
            "Current registered partner villages: [{$desaNames}]. " .
            $langInstruction .
            "Respond in a very polite, warm, helpful, structured, and professional customer service tone. " .
            "Use WhatsApp styling (*bold*, _italic_) and fitting emojis.";

        // 2. Coba panggil remote Gemini AI dengan rotasi model & API key
        $reply = $this->callGeminiTextWithRotation($message, $systemInstruction);
        if (!empty($reply)) {
            return $reply;
        }

        // 3. Fallback cerdas lokal ramah bilingual
        return $this->handleLocalIntelligentChat($message, $senderName, $db, $lang);
    }

    /**
     * Mesin Knowledge Base Cerdas Bilingual (QnA Lengkap Customer Service BaktiNusantara).
     */
    public function handleSmartKnowledgeBase(string $message, ?string $senderName, array $db, string $lang = 'id'): ?string
    {
        $lower = strtolower(trim($message));
        $nama = $senderName ? ($lang === 'en' ? " *{$senderName}*" : "Kak *{$senderName}*") : ($lang === 'en' ? "Friend" : "Kakak");

        // 1. KASUS: LUPA SUBMIT / CARA DAFTAR KKN / ALUR SUBMISSION
        if (
            str_contains($lower, 'lupa submit') ||
            str_contains($lower, 'submit gayatama') ||
            str_contains($lower, 'cara submit') ||
            str_contains($lower, 'cara daftar kkn') ||
            str_contains($lower, 'daftar kkn') ||
            str_contains($lower, 'alur pendaftaran') ||
            str_contains($lower, 'syarat kkn') ||
            str_contains($lower, 'cara ikut kkn') ||
            str_contains($lower, 'bagaimana cara daftar') ||
            str_contains($lower, 'forgot to submit') ||
            str_contains($lower, 'how to submit') ||
            str_contains($lower, 'how to register') ||
            str_contains($lower, 'kkn registration') ||
            str_contains($lower, 'application process')
        ) {
            if ($lang === 'en') {
                return "Hello {$nama}! Regarding student KKN registration and proposal submission on *BaktiNusantara*: 🇮🇩\n\n" .
                    "📋 *Student KKN Team Application Flow*:\n" .
                    "1. *Form a Team*: Log in to the student web portal, create a group of 5–10 students.\n" .
                    "2. *Explore Village Needs*: Browse the *Spatial Map* (`/maps`) or *Catalog* (`/katalog`).\n" .
                    "3. *Verify Aira AI Matching Score*: Ensure your team members' academic majors align with the village criteria (e.g. Nutrition for stunting, Accounting for MSMEs) for high compatibility (up to 94%).\n" .
                    "4. *Comply with Haversine Safety Distance*: If destination distance exceeds 1,000 km, upload a Parental Consent Letter (*Safety Compliance*).\n" .
                    "5. *Submit Proposal*: Click 'Submit Proposal' and wait for Village Head review!\n\n" .
                    "⚠️ *If You Forgot to Submit or Missed a Deadline*:\n" .
                    "• Check if the village need post still has open quota (status: _Open_).\n" .
                    "• If the post deadline has passed, your team may select alternative open partner villages in the catalog.\n" .
                    "• For university extension dispensations, please coordinate with your Field Supervisor (DPL) or University LPPM.";
            }

            return "Halo {$nama}! Terkait pendaftaran dan pengajuan proposal KKN di platform *BaktiNusantara*: 🇮🇩\n\n" .
                "📋 *Alur Pengajuan Tim Mahasiswa KKN*:\n" .
                "1. *Login / Buat Tim*: Masuk ke portal web mahasiswa, bentuk kelompok (5–10 orang).\n" .
                "2. *Pilih Pos Kebutuhan*: Buka menu *Peta Spasial* (`/maps`) atau *Katalog* (`/katalog`).\n" .
                "3. *Cek AI Matching Score*: Pastikan jurusan anggota tim sesuai kriteria pos desa (misal: S1 Gizi untuk stunting, Akuntansi untuk UMKM) untuk mendapat skor kecocokan tinggi (hingga 94%).\n" .
                "4. *Patuhi Aturan Jarak Haversine*: Jika jarak kampus ke desa tujuan melebihi 1.000 km, wajib mengunggah Surat Izin Orang Tua (*Safety Compliance*).\n" .
                "5. *Submit Proposal*: Klik tombol 'Submit Proposal' dan tunggu review dari Kepala Desa.\n\n" .
                "⚠️ *Jika Kakak Lupa Submit / Terlambat*:\n" .
                "• Periksa apakah pos kebutuhan desa yang dituju masih memiliki sisa kuota (status: _Open_).\n" .
                "• Jika batas waktu pos sudah ditutup, Kakak dapat memilih pos alternatif desa mitra lain yang masih membuka pendaftaran.\n" .
                "• Untuk permohonan dispensasi khusus, silakan koordinasikan dengan Dosen Pembimbing Lapangan (DPL) atau LPPM perguruan tinggi Kakak.";
        }

        // 2. KASUS: TENTANG BAKTINUSANTARA & TIM GAYATAMA 5 UNESA
        if (
            str_contains($lower, 'apa itu bakti nusantara') ||
            str_contains($lower, 'tentang bakti nusantara') ||
            str_contains($lower, 'baktinusantara itu apa') ||
            str_contains($lower, 'gayatama 5') ||
            str_contains($lower, 'tim gayatama') ||
            str_contains($lower, 'gayatamaweb') ||
            str_contains($lower, 'siapa yang buat') ||
            str_contains($lower, 'siapa pengembang') ||
            str_contains($lower, 'what is baktinusantara') ||
            str_contains($lower, 'about baktinusantara') ||
            str_contains($lower, 'who developed') ||
            str_contains($lower, 'who built this')
        ) {
            if ($lang === 'en') {
                return "🏛️ *About BaktiNusantara Platform* 🇮🇩\n\n" .
                    "BaktiNusantara is an intelligent university community service (KKN Tematik) collaboration ecosystem developed by **Team Gayatama 5 from Universitas Negeri Surabaya (UNESA)**.\n\n" .
                    "💡 *Why BaktiNusantara Was Built*:\n" .
                    "For decades, conventional community service has been strictly *Top-Down*. Students drafted work programs in air-conditioned classrooms based on wild guesses, causing severe *skill mismatch* (e.g. engineering students repainting village gates while the village desperately needed stunting nutritional intervention).\n\n" .
                    "🚀 *Our Paradigm Inversion*:\n" .
                    "We invert the entire paradigm: **The Village Speaks First!**\n" .
                    "1. *Zero Digital Barrier*: Rural citizens report issues effortlessly via WhatsApp (AIIRA).\n" .
                    "2. *Village Validation*: Village Heads validate citizen tickets into official SDG-tagged Need Posts with 1 click.\n" .
                    "3. *Aira AI Matching Engine*: Precisely matches student academic majors against village needs (0–100%).\n" .
                    "4. *Haversine Spatial Mapping*: Connects remote 3T villages across all 38 provinces with safety compliance (>1,000 km parental consent).\n" .
                    "5. *Cryptographic SHA-256 E-Certificate*: Minted digital credentials with ISO QR codes for 4–6 MBKM university course credits.";
            }

            return "🏛️ *Tentang Platform BaktiNusantara* 🇮🇩\n\n" .
                "BaktiNusantara adalah ekosistem kolaborasi Kuliah Kerja Nyata (KKN) Tematik cerdas yang dikembangkan oleh **Tim Gayatama 5 dari Universitas Negeri Surabaya (UNESA)**.\n\n" .
                "💡 *Mengapa BaktiNusantara Hadir?*\n" .
                "Selama puluhan tahun, KKN konvensional berjalan *Top-Down* (dari atas ke bawah). Mahasiswa sering merancang program kerja berdasarkan tebakan sepihak di kampus, sehingga melahirkan *skill mismatch* (contoh: mahasiswa teknik hanya mengecat gapura desa padahal warga sangat butuh pendampingan gizi stunting).\n\n" .
                "🚀 *Solusi Paradigma Baru Kami*:\n" .
                "Kami membalik piramida KKN: **Desa yang bersuara lebih dulu!**\n" .
                "1. *Zero Digital Barrier*: Warga melapor masalah via WhatsApp bot (AIIRA).\n" .
                "2. *Validasi Desa*: Kepala desa mengesahkan aspirasi menjadi Pos Kebutuhan resmi berstandar SDGs.\n" .
                "3. *AI Matching Engine*: Algoritma Aira AI mencocokkan kompetensi prodi mahasiswa secara presisi (0-100%).\n" .
                "4. *Peta Spasial Haversine*: Jangkauan desa 3T di 38 provinsi dengan kepatuhan keselamatan (>1.000 km izin orang tua).\n" .
                "5. *E-Sertifikat Kriptografis SHA-256*: Sertifikat anti-palsu dengan QR Code publik untuk pengakuan 4–6 SKS MBKM.";
        }

        // 3. KASUS: AIRA AI MATCHING ENGINE & SKOR KECOCOKAN
        if (
            str_contains($lower, 'matching score') ||
            str_contains($lower, 'aira ai') ||
            str_contains($lower, 'skor kecocokan') ||
            str_contains($lower, 'algoritma matching') ||
            str_contains($lower, 'cara kerja matching') ||
            str_contains($lower, 'pencocokan kompetensi') ||
            str_contains($lower, 'how matching works') ||
            str_contains($lower, 'matching algorithm')
        ) {
            if ($lang === 'en') {
                return "🎯 *Aira AI Competency Matching Engine* ⚡\n\n" .
                    "Our AI matching algorithm guarantees zero guesswork and prevents skill mismatch during community service:\n\n" .
                    "• *Matrix Evaluation*: Evaluates all student team members' majors against the village need tags.\n" .
                    "• *Real-time Compatibility (0–100%)*: For example, Desa Sukamaju's Toddler Stunting post applied by a team of Nutrition and Public Health majors delivers an instant **94% Matching Score**!\n" .
                    "• *Priority Selection*: Village heads can prioritize teams with the highest compatibility scores, ensuring highly impactful solutions.";
            }

            return "🎯 *Aira AI Competency Matching Engine* ⚡\n\n" .
                "Algoritma AI Matching kami menjamin tidak ada lagi salah penempatan keahlian saat KKN:\n\n" .
                "• *Analisis Matriks*: Sistem menganalisis prodi seluruh anggota kelompok terhadap tag kebutuhan pos desa.\n" .
                "• *Skor Instan 0–100%*: Menghasilkan nilai kompatibilitas real-time. Sebagai contoh: Pos Kebutuhan Stunting Desa Sukamaju yang dilamar oleh kelompok mahasiswa prodi Gizi & Kesehatan Masyarakat akan mendapatkan **Matching Score 94%**!\n" .
                "• *Peluang Penerimaan*: Tim dengan skor kesesuaian tinggi diprioritaskan oleh Kepala Desa untuk memastikan solusi yang diberikan tepat sasaran dan profesional.";
        }

        // 4. KASUS: PETA SPASIAL & HAVERSINE (>1000 KM RULE)
        if (
            str_contains($lower, 'peta spasial') ||
            str_contains($lower, 'haversine') ||
            str_contains($lower, 'jarak kkn') ||
            str_contains($lower, '1000 km') ||
            str_contains($lower, 'izin orang tua') ||
            str_contains($lower, 'safety compliance') ||
            str_contains($lower, 'spatial map') ||
            str_contains($lower, 'parental consent')
        ) {
            if ($lang === 'en') {
                return "🗺️ *Interactive Spatial Mapping & Haversine Safety Compliance* 🌐\n\n" .
                    "BaktiNusantara maps village needs across all 38 provinces in Indonesia:\n\n" .
                    "• *Haversine Formula*: Computes the exact spherical curved-earth distance between the home university and destination village coordinates.\n" .
                    "• *Safety Compliance*: If the service distance exceeds **1,000 km** (e.g. students deployed across islands to remote areas), the system locks registration until a verified **Parental Consent Letter** is uploaded.\n" .
                    "• This protects student welfare while promoting equal distribution to remote 3T frontier villages.";
            }

            return "🗺️ *Peta Spasial Interaktif & Formula Haversine* 🌐\n\n" .
                "BaktiNusantara memetakan kebutuhan desa di seluruh 38 provinsi di Indonesia:\n\n" .
                "• *Perhitungan Haversine*: Menghitung jarak lengkung bola bumi akurat antara kampus asal dan desa tujuan penempatan.\n" .
                "• *Safety Compliance*: Jika jarak pengabdian melebihi **1.000 km**, sistem otomatis mengunci formulir pendaftaran hingga mahasiswa mengunggah **Surat Izin Orang Tua** yang sah.\n" .
                "• Fitur ini melindungi keselamatan mahasiswa sekaligus mendorong pemerataan pengabdian hingga ke desa 3T (Terdepan, Terluar, Tertinggal).";
        }

        // 5. KASUS: E-SERTIFIKAT KRIPTOGRAFIS SHA-256 & QR CODE
        if (
            str_contains($lower, 'e-sertifikat') ||
            str_contains($lower, 'sertifikat') ||
            str_contains($lower, 'certificate') ||
            str_contains($lower, 'kriptografis') ||
            str_contains($lower, 'sha-256') ||
            str_contains($lower, 'sha256') ||
            str_contains($lower, 'qr code') ||
            str_contains($lower, 'verifikasi sertifikat') ||
            str_contains($lower, 'anti palsu') ||
            str_contains($lower, 'cryptographic certificate') ||
            str_contains($lower, 'verify certificate') ||
            str_contains($lower, 'anti-forgery')
        ) {
            if ($lang === 'en') {
                return "🔐 *Cryptographic SHA-256 E-Certificate (Anti-Forgery)* 🛡️\n\n" .
                    "Certificates in BaktiNusantara possess enterprise-grade cryptographic integrity:\n\n" .
                    "• *SHA-256 Seal*: Combines Student Name, Student ID (NIM), Village ID, 160 Service Hours, Village Head BAST Grade, and Server Secret Key into an unforgeable 64-character digital fingerprint.\n" .
                    "• *ISO/IEC 18004 Vector QR Code*: Embedded on every certificate.\n" .
                    "• *Live Public Verification*: Anyone (employers, universities, advisors) can scan the QR code with a phone camera to reveal instant *VALID & GENUINE* status on the public portal.\n" .
                    "• If a single letter is altered on the document, the hash mismatches immediately, flagging it as forged. Essential for legal conversion into 4–6 MBKM course credits.";
            }

            return "🔐 *E-Sertifikat Kriptografis SHA-256 (Anti-Pemalsuan)* 🛡️\n\n" .
                "Sertifikat KKN di BaktiNusantara memiliki derajat integritas digital setara perbankan:\n\n" .
                "• *Segel Matematis SHA-256*: Sistem menggabungkan Nama Mahasiswa, NIM, ID Desa, Beban 160 Jam Pengabdian, Nilai BAST Kades, dan Kunci Rahasia Server menjadi sidik jari digital unik 64 karakter.\n" .
                "• *QR Code Standar ISO/IEC 18004*: Tertanam di dokumen sertifikat.\n" .
                "• *Verifikasi Live*: Kamera smartphone dapat langsung men-scan QR code untuk membuka URL verifikasi publik dan membuktikan keaslian dokumen (*VALID & GENUINE*).\n" .
                "• Jika dokumen diubah 1 karakter saja, sidik jari seketika tidak cocok (*MISMATCH*) dan dinyatakan palsu. Ini menjadi bukti legal formal bagi kampus untuk konversi 4–6 SKS MBKM.";
        }

        // 6. KASUS: BIAYA & GRATIS
        if (
            str_contains($lower, 'biaya') ||
            str_contains($lower, 'apakah bayar') ||
            str_contains($lower, 'apakah gratis') ||
            str_contains($lower, 'gratis') ||
            str_contains($lower, 'tarif') ||
            str_contains($lower, 'bayar berapa') ||
            str_contains($lower, 'free') ||
            str_contains($lower, 'cost') ||
            str_contains($lower, 'fee')
        ) {
            if ($lang === 'en') {
                return "🎉 BaktiNusantara platform services are **100% FREE OF CHARGE**! 🇮🇩✨\n\n" .
                    "Zero fees are required for:\n" .
                    "• Rural citizens reporting issues via WhatsApp\n" .
                    "• Village administrations publishing need posts\n" .
                    "• University students registering and executing KKN projects\n\n" .
                    "Our platform is purely dedicated to national community empowerment and village self-reliance.";
            }

            return "🎉 Layanan platform BaktiNusantara adalah **100% GRATIS**! 🇮🇩✨\n\n" .
                "Tidak ada pungutan biaya apapun untuk:\n" .
                "• Warga desa yang menyampaikan aspirasi lewat WhatsApp\n" .
                "• Pemerintah desa yang mempublikasikan pos kebutuhan\n" .
                "• Mahasiswa yang mendaftar dan mengikuti program KKN\n\n" .
                "Platform ini didedikasikan penuh untuk kemajuan dan kemandirian desa di seluruh Nusantara.";
        }

        // 7. KASUS: KONTAK & HELPDESK ADMIN
        if (
            str_contains($lower, 'kontak admin') ||
            str_contains($lower, 'customer service') ||
            str_contains($lower, 'nomor admin') ||
            str_contains($lower, 'helpdesk') ||
            str_contains($lower, 'hubungi siapa') ||
            str_contains($lower, 'contact support') ||
            str_contains($lower, 'call center')
        ) {
            if ($lang === 'en') {
                return "📞 *BaktiNusantara Customer Support & Helpdesk*:\n\n" .
                    "• *WhatsApp Bot (AIIRA)*: Available 24/7 on this number\n" .
                    "• *Official Email*: support@baktinusantara.id / gayatama5.unesa@gmail.com\n" .
                    "• *Web Portal*: https://baktinusantara.up.railway.app\n" .
                    "• *Human Support Hours*: Monday – Friday (08:00 – 17:00 WIB)\n\n" .
                    "Feel free to ask any question, AIIRA is always happy to assist you! 😊";
            }

            return "📞 *Layanan Bantuan & Helpdesk BaktiNusantara*:\n\n" .
                "• *WhatsApp Bot (AIIRA)*: Siap mendampingi 24/7 di nomor ini\n" .
                "• *Email Resmi*: support@baktinusantara.id / gayatama5.unesa@gmail.com\n" .
                "• *Website*: https://baktinusantara.up.railway.app\n" .
                "• *Jam Layanan Operator Tim*: Senin – Jumat (08.00 – 17.00 WIB)\n\n" .
                "Silakan sampaikan pertanyaan atau kendala Anda, AIIRA siap membantu dengan senang hati! 😊";
        }

        // 8. KASUS: TERIMA KASIH & APRESIASI
        if (
            str_contains($lower, 'terima kasih') ||
            str_contains($lower, 'makasih') ||
            str_contains($lower, 'terimakasih') ||
            str_contains($lower, 'thanks') ||
            str_contains($lower, 'thank you') ||
            str_contains($lower, 'mantap') ||
            str_contains($lower, 'keren') ||
            str_contains($lower, 'awesome') ||
            str_contains($lower, 'great')
        ) {
            if ($lang === 'en') {
                return "You are very welcome{$nama}! It is an absolute pleasure to help. 😊🙏\n\n" .
                    "Let's work together to empower villages and deliver verified community impact for Indonesia! 🇮🇩✨\n\n" .
                    "Whenever you have more questions, feel free to chat with AIIRA anytime. Wishing you a wonderful and successful day ahead! 🌟";
            }

            return "Sama-sama {$nama}! Senang sekali AIIRA bisa membantu. 😊🙏\n\n" .
                "Mari bersama-sama kita majukan desa dan wujudkan pengabdian nyata untuk Indonesia! 🇮🇩✨\n\n" .
                "Jika ada hal lain yang ingin Kakak tanyakan nanti, silakan chat AIIRA kapan saja ya. Semoga hari Kakak menyenangkan dan penuh berkah! 🌟";
        }

        // 9. KASUS: KATEGORI ADUAN & MASALAH YANG BISA DILAPORKAN
        if (
            str_contains($lower, 'kategori') ||
            str_contains($lower, 'apa saja yang bisa dilaporkan') ||
            str_contains($lower, 'bisa lapor apa saja') ||
            str_contains($lower, 'jenis aduan') ||
            str_contains($lower, 'topik aduan') ||
            str_contains($lower, 'what can i report') ||
            str_contains($lower, 'categories') ||
            str_contains($lower, 'what issues') ||
            str_contains($lower, 'report categories')
        ) {
            if ($lang === 'en') {
                return "📂 *Citizen Report Categories Supported in BaktiNusantara* 🇮🇩\n\n" .
                    "Citizens can report community problems across 5 strategic SDG-aligned sectors:\n\n" .
                    "1️⃣ 🏥 *Healthcare & Nutrition* (SDG 3):\n" .
                    "   • Toddler stunting, Posyandu health counseling, child nutrition, medical facilities.\n\n" .
                    "2️⃣ 🏪 *Village MSME / Economy* (SDG 8 & 1):\n" .
                    "   • Digital marketing, packaging design, business licensing (P-IRT/BPOM), financial bookkeeping.\n\n" .
                    "3️⃣ 🚧 *Public Facilities & Infrastructure* (SDG 9 & 11):\n" .
                    "   • Damaged/potholed roads, broken bridges, streetlights off, clean water pipes, irrigation.\n\n" .
                    "4️⃣ 🌿 *Environment & Sanitation* (SDG 13 & 6):\n" .
                    "   • Waste dumps, river pollution, drainage clogs, flood mitigation, organic composting.\n\n" .
                    "5️⃣ 📚 *Education & Community Literacy* (SDG 4):\n" .
                    "   • Student tutoring, school digital literacy, community library, youth empowerment.\n\n" .
                    "💡 _Directly type your village and issue, and AIIRA will issue an official ticket!_";
            }

            return "📂 *Kategori Aduan Warga yang Didukung BaktiNusantara* 🇮🇩\n\n" .
                "Warga dapat menyampaikan aspirasi dan keluhan desa pada 5 bidang strategis berbasis SDGs:\n\n" .
                "1️⃣ 🏥 *Kesehatan & Gizi* (SDG 3):\n" .
                "   • Pencegahan stunting balita, tenaga penyuluhan Posyandu, gizi anak, sanitasi jamban sehat.\n\n" .
                "2️⃣ 🏪 *UMKM & Ekonomi Desa* (SDG 8 & 1):\n" .
                "   • Pemasaran digital, desain kemasan produk, legalitas izin edar (P-IRT/BPOM), pembukuan kas.\n\n" .
                "3️⃣ 🚧 *Fasilitas & Infrastruktur Desa* (SDG 9 & 11):\n" .
                "   • Jalan rusak berlubang, jembatan rusak, lampu jalan mati, pipa air bersih, saluran irigasi.\n\n" .
                "4️⃣ 🌿 *Lingkungan & Sanitasi* (SDG 13 & 6):\n" .
                "   • Tumpukan sampah, pencemaran sungai, drainase/got tersumbat, pencegahan banjir, pengolahan kompos.\n\n" .
                "5️⃣ 📚 *Pendidikan & Literasi* (SDG 4):\n" .
                "   • Bimbingan belajar anak, literasi digital sekolah, pojok baca desa, pelatihan pemuda.\n\n" .
                "💡 _Langsung ceritakan masalah desa Anda di sini, AIIRA akan segera menerbitkan tiket resmi!_";
        }

        // 10. KASUS: ALUR INTEGRASI PLATFORM (END-TO-END PIPELINE)
        if (
            str_contains($lower, 'alur sistem') ||
            str_contains($lower, 'bagaimana alurnya') ||
            str_contains($lower, 'cara kerja platform') ||
            str_contains($lower, 'alur kerja') ||
            str_contains($lower, 'proses dari aduan') ||
            str_contains($lower, 'how does it work') ||
            str_contains($lower, 'platform workflow') ||
            str_contains($lower, 'end to end flow')
        ) {
            if ($lang === 'en') {
                return "🔄 *BaktiNusantara End-to-End Collaboration Pipeline* 🇮🇩\n\n" .
                    "Our platform inverts conventional top-down KKN into an integrated 4-step impact cycle:\n\n" .
                    "1️⃣ *The Village Speaks First (Zero Barrier)*:\n" .
                    "   Citizens easily report real issues via WhatsApp bot (*AIIRA*). An official ticket (`#ASP-...`) is generated instantly.\n\n" .
                    "2️⃣ *Village Validation & Need Post Publishing*:\n" .
                    "   Village Heads review tickets and convert verified community problems into official SDG-tagged Need Posts with 1 click.\n\n" .
                    "3️⃣ *Aira AI Competency Matching & Geospatial Haversine*:\n" .
                    "   Student teams apply. Aira AI evaluates members' academic majors against village needs (up to 94% compatibility score). For distances >1,000 km, parental consent verification ensures student safety.\n\n" .
                    "4️⃣ *Execution, Village Handover (BAST) & Cryptographic Certification*:\n" .
                    "   Students submit weekly reports and deliverables. The Village Head approves the Handover Minutes (BAST), triggering automatic issuance of *SHA-256 Cryptographic E-Certificates* and public E-Portfolios for MBKM course credits!";
            }

            return "🔄 *Alur Kerja Integrasi Platform BaktiNusantara* 🇮🇩\n\n" .
                "Platform kami membalik paradigma KKN lama menjadi siklus kolaborasi 4 tahap berdampak nyata:\n\n" .
                "1️⃣ *Desa Bersuara Lebih Dulu (Zero Barrier)*:\n" .
                "   Warga melapor masalah desa semudah kirim chat WhatsApp ke bot *AIIRA*. Tiket resmi (`#ASP-...`) langsung terbit seketika.\n\n" .
                "2️⃣ *Validasi Desa & Penerbitan Pos Kebutuhan*:\n" .
                "   Kepala Desa memverifikasi tiket warga dan mengangkatnya menjadi Pos Kebutuhan KKN resmi berbasis SDGs dengan 1 klik.\n\n" .
                "3️⃣ *Aira AI Matching Engine & Spasial Haversine*:\n" .
                "   Mahasiswa melamar pos. Algoritma Aira AI mencocokkan kompetensi jurusan secara presisi (skor kecocokan hingga 94%). Untuk jarak >1.000 km, kepatuhan izin orang tua menjamin keselamatan mahasiswa.\n\n" .
                "4️⃣ *Eksekusi, Pengesahan BAST Kades & E-Sertifikat SHA-256*:\n" .
                "   Mahasiswa mengunggah progres mingguan dan luaran. Kades mengesahkan Berita Acara Serah Terima (BAST), menerbitkan *E-Sertifikat Kriptografis SHA-256* dan E-Portofolio resmi berstandar MBKM!";
        }

        return null;
    }

    /**
     * Fallback cerdas lokal ramah dan bersahabat bilingual.
     */
    protected function handleLocalIntelligentChat(string $message, ?string $senderName, array $db, string $lang = 'id'): string
    {
        $totalDesa = $db['total_desa'] ?: 7;
        $desaSample = !empty($db['desa_names']) ? implode(', ', array_slice($db['desa_names'], 0, 3)) : 'Desa Sukamaju, Desa Berkah Makmur';

        if ($lang === 'en') {
            $nama = $senderName ? " *{$senderName}*" : "";
            return "Hello{$nama}! Welcome to the official WhatsApp service of *BaktiNusantara*. 🇮🇩✨\n\n" .
                "I am *AIIRA*, an intelligent AI assistant ready to support you with village development and student KKN programs.\n\n" .
                "Here are several quick actions you can ask me:\n" .
                "1️⃣ 🏡 *Partner Villages*: Type _\"What villages are available?\"_ to view {$totalDesa} active villages ({$desaSample}).\n" .
                "2️⃣ 🎓 *KKN Programs*: Type _\"What programs are open?\"_ to see currently open student positions.\n" .
                "3️⃣ 📢 *Citizen Report*: Directly share any public facility issues (e.g. _\"I want to report broken road in Desa Sukamaju\"_).\n" .
                "4️⃣ 🔍 *Check Ticket*: Type *STATUS* or *CHECK #NUMBER* to monitor your report progress.\n" .
                "5️⃣ 💬 *Consultation*: Ask anything about KKN workflow, AI matching, or cryptographic E-Certificates.\n\n" .
                "How may AIIRA assist you right now? 😊";
        }

        $nama = $senderName ? "Kak *{$senderName}*" : "Kakak";
        return "Halo {$nama}! Senang bisa menyapa Kakak di layanan WhatsApp resmi *BaktiNusantara*. 🇮🇩✨\n\n" .
            "Saya *AIIRA*, asisten AI cerdas yang siap mendampingi kebutuhan informasi seputar pemberdayaan desa dan program KKN mahasiswa.\n\n" .
            "Berikut beberapa layanan yang dapat langsung Kakak tanyakan:\n" .
            "1️⃣ 🏡 *Daftar Desa Mitra*: Ketik _\"Desa apa saja?\"_ untuk melihat {$totalDesa} desa binaan kami ({$desaSample}).\n" .
            "2️⃣ 🎓 *Program KKN*: Ketik _\"Program KKN apa saja?\"_ untuk melihat pos pengabdian mahasiswa yang sedang buka.\n" .
            "3️⃣ 📢 *Layanan Aduan Warga*: Langsung ceritakan masalah fasilitas desa (contoh: _\"Saya mau lapor jalan berlubang di Desa Sukamaju\"_).\n" .
            "4️⃣ 🔍 *Cek Tiket*: Ketik *STATUS* atau *CEK #NOMOR* untuk melihat progres aduan Anda.\n" .
            "5️⃣ 💬 *Konsultasi Program*: Tanyakan seputar alur KKN, sistem matching kompetensi, hingga verifikasi e-sertifikat.\n\n" .
            "Ada yang bisa AIIRA bantu untuk Kakak saat ini? 😊";
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
You are AIIRA, the intelligent citizen report analysis assistant for BaktiNusantara.
Analyze the following citizen message and extract data strictly into JSON format:
{
  "desa_nama": "village name mentioned or null",
  "kategori": "one of: umkm, kesehatan, lingkungan, pendidikan, fasilitas",
  "deskripsi": "clear summary of the reported issue",
  "urgensi": "one of: rendah, sedang, mendesak",
  "sdg_codes": [array of numbers e.g. 3, 4, 8, 11, 13]
}

Citizen message:
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
     * Memeriksa apakah pesan merupakan pertanyaan status tiket.
     */
    protected function isStatusQuery(string $lower): bool
    {
        $clean = trim($lower);

        if (in_array($clean, ['1', '2', '3', '4', '5', 'menu 1', 'menu 2', 'menu 3', 'menu 4', 'menu 5', 'opsi 1', 'opsi 2', 'opsi 3', 'opsi 4', 'opsi 5'])) {
            return false;
        }

        if (preg_match('/(?:tiket|cek|status|progres|lapor(?:an)?|asp-?|ticket|check)\s*#?\s*(\d+)/i', $clean)) {
            return true;
        }

        if (preg_match('/^#\d+$/', $clean)) {
            return true;
        }

        if (
            $clean === 'status' ||
            $clean === 'cek tiket' ||
            $clean === 'check ticket' ||
            $clean === 'progres' ||
            $clean === 'progress' ||
            $clean === 'aduan saya' ||
            $clean === 'my ticket' ||
            $clean === 'my report' ||
            $clean === 'track ticket' ||
            $clean === 'laporan saya' ||
            $clean === 'cek aduan' ||
            $clean === 'cek laporan' ||
            $clean === 'pantau aduan'
        ) {
            return true;
        }

        return false;
    }

    /**
     * Menangani pengecekan status tiket secara cerdas dari database (Bilingual).
     */
    protected function handleStatusCheck(string $cleanSender, string $message, ?string $senderName, string $lang = 'id'): array
    {
        $phoneVariants = [
            $cleanSender,
            ltrim($cleanSender, '62'),
            '0' . substr($cleanSender, 2),
            '+' . $cleanSender,
        ];

        // 1. Jika ada nomor tiket spesifik (#4, STATUS #4, CHECK #4, TIKET #3, TIKET 3, ASP-2026-SKM-01)
        if (preg_match('/(?:tiket|cek|status|progres|lapor(?:an)?|asp-?|ticket|check)\s*#?\s*(\d+)/i', $message, $m) || preg_match('/^#(\d+)$/', trim($message), $m)) {
            $ticketId = (int) $m[1];
            $aspirasi = Aspirasi::with('desa', 'posKebutuhan')->find($ticketId);

            if (!$aspirasi) {
                $reply = $lang === 'en'
                    ? "❌ *Ticket #{$ticketId} Not Found*\n\nPlease make sure the ticket number you entered is correct. You can also type *STATUS* to see all reports linked to this WhatsApp number."
                    : "❌ *Tiket #{$ticketId} Tidak Ditemukan*\n\nMohon pastikan nomor tiket yang Anda masukkan sudah benar. Anda juga dapat mengetik *STATUS* untuk melihat riwayat aduan yang terdaftar dengan nomor WhatsApp ini.";

                return [
                    'reply' => $reply,
                    'action' => 'check_status',
                    'ticket_data' => null,
                ];
            }

            return [
                'reply' => $this->formatTicketDetailNarrative($aspirasi, $lang),
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
            ->take(5)
            ->get();

        if ($tickets->isEmpty()) {
            $reply = $lang === 'en'
                ? "📋 Currently no active reports found registered under your WhatsApp number (*+{$cleanSender}*).\n\nIf you would like to submit an issue or suggestion for your village, feel free to describe it here (e.g. _\"I want to report broken road in Desa Sukamaju\"_). AIIRA is ready to assist! 😊"
                : "📋 Saat ini belum ditemukan tiket aduan aktif yang terdaftar dengan nomor WhatsApp Anda (*+{$cleanSender}*).\n\nJika Anda ingin menyampaikan keluhan atau usulan untuk desa Anda, ceritakan langsung masalahnya di sini ya (contoh: _\"Saya mau lapor jalan rusak di Desa Sukamaju\"_). AIIRA siap membantu! 😊";

            return [
                'reply' => $reply,
                'action' => 'check_status',
                'ticket_data' => null,
            ];
        }

        if ($lang === 'en') {
            $reply = "📄 *Status of Your Citizen Reports*:\n\n";
            foreach ($tickets as $idx => $t) {
                $num = $idx + 1;
                $statusText = match ($t->status) {
                    'menunggu' => '⏳ *UNDER REVIEW* by Village Government',
                    'terverifikasi' => '✅ *APPROVED & PUBLISHED* as Student KKN Needs Post',
                    'ditolak' => "❌ *REJECTED* (Reason: " . ($t->alasan_tolak ?: 'Does not meet village criteria') . ")",
                    default => strtoupper($t->status),
                };

                $desaNama = $t->desa?->nama_desa ?? 'Village';
                $kodeTiket = "#ASP-2026-SKM-" . str_pad($t->id, 2, '0', STR_PAD_LEFT);
                $reply .= "{$num}. *Ticket #{$t->id}* ({$kodeTiket}) — {$desaNama}\n" .
                    "   📂 Category: " . strtoupper($t->kategori) . "\n" .
                    "   ⚡ Urgency: " . strtoupper($t->urgensi) . "\n" .
                    "   📊 Status: {$statusText}\n" .
                    "   📝 \"{$t->deskripsi}\"\n\n";
            }
            $reply .= "_Type *STATUS #NUMBER* (e.g. *STATUS #{$tickets->first()->id}*) to view full details._";
        } else {
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
                $kodeTiket = "#ASP-2026-SKM-" . str_pad($t->id, 2, '0', STR_PAD_LEFT);
                $reply .= "{$num}. *Tiket #{$t->id}* ({$kodeTiket}) — {$desaNama}\n" .
                    "   📂 Kategori: " . strtoupper($t->kategori) . "\n" .
                    "   ⚡ Urgensi: " . strtoupper($t->urgensi) . "\n" .
                    "   📊 Status: {$statusText}\n" .
                    "   📝 \"{$t->deskripsi}\"\n\n";
            }
            $reply .= "_Ketik *STATUS #NOMOR* (contoh: *STATUS #{$tickets->first()->id}*) untuk melihat rincian lebih detail._";
        }

        return [
            'reply' => $reply,
            'action' => 'check_status',
            'ticket_data' => $tickets->toArray(),
        ];
    }

    /**
     * Memformat rincian narasi status tiket resmi (Bilingual).
     */
    protected function formatTicketDetailNarrative(Aspirasi $aspirasi, string $lang = 'id'): string
    {
        $desaNama = $aspirasi->desa?->nama_desa ?? ($lang === 'en' ? 'Partner Village' : 'Desa Mitra');
        $kodeTiket = "#ASP-2026-SKM-" . str_pad($aspirasi->id, 2, '0', STR_PAD_LEFT);

        if ($lang === 'en') {
            $statusNarrative = match ($aspirasi->status) {
                'menunggu' => "⏳ *UNDER REVIEW BY VILLAGE GOVERNMENT*\nYour report is currently in the verification queue of {$desaNama}. The village administrative team is reviewing feasibility and priority alignment.",
                'terverifikasi' => "✅ *APPROVED & OFFICIALLY ELEVATED TO STUDENT KKN PROJECT*\nYour aspiration passed verification and was converted into an official KKN Needs Post to be solved with university student teams!" . ($aspirasi->posKebutuhan ? "\n📌 *Project Title*: {$aspirasi->posKebutuhan->judul}" : ""),
                'ditolak' => "❌ *REJECTED BY VILLAGE GOVERNMENT*\n📋 *Village Note*: " . ($aspirasi->alasan_tolak ?: 'Does not meet priority criteria for the current period.'),
                default => strtoupper($aspirasi->status),
            };

            return "📄 *Citizen Aspiration Ticket Details (#{$aspirasi->id} / {$kodeTiket})*\n\n" .
                "🏡 *Target Village*: {$desaNama}\n" .
                "👤 *Reporter*: {$aspirasi->pelapor_nama}\n" .
                "📂 *Category*: " . strtoupper($aspirasi->kategori) . "\n" .
                "⚡ *Urgency Level*: " . strtoupper($aspirasi->urgensi) . "\n" .
                "📝 *Issue Summary*: {$aspirasi->deskripsi}\n\n" .
                "📊 *Latest Progress*:\n{$statusNarrative}\n\n" .
                "💡 _You can ask for updates on this ticket anytime right here on WhatsApp._";
        }

        $statusNarrative = match ($aspirasi->status) {
            'menunggu' => "⏳ *SEDANG DITINJAU OLEH PERANGKAT DESA*\nLaporan Anda saat ini sedang dalam antrean verifikasi oleh Pemerintah Desa {$desaNama}. Tim desa akan meninjau kelayakan dan kesesuaian prioritas pembangunan desa.",
            'terverifikasi' => "✅ *DISETUJUI & RESMI DIJADIKAN PROGRAM KKN MAHASISWA*\nAspirasi Anda telah lolos verifikasi dan diangkat menjadi Pos Kebutuhan KKN nyata untuk direalisasikan bersama mahasiswa perguruan tinggi mitra!" . ($aspirasi->posKebutuhan ? "\n📌 *Nama Program*: {$aspirasi->posKebutuhan->judul}" : ""),
            'ditolak' => "❌ *DITOLAK OLEH PERANGKAT DESA*\n📋 *Catatan Desa*: " . ($aspirasi->alasan_tolak ?: 'Belum memenuhi kriteria program prioritas desa tahun berjalan.'),
            default => strtoupper($aspirasi->status),
        };

        return "📄 *Rincian Status Tiket Aspirasi (#{$aspirasi->id} / {$kodeTiket})*\n\n" .
            "🏡 *Desa Sasaran*: {$desaNama}\n" .
            "👤 *Pelapor*: {$aspirasi->pelapor_nama}\n" .
            "📂 *Kategori*: " . strtoupper($aspirasi->kategori) . "\n" .
            "⚡ *Tingkat Urgensi*: " . strtoupper($aspirasi->urgensi) . "\n" .
            "📝 *Uraian Aduan*: {$aspirasi->deskripsi}\n\n" .
            "📊 *Perkembangan Terkini*:\n{$statusNarrative}\n\n" .
            "💡 _Anda dapat menanyakan kembali perkembangan tiket ini kapan saja di nomor WhatsApp ini._";
    }

    /**
     * Cek apakah user mengonfirmasi persetujuan penerbitan tiket (Bilingual).
     */
    protected function isConfirmationAffirmative(string $lower): bool
    {
        $affirmativeWords = [
            'ya', 'iya', 'kirim', 'setuju', 'benar', 'betul', 'ok', 'oke', 'okee',
            'yes', 'yup', 'siap', 'proses', 'terbitkan', 'lanjut', 'lanjutkan', 'deal', 'gass', 'gas',
            'confirm', 'submit', 'proceed', 'send'
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
     * Cek apakah user membatalkan pada langkah konfirmasi (Bilingual).
     */
    protected function isRejectionOrCancel(string $lower): bool
    {
        $rejectWords = ['tidak', 'gak', 'nggak', 'batal', 'cancel', 'bukan', 'salah', 'stop', 'no', 'nope', 'abort'];
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
            'president', 'election', 'football score', 'recipe', 'movie cinema'
        ];

        foreach ($forbiddenKeywords as $word) {
            if (str_contains($lower, $word)) {
                if (!str_contains($lower, 'desa') && !str_contains($lower, 'kkn') && !str_contains($lower, 'village')) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Respons penolakan santun di luar domain (Bilingual).
     */
    protected function formatOutOfDomainReply(string $text, string $lang = 'id'): string
    {
        if ($lang === 'en') {
            return "For general topics outside rural community empowerment, AIIRA is unable to assist 😊.\n\n" .
                "AIIRA's core focus is assisting citizens and university students regarding the BaktiNusantara platform, public facility reports, and KKN programs.\n\n" .
                "AIIRA can happily help you with:\n" .
                "• 📝 Reporting public facility issues (roads, healthcare, stunting, MSMEs, clean water)\n" .
                "• 🔍 Checking the progress of citizen reports (*type: STATUS*)\n" .
                "• 💡 Finding partner villages and KKN student work programs\n\n" .
                "Let us know how AIIRA can assist your village!";
        }

        return "Untuk pertanyaan topik umum di luar pengabdian desa, AIIRA belum bisa membantu ya Kak 😊.\n\n" .
            "Fokus utama AIIRA adalah mendampingi warga dan mahasiswa seputar platform BaktiNusantara, penyampaian aspirasi fasilitas desa, dan program KKN terpadu.\n\n" .
            "AIIRA siap membantu Anda untuk hal-hal berikut:\n" .
            "• 📝 Menyampaikan keluhan fasilitas atau potensi desa (jalan, kesehatan, stunting, UMKM, lingkungan)\n" .
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
                $namaClean = strtolower(trim(str_ireplace(['desa', 'kelurahan', 'village'], '', $desa->nama_desa)));
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
     * Rule-based engine parsing aspirasi (Bilingual).
     */
    public function ruleBasedParseAspirasi(string $text): array
    {
        $lower = strtolower($text);

        $kategori = 'fasilitas';
        $sdgCodes = [11];

        if (preg_match('/\b(umkm|jualan|dagang|produk|kemasan|logo|pembukuan|pasar|modal|bisnis|keripik|usaha|omzet|toko|warung|legalitas|bpom|msme|business|packaging|marketing)\b/i', $lower)) {
            $kategori = 'umkm';
            $sdgCodes = [8, 1];
        } elseif (preg_match('/\b(kesehatan|stunting|posyandu|gizi|balita|ibu hamil|sakit|puskesmas|imunisasi|sanitasi|jamban|bidan|obat|penyuluhan|health|nutrition|counseling)\b/i', $lower)) {
            $kategori = 'kesehatan';
            $sdgCodes = [3, 6];
        } elseif (preg_match('/\b(lingkungan|sampah|sungai|banjir|polusi|biogas|daur ulang|kebersihan|saluran air|got|limbah|pencemaran|waste|garbage|flood|river|environment)\b/i', $lower)) {
            $kategori = 'lingkungan';
            $sdgCodes = [13, 15, 6];
        } elseif (preg_match('/\b(pendidikan|sekolah|les|belajar|bimbingan|literasi|anak|mengajar|guru|paud|sd|buku|perpustakaan|education|school|teaching|library)\b/i', $lower)) {
            $kategori = 'pendidikan';
            $sdgCodes = [4];
        } elseif (preg_match('/\b(jalan|rusak|rusakk|lubang|berlubang|lampu|penerangan|jembatan|roboh|robohh|gapura|balai|gedung|aspal|paving|lapangan|gor|drainase|air bersih|pipa|road|bridge|pothole|leak|collapsed)\b/i', $lower)) {
            $kategori = 'fasilitas';
            $sdgCodes = [9, 11];
        }

        $urgensi = 'sedang';
        if (preg_match('/\b(darurat|bahaya|parah|segera|mendesak|urgent|roboh|robohh|putus|kecelakaan|amblas|banjir bandang|longsor|kritis|danger|emergency|critical|collapse)\b/i', $lower)) {
            $urgensi = 'mendesak';
        } elseif (preg_match('/\b(usulan|rencana|saran|kalau bisa|ide|ke depan|nanti|suggestion|proposal|future|plan)\b/i', $lower)) {
            $urgensi = 'rendah';
        }

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