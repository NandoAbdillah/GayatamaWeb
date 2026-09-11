<?php

namespace App\Services;

use App\Models\LaporanDosen;
use App\Models\User;

class LaporanDosenService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function storeByDesa(User $userDesa, array $data): LaporanDosen
    {
        $desa = $userDesa->profilDesa;
        if (!$desa) {
            abort(403, 'Profil desa tidak ditemukan.');
        }

        $laporan = LaporanDosen::create([
            'dosen_id' => $data['dosen_id'],
            'desa_id' => $desa->id,
            'proposal_id' => $data['proposal_id'] ?? null,
            'status' => 'menunggu',
            'isi' => $data['isi'],
        ])->load('dosen.user', 'dosen.universitas.user', 'desa', 'proposal');

        if ($laporan->dosen && $laporan->dosen->user_id) {
            $this->notificationService->send(
                $laporan->dosen->user_id,
                "Desa '{$desa->nama_desa}' telah mengirimkan evaluasi kinerja pembimbingan KKN."
            );
        }

        if ($laporan->dosen && $laporan->dosen->universitas && $laporan->dosen->universitas->user_id) {
            $this->notificationService->send(
                $laporan->dosen->universitas->user_id,
                "Desa '{$desa->nama_desa}' telah mengirimkan evaluasi kinerja untuk DPL {$laporan->dosen->user->name}."
            );
        }

        return $laporan;
    }
}
