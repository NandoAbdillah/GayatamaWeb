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
            $nama = $senderName ?: 'Kakak';
            return [
                'reply' => "Baik {$nama}, sesi percakapan/aduan sebelumnya telah di-reset. 👍\n\nJika nanti Anda ingin menanyakan info desa, melihat program KKN, menyampaikan aspirasi warga, atau mengecek tiket aduan, silakan chat AIIRA kapan saja ya! 😊",
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 2. INTENT: CEK STATUS / PROGRES TIKET (#4, STATUS, ASP-2026-SKM-01)
        if ($this->isStatusQuery($lower)) {
            return $this->handleStatusCheck($cleanSender, $trimmed, $senderName);
        }

        // 3. INTENT: KONFIRMASI PEMBUATAN TIKET RESMI (Hanya jika sedang menunggu konfirmasi)
        if ($session['step'] === 'awaiting_confirmation') {
            if ($this->isConfirmationAffirmative($lower)) {
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

        // 4. INTENT: OUT-OF-DOMAIN CHECK (Menolak topik politik, resep kuliner luar, dll. secara santun)
        if ($this->isOutOfDomain($lower)) {
            return [
                'reply' => $this->formatOutOfDomainReply($trimmed),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 5. INTENT: TANYA KEMAMPUAN / SIAPA NAMAMU / IDENTITAS AIIRA
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

        // 8. INTENT: GREETING / SAPAAN RAMAH ("ola", "halo", "hai", "p", "assalamualaikum", "cek", "tes")
        if ($this->isGreeting($lower)) {
            return [
                'reply' => $this->handleGreeting($senderName, $session),
                'action' => 'none',
                'ticket_data' => null,
            ];
        }

        // 9. INTENT: PELAPORAN / DRAF ASPIRASI WARGA
        if ($this->isAspirasiReportIntent($lower, $trimmed, $session)) {
            return $this->processAspirasiConversation($cleanSender, $trimmed, $senderName, $session);
        }

        // 10. CHAT UMUM / QNA LENGKAP KONSULTASI (SMART KNOWLEDGE BASE + GEMINI ROTATION)
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
            'ola', 'halo', 'haloo', 'halooo', 'halo aiira', 'halo aira', 'hai', 'hai aiira', 'hi', 'hi aiira',
            'hey', 'helo', 'hello', 'p', 'ping', 'tes', 'test', 'cek',
            'assalamualaikum', 'assalamu alaikum', 'assalamu\'alaikum', 'sampurasun', 'kulonuwun',
            'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
            'pagi', 'siang', 'sore', 'malam', 'menu', 'bantuan', 'help', 'start'
        ];

        $clean = trim(preg_replace('/[^a-z0-9\s]/', '', $lower));
        if (in_array($clean, $greetings)) {
            return true;
        }

        foreach (['halo', 'hai', 'helo', 'hello', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum'] as $lead) {
            if (str_starts_with($clean, $lead) && strlen($clean) <= strlen($lead) + 12) {
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
            'siapa namamu',
            'nama kamu siapa',
            'namamu siapa',
            'nama lu siapa',
            'siapa kamu',
            'kamu siapa',
            'kamu siapa sih',
            'siapa anda',
            'kenalan dong',
            'kenalan',
            'siapa aiira',
            'aiira itu apa',
            'aiira siapa',
            'apa yang bisa anda lakukan',
            'apa yang bisa kamu lakukan',
            'kamu bisa apa aja sih',
            'kamu bisa apa aja',
            'kamu bisa apa',
            'bisa apa aja',
            'bisa ngapain aja',
            'fitur apa saja',
            'fitur apa aja',
            'bisa bantu apa',
            'bisa bantu apa saja',
            'apa fungsi kamu',
            'fungsi aiira',
            'tugas kamu apa',
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
            'desa nya apa',
            'desanya apa',
            'desa nya apa saja',
            'desanya apa saja',
            'desa apa saja',
            'ada desa apa saja',
            'desa apa aja',
            'ada desa apa aja',
            'desa apa',
            'daftar desa',
            'list desa',
            'daftardesa',
            'desa terdaftar',
            'desa mitra',
            'desa binaan',
            'info desa',
            'lihat desa',
            'sebutkan desa',
            'desa mana saja',
            'rekomendasi desa',
            'desa yang ada',
            'lokasi desa',
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
            'proker kkn',
            'program kerja',
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
        // 1. Jika dalam tahap gathering_info
        if ($session['step'] === 'gathering_info') {
            $desa = $this->findDesaByName($message);
            if ($desa) {
                return true;
            }
            if (strlen($message) >= 8 && !preg_match('/\b(apa|siapa|kenapa|mengapa|halo|hai|batal)\b/i', $message)) {
                return true;
            }
        }

        // 2. Deteksi kata kunci keluhan / masalah infrastruktur / kebutuhan desa
        $complaintKeywords = [
            'lapor', 'aduan', 'mengadu', 'keluhan', 'aspirasi', 'usulan warga', 'tolong', 'bantu',
            'jalan rusak', 'jalan berlubang', 'jalan amblas', 'jembatan rusak', 'jembatan putus', 'jembatan roboh', 'jembatan robohh',
            'roboh', 'robohh', 'rusak', 'rusakk', 'amblas', 'lubang', 'berlubang', 'hancur',
            'lampu mati', 'penerangan mati', 'lampu padam', 'padam', 'gelap', 'lampu jalan',
            'sampah menumpuk', 'sampah', 'sungai kotor', 'sungai', 'banjir', 'limbah', 'polusi', 'pencemaran',
            'stunting', 'posyandu', 'gizi buruk', 'kekurangan tenaga', 'air bersih', 'pipa bocor', 'saluran mampet', 'drainase', 'got mampet',
            'umkm butuh', 'bantuan modal', 'pelatihan digital', 'keripik', 'izin bpom', 'legalitas umkm',
        ];

        foreach ($complaintKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                return true;
            }
        }

        // 3. Pola frasa "saya dari desa ... " atau "saya warga desa ... "
        if (preg_match('/(?:warga|desa|dusun|rt|rw|kampung)\s+[a-z0-9\s]+/i', $lower) && (
            str_contains($lower, 'lapor') || str_contains($lower, 'rusak') || str_contains($lower, 'butuh') || str_contains($lower, 'roboh') || str_contains($lower, 'masalah') || str_contains($lower, 'jembatan')
        )) {
            return true;
        }

        return false;
    }

    /**
     * Penjelasan kapabilitas cerdas AIIRA dengan data interaktif.
     */
    protected function handleCapabilitiesInquiry(?string $senderName, array $session): string
    {
        $db = $this->getDatabaseContextSummary();
        $nama = $senderName ? "Kak *{$senderName}*" : "Kakak";
        $contohDesa = !empty($db['desa_names']) ? implode(', ', array_slice($db['desa_names'], 0, 4)) : 'Desa Sukamaju, Desa Berkah Makmur';

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
     * Respons sapaan ramah AIIRA.
     */
    protected function handleGreeting(?string $senderName, array $session): string
    {
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
     * Handler penelusuran desa langsung dari tabel `profil_desa`.
     */
    protected function handleDesaInquiry(): string
    {
        $db = $this->getDatabaseContextSummary();
        $desaList = $db['desa_list'];

        if ($desaList->isEmpty()) {
            return "Saat ini belum ada data profil desa yang terdaftar di database sistem BaktiNusantara.";
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
     * Handler penelusuran program KKN / pos kebutuhan langsung dari tabel `pos_kebutuhan`.
     */
    protected function handleProgramInquiry(): string
    {
        $posList = PosKebutuhan::with('desa')->latest()->take(6)->get();

        if ($posList->isEmpty()) {
            return "Saat ini belum ada Pos Kebutuhan KKN aktif yang dipublikasikan oleh perangkat desa.";
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
     * Memproses percakapan aspirasi (ekstraksi entitas, deteksi desa tidak terdaftar, dan direct auto-ticketing).
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
            if (preg_match('/(?:desa|kelurahan|dusun)\s+([a-zA-Z]{3,25})/i', $message, $matchDesaLuar)) {
                $candidateDesa = trim($matchDesaLuar[1]);
                $ignoreWords = ['sukamaju', 'berkah', 'cempaka', 'maju', 'sukarelawan', 'kedung', 'saya', 'kami', 'yang', 'ini', 'itu', 'anda', 'kamu', 'mana', 'apa'];
                if (!in_array(strtolower($candidateDesa), $ignoreWords)) {
                    $namaDesaLuar = ucwords($candidateDesa);
                    $db = $this->getDatabaseContextSummary();
                    $desaSample = implode(', ', array_slice($db['desa_names'], 0, 4));

                    return [
                        'reply' => "Halo Kak! Terima kasih banyak telah mengabarkan kondisi di *Desa {$namaDesaLuar}* ({$parsed['deskripsi']}). 🙏\n\n" .
                            "Saat ini, *Desa {$namaDesaLuar}* belum terdaftar sebagai salah satu dari 7 desa mitra resmi BaktiNusantara. Desa mitra aktif kami meliputi: *{$desaSample}*.\n\n" .
                            "⚠️ *Tindakan Keselamatan Darurat*:\n" .
                            "Jika masalah yang dilaporkan menyangkut keselamatan fasilitas vital atau keadaan darurat (seperti jembatan roboh/putus, tanah longsor, atau banjir bandang), kami sangat menyarankan warga untuk segera melapor langsung ke pihak RT/RW, Pemerintah Desa/Kelurahan setempat, atau Badan Penanggulangan Bencana Daerah (BPBD) / Dinas PUPR setempat.\n\n" .
                            "💡 *Kemitraan Desa Baru*:\n" .
                            "Bagi Pemerintah Desa {$namaDesaLuar} yang ingin bermitra dengan BaktiNusantara agar mahasiswa KKN perguruan tinggi dapat diterjunkan membantu pembangunan desa, pendaftaran dapat dilakukan secara resmi melalui platform web kami di https://baktinusantara.up.railway.app.",
                        'action' => 'none',
                        'ticket_data' => null,
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
            $reply = "Terima kasih atas laporannya Kak! 🙏\n\n" .
                "Keluhan yang dicatat: *\"{$draft['deskripsi']}\"*\n\n" .
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

        // Syarat 2: Deskripsi harus ada substansi
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

        // SKENARIO DEMO RESMI / DIRECT TICKETING:
        // Jika desa mitra resmi DITEMUKAN dan deskripsi lengkap (>= 15 karakter atau mengandung kata kunci masalah)
        // -> Terbitkan tiket secara langsung tanpa menunda!
        $isClearComplaint = strlen($draft['deskripsi']) >= 15 && !empty($draft['desa_id']);
        if ($isClearComplaint) {
            Cache::forget($cacheKey);

            return [
                'reply' => '', // Diformat oleh WhatsAppBotService::handlePublicRole
                'action' => 'create_ticket',
                'ticket_data' => [
                    'desa_id' => $draft['desa_id'],
                    'desa_nama' => $draft['desa_nama'],
                    'pelapor_nama' => $draft['pelapor_nama'] ?: ($senderName ?: 'Warga ' . $draft['desa_nama']),
                    'pelapor_wa' => $cleanSender,
                    'kategori' => $draft['kategori'] ?: 'fasilitas',
                    'urgensi' => $draft['urgensi'] ?: 'sedang',
                    'deskripsi' => $draft['deskripsi'],
                ],
            ];
        }

        // Skenario 2: Minta konfirmasi jika informasi dirasa perlu verifikasi tambahan
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

        // 1. Cek Smart Local Knowledge Base terlebih dahulu (Instant, High Precision, Human-Friendly)
        $smartKb = $this->handleSmartKnowledgeBase($message, $senderName, $db);
        if (!empty($smartKb)) {
            return $smartKb;
        }

        $desaNames = implode(', ', $db['desa_names']);
        $systemInstruction = "Anda adalah AIIRA, asisten AI cerdas & customer service resmi platform BaktiNusantara (GayatamaWeb - Tim Gayatama 5 UNESA). " .
            "Fokus keahlian Anda: program Kuliah Kerja Nyata (KKN) Tematik, kemitraan desa binaan, dan aspirasi warga desa. " .
            "Desa mitra yang saat ini terdaftar di database sistem kami adalah: [{$desaNames}]. " .
            "Jawablah dengan bahasa Indonesia yang sangat ramah, hangat, sopan, bersahabat, terstruktur rapi, dan solutif layaknya Customer Service profesional. " .
            "Gunakan WhatsApp styling (cetak tebal dengan *, miring dengan _) dan emoji yang pas.";

        // 2. Coba panggil remote Gemini AI dengan rotasi model & API key
        $reply = $this->callGeminiTextWithRotation($message, $systemInstruction);
        if (!empty($reply)) {
            return $reply;
        }

        // 3. Fallback cerdas lokal ramah (tanpa template repetitif)
        return $this->handleLocalIntelligentChat($message, $senderName, $db);
    }

    /**
     * Mesin Knowledge Base Cerdas (QnA Lengkap Customer Service BaktiNusantara).
     */
    public function handleSmartKnowledgeBase(string $message, ?string $senderName, array $db): ?string
    {
        $lower = strtolower(trim($message));
        $nama = $senderName ? "Kak *{$senderName}*" : "Kakak";

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
            str_contains($lower, 'bagaimana cara daftar')
        ) {
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
            str_contains($lower, 'siapa pengembang')
        ) {
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
            str_contains($lower, 'pencocokan kompetensi')
        ) {
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
            str_contains($lower, 'safety compliance')
        ) {
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
            str_contains($lower, 'kriptografis') ||
            str_contains($lower, 'sha-256') ||
            str_contains($lower, 'sha256') ||
            str_contains($lower, 'qr code') ||
            str_contains($lower, 'verifikasi sertifikat') ||
            str_contains($lower, 'anti palsu')
        ) {
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
            str_contains($lower, 'tarif') ||
            str_contains($lower, 'bayar berapa')
        ) {
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
            str_contains($lower, 'call center')
        ) {
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
            str_contains($lower, 'top')
        ) {
            return "Sama-sama {$nama}! Senang sekali AIIRA bisa membantu. 😊🙏\n\n" .
                "Mari bersama-sama kita majukan desa dan wujudkan pengabdian nyata untuk Indonesia! 🇮🇩✨\n\n" .
                "Jika ada hal lain yang ingin Kakak tanyakan nanti, silakan chat AIIRA kapan saja ya. Semoga hari Kakak menyenangkan dan penuh berkah! 🌟";
        }

        return null;
    }

    /**
     * Fallback cerdas lokal ramah dan bersahabat (tidak monoton).
     */
    protected function handleLocalIntelligentChat(string $message, ?string $senderName, array $db): string
    {
        $nama = $senderName ? "Kak *{$senderName}*" : "Kakak";
        $totalDesa = $db['total_desa'] ?: 7;
        $desaSample = !empty($db['desa_names']) ? implode(', ', array_slice($db['desa_names'], 0, 3)) : 'Desa Sukamaju, Desa Berkah Makmur';

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
     * Memeriksa apakah pesan merupakan pertanyaan status tiket.
     */
    protected function isStatusQuery(string $lower): bool
    {
        $clean = trim($lower);

        if (preg_match('/(?:tiket|cek|status|progres|lapor(?:an)?|#|asp-?)\s*#?\s*(\d+)/i', $clean)) {
            return true;
        }

        if (preg_match('/^#?\d+$/', $clean)) {
            return true;
        }

        if (
            str_contains($clean, 'status') ||
            str_contains($clean, 'cek tiket') ||
            str_contains($clean, 'progres') ||
            str_contains($clean, 'aduan saya') ||
            str_contains($clean, 'laporan saya') ||
            str_contains($clean, 'cek aduan') ||
            str_contains($clean, 'cek laporan') ||
            str_contains($clean, 'pantau aduan')
        ) {
            if (!preg_match('/\b(jalan|sampah|jembatan|lampu|banjir|posyandu|sekolah|stunting|umkm|rusak|lubang|amblas|roboh)\b/i', $clean)) {
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

        // 1. Jika ada nomor tiket spesifik (contoh: #4, STATUS #4, ASP-2026-SKM-01)
        if (preg_match('/(?:tiket|cek|status|progres|lapor(?:an)?|#|asp-?)\s*#?\s*(\d+)/i', $message, $m) || preg_match('/^#?(\d+)$/', trim($message), $m)) {
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
            ->take(5)
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
            $kodeTiket = "#ASP-2026-SKM-" . str_pad($t->id, 2, '0', STR_PAD_LEFT);
            $reply .= "{$num}. *Tiket #{$t->id}* ({$kodeTiket}) — {$desaNama}\n" .
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

        $kodeTiket = "#ASP-2026-SKM-" . str_pad($aspirasi->id, 2, '0', STR_PAD_LEFT);

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

        if (preg_match('/\b(umkm|jualan|dagang|produk|kemasan|logo|pembukuan|pasar|modal|bisnis|keripik|usaha|omzet|toko|warung|legalitas|bpom)\b/i', $lower)) {
            $kategori = 'umkm';
            $sdgCodes = [8, 1];
        } elseif (preg_match('/\b(kesehatan|stunting|posyandu|gizi|balita|ibu hamil|sakit|puskesmas|imunisasi|sanitasi|jamban|bidan|obat|penyuluhan)\b/i', $lower)) {
            $kategori = 'kesehatan';
            $sdgCodes = [3, 6];
        } elseif (preg_match('/\b(lingkungan|sampah|sungai|banjir|polusi|biogas|daur ulang|kebersihan|saluran air|got|limbah|pencemaran)\b/i', $lower)) {
            $kategori = 'lingkungan';
            $sdgCodes = [13, 15, 6];
        } elseif (preg_match('/\b(pendidikan|sekolah|les|belajar|bimbingan|literasi|anak|mengajar|guru|paud|sd|buku|perpustakaan)\b/i', $lower)) {
            $kategori = 'pendidikan';
            $sdgCodes = [4];
        } elseif (preg_match('/\b(jalan|rusak|rusakk|lubang|berlubang|lampu|penerangan|jembatan|roboh|robohh|gapura|balai|gedung|aspal|paving|lapangan|gor|drainase|air bersih|pipa)\b/i', $lower)) {
            $kategori = 'fasilitas';
            $sdgCodes = [9, 11];
        }

        // 2. Ekstrak Urgensi
        $urgensi = 'sedang';
        if (preg_match('/\b(darurat|bahaya|parah|segera|mendesak|urgent|roboh|robohh|putus|kecelakaan|amblas|banjir bandang|longsor|kritis)\b/i', $lower)) {
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