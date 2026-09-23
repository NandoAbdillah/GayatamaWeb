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
     * Memproses pesan WhatsApp masuk dan mengembalikan teks balasan interaktif.
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
            return match ($user->role) {
                'perangkat_desa' => $this->handleDesaRole($user, $trimmedMessage),
                'mahasiswa' => $this->handleMahasiswaRole($user, $trimmedMessage),
                'dosen' => $this->handleDosenRole($user, $trimmedMessage),
                default => $this->handlePublicRole($normalizedSender, $trimmedMessage, $senderName ?: $user->name),
            };
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
                $list .= "{$num}. *Tiket #{$a->id}* - {$a->pelapor_nama}\n   📂 Kategori: " . strtoupper($a->kategori) . "\n   📝 \"{$a->deskripsi}\"\n\n";
            }
            $list .= "_Buka dashboard desa untuk mengangkat aspirasi ini menjadi Pos Kebutuhan KKN._";
            return $list;
        }

        return "Halo Pengurus *{$namaDesa}*! 👋\n\nAnda terdaftar sebagai *Perangkat Desa* di platform BaktiNusantara.\n\nKetik kata kunci berikut untuk melihat data cepat:\n• *PROPOSAL* : Lihat proposal KKN yang masuk\n• *ASPIRASI* : Lihat aspirasi warga yang belum diverifikasi\n• *WEB* : Kunjungi dashboard desa";
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

        return "Halo *{$user->name}* ({$kelompok->nama_kelompok})! 👋\n\nKetik kata kunci berikut untuk info KKN Anda:\n• *STATUS* : Cek status proposal KKN\n• *PROGRESS* : Cek checklist laporan mingguan\n• *PORTOFOLIO* : Ambil link e-portofolio resmi";
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
     * Handler untuk Publik / Warga Desa Umum (Bisa Bikin Aspirasi & Cek Tiket).
     */
    protected function handlePublicRole(string $sender, string $message, ?string $senderName = null): string
    {
        // Delegasikan percakapan interaktif ke AIIRA Conversational Engine
        $aiResult = $this->aiService->chatWithAiira($sender, $message, $senderName);

        // Jika user telah mengonfirmasi pembuatan tiket resmi (Skema 2: Auto-Ticketing)
        if ($aiResult['action'] === 'create_ticket') {
            $ticketData = $aiResult['ticket_data'];
            $desa = ProfilDesa::find($ticketData['desa_id']);

            if (!$desa) {
                return "Maaf, data desa belum valid. Silakan sebutkan kembali nama desa Anda.";
            }

            // Simpan resmi ke database tabel `aspirasi` (POST terjadi di database)
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

            return "🎉 *Tiket Aduan Resmi Berhasil Diterbitkan!* 🇮🇩\n\n" .
                "📌 *Nomor Tiket*: *#{$aspirasi->id}*\n" .
                "🏡 *Desa Sasaran*: {$desa->nama_desa}\n" .
                "👤 *Pelapor*: {$aspirasi->pelapor_nama}\n" .
                "📂 *Kategori*: " . strtoupper($aspirasi->kategori) . "\n" .
                "⚡ *Tingkat Urgensi*: " . strtoupper($aspirasi->urgensi) . "\n" .
                "📝 *Uraian Masalah*: \"{$aspirasi->deskripsi}\"\n\n" .
                "✅ Laporan Anda telah resmi masuk ke sistem database BaktiNusantara dan sedang dalam antrean verifikasi Perangkat Desa {$desa->nama_desa}.\n\n" .
                "📱 *Pemantauan Mandiri Tanpa Buka Web*:\n" .
                "Anda tidak perlu membuka website lagi. Anda dapat memantau perkembangan tiket ini langsung di nomor WhatsApp ini cukup dengan mengetik *STATUS* atau *CEK #{$aspirasi->id}*.\n\n" .
                "_Salam hangat,_\n*AIIRA — Tim Layanan BaktiNusantara*";
        }

        return $aiResult['reply'];
    }
}