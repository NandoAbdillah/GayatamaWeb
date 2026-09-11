<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WilayahService
{
    protected const BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';
    protected const CACHE_TTL_DAYS = 30;

    protected function fetch(string $endpoint): array
    {
        $cacheKey = 'wilayah:' . str_replace('/', ':', $endpoint);

        return Cache::remember($cacheKey, now()->addDays(self::CACHE_TTL_DAYS), function () use ($endpoint) {
            try {
                $response = Http::timeout(5)->get(self::BASE_URL . '/' . $endpoint);

                if (!$response->successful()) {
                    return [];
                }

                return $response->json() ?? [];
            } catch (\Throwable $e) {
                return [];
            }
        });
    }

    public function getProvinsi(): array
    {
        return $this->fetch('provinces.json');
    }

    public function getKabupaten(string $provinceId): array
    {
        return $this->fetch("regencies/{$provinceId}.json");
    }

    public function getKecamatan(string $regencyId): array
    {
        return $this->fetch("districts/{$regencyId}.json");
    }

    public function getDesa(string $districtId): array
    {
        return $this->fetch("villages/{$districtId}.json");
    }
}