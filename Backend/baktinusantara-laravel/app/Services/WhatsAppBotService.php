<?php

namespace App\Services;

use App\Models\Aspirasi;
use App\Models\Kelompok;
use App\Models\ProfilDesa;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class WhatsAppBotService
{
    public function __construct(
        protected WhatsAppService $whatsAppService,
        protected AiService $aiService
    ) {}

    /**
     * Memproses pesan WhatsApp masuk dan mengembalikan teks balasan interaktif cerdas.
     */
    public function handleIncoming(string $sender, string $message, ?string $senderName = null): string
    {
        $normalizedSender = $this->whatsAppService->normalizePhoneNumber($sender);
        $trimmedMessage = trim($message);

        // 1. Cek apakah pengirim terdaftar sebagai User sistem
        $user = User::where('phone_wa', $normalizedSender)
            ->orWhere('phone_wa', $sender)
            ->first();

        if ($user) {
            $lower = strtolower($trimmedMessage);
            // Cek apakah pesan adalah perintah spesifik role yang ingin melihat data internal
            $isRoleSpecific = match ($user->role) {
                'perangkat_desa' => (bool) preg_match('/\b(proposal|lamaran|mhs|mahasiswa|aspirasi|warga|keluhan|menu desa|dashboard desa)\b/i', $lower),
                'mahasiswa' => (bool) preg_match('/\b(proposal|kkn|progres|progress|laporan|portofolio|sertifikat|luaran|kelompok saya)\b/i', $lower),
                'dosen' => (bool) preg_match('/\b(kelompok|binaan|mahasiswa bimbingan|logbook|dosen)\b/i', $lower),
                default => false,
            };

            if ($isRoleSpecific) {
                return match ($user->role) {
                    'perangkat_desa' => $this->handleDesaRole($user, $trimmedMessage),
                    'mahasiswa' => $this->handleMahasiswaRole($user, $trimmedMessage),
                    'dosen' => $this->handleDosenRole($user, $trimmedMessage),
                    default => $this->handlePublicRole($normalizedSender, $trimmedMessage, $senderName ?: $user->name),
                };
            }

            // Jika bukan perintah data internal spesifik, layani menggunakan kecerdasan AIIRA publik
            return $this->handlePublicRole($normalizedSender, $trimmedMessage, $senderName ?: $user->name);
        }

        // 2. User umum / Warga masyarakat
        return $this->handlePublicRole($normalizedSender, $trimmedMessage, $senderName);
    }

    /**
     * Handler untuk Perangkat Desa.
     */
    protected function handleDesaRole(User $user, string $message): string
    {
        $profilDesa = $user->profilDesa;
        $namaDesa = $profilDesa?->nama_desa ?? 'Desa Anda';
        $lower = strtolower($message);

        if (preg_match('/\b(proposal|lamaran|mhs|mahasiswa)\b/i', $lower)) {
            $proposals = Proposal::whereHas('posKebutuhan', fn($q) => $q->where('desa_id', $profilDesa?->id))
                ->where('status', 'menunggu')
                ->with('kelompok', 'posKebutuhan')
                ->get();

            if ($proposals->isEmpty()) {
                return "Halo Pengurus *{$namaDesa}*,\n\nSaat ini belum ada proposal mahasiswa baru yang berstatus menunggu persetujuan.";
            }

            $list = "Halo Pengurus *{$namaDesa}*,\n\nBerikut daftar proposal KKN yang menunggu review Anda:\n\n";
            foreach ($proposals as $idx => $p) {
                $num = $idx + 1;
                $score = round((float) $p->matching_score);
                $jarak = round((float) $p->jarak_km);
                $list .= "{$num}. *{$p->kelompok->nama_kelompok}*\n   📌 Pos: {$p->posKebutuhan->judul}\n   🎯 Kecocokan: {$score}%\n   📍 Jarak: {$jarak} km\n\n";
            }
            $list .= "_Silakan login ke dashboard BaktiNusantara untuk menyetujui (Approve) atau menolak (Reject) proposal._";
            return $list;
        }

        if (preg_match('/\b(aspirasi|warga|keluhan)\b/i', $lower)) {
            $aspirasi = Aspirasi::where('desa_id', $profilDesa?->id)
                ->where('status', 'menunggu')
                ->latest()
                ->take(5)
                ->get();

            if ($aspirasi->isEmpty()) {
                return "Halo Pengurus *{$namaDesa}*,\n\nTidak ada aspirasi warga baru yang menunggu verifikasi saat ini.";
            }

            $list = "Halo Pengurus *{$namaDesa}*,\n\nBerikut daftar aspirasi warga terbaru:\n\n";
            foreach ($aspirasi as $idx => $a) {
                $num = $idx + 1;
                $kodeTiket = "#ASP-2026-SKM-" . str_pad($a->id, 2, '0', STR_PAD_LEFT);
                $list .= "{$num}. *Tiket #{$a->id}* ({$kodeTiket}) - {$a->pelapor_nama}\n   📂 Kategori: " . strtoupper($a->kategori) . "\n   📝 \"{$a->deskripsi}\"\n\n";
            }
            $list .= "_Buka dashboard desa untuk mengangkat aspirasi ini menjadi Pos Kebutuhan KKN._";
            return $list;
        }

        return "Halo Pengurus *{$namaDesa}*! 👋\n\nAnda terdaftar sebagai *Perangkat Desa* di platform BaktiNusantara.\n\nKetik kata kunci berikut untuk melihat data cepat:\n• *PROPOSAL* : Lihat proposal KKN yang masuk\n• *ASPIRASI* : Lihat aspirasi warga yang belum diverifikasi\n• *WEB* : Kunjungi dashboard desa\n\n_Atau tanyakan apa saja kepada AIIRA untuk panduan fitur._";
    }

    /**
     * Handler untuk Mahasiswa KKN.
     */
    protected function handleMahasiswaRole(User $user, string $message): string
    {
        $lower = strtolower($message);
        $kelompok = Kelompok::where('ketua_id', $user->id)
            ->orWhereHas('anggota', fn($q) => $q->where('user_id', $user->id))
            ->with(['proposal.posKebutuhan.desa', 'proposal.progressMingguan', 'proposal.luaranAkhir.portofolio'])
            ->first();

        if (!$kelompok) {
            return "Halo *{$user->name}*! 👋\n\nAnda terdaftar sebagai Mahasiswa di BaktiNusantara, namun belum bergabung ke kelompok KKN manapun.\n\nSilakan buka platform web untuk membuat atau bergabung ke kelompok KKN.";
        }

        $proposalAktif = $kelompok->proposal->whereIn('status', ['diterima', 'menunggu'])->first();

        if (preg_match('/\b(status|proposal|kkn)\b/i', $lower)) {
            if (!$proposalAktif) {
                return "Halo *{$user->name}* ({$kelompok->nama_kelompok}),\n\nKelompok Anda saat ini belum memiliki pengajuan proposal aktif. Silakan jelajahi pos kebutuhan desa di katalog web kami.";
            }

            $desaNama = $proposalAktif->posKebutuhan->desa->nama_desa ?? 'Desa';
            $statusText = strtoupper($proposalAktif->status);
            $score = round((float) $proposalAktif->matching_score);

            return "Halo *{$user->name}* ({$kelompok->nama_kelompok}) 👋\n\n📊 *Status Proposal KKN Anda*:\n📌 *Pos*: {$proposalAktif->posKebutuhan->judul}\n🏡 *Desa*: {$desaNama}\n⚡ *Status*: *{$statusText}*\n🎯 *Matching Score*: {$score}%\n\n" . ($proposalAktif->status === 'diterima' ? "✅ Proposal telah disetujui desa! Jangan lupa laporkan progress mingguan Anda." : "⏳ Proposal sedang ditinjau oleh pihak desa.");
        }

        if (preg_match('/\b(progres|progress|laporan)\b/i', $lower)) {
            if (!$proposalAktif || $proposalAktif->status !== 'diterima') {
                return "Halo *{$user->name}*,\n\nLaporan progress mingguan hanya dapat diakses setelah proposal KKN disetujui oleh desa.";
            }

            $submittedWeeks = $proposalAktif->progressMingguan->pluck('minggu_ke')->all();
            $checklist = "";
            for ($w = 1; $w <= 4; $w++) {
                $checklist .= in_array($w, $submittedWeeks) ? "• Minggu {$w}: ✅ Terkirim\n" : "• Minggu {$w}: ⏳ Belum diisi\n";
            }

            return "Halo *{$user->name}* ({$kelompok->nama_kelompok}) 📋\n\n*Status Laporan Progress Mingguan*:\n{$checklist}\n_Unggah bukti progress mingguan Anda melalui platform web BaktiNusantara._";
        }

        if (preg_match('/\b(portofolio|sertifikat|luaran)\b/i', $lower)) {
            $portofolio = $proposalAktif?->luaranAkhir?->portofolio;
            if ($portofolio) {
                $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
                return "🎉 *Selamat!* E-Portofolio KKN kelompok Anda telah terbit dan diverifikasi desa:\n\n🔗 {$frontendUrl}/portofolio/{$portofolio->slug_public}\n\nAnda dapat membagikan tautan ini sebagai bukti portofolio kerja nyata profesional.";
            }

            return "Halo *{$user->name}*,\n\nE-Portofolio dan sertifikat akan terbit otomatis setelah luaran akhir disahkan oleh perangkat desa (*Verified by Village*).";
        }

        return "Halo *{$user->name}* ({$kelompok->nama_kelompok})! 👋\n\nKetik kata kunci berikut untuk info KKN Anda:\n• *STATUS* : Cek status proposal KKN\n• *PROGRESS* : Cek checklist laporan mingguan\n• *PORTOFOLIO* : Ambil link e-portofolio resmi\n\n_Atau tanyakan apa saja kepada AIIRA untuk panduan seputar KKN._";
    }

    /**
     * Handler untuk Dosen DPL.
     */
    protected function handleDosenRole(User $user, string $message): string
    {
        $dosen = $user->profilDosen;
        $kelompok = Kelompok::where('dosen_id', $dosen?->id)->with('proposal.posKebutuhan.desa')->get();

        if ($kelompok->isEmpty()) {
            return "Halo {$user->name} (Dosen DPL) 👋\n\nSaat ini belum ada kelompok KKN binaan yang terhubung dengan akun Anda.";
        }

        $list = "Halo {$user->name} (Dosen DPL) 👋\n\nBerikut kelompok KKN binaan Anda:\n\n";
        foreach ($kelompok as $idx => $k) {
            $num = $idx + 1;
            $pos = $k->proposal->first();
            $posJudul = $pos ? $pos->posKebutuhan->judul : 'Belum submit';
            $list .= "{$num}. *{$k->nama_kelompok}*\n   📌 Program: {$posJudul}\n\n";
        }
        $list .= "_Buka dashboard dosen untuk memvalidasi kelayakan proposal dan memantau logbook mahasiswa._";
        return $list;
    }

    /**
     * Handler untuk Publik / Warga Desa Umum (Aspirasi Cerdas, Status, & QnA).
     */
    protected function handlePublicRole(string $sender, string $message, ?string $senderName = null): string
    {
        // Delegasikan percakapan interaktif ke AIIRA Conversational Engine
        $aiResult = $this->aiService->chatWithAiira($sender, $message, $senderName);

        // Jika user telah mengonfirmasi pembuatan tiket resmi atau direct ticketing terpenuhi
        if ($aiResult['action'] === 'create_ticket') {
            $ticketData = $aiResult['ticket_data'];
            $desa = ProfilDesa::find($ticketData['desa_id']);

            if (!$desa) {
                return "Maaf Kak, data desa belum valid. Silakan sebutkan kembali nama desa Anda (contoh: *Desa Sukamaju*).";
            }

            // Simpan resmi ke database tabel `aspirasi`
            $aspirasi = Aspirasi::create([
                'desa_id' => $desa->id,
                'pelapor_nama' => $ticketData['pelapor_nama'] ?: ($senderName ?: 'Warga ' . $desa->nama_desa),
                'pelapor_wa' => $sender,
                'kategori' => $ticketData['kategori'] ?? 'fasilitas',
                'deskripsi' => $ticketData['deskripsi'],
                'urgensi' => $ticketData['urgensi'] ?? 'sedang',
                'latitude' => $desa->latitude ?? -7.54,
                'longitude' => $desa->longitude ?? 112.23,
                'status' => 'menunggu',
            ]);

            $kodeTiket = "#ASP-2026-SKM-" . str_pad($aspirasi->id, 2, '0', STR_PAD_LEFT);
            $sdgTag = match ($aspirasi->kategori) {
                'kesehatan' => ' (SDG 3: Good Health & Well-being)',
                'umkm' => ' (SDG 8: Decent Work & Economic Growth)',
                'lingkungan' => ' (SDG 13: Climate Action & SDG 6: Clean Water)',
                'pendidikan' => ' (SDG 4: Quality Education)',
                default => ' (SDG 11: Sustainable Communities)',
            };

            return "🎉 *Tiket Aspirasi Berhasil Diterbitkan!* 🇮🇩\n\n" .
                "Terima kasih Kak, aspirasi Anda telah dicatat dengan No Tiket: *{$kodeTiket}* (ID: *#{$aspirasi->id}*).\n\n" .
                "🏡 *Desa Sasaran*: {$desa->nama_desa}\n" .
                "👤 *Pelapor*: {$aspirasi->pelapor_nama}\n" .
                "📂 *Kategori*: " . strtoupper($aspirasi->kategori) . $sdgTag . "\n" .
                "⚡ *Tingkat Urgensi*: " . strtoupper($aspirasi->urgensi) . "\n" .
                "📝 *Uraian Masalah*: \"{$aspirasi->deskripsi}\"\n\n" .
                "✅ Laporan Anda telah resmi masuk ke sistem database BaktiNusantara dan sedang dalam antrean verifikasi Perangkat Desa {$desa->nama_desa}. Teruskan ke perangkat desa.\n\n" .
                "📱 *Pemantauan Mandiri Tanpa Buka Web*:\n" .
                "Warga tidak perlu repot membuka website. Anda dapat memantau perkembangan tiket ini langsung di nomor WhatsApp ini cukup dengan mengetik *STATUS* atau *CEK #{$aspirasi->id}*.\n\n" .
                "_Salam hangat,_\n*AIIRA — Tim Layanan BaktiNusantara*";
        }

        return $aiResult['reply'];
    }
}