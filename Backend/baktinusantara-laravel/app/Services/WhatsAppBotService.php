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
     * Memproses pesan WhatsApp masuk dan mengembalikan teks balasan interaktif cerdas (Bilingual).
     */
    public function handleIncoming(string $sender, string $message, ?string $senderName = null): string
    {
        $normalizedSender = $this->whatsAppService->normalizePhoneNumber($sender);
        $trimmedMessage = trim($message);
        $lang = $this->aiService->detectLanguage($trimmedMessage);

        // 1. Cek apakah pengirim terdaftar sebagai User sistem
        $user = User::where('phone_wa', $normalizedSender)
            ->orWhere('phone_wa', $sender)
            ->first();

        if ($user) {
            $lower = strtolower($trimmedMessage);
            // Cek apakah pesan adalah perintah spesifik role yang ingin melihat data internal
            $isRoleSpecific = match ($user->role) {
                'perangkat_desa' => (bool) preg_match('/\b(status|proposal|lamaran|mhs|mahasiswa|aspirasi|warga|keluhan|menu desa|dashboard desa|applicant|applicants|tickets)\b/i', $lower),
                'mahasiswa' => (bool) preg_match('/\b(status|proposal|kkn|progres|progress|laporan|portofolio|portfolio|sertifikat|certificate|luaran|kelompok saya|weekly)\b/i', $lower),
                'dosen' => (bool) preg_match('/\b(status|kelompok|binaan|mahasiswa bimbingan|logbook|dosen|supervision|teams)\b/i', $lower),
                default => false,
            };

            if ($isRoleSpecific) {
                return match ($user->role) {
                    'perangkat_desa' => $this->handleDesaRole($user, $trimmedMessage, $lang),
                    'mahasiswa' => $this->handleMahasiswaRole($user, $trimmedMessage, $lang),
                    'dosen' => $this->handleDosenRole($user, $trimmedMessage, $lang),
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
     * Handler untuk Perangkat Desa (Bilingual).
     */
    protected function handleDesaRole(User $user, string $message, string $lang = 'id'): string
    {
        $profilDesa = $user->profilDesa;
        $namaDesa = $profilDesa?->nama_desa ?? ($lang === 'en' ? 'Your Village' : 'Desa Anda');
        $lower = strtolower($message);

        if (preg_match('/\b(proposal|lamaran|mhs|mahasiswa|applicant|applicants)\b/i', $lower)) {
            $proposals = Proposal::whereHas('posKebutuhan', fn($q) => $q->where('desa_id', $profilDesa?->id))
                ->where('status', 'menunggu')
                ->with('kelompok', 'posKebutuhan')
                ->get();

            if ($proposals->isEmpty()) {
                return $lang === 'en'
                    ? "Hello Administrator of *{$namaDesa}*,\n\nCurrently there are no new student proposals awaiting your review."
                    : "Halo Pengurus *{$namaDesa}*,\n\nSaat ini belum ada proposal mahasiswa baru yang berstatus menunggu persetujuan.";
            }

            if ($lang === 'en') {
                $list = "Hello Administrator of *{$namaDesa}*,\n\nHere is the list of KKN proposals awaiting your review:\n\n";
                foreach ($proposals as $idx => $p) {
                    $num = $idx + 1;
                    $score = round((float) $p->matching_score);
                    $jarak = round((float) $p->jarak_km);
                    $list .= "{$num}. *{$p->kelompok->nama_kelompok}*\n   📌 Need Post: {$p->posKebutuhan->judul}\n   🎯 AI Compatibility: {$score}%\n   📍 Distance: {$jarak} km\n\n";
                }
                $list .= "_Please log in to the BaktiNusantara dashboard to Approve or Reject proposals._";
                return $list;
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

        if (preg_match('/\b(aspirasi|warga|keluhan|report|reports|issues|tickets)\b/i', $lower)) {
            $aspirasi = Aspirasi::where('desa_id', $profilDesa?->id)
                ->where('status', 'menunggu')
                ->latest()
                ->take(5)
                ->get();

            if ($aspirasi->isEmpty()) {
                return $lang === 'en'
                    ? "Hello Administrator of *{$namaDesa}*,\n\nThere are no new citizen reports awaiting verification at this moment."
                    : "Halo Pengurus *{$namaDesa}*,\n\nTidak ada aspirasi warga baru yang menunggu verifikasi saat ini.";
            }

            if ($lang === 'en') {
                $list = "Hello Administrator of *{$namaDesa}*,\n\nHere are the latest citizen reports for your village:\n\n";
                foreach ($aspirasi as $idx => $a) {
                    $num = $idx + 1;
                    $kodeTiket = "#ASP-2026-SKM-" . str_pad($a->id, 2, '0', STR_PAD_LEFT);
                    $list .= "{$num}. *Ticket #{$a->id}* ({$kodeTiket}) - {$a->pelapor_nama}\n   📂 Category: " . strtoupper($a->kategori) . "\n   📝 \"{$a->deskripsi}\"\n\n";
                }
                $list .= "_Open your village web dashboard to elevate this citizen report into a student KKN Needs Post._";
                return $list;
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

        if ($lang === 'en') {
            return "Hello Administrator of *{$namaDesa}*! 👋\n\nYou are registered as a *Village Official* on the BaktiNusantara platform.\n\nType the following keywords for instant data:\n• *PROPOSAL* : View incoming student KKN proposals\n• *ASPIRASI* : View pending citizen reports\n• *WEB* : Visit village dashboard\n\n_Or ask AIIRA any question for feature guidance._";
        }

        return "Halo Pengurus *{$namaDesa}*! 👋\n\nAnda terdaftar sebagai *Perangkat Desa* di platform BaktiNusantara.\n\nKetik kata kunci berikut untuk melihat data cepat:\n• *PROPOSAL* : Lihat proposal KKN yang masuk\n• *ASPIRASI* : Lihat aspirasi warga yang belum diverifikasi\n• *WEB* : Kunjungi dashboard desa\n\n_Atau tanyakan apa saja kepada AIIRA untuk panduan fitur._";
    }

    /**
     * Handler untuk Mahasiswa KKN (Bilingual).
     */
    protected function handleMahasiswaRole(User $user, string $message, string $lang = 'id'): string
    {
        $lower = strtolower($message);
        $kelompok = Kelompok::where('ketua_id', $user->id)
            ->orWhereHas('anggota', fn($q) => $q->where('user_id', $user->id))
            ->with(['proposal.posKebutuhan.desa', 'proposal.progressMingguan', 'proposal.luaranAkhir.portofolio'])
            ->first();

        if (!$kelompok) {
            return $lang === 'en'
                ? "Hello *{$user->name}*! 👋\n\nYou are registered as a Student on BaktiNusantara, but have not joined any KKN team yet.\n\nPlease log in to the web platform to create or join a KKN group."
                : "Halo *{$user->name}*! 👋\n\nAnda terdaftar sebagai Mahasiswa di BaktiNusantara, namun belum bergabung ke kelompok KKN manapun.\n\nSilakan buka platform web untuk membuat atau bergabung ke kelompok KKN.";
        }

        $proposalAktif = $kelompok->proposal->whereIn('status', ['diterima', 'menunggu'])->first();

        if (preg_match('/\b(status|proposal|kkn)\b/i', $lower)) {
            if (!$proposalAktif) {
                return $lang === 'en'
                    ? "Hello *{$user->name}* ({$kelompok->nama_kelompok}),\n\nYour group does not currently have an active proposal submission. Please explore village need posts in our catalog."
                    : "Halo *{$user->name}* ({$kelompok->nama_kelompok}),\n\nKelompok Anda saat ini belum memiliki pengajuan proposal aktif. Silakan jelajahi pos kebutuhan desa di katalog web kami.";
            }

            $desaNama = $proposalAktif->posKebutuhan->desa->nama_desa ?? ($lang === 'en' ? 'Village' : 'Desa');
            $statusText = strtoupper($proposalAktif->status);
            $score = round((float) $proposalAktif->matching_score);

            if ($lang === 'en') {
                $statusMsg = $proposalAktif->status === 'diterima'
                    ? "✅ Your proposal has been approved by the village! Don't forget to submit your weekly progress."
                    : "⏳ Your proposal is currently under review by the village government.";

                return "Hello *{$user->name}* ({$kelompok->nama_kelompok}) 👋\n\n📊 *Your KKN Proposal Status*:\n📌 *Need Post*: {$proposalAktif->posKebutuhan->judul}\n🏡 *Village*: {$desaNama}\n⚡ *Status*: *{$statusText}*\n🎯 *Matching Score*: {$score}%\n\n{$statusMsg}";
            }

            return "Halo *{$user->name}* ({$kelompok->nama_kelompok}) 👋\n\n📊 *Status Proposal KKN Anda*:\n📌 *Pos*: {$proposalAktif->posKebutuhan->judul}\n🏡 *Desa*: {$desaNama}\n⚡ *Status*: *{$statusText}*\n🎯 *Matching Score*: {$score}%\n\n" . ($proposalAktif->status === 'diterima' ? "✅ Proposal telah disetujui desa! Jangan lupa laporkan progress mingguan Anda." : "⏳ Proposal sedang ditinjau oleh pihak desa.");
        }

        if (preg_match('/\b(progres|progress|laporan|checklist|weekly)\b/i', $lower)) {
            if (!$proposalAktif || $proposalAktif->status !== 'diterima') {
                return $lang === 'en'
                    ? "Hello *{$user->name}*,\n\nWeekly progress reports can only be submitted after your KKN proposal has been approved by the village."
                    : "Halo *{$user->name}*,\n\nLaporan progress mingguan hanya dapat diakses setelah proposal KKN disetujui oleh desa.";
            }

            $submittedWeeks = $proposalAktif->progressMingguan->pluck('minggu_ke')->all();
            $checklist = "";
            for ($w = 1; $w <= 4; $w++) {
                if ($lang === 'en') {
                    $checklist .= in_array($w, $submittedWeeks) ? "• Week {$w}: ✅ Submitted\n" : "• Week {$w}: ⏳ Pending\n";
                } else {
                    $checklist .= in_array($w, $submittedWeeks) ? "• Minggu {$w}: ✅ Terkirim\n" : "• Minggu {$w}: ⏳ Belum diisi\n";
                }
            }

            if ($lang === 'en') {
                return "Hello *{$user->name}* ({$kelompok->nama_kelompok}) 📋\n\n*Weekly Progress Report Status*:\n{$checklist}\n_Upload your weekly progress evidence directly on the BaktiNusantara web platform._";
            }

            return "Halo *{$user->name}* ({$kelompok->nama_kelompok}) 📋\n\n*Status Laporan Progress Mingguan*:\n{$checklist}\n_Unggah bukti progress mingguan Anda melalui platform web BaktiNusantara._";
        }

        if (preg_match('/\b(portofolio|portfolio|sertifikat|certificate|luaran)\b/i', $lower)) {
            $portofolio = $proposalAktif?->luaranAkhir?->portofolio;
            if ($portofolio) {
                $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
                return $lang === 'en'
                    ? "🎉 *Congratulations!* Your team's official KKN E-Portfolio has been published and verified by the village:\n\n🔗 {$frontendUrl}/portofolio/{$portofolio->slug_public}\n\nYou can share this link as verified proof of real-world community development impact."
                    : "🎉 *Selamat!* E-Portofolio KKN kelompok Anda telah terbit dan diverifikasi desa:\n\n🔗 {$frontendUrl}/portofolio/{$portofolio->slug_public}\n\nAnda dapat membagikan tautan ini sebagai bukti portofolio kerja nyata profesional.";
            }

            return $lang === 'en'
                ? "Hello *{$user->name}*,\n\nE-Portfolios and certificates will be generated automatically once final deliverables are verified by the village administration (*Verified by Village*)."
                : "Halo *{$user->name}*,\n\nE-Portofolio dan sertifikat akan terbit otomatis setelah luaran akhir disahkan oleh perangkat desa (*Verified by Village*).";
        }

        if ($lang === 'en') {
            return "Hello *{$user->name}* ({$kelompok->nama_kelompok})! 👋\n\nType the following keywords for your KKN information:\n• *STATUS* : Check KKN proposal status\n• *PROGRESS* : Check weekly report checklist\n• *PORTOFOLIO* : Retrieve official e-portfolio link\n\n_Or ask AIIRA anything about KKN programs._";
        }

        return "Halo *{$user->name}* ({$kelompok->nama_kelompok})! 👋\n\nKetik kata kunci berikut untuk info KKN Anda:\n• *STATUS* : Cek status proposal KKN\n• *PROGRESS* : Cek checklist laporan mingguan\n• *PORTOFOLIO* : Ambil link e-portofolio resmi\n\n_Atau tanyakan apa saja kepada AIIRA untuk panduan seputar KKN._";
    }

    /**
     * Handler untuk Dosen DPL (Bilingual).
     */
    protected function handleDosenRole(User $user, string $message, string $lang = 'id'): string
    {
        $dosen = $user->profilDosen;
        $kelompok = Kelompok::where('dosen_id', $dosen?->id)->with('proposal.posKebutuhan.desa')->get();

        if ($kelompok->isEmpty()) {
            return $lang === 'en'
                ? "Hello {$user->name} (Field Supervisor) 👋\n\nCurrently there are no KKN student teams connected to your supervisor account."
                : "Halo {$user->name} (Dosen DPL) 👋\n\nSaat ini belum ada kelompok KKN binaan yang terhubung dengan akun Anda.";
        }

        if ($lang === 'en') {
            $list = "Hello {$user->name} (Field Supervisor) 👋\n\nHere are the KKN teams under your supervision:\n\n";
            foreach ($kelompok as $idx => $k) {
                $num = $idx + 1;
                $pos = $k->proposal->first();
                $posJudul = $pos ? $pos->posKebutuhan->judul : 'Not yet submitted';
                $list .= "{$num}. *{$k->nama_kelompok}*\n   📌 Program: {$posJudul}\n\n";
            }
            $list .= "_Open the supervisor dashboard to validate proposal feasibility and monitor student logbooks._";
            return $list;
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
     * Handler untuk Publik / Warga Desa Umum (Aspirasi Cerdas, Status, & QnA Bilingual).
     */
    protected function handlePublicRole(string $sender, string $message, ?string $senderName = null): string
    {
        // Delegasikan percakapan interaktif ke AIIRA Conversational Engine
        $aiResult = $this->aiService->chatWithAiira($sender, $message, $senderName);
        $lang = $aiResult['lang'] ?? 'id';

        // Jika user telah mengonfirmasi pembuatan tiket resmi atau direct ticketing terpenuhi
        if ($aiResult['action'] === 'create_ticket') {
            $ticketData = $aiResult['ticket_data'];
            $desa = ProfilDesa::find($ticketData['desa_id']);

            if (!$desa) {
                return $lang === 'en'
                    ? "Sorry, the village data could not be verified. Please state your village name again (e.g. *Desa Sukamaju*)."
                    : "Maaf Kak, data desa belum valid. Silakan sebutkan kembali nama desa Anda (contoh: *Desa Sukamaju*).";
            }

            // Simpan resmi ke database tabel `aspirasi`
            $aspirasi = Aspirasi::create([
                'desa_id' => $desa->id,
                'pelapor_nama' => $ticketData['pelapor_nama'] ?: ($senderName ?: ($lang === 'en' ? 'Citizen of ' . $desa->nama_desa : 'Warga ' . $desa->nama_desa)),
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

            if ($lang === 'en') {
                return "🎉 *Official Aspiration Ticket Issued!* 🇮🇩\n\n" .
                    "Thank you, your citizen report has been registered with Ticket No: *{$kodeTiket}* (ID: *#{$aspirasi->id}*).\n\n" .
                    "🏡 *Target Village*: {$desa->nama_desa}\n" .
                    "👤 *Reporter*: {$aspirasi->pelapor_nama}\n" .
                    "📂 *Category*: " . strtoupper($aspirasi->kategori) . $sdgTag . "\n" .
                    "⚡ *Urgency Level*: " . strtoupper($aspirasi->urgensi) . "\n" .
                    "📝 *Issue Summary*: \"{$aspirasi->deskripsi}\"\n\n" .
                    "✅ Your report has officially entered the BaktiNusantara database and is now in the verification queue for the {$desa->nama_desa} Village Administration.\n\n" .
                    "📱 *Direct WhatsApp Tracking (No Web Needed)*:\n" .
                    "Citizens do not need to open any web browser. You can track this ticket's progress directly on WhatsApp anytime simply by typing *STATUS* or *CHECK #{$aspirasi->id}*.\n\n" .
                    "_Warm regards,_\n*AIIRA — BaktiNusantara Support Team*";
            }

            return "🎉 *Tiket Aspirasi Berhasil Diterbitkan!* 🇮🇩\n\n" .
                "Terima kasih Kak, aspirasi Anda telah dicatat dengan Nomor Tiket: *{$kodeTiket}* (ID: *#{$aspirasi->id}*).\n\n" .
                "🏡 *Desa Sasaran*: {$desa->nama_desa}\n" .
                "👤 *Pelapor*: {$aspirasi->pelapor_nama}\n" .
                "📂 *Kategori*: " . strtoupper($aspirasi->kategori) . $sdgTag . "\n" .
                "⚡ *Tingkat Urgensi*: " . strtoupper($aspirasi->urgensi) . "\n" .
                "📝 *Uraian Masalah*: \"{$aspirasi->deskripsi}\"\n\n" .
                "✅ Laporan Anda telah resmi masuk ke sistem database BaktiNusantara dan sedang dalam antrean verifikasi Perangkat Desa {$desa->nama_desa}.\n\n" .
                "📱 *Pemantauan Mandiri Tanpa Buka Web*:\n" .
                "Warga tidak perlu repot membuka website. Anda dapat memantau perkembangan tiket ini langsung di nomor WhatsApp ini cukup dengan mengetik *STATUS* atau *CEK #{$aspirasi->id}*.\n\n" .
                "_Salam hangat,_\n*AIIRA — Tim Layanan BaktiNusantara*";
        }

        return $aiResult['reply'];
    }
}