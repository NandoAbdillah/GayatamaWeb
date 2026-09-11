<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublishPosKebutuhanRequest;
use App\Models\PosKebutuhan;
use App\Services\PosKebutuhanService;
use Illuminate\Http\Request;

class PosKebutuhanController extends Controller
{
    public function __construct(protected PosKebutuhanService $posKebutuhanService) {}

    public function index(Request $request)
    {
        $kategori = $request->query('kategori');
        $lat = $request->filled('lat') ? (float) $request->query('lat') : null;
        $lon = $request->filled('lon') ? (float) $request->query('lon') : null;
        $radiusKm = $request->filled('radius_km') ? (float) $request->query('radius_km') : null;

        $posKebutuhan = $this->posKebutuhanService->getPublicCatalog($kategori, $lat, $lon, $radiusKm);

        return response()->json($posKebutuhan);
    }

    public function show(PosKebutuhan $posKebutuhan)
    {
        return response()->json($posKebutuhan->load('desa.user'));
    }

    public function indexByDesa(Request $request)
    {
        $desaId = $request->user()->profilDesa->id;
        return response()->json($this->posKebutuhanService->getByDesa($desaId));
    }

    public function store(PublishPosKebutuhanRequest $request)
    {
        $pos = $this->posKebutuhanService->createDirect($request->user(), $request->validated());

        return response()->json([
            'message' => 'Pos kebutuhan berhasil dipublikasikan',
            'data' => $pos,
        ], 201);
    }
}