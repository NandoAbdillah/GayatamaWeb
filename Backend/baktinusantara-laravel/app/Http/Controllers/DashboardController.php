<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function metrics(): JsonResponse
    {
        $metrics = $this->dashboardService->getNationalMetrics();

        return response()->json([
            'message' => 'Metrik dampak nasional berhasil dimuat.',
            'data' => $metrics,
        ]);
    }
}