<?php

namespace App\Services;

use App\Models\Kelompok;
use App\Models\PosKebutuhan;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProposalService
{
    protected const RADIUS_THRESHOLD_KM = 1000;

    public function __construct(
        protected NotificationService $notificationService
    ) {}

    protected function getKelompokAsKetua(User $user): Kelompok
    {
        $kelompok = Kelompok::where('ketua_id', $user->id)->first();

        if (!$kelompok) {
            throw ValidationException::withMessages([
                'kelompok' => 'Kamu bukan ketua kelompok manapun. Hanya ketua yang bisa submit proposal.',
            ]);
        }

        return $kelompok;
    }

    protected function calculateJarak(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    protected function calculateMatchingScore(Kelompok $kelompok, PosKebutuhan $pos): float
    {
        $dibutuhkan = $pos->jurusan_dibutuhkan ?? [];

        if (empty($dibutuhkan)) {
            return 0;
        }

        $anggota = $kelompok->anggota()->pluck('jurusan_kontribusi');
        $totalDibutuhkan = array_sum($dibutuhkan);
        $totalCocok = 0;

        foreach ($dibutuhkan as $jurusan => $jumlah) {
            $adaDiKelompok = $anggota->filter(fn($j) => $j === $jurusan)->count();
            $totalCocok += min($adaDiKelompok, $jumlah);
        }

        return $totalDibutuhkan > 0 ? round(($totalCocok / $totalDibutuhkan) * 100, 2) : 0;
    }

    public function create(User $user, array $data, $fileProposal, $suratPengantar = null): Proposal
    {
        $kelompok = $this->getKelompokAsKetua($user);
        $pos = PosKebutuhan::with('desa')->findOrFail($data['pos_kebutuhan_id']);

        if ($pos->status !== 'open') {
            throw ValidationException::withMessages([
                'pos_kebutuhan' => 'Pos kebutuhan ini sudah tidak menerima pengajuan.',
            ]);
        }

        $kuotaTerpakai = Proposal::where('pos_kebutuhan_id', $pos->id)
            ->where('status', 'diterima')
            ->count();

        if ($kuotaTerpakai >= $pos->kuota_kelompok) {
            throw ValidationException::withMessages([
                'pos_kebutuhan' => 'Kuota kelompok untuk pos kebutuhan ini sudah penuh.',
            ]);
        }

        $sudahApply = Proposal::where('kelompok_id', $kelompok->id)
            ->where('pos_kebutuhan_id', $pos->id)
            ->whereIn('status', ['menunggu', 'diterima'])
            ->exists();

        if ($sudahApply) {
            throw ValidationException::withMessages([
                'proposal' => 'Kelompok kamu sudah mengajukan proposal ke pos kebutuhan ini.',
            ]);
        }

        $jarakKm = $this->calculateJarak(
            $data['latitude'],
            $data['longitude'],
            $pos->desa->latitude,
            $pos->desa->longitude
        );

        $matchingScore = $this->calculateMatchingScore($kelompok, $pos);
        $filePath = $fileProposal->store('proposal', 'local');
        $suratPath = $suratPengantar ? $suratPengantar->store('surat-pengantar', 'local') : null;

        $proposal = DB::transaction(function () use ($kelompok, $pos, $data, $jarakKm, $matchingScore, $filePath, $suratPath) {
            $proposal = Proposal::create([
                'kelompok_id' => $kelompok->id,
                'pos_kebutuhan_id' => $pos->id,
                'draf_proker' => $data['draf_proker'],
                'file_proposal_url' => $filePath,
                'surat_pengantar_url' => $suratPath,
                'status' => 'menunggu',
                'matching_score' => $matchingScore,
                'jarak_km' => $jarakKm,
                'submitted_at' => now(),
            ]);

            if ($jarakKm > self::RADIUS_THRESHOLD_KM) {
                $proposal->suratIzinOrtu()->create(['required' => true]);
            }

            return $proposal;
        });

        if ($pos->desa && $pos->desa->user_id) {
            $this->notificationService->send(
                $pos->desa->user_id,
                "Proposal baru diajukan oleh kelompok '{$kelompok->nama_kelompok}' untuk pos kebutuhan '{$pos->judul}'."
            );
        }

        return $proposal;
    }

    public function decideByDesa(Proposal $proposal, User $user, array $data): Proposal
    {
        if ($proposal->posKebutuhan->desa_id !== $user->profilDesa->id) {
            abort(403, 'Proposal ini bukan ditujukan ke desa Anda');
        }

        if ($data['action'] === 'reject') {
            $proposal->update([
                'status' => 'ditolak',
                'catatan_desa' => $data['catatan_desa'],
            ]);

            if ($proposal->kelompok && $proposal->kelompok->ketua_id) {
                $this->notificationService->send(
                    $proposal->kelompok->ketua_id,
                    "Proposal kelompok Anda untuk pos kebutuhan '{$proposal->posKebutuhan->judul}' telah ditolak oleh pihak desa."
                );
            }

            return $proposal;
        }

        $kuotaTerpakai = Proposal::where('pos_kebutuhan_id', $proposal->pos_kebutuhan_id)
            ->where('status', 'diterima')
            ->count();

        if ($kuotaTerpakai >= $proposal->posKebutuhan->kuota_kelompok) {
            throw ValidationException::withMessages([
                'kuota' => 'Kuota pos kebutuhan ini sudah penuh, tidak bisa approve proposal lagi.',
            ]);
        }

        $proposal->update([
            'status' => 'diterima',
            'catatan_desa' => $data['catatan_desa'] ?? null,
        ]);

        if ($proposal->posKebutuhan->status === 'open') {
            $proposal->posKebutuhan->update(['status' => 'in_progress']);
        }

        if ($proposal->kelompok && $proposal->kelompok->ketua_id) {
            $this->notificationService->send(
                $proposal->kelompok->ketua_id,
                "Proposal kelompok Anda untuk pos kebutuhan '{$proposal->posKebutuhan->judul}' telah disetujui (diterima) oleh pihak desa."
            );
        }

        return $proposal;
    }
}
