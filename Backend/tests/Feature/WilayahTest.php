<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WilayahTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_can_get_provinsi_list_with_caching()
    {
        $mockProvinces = [
            ['id' => '35', 'name' => 'JAWA TIMUR'],
            ['id' => '33', 'name' => 'JAWA TENGAH'],
            ['id' => '32', 'name' => 'JAWA BARAT'],
        ];

        Http::fake([
            'https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json' => Http::response($mockProvinces, 200),
        ]);

        // First request: hits mock HTTP
        $res = $this->getJson('/api/wilayah/provinsi');
        $res->assertStatus(200)
            ->assertJson($mockProvinces);

        // Verify cached
        $this->assertTrue(Cache::has('wilayah:provinces.json'));

        // Second request: served from cache without extra HTTP call
        $res2 = $this->getJson('/api/wilayah/provinsi');
        $res2->assertStatus(200)
            ->assertJson($mockProvinces);

        Http::assertSentCount(1);
    }

    public function test_can_get_kabupaten_by_province_id()
    {
        $mockRegencies = [
            ['id' => '3578', 'province_id' => '35', 'name' => 'KOTA SURABAYA'],
            ['id' => '3515', 'province_id' => '35', 'name' => 'KABUPATEN SIDOARJO'],
        ];

        Http::fake([
            'https://emsifa.github.io/api-wilayah-indonesia/api/regencies/35.json' => Http::response($mockRegencies, 200),
        ]);

        $res = $this->getJson('/api/wilayah/kabupaten/35');
        $res->assertStatus(200)
            ->assertJson($mockRegencies);

        $this->assertTrue(Cache::has('wilayah:regencies:35.json'));
    }

    public function test_can_get_kecamatan_by_regency_id()
    {
        $mockDistricts = [
            ['id' => '357801', 'regency_id' => '3578', 'name' => 'GENTENG'],
            ['id' => '357802', 'regency_id' => '3578', 'name' => 'TEGALSARI'],
        ];

        Http::fake([
            'https://emsifa.github.io/api-wilayah-indonesia/api/districts/3578.json' => Http::response($mockDistricts, 200),
        ]);

        $res = $this->getJson('/api/wilayah/kecamatan/3578');
        $res->assertStatus(200)
            ->assertJson($mockDistricts);

        $this->assertTrue(Cache::has('wilayah:districts:3578.json'));
    }

    public function test_can_get_desa_by_district_id()
    {
        $mockVillages = [
            ['id' => '3578011001', 'district_id' => '357801', 'name' => 'EMBONG KALIASIN'],
            ['id' => '3578011002', 'district_id' => '357801', 'name' => 'KETABANG'],
        ];

        Http::fake([
            'https://emsifa.github.io/api-wilayah-indonesia/api/villages/357801.json' => Http::response($mockVillages, 200),
        ]);

        $res = $this->getJson('/api/wilayah/desa/357801');
        $res->assertStatus(200)
            ->assertJson($mockVillages);

        $this->assertTrue(Cache::has('wilayah:villages:357801.json'));
    }

    public function test_graceful_fallback_when_upstream_api_fails()
    {
        Http::fake([
            'https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json' => Http::response(null, 500),
        ]);

        $res = $this->getJson('/api/wilayah/provinsi');
        $res->assertStatus(200)
            ->assertJson([]);
    }
}