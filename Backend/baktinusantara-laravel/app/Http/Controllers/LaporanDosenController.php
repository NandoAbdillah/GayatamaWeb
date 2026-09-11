<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLaporanDosenRequest;
use App\Services\LaporanDosenService;

class LaporanDosenController extends Controller
{
    public function __construct(protected LaporanDosenService $laporanDosenService) {}

    public function store(StoreLaporanDosenRequest $request)
    {
        $laporan = $this->laporanDosenService->storeByDesa(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Laporan kinerja dosen berhasil dikirim ke pihak universitas',
            'data' => $laporan,
        ], 201);
    }
}
