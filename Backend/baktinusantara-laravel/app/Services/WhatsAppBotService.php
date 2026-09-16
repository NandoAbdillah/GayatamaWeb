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
        $lower = strtolower($message);

        // 1. Cek Status Tiket (misal: "TIKET #12", "CEK 12", "STATUS 12")
        if (preg_match('/(?:tiket|cek|status)\s*#?\s*(\d+)/i', $lower, $matches)) {
            $ticketId = (int) $matches[1];
            $aspirasi = Aspirasi::with('desa')->find($ticketId);

            if (!$aspirasi) {
                return "❌ *Tiket #{$ticketId} Tidak Ditemukan*\n\nMohon pastikan nomor tiket yang Anda masukkan sudah benar.";
            }

            $statusText = match ($aspirasi->status) {
                'menunggu' => '⏳ *SEDANG DITINJAU* oleh Perangkat Desa',
                'terverifikasi' => '✅ *DISETUJUI & DITERBITKAN* sebagai Pos Kebutuhan KKN Mahasiswa',
                'ditolak' => "❌ *DITOLAK* oleh Perangkat Desa\n📋 *Alasan*: " . ($aspirasi->alasan_tolak ?? 'Tidak memenuhi kriteria prioritas desa'),
                default => strtoupper($aspirasi->status),
            };

            $desaNama = $aspirasi->desa?->nama_desa ?? 'Desa';
            return "📄 *Status Aspirasi Warga (Tiket #{$aspirasi->id})*\n\n🏡 *Desa*: {$desaNama}\n📂 *Kategori*: " . strtoupper($aspirasi->kategori) . "\n📝 *Keluhan*: {$aspirasi->deskripsi}\n📊 *Status*: {$statusText}\n\n_Terima kasih atas partisipasi Anda dalam pembangunan desa._";
        }

        // 2. Menu Bantuan Standar
        if (in_array($lower, ['halo', 'hi', 'menu', 'bantuan', 'help', 'info', 'p', 'start'])) {
            return "Selamat datang di *Bot WhatsApp Resmi BaktiNusantara*! 🇮🇩\n\nLayanan yang tersedia:\n\n1️⃣ *Kirim Aspirasi Desa*: Ceritakan keluhan/kebutuhan desa Anda secara langsung (contoh: _\"Saya warga Sukamaju mau lapor jalan berlubang di dusun krajan\"_).\n\n2️⃣ *Cek Status Aspirasi*: Ketik *TIKET #ID* (contoh: *TIKET #15*).\n\n3️⃣ *Website*: Kunjungi platform web kami untuk informasi KKN terpadu.\n\n_Ketik keluhan Anda sekarang untuk meneruskannya ke perangkat desa._";
        }

        // 3. Parsing dan Simpan Aspirasi Baru via Chat
        $parsed = $this->aiService->parseAspirasi($message);

        // Cari desa yang sesuai di database
        $desa = null;
        if (!empty($parsed['desa_nama'])) {
            $cleanName = trim(str_ireplace(['desa', 'kelurahan'], '', $parsed['desa_nama']));
            $desa = ProfilDesa::where('nama_desa', 'LIKE', '%' . $cleanName . '%')->first();
        }

        if (!$desa) {
            foreach (ProfilDesa::all() as $d) {
                $clean = trim(str_ireplace(['desa', 'kelurahan'], '', $d->nama_desa));
                if (!empty($clean) && str_contains($lower, strtolower($clean))) {
                    $desa = $d;
                    break;
                }
            }
        }

        if (!$desa) {
            $daftarDesa = ProfilDesa::take(3)->pluck('nama_desa')->implode(', ');
            return "Terima kasih telah menghubungi BaktiNusantara! 🙏\n\nUntuk mencatat aspirasi Anda ke sistem desa, mohon sebutkan *nama desa* Anda dalam pesan.\n\n_Contoh_: *\"Saya warga Desa Sukamaju ingin lapor pelatihan pembukuan UMKM desa.\"*\n\n(Contoh desa terdaftar: {$daftarDesa})";
        }

        // Simpan otomatis ke tabel `aspirasi` MySQL
        $namaPelapor = $senderName ?: 'Warga ' . $desa->nama_desa;
        $aspirasi = Aspirasi::create([
            'desa_id' => $desa->id,
            'pelapor_nama' => $namaPelapor,
            'pelapor_wa' => $sender,
            'kategori' => $parsed['kategori'],
            'deskripsi' => $parsed['deskripsi'],
            'urgensi' => $parsed['urgensi'],
            'latitude' => $desa->latitude ?? -7.5,
            'longitude' => $desa->longitude ?? 112.5,
            'status' => 'menunggu',
        ]);

        return "✅ *Aspirasi Anda Berhasil Dicatat!*\n\n📌 *Nomor Tiket*: *#{$aspirasi->id}*\n🏡 *Desa Sasaran*: {$desa->nama_desa}\n📂 *Kategori*: " . strtoupper($aspirasi->kategori) . "\n⚡ *Urgensi*: " . strtoupper($aspirasi->urgensi) . "\n📝 *Keluhan*: {$aspirasi->deskripsi}\n\nAspirasi Anda telah masuk ke sistem dan dapat langsung ditinjau oleh Perangkat {$desa->nama_desa}.\n\nKetik *TIKET #{$aspirasi->id}* kapan saja untuk mengecek perkembangan aspirasi Anda.\n\n_Salam hangat,_\n*Tim BaktiNusantara*";
    }
}