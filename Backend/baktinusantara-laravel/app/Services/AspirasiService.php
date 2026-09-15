<?php

namespace App\Services;

use App\Jobs\SendWhatsAppNotificationJob;
use App\Models\Aspirasi;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class AspirasiService
{
    public function __construct(protected PosKebutuhanService $posKebutuhanService) {}

    public function create(array $data, $fotoFile = null): Aspirasi
    {
        if ($fotoFile) {
            $path = $fotoFile->store('aspirasi-foto', 'public');
            $data['foto_url'] = Storage::url($path);
        }

        $aspirasi = Aspirasi::create($data);

        // Dispatch WA notification to citizen
        if (! empty($aspirasi->pelapor_wa)) {
            $desaNama = $aspirasi->desa?->nama_desa ?? 'Desa';
            $pesan = "Halo *{$aspirasi->pelapor_nama}*,\n\nTerima kasih atas aspirasi yang Anda sampaikan untuk *{$desaNama}*.\n\n📌 *ID Tiket*: #{$aspirasi->id}\n📂 *Kategori*: " . strtoupper($aspirasi->kategori) . "\n📝 *Deskripsi*: {$aspirasi->deskripsi}\n\nAspirasi Anda telah diterima dan sedang ditinjau oleh Perangkat Desa. Anda dapat memantau status perkembangan aspirasi Anda secara berkala.\n\n_Salam hangat,_\n*Tim BaktiNusantara*";

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
                $pesan = "Halo *{$aspirasi->pelapor_nama}*,\n\nUpdate status aspirasi Anda (Tiket *#{$aspirasi->id}*):\n❌ *Status*: DITOLAK oleh Perangkat Desa\n📋 *Alasan*: {$aspirasi->alasan_tolak}\n\nTerima kasih atas kepedulian Anda dalam menyuarakan aspirasi warga desa.\n\n_Salam hangat,_\n*Tim BaktiNusantara*";
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
            'kuota_kelompok' => $data['kuota_kelompok'],
            'deadline' => $data['deadline'],
            'jurusan_dibutuhkan' => $data['jurusan_dibutuhkan'],
        ]);

        if (! empty($aspirasi->pelapor_wa)) {
            $pesan = "Halo *{$aspirasi->pelapor_nama}*,\n\nKabar baik! Aspirasi Anda (Tiket *#{$aspirasi->id}*) telah ✅ *DISETUJUI & DIVERIFIKASI* oleh Perangkat Desa.\n\nAspirasi ini telah resmi dijadikan Pos Kebutuhan KKN Mahasiswa dengan judul:\n📌 *\"{$data['judul']}\"*\n\nTerima kasih atas kontribusi nyata Anda untuk kemajuan desa!\n\n_Salam hangat,_\n*Tim BaktiNusantara*";
            SendWhatsAppNotificationJob::dispatch($aspirasi->pelapor_wa, $pesan);
        }

        return $aspirasi;
    }
}