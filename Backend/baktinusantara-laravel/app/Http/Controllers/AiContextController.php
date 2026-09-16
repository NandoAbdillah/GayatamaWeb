<?php

namespace App\Http\Controllers;

use App\Services\AiContextService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiContextController extends Controller
{
    protected AiContextService $aiContextService;

    public function __construct(AiContextService $aiContextService)
    {
        $this->aiContextService = $aiContextService;
    }

    /**
     * Endpoint publik konteks global real-time untuk AI Copilot.
     * GET /api/ai/context
     */
    public function globalContext(): JsonResponse
    {
        $data = $this->aiContextService->getGlobalContext();

        return response()->json([
            'success' => true,
            'message' => 'Konteks data global platform BaktiNusantara berhasil dimuat secara real-time',
            'data' => $data,
        ]);
    }

    /**
     * Endpoint personal konteks user terautentikasi (Mahasiswa, Desa, Dosen, Admin).
     * GET /api/ai/user-context
     */
    public function userContext(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $this->aiContextService->getUserContext($user);

        return response()->json([
            'success' => true,
            'message' => 'Konteks profil dan aksi pengguna berhasil dimuat secara real-time',
            'data' => $data,
        ]);
    }

    /**
     * Endpoint rekomendasi pos KKN cerdas berbasis keahlian, jurusan, dan SDGs.
     * POST /api/ai/recommend-pos
     */
    public function recommendPos(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_major' => 'nullable|string|max:255',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:100',
            'kategori' => 'nullable|string|max:100',
            'sdg_target' => 'nullable',
            'kabupaten' => 'nullable|string|max:255',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $data = $this->aiContextService->recommendPositions($validated);

        return response()->json([
            'success' => true,
            'message' => 'Rekomendasi pos kebutuhan KKN berhasil dihitung dan dicocokkan',
            'data' => $data,
        ]);
    }

    /**
     * Endpoint generator draf proposal KKN terstruktur berbasis kebutuhan pos riil.
     * POST /api/ai/draft-proposal
     */
    public function draftProposal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pos_id' => 'required|exists:pos_kebutuhan,id',
            'kelompok_id' => 'nullable|exists:kelompok,id',
            'fokus_utama' => 'nullable|string|max:255',
        ]);

        $data = $this->aiContextService->generateProposalDraft(
            (int) $validated['pos_id'],
            isset($validated['kelompok_id']) ? (int) $validated['kelompok_id'] : null,
            $validated['fokus_utama'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Draf proposal KKN berhasil disusun berbasis data riil desa',
            'data' => $data,
        ]);
    }

    /**
     * Endpoint generator draf logbook kegiatan mingguan mahasiswa.
     * POST /api/ai/draft-logbook
     */
    public function draftLogbook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'minggu_ke' => 'required|integer|min:1|max:12',
            'kegiatan_utama' => 'required|string|max:1000',
            'kendala' => 'nullable|string|max:1000',
            'solusi' => 'nullable|string|max:1000',
            'jam_kerja' => 'nullable|integer|min:1|max:24',
        ]);

        $data = $this->aiContextService->generateLogbookDraft($validated, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Draf catatan logbook berhasil disusun sesuai standar LPPM',
            'data' => $data,
        ]);
    }

    /**
     * Endpoint pencarian profil desa real-time.
     * GET /api/ai/search-desa
     */
    public function searchDesa(Request $request): JsonResponse
    {
        $filters = $request->only(['keyword', 'provinsi', 'kabupaten']);
        $data = $this->aiContextService->searchDesa($filters);

        return response()->json([
            'success' => true,
            'message' => 'Pencarian data desa berhasil diproses secara real-time',
            'data' => $data,
        ]);
    }
}
