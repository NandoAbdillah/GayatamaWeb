<?php

namespace App\Http\Controllers;

use App\Services\WilayahService;
use Illuminate\Http\JsonResponse;

class WilayahController extends Controller
{
    public function __construct(
        protected WilayahService $wilayahService
    ) {}

    public function provinsi(): JsonResponse
    {
        return response()->json($this->wilayahService->getProvinsi());
    }

    public function kabupaten(string $provinceId): JsonResponse
    {
        return response()->json($this->wilayahService->getKabupaten($provinceId));
    }

    public function kecamatan(string $regencyId): JsonResponse
    {
        return response()->json($this->wilayahService->getKecamatan($regencyId));
    }

    public function desa(string $districtId): JsonResponse
    {
        return response()->json($this->wilayahService->getDesa($districtId));
    }
}