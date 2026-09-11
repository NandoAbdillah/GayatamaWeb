<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\ProgressMingguan;
use App\Models\SuratIzinOrtu;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProgressService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    protected function assertAnggotaKelompok(Proposal $proposal, User $user): void
    {
        $isMember = $proposal->kelompok->anggota()->where('user_id', $user->id)->exists()
            || $proposal->kelompok->ketua_id === $user->id;

        if (!$isMember) {
            abort(403, 'Anda bukan anggota dari kelompok pemilik proposal ini.');
        }
    }

    protected function assertKetuaKelompok(Proposal $proposal, User $user): void
    {
        if ($proposal->kelompok->ketua_id !== $user->id) {
            abort(403, 'Hanya ketua kelompok yang memiliki wewenang mengunggah dokumen ini.');
        }
    }

    public function store(User $user, array $data, $fotoFile = null): ProgressMingguan
    {
        $proposal = Proposal::with('kelompok')->findOrFail($data['proposal_id']);

        $this->assertAnggotaKelompok($proposal, $user);

        if ($proposal->status !== 'diterima') {
            throw ValidationException::withMessages([
                'proposal' => 'Progress mingguan hanya dapat diisi jika proposal berstatus diterima.',
            ]);
        }

        $exists = ProgressMingguan::where('proposal_id', $proposal->id)
            ->where('minggu_ke', $data['minggu_ke'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'minggu_ke' => 'Laporan progress untuk minggu ke-' . $data['minggu_ke'] . ' sudah pernah diisi.',
            ]);
        }

        // Validasi urutan minggu_ke (harus berurutan)
        if ($data['minggu_ke'] > 1) {
            $prevWeekExists = ProgressMingguan::where('proposal_id', $proposal->id)
                ->where('minggu_ke', $data['minggu_ke'] - 1)
                ->exists();

            if (!$prevWeekExists) {
                throw ValidationException::withMessages([
                    'minggu_ke' => 'Laporan progress harus diisi secara berurutan. Harap laporkan minggu ke-' . ($data['minggu_ke'] - 1) . ' terlebih dahulu.',
                ]);
            }
        }

        $fotoUrl = null;
        if ($fotoFile) {
            $path = $fotoFile->store('progress-foto', 'public');
            $fotoUrl = Storage::url($path);
        }

        $progress = ProgressMingguan::create([
            'proposal_id' => $proposal->id,
            'minggu_ke' => $data['minggu_ke'],
            'persentase' => $data['persentase'],
            'deskripsi' => $data['deskripsi'],
            'foto_url' => $fotoUrl,
            'is_locked' => true,
        ]);

        $proposal->load(['kelompok.dosen', 'posKebutuhan.desa']);

        if ($proposal->posKebutuhan && $proposal->posKebutuhan->desa && $proposal->posKebutuhan->desa->user_id) {
            $this->notificationService->send(
                $proposal->posKebutuhan->desa->user_id,
                "Kelompok '{$proposal->kelompok->nama_kelompok}' telah melaporkan progres minggu ke-{$data['minggu_ke']} ({$data['persentase']}%)."
            );
        }

        if ($proposal->kelompok && $proposal->kelompok->dosen && $proposal->kelompok->dosen->user_id) {
            $this->notificationService->send(
                $proposal->kelompok->dosen->user_id,
                "Kelompok bimbingan '{$proposal->kelompok->nama_kelompok}' telah melaporkan progres minggu ke-{$data['minggu_ke']} ({$data['persentase']}%)."
            );
        }

        return $progress;
    }

    public function getByProposal(Proposal $proposal, User $user)
    {
        $proposal->load('kelompok', 'posKebutuhan');

        $isMember = $proposal->kelompok->anggota()->where('user_id', $user->id)->exists()
            || $proposal->kelompok->ketua_id === $user->id;

        $isDesa = $user->profilDesa && $proposal->posKebutuhan->desa_id === $user->profilDesa->id;

        $isDosen = $user->profilDosen && $proposal->kelompok->dosen_id === $user->profilDosen->id;

        $isAdmin = $user->role === 'admin';

        if (!$isMember && !$isDesa && !$isDosen && !$isAdmin) {
            abort(403, 'Anda tidak memiliki wewenang untuk melihat progress proposal ini.');
        }

        return $proposal->progressMingguan()
            ->orderBy('minggu_ke', 'asc')
            ->get();
    }

    public function uploadSuratIzinOrtu(Proposal $proposal, User $user, $file): SuratIzinOrtu
    {
        $proposal->load('kelompok', 'suratIzinOrtu');
        $this->assertKetuaKelompok($proposal, $user);

        $surat = $proposal->suratIzinOrtu;

        if (!$surat || !$surat->required) {
            throw ValidationException::withMessages([
                'surat_izin' => 'Surat izin orang tua tidak diwajibkan untuk proposal ini karena jarak KKN dalam batas aman (<= 1.000 km).',
            ]);
        }

        $path = $file->store('surat-izin-ortu', 'local');

        $surat->update([
            'file_url' => $path,
            'uploaded_at' => now(),
        ]);

        return $surat;
    }
}
