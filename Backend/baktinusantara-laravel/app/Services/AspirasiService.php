<?php

namespace App\Services;

use App\Jobs\SendWhatsAppNotificationJob;
use App\Models\Aspirasi;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class AspirasiService
{
    public function __construct(
        protected PosKebutuhanService $posKebutuhanService,
        protected WhatsAppService $whatsAppService
    ) {}

    public function create(array $data, $fotoFile = null): Aspirasi
    {
        if ($fotoFile) {
            $path = $fotoFile->store('aspirasi-foto', 'public');
            $data['foto_url'] = Storage::url($path);
        }

        $aspirasi = Aspirasi::create($data);

        // Kirim notifikasi WhatsApp naratif resmi langsung ke warga (Skema 1)
        if (! empty($aspirasi->pelapor_wa)) {
            $desaNama = $aspirasi->desa?->nama_desa ?? 'Desa Mitra';
            $pesan = "Halo *{$aspirasi->pelapor_nama}*! 👋\n\nTerima kasih, aspirasi Anda untuk *{$desaNama}* telah berhasil dicatat secara resmi di platform BaktiNusantara.\n\n📋 *Rincian Tiket Aspirasi*:\n• *Nomor Tiket*: *#{$aspirasi->id}*\n• *Desa Sasaran*: {$desaNama}\n• *Kategori*: " . strtoupper($aspirasi->kategori) . "\n• *Tingkat Urgensi*: " . strtoupper($aspirasi->urgensi) . "\n• *Uraian Masalah*: {$aspirasi->deskripsi}\n• *Status*: ⏳ *Sedang Ditinjau Perangkat Desa*\n\n💡 *Pemantauan Mandiri via WhatsApp*:\nAnda tidak perlu membuka website lagi. Anda dapat memantau status atau bertanya langsung di ruang obrolan WhatsApp ini kapan saja (cukup ketik *STATUS* atau *CEK #{$aspirasi->id}*). AIIRA siap melayani Anda 24/7.\n\n_Salam hangat,_\n*AIIRA — Tim Layanan BaktiNusantara*";

            SendWhatsAppNotificationJob::dispatch($aspirasi->pelapor_wa, $pesan);
        }

        return $aspirasi;
    }

    public function findByTicket(int $id): ?Aspirasi
    {
        return Aspirasi::find($id);
    }

    public function getByDesa(int $desaId)
    {
        return Aspirasi::where('desa_id', $desaId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function decide(Aspirasi $aspirasi, User $user, array $data): Aspirasi
    {
        if ($data['action'] === 'reject') {
            $aspirasi->update([
                'status' => 'ditolak',
                'alasan_tolak' => $data['alasan_tolak'],
            ]);

            if (! empty($aspirasi->pelapor_wa)) {
                $pesan = "Halo *{$aspirasi->pelapor_nama}*,\n\nUpdate status aspirasi Anda (Tiket *#{$aspirasi->id}*):\n❌ *Status*: DITOLAK oleh Perangkat Desa\n📋 *Alasan*: {$aspirasi->alasan_tolak}\n\nTerima kasih atas kepedulian Anda dalam menyuarakan aspirasi warga desa.\n\n_Salam hangat,_\n*AIIRA — Tim Layanan BaktiNusantara*";
                SendWhatsAppNotificationJob::dispatch($aspirasi->pelapor_wa, $pesan);
            }

            return $aspirasi;
        }

        $aspirasi->update(['status' => 'terverifikasi']);

        $this->posKebutuhanService->createDirect($user, [
            'aspirasi_id' => $aspirasi->id,
            'judul' => $data['judul'],
            'deskripsi' => $aspirasi->deskripsi,
            'kategori' => $aspirasi->kategori,
            'sdg_codes' => $data['sdg_codes'] ?? null,
            'kuota_kelompok' => $data['kuota_kelompok'] ?? 1,
            'deadline' => $data['deadline'] ?? null,
            'jurusan_dibutuhkan' => $data['jurusan_dibutuhkan'] ?? null,
        ]);

        if (! empty($aspirasi->pelapor_wa)) {
            $pesan = "Halo *{$aspirasi->pelapor_nama}*,\n\nKabar baik! Aspirasi Anda (Tiket *#{$aspirasi->id}*) telah ✅ *DISETUJUI & DIVERIFIKASI* oleh Perangkat Desa.\n\nAspirasi ini telah resmi dijadikan Pos Kebutuhan KKN Mahasiswa dengan judul:\n📌 *\"{$data['judul']}\"*\n\nTerima kasih atas kontribusi nyata Anda untuk kemajuan desa!\n\n_Salam hangat,_\n*AIIRA — Tim Layanan BaktiNusantara*";
            SendWhatsAppNotificationJob::dispatch($aspirasi->pelapor_wa, $pesan);
        }

        return $aspirasi;
    }
}