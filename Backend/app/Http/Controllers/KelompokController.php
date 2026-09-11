<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKelompokRequest;
use App\Http\Requests\JoinKelompokRequest;
use App\Models\Kelompok;
use App\Services\KelompokService;

class KelompokController extends Controller
{
    public function __construct(protected KelompokService $kelompokService) {}

    public function store(StoreKelompokRequest $request)
    {
        $kelompok = $this->kelompokService->create($request->user(), $request->validated());
        return response()->json(['message' => 'Kelompok berhasil dibuat', 'data' => $kelompok], 201);
    }

    public function join(JoinKelompokRequest $request, Kelompok $kelompok)
    {
        $this->kelompokService->join($request->user(), $kelompok, $request->jurusan_kontribusi);
        return response()->json(['message' => 'Berhasil bergabung ke kelompok']);
    }

    public function show(Kelompok $kelompok)
    {
        return response()->json($kelompok->load('anggota.user', 'ketua', 'dosen'));
    }
}