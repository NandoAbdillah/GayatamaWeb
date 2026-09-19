<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLuaranRequest;
use App\Http\Requests\VerifyLuaranRequest;
use App\Models\LuaranAkhir;
use App\Models\Proposal;
use App\Services\LuaranService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LuaranController extends Controller
{
    public function __construct(protected LuaranService $luaranService) {}

    public function store(StoreLuaranRequest $request)
    {
        $luaran = $this->luaranService->store(
            $request->user(),
            $request->validated(),
            $request->file('file_deliverable')
        );

        return response()->json([
            'message' => 'Luaran akhir KKN berhasil diunggah',
            'data' => $luaran,
        ], 201);
    }

    public function indexByDesa(Request $request)
    {
        return response()->json($this->luaranService->listByDesa($request->user()));
    }

    public function showByProposal(Proposal $proposal, Request $request)
    {
        $luaran = $this->luaranService->getByProposal($proposal, $request->user());

        return response()->json([
            'message' => 'Data luaran berhasil diambil',
            'data' => $luaran,
        ]);
    }

    public function verify(VerifyLuaranRequest $request, LuaranAkhir $luaran)
    {
        $portofolio = $this->luaranService->verifyByDesa(
            $luaran,
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Luaran akhir berhasil diverifikasi dan portofolio publik telah diterbitkan',
            'data' => $portofolio,
        ]);
    }

    public function downloadFile(LuaranAkhir $luaran, Request $request)
    {
        $luaran->load('proposal.kelompok.anggota', 'proposal.posKebutuhan');
        $user = $request->user();

        $isVerified = $luaran->status_verifikasi === 'verified';
        $isAdmin = $user?->role === 'admin';
        $isDesa = $user?->profilDesa && $luaran->proposal?->posKebutuhan?->desa_id === $user->profilDesa->id;
        $isDosen = $user?->profilDosen && $luaran->proposal?->kelompok?->dosen_id === $user->profilDosen->id;
        $isUniv = $user?->role === 'universitas';
        $isMember = $user && $luaran->proposal?->kelompok && (
            $luaran->proposal->kelompok->ketua_id === $user->id ||
            $luaran->proposal->kelompok->anggota()->where('user_id', $user->id)->exists()
        );

        if (!$isVerified && !$isAdmin && !$isDesa && !$isDosen && !$isUniv && !$isMember) {
            abort(403, 'Anda tidak memiliki akses ke berkas luaran akhir ini.');
        }

        $path = $luaran->file_deliverable_url;
        if (!$path) {
            abort(404, 'Berkas luaran belum diunggah.');
        }

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        $cleanPath = str_replace('/storage/', '', parse_url($path, PHP_URL_PATH) ?? $path);
        $cleanPath = ltrim($cleanPath, '/');
        if (Storage::disk('public')->exists($cleanPath)) {
            return Storage::disk('public')->response($cleanPath);
        }
        if (Storage::disk('local')->exists($cleanPath)) {
            return Storage::disk('local')->response($cleanPath);
        }

        abort(404, 'Berkas fisik luaran tidak ditemukan.');
    }
}
