<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterUniversitasRequest;
use App\Http\Requests\StoreDosenRequest;
use App\Models\LaporanDosen;
use App\Models\ProfilUniversitas;
use App\Services\UniversitasService;
use Illuminate\Http\Request;

class UniversitasController extends Controller
{
    public function __construct(protected UniversitasService $universitasService) {}

    public function index()
    {
        return response()->json($this->universitasService->listVerifiedPublic());
    }

    public function register(RegisterUniversitasRequest $request)
    {
        $univ = $this->universitasService->register($request->validated());

        return response()->json([
            'message' => 'Registrasi universitas berhasil, menunggu verifikasi admin',
            'data' => $univ,
        ], 201);
    }

    public function verify(ProfilUniversitas $profilUniversitas)
    {
        $univ = $this->universitasService->verifyByAdmin($profilUniversitas);

        return response()->json([
            'message' => 'Institusi universitas berhasil diverifikasi',
            'data' => $univ,
        ]);
    }

    public function storeDosen(StoreDosenRequest $request)
    {
        $dosen = $this->universitasService->createDosen(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Dosen pembimbing lapangan berhasil ditambahkan',
            'data' => $dosen,
        ], 201);
    }

    public function listDosen(Request $request)
    {
        return response()->json($this->universitasService->listDosenByUniv($request->user()));
    }

    public function listLaporan(Request $request)
    {
        return response()->json($this->universitasService->listLaporanDosen($request->user()));
    }

    public function updateLaporan(Request $request, LaporanDosen $laporanDosen)
    {
        $request->validate(['status' => 'required|in:menunggu,ditinjau,selesai']);

        $laporan = $this->universitasService->updateStatusLaporan(
            $laporanDosen,
            $request->user(),
            $request->status
        );

        return response()->json([
            'message' => 'Status laporan kinerja dosen berhasil diperbarui',
            'data' => $laporan,
        ]);
    }
}
