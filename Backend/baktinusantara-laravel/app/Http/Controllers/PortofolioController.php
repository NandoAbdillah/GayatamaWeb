<?php

namespace App\Http\Controllers;

use App\Services\LuaranService;

class PortofolioController extends Controller
{
    public function __construct(protected LuaranService $luaranService) {}

    public function show(string $slug)
    {
        $portofolio = $this->luaranService->getPublicPortfolio($slug);

        return response()->json([
            'message' => 'E-Portofolio publik berhasil ditemukan',
            'data' => $portofolio,
        ]);
    }
}
