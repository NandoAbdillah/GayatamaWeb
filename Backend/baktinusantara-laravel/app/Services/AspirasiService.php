<?php

namespace App\Services;

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

        return Aspirasi::create($data);
        // TODO nanti: dispatch job kirim WA notif (BAB 6.2) + AI kategorisasi (BAB 6.3)
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

        return $aspirasi;
    }
}