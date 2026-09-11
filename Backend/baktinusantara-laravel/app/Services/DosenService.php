<?php

namespace App\Services;

use App\Models\Kelompok;
use App\Models\ProfilDosen;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class DosenService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function listKelompokBinaan(User $userDosen)
    {
        $dosen = $userDosen->profilDosen;
        if (!$dosen) {
            abort(403, 'Profil dosen tidak ditemukan.');
        }

        return Kelompok::where('dosen_id', $dosen->id)
            ->with([
                'ketua',
                'anggota.user.profilMahasiswa',
                'proposal.posKebutuhan.desa',
                'proposal.progressMingguan',
                'proposal.luaranAkhir',
            ])
            ->get();
    }

    public function validasiKelayakanProposal(Proposal $proposal, User $userDosen, array $data): Proposal
    {
        $proposal->load('kelompok', 'posKebutuhan.desa');

        $dosen = $userDosen->profilDosen;
        if (!$dosen || $proposal->kelompok->dosen_id !== $dosen->id) {
            abort(403, 'Anda bukan dosen pembimbing dari kelompok pemilik proposal ini.');
        }

        // Simpan ke kolom terstruktur khusus Dosen DPL
        $proposal->update([
            'status_kelayakan_dosen' => $data['status_kelayakan'],
            'catatan_dosen' => $data['catatan_dosen'],
            'dosen_reviewed_at' => now(),
        ]);

        if ($proposal->kelompok && $proposal->kelompok->ketua_id) {
            $this->notificationService->send(
                $proposal->kelompok->ketua_id,
                "Dosen Pembimbing ({$userDosen->name}) telah memberikan tinjauan kelayakan proposal: " . strtoupper($data['status_kelayakan']) . "."
            );
        }

        if ($proposal->posKebutuhan && $proposal->posKebutuhan->desa && $proposal->posKebutuhan->desa->user_id) {
            $this->notificationService->send(
                $proposal->posKebutuhan->desa->user_id,
                "Dosen Pembimbing ({$userDosen->name}) telah meninjau proposal kelompok '{$proposal->kelompok->nama_kelompok}' dengan status: " . strtoupper($data['status_kelayakan']) . "."
            );
        }

        return $proposal->load('kelompok', 'posKebutuhan');
    }

    public function listDosenPublic()
    {
        return ProfilDosen::with(['user:id,name,email', 'universitas:id,nama_universitas,kode_univ'])
            ->get();
    }

    public function setDosenPembimbing(Kelompok $kelompok, User $userKetua, int $dosenId): Kelompok
    {
        if ($kelompok->ketua_id !== $userKetua->id) {
            abort(403, 'Hanya ketua kelompok yang memiliki wewenang menetapkan dosen pembimbing.');
        }

        $dosen = ProfilDosen::with('universitas')->findOrFail($dosenId);

        // Validasi kesesuaian asal universitas mahasiswa dengan dosen via Foreign Key (universitas_id)
        $profilMahasiswa = $userKetua->profilMahasiswa;
        if ($profilMahasiswa && (int) $profilMahasiswa->universitas_id !== (int) $dosen->universitas_id) {
            throw ValidationException::withMessages([
                'dosen_id' => 'Dosen pembimbing harus berasal dari perguruan tinggi yang sama dengan mahasiswa.',
            ]);
        }

        $kelompok->update([
            'dosen_id' => $dosen->id,
        ]);

        if ($dosen->user_id) {
            $this->notificationService->send(
                $dosen->user_id,
                "Kelompok '{$kelompok->nama_kelompok}' telah menetapkan Anda sebagai Dosen Pembimbing Lapangan."
            );
        }

        return $kelompok->load('dosen.user', 'dosen.universitas');
    }
}
