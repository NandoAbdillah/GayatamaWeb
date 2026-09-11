<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreAspirasiRequest;
use App\Http\Requests\VerifyAspirasiRequest;
use App\Models\Aspirasi;
use App\Services\AspirasiService;

class AspirasiController extends Controller
{
    public function __construct(protected AspirasiService $aspirasiService) {}

    public function store(StoreAspirasiRequest $request)
    {
        $aspirasi = $this->aspirasiService->create(
            $request->validated(),
            $request->file('foto')
        );

        return response()->json([
            'message' => 'Aspirasi berhasil diajukan',
            'nomor_tiket' => $aspirasi->id,
            'data' => $aspirasi,
        ], 201);
    }

    public function show(int $ticket)
    {
        $aspirasi = $this->aspirasiService->findByTicket($ticket);

        if (!$aspirasi) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        return response()->json($aspirasi);
    }

    public function indexByDesa(Request $request)
    {
        $desaId = $request->user()->profilDesa->id;
        return response()->json($this->aspirasiService->getByDesa($desaId));
    }

    public function decide(VerifyAspirasiRequest $request, Aspirasi $aspirasi)
    {
        // scope check: pastikan aspirasi ini milik desa yang login
        if ($aspirasi->desa_id !== $request->user()->profilDesa->id) {
            abort(403, 'Aspirasi ini bukan milik desa Anda');
        }

        $aspirasi = $this->aspirasiService->decide($aspirasi, $request->user(), $request->validated());

        return response()->json([
            'message' => $request->action === 'approve' ? 'Aspirasi diverifikasi & pos kebutuhan diterbitkan' : 'Aspirasi ditolak',
            'data' => $aspirasi,
        ]);
    }
}
