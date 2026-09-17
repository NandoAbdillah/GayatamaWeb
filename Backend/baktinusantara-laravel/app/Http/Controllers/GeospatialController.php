<?php

namespace App\Http\Controllers;

use App\Services\GeospatialService;
use Illuminate\Http\Request;

class GeospatialController extends Controller
{
    public function __construct(
        protected GeospatialService $geospatialService
    ) {}

    public function mapData(Request $request)
    {
        $request->validate([
            'provinsi' => 'nullable|string|max:100',
            'kategori' => 'nullable|string|in:umkm,kesehatan,lingkungan,pendidikan,fasilitas',
            'sdg' => 'nullable|integer|between:1,17',
        ]);

        $pins = $this->geospatialService->getMapPins(
            $request->query('provinsi'),
            $request->query('kategori'),
            $request->filled('sdg') ? (int) $request->query('sdg') : null
        );

        return response()->json($pins);
    }

    public function nearbyPos(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lon' => 'required|numeric|between:-180,180',
            'radius_km' => 'nullable|numeric|min:0.1',
            'kategori' => 'nullable|string|in:umkm,kesehatan,lingkungan,pendidikan,fasilitas',
            'sdg' => 'nullable|integer|between:1,17',
            'jurusan' => 'nullable|string|max:100',
        ]);

        $lat = (float) $request->input('lat');
        $lon = (float) $request->input('lon');
        $radiusKm = $request->filled('radius_km') ? (float) $request->input('radius_km') : null;
        $kategori = $request->input('kategori');
        $sdg = $request->filled('sdg') ? (int) $request->input('sdg') : null;
        $jurusan = $request->input('jurusan');

        $result = $this->geospatialService->getNearbyPositions(
            $lat,
            $lon,
            $radiusKm,
            $kategori,
            $sdg,
            $jurusan
        );

        return response()->json($result);
    }

    public function provinceSummary()
    {
        $summary = $this->geospatialService->getProvinceSummary();
        return response()->json($summary);
    }

    public function calculateDistance(Request $request)
    {
        $request->validate([
            'lat1' => 'required|numeric|between:-90,90',
            'lon1' => 'required|numeric|between:-180,180',
            'lat2' => 'required|numeric|between:-90,90',
            'lon2' => 'required|numeric|between:-180,180',
        ]);

        $lat1 = (float) $request->input('lat1');
        $lon1 = (float) $request->input('lon1');
        $lat2 = (float) $request->input('lat2');
        $lon2 = (float) $request->input('lon2');

        $distance = $this->geospatialService->calculateHaversineDistance($lat1, $lon1, $lat2, $lon2);

        return response()->json([
            'origin' => ['latitude' => $lat1, 'longitude' => $lon1],
            'destination' => ['latitude' => $lat2, 'longitude' => $lon2],
            'distance_km' => $distance,
            'requires_surat_izin_ortu' => $this->geospatialService->isSuratIzinOrtuRequired($distance),
            'travel_estimate' => $this->geospatialService->estimateTravelTime($distance),
        ]);
    }
}
