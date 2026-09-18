<?php
        
namespace App\Http\Controllers;

use App\Http\Requests\StoreProposalRequest;
use App\Http\Requests\DecideProposalRequest;
use App\Models\Kelompok;
use App\Models\Proposal;
use App\Services\ProposalService;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;

class ProposalController extends Controller
{
    public function __construct(protected ProposalService $proposalService) {}

    public function store(StoreProposalRequest $request)
    {
        $proposal = $this->proposalService->create(
            $request->user(),
            $request->validated(),
            $request->file('file_proposal'),
            $request->file('surat_pengantar')
        );

        return response()->json([
            'message' => 'Proposal berhasil diajukan',
            'data' => $proposal,
        ], 201);
    }

    public function myProposals(Request $request)
    {
        $kelompok = Kelompok::where('ketua_id', $request->user()->id)->first();

        if (!$kelompok) {
            return response()->json([]);
        }

        return response()->json($kelompok->proposal()->with('posKebutuhan')->get());
    }

    public function indexByDesa(Request $request)
    {
        $desaId = $request->user()->profilDesa->id;

        $proposals = Proposal::whereHas('posKebutuhan', fn($q) => $q->where('desa_id', $desaId))
            ->with('kelompok.anggota', 'posKebutuhan')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($proposals);
    }

    public function decide(DecideProposalRequest $request, Proposal $proposal)
    {
        $proposal = $this->proposalService->decideByDesa($proposal, $request->user(), $request->validated());

        return response()->json([
            'message' => $request->validated()['action'] === 'approve' ? 'Proposal diterima' : 'Proposal ditolak',
            'data' => $proposal,
        ]);
    }

    public function downloadFile(Proposal $proposal, Request $request)
    {
        $proposal->load('kelompok.anggota', 'posKebutuhan');
        $user = $request->user();

        $isMember = $proposal->kelompok && (
            $proposal->kelompok->ketua_id === $user->id ||
            $proposal->kelompok->anggota()->where('user_id', $user->id)->exists()
        );
        $isDesa = $user->profilDesa && $proposal->posKebutuhan && $proposal->posKebutuhan->desa_id === $user->profilDesa->id;
        $isDosen = $user->profilDosen && $proposal->kelompok && $proposal->kelompok->dosen_id === $user->profilDosen->id;
        $isAdmin = $user->role === 'admin';
        $isUniv = $user->role === 'universitas';

        if (!$isMember && !$isDesa && !$isDosen && !$isAdmin && !$isUniv) {
            abort(403, 'Anda tidak memiliki akses ke berkas proposal ini.');
        }

        $path = $proposal->file_proposal_url;
        if (!$path) {
            abort(404, 'Berkas proposal belum diunggah.');
        }

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        abort(404, 'Berkas fisik proposal tidak ditemukan.');
    }

    public function downloadSuratOrtu(Proposal $proposal, Request $request)
    {
        $proposal->load('kelompok.anggota', 'posKebutuhan', 'suratIzinOrtu');
        $user = $request->user();

        $isMember = $proposal->kelompok && (
            $proposal->kelompok->ketua_id === $user->id ||
            $proposal->kelompok->anggota()->where('user_id', $user->id)->exists()
        );
        $isDesa = $user->profilDesa && $proposal->posKebutuhan && $proposal->posKebutuhan->desa_id === $user->profilDesa->id;
        $isDosen = $user->profilDosen && $proposal->kelompok && $proposal->kelompok->dosen_id === $user->profilDosen->id;
        $isAdmin = $user->role === 'admin';
        $isUniv = $user->role === 'universitas';

        if (!$isMember && !$isDesa && !$isDosen && !$isAdmin && !$isUniv) {
            abort(403, 'Anda tidak memiliki akses ke berkas surat izin ini.');
        }

        $path = $proposal->suratIzinOrtu?->file_url;
        if (!$path) {
            abort(404, 'Berkas surat izin orang tua belum diunggah.');
        }

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        abort(404, 'Berkas fisik surat izin tidak ditemukan.');
    }
}