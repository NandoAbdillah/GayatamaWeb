<?php

namespace Tests\Feature;

use App\Models\Aspirasi;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeospatialMapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    private function seedGeospatialSampleData(): array
    {
        // 1. Desa Jombang (Jawa Timur) - Dekat Surabaya (~65 km)
        $userDesa1 = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $desaJombang = ProfilDesa::create([
            'user_id' => $userDesa1->id,
            'nama_desa' => 'Desa Sukamaju',
            'kecamatan' => 'Mojowarno',
            'kabupaten' => 'Kabupaten Jombang',
            'provinsi' => 'Jawa Timur',
            'latitude' => -7.6358,
            'longitude' => 112.2965,
            'sk_file_url' => 'sk/jombang.pdf',
            'verified_at' => now(),
        ]);

        $pos1 = PosKebutuhan::create([
            'desa_id' => $desaJombang->id,
            'judul' => 'Digitalisasi Branding UMKM Kripik',
            'deskripsi' => 'Pengembangan kemasan dan toko online',
            'kategori' => 'umkm',
            'sdg_codes' => [8, 9],
            'kuota_kelompok' => 2,
            'deadline' => now()->addDays(30),
            'jurusan_dibutuhkan' => ['Teknik Informatika' => 1, 'Manajemen' => 1],
            'status' => 'open',
        ]);

        Aspirasi::create([
            'desa_id' => $desaJombang->id,
            'pelapor_nama' => 'Pak Joko',
            'pelapor_wa' => '081234567890',
            'kategori' => 'umkm',
            'deskripsi' => 'Butuh branding kemasan',
            'latitude' => -7.6358,
            'longitude' => 112.2965,
            'urgensi' => 'mendesak',
            'status' => 'menunggu',
        ]);

        // 2. Desa Pasuruan (Jawa Timur) - Jarak sedang (~45 km dari Surabaya)
        $userDesa2 = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $desaPasuruan = ProfilDesa::create([
            'user_id' => $userDesa2->id,
            'nama_desa' => 'Desa Berkah Makmur',
            'kecamatan' => 'Prigen',
            'kabupaten' => 'Kabupaten Pasuruan',
            'provinsi' => 'Jawa Timur',
            'latitude' => -7.6931,
            'longitude' => 112.6312,
            'sk_file_url' => 'sk/pasuruan.pdf',
            'verified_at' => now(),
        ]);

        $pos2 = PosKebutuhan::create([
            'desa_id' => $desaPasuruan->id,
            'judul' => 'Pengolahan Biogas Kotoran Sapi',
            'deskripsi' => 'Instalasi reaktor biogas ternak',
            'kategori' => 'lingkungan',
            'sdg_codes' => [13, 15],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(40),
            'jurusan_dibutuhkan' => ['Teknik Lingkungan' => 1],
            'status' => 'open',
        ]);

        // 3. Desa Raja Ampat (Papua Barat Daya) - Jarak jauh (~2200 km dari Surabaya)
        $userDesa3 = User::factory()->create(['role' => 'perangkat_desa', 'is_verified' => true]);
        $desaRajaAmpat = ProfilDesa::create([
            'user_id' => $userDesa3->id,
            'nama_desa' => 'Desa Wisata Arborek',
            'kecamatan' => 'Meos Mansar',
            'kabupaten' => 'Kabupaten Raja Ampat',
            'provinsi' => 'Papua Barat Daya',
            'latitude' => -0.5647,
            'longitude' => 130.5186,
            'sk_file_url' => 'sk/papua.pdf',
            'verified_at' => now(),
        ]);

        $pos3 = PosKebutuhan::create([
            'desa_id' => $desaRajaAmpat->id,
            'judul' => 'Ekowisata Bahari dan Konservasi Terumbu Karang',
            'deskripsi' => 'Pengembangan ekowisata berkelanjutan',
            'kategori' => 'lingkungan',
            'sdg_codes' => [14, 17],
            'kuota_kelompok' => 1,
            'deadline' => now()->addDays(60),
            'jurusan_dibutuhkan' => ['Ilmu Kelautan' => 1],
            'status' => 'open',
        ]);

        return compact('desaJombang', 'desaPasuruan', 'desaRajaAmpat', 'pos1', 'pos2', 'pos3');
    }

    public function test_public_can_fetch_interactive_map_data_pins(): void
    {
        $this->seedGeospatialSampleData();

        $response = $this->getJson('/api/geospatial/map-data');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_desa_mitra',
                'pins' => [
                    '*' => [
                        'desa_id',
                        'nama_desa',
                        'kecamatan',
                        'kabupaten',
                        'provinsi',
                        'latitude',
                        'longitude',
                        'total_pos_aktif',
                        'total_kelompok_kkn',
                        'sdgs_fokus',
                        'kategori_pos',
                        'aspirasi_urgensi_tertinggi',
                        'pos_kebutuhan',
                    ]
                ]
            ]);

        $this->assertEquals(3, $response->json('total_desa_mitra'));

        // Test filter provinsi
        $responseJatim = $this->getJson('/api/geospatial/map-data?provinsi=Jawa Timur');
        $responseJatim->assertStatus(200);
        $this->assertEquals(2, $responseJatim->json('total_desa_mitra'));
    }

    public function test_nearby_pos_calculates_accurate_haversine_distance_and_orders_by_proximity(): void
    {
        $this->seedGeospatialSampleData();

        // Titik Koordinat Kampus UNESA Lidah Wetan Surabaya
        $unesaLat = -7.3117;
        $unesaLon = 112.7275;

        $response = $this->getJson("/api/geospatial/nearby-pos?lat={$unesaLat}&lon={$unesaLon}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'origin' => ['latitude', 'longitude'],
                'total_found',
                'results' => [
                    '*' => [
                        'pos_id',
                        'judul',
                        'kategori',
                        'sdg_codes',
                        'kuota_kelompok',
                        'sisa_kuota',
                        'desa',
                        'jarak_km',
                        'requires_surat_izin_ortu',
                        'travel_estimate',
                    ]
                ]
            ]);

        $results = $response->json('results');
        $this->assertCount(3, $results);

        // Pos 1 (Pasuruan / Prigen ~43 km) harus lebih dekat dari Pos 2 (Jombang ~63 km)
        $this->assertTrue($results[0]['jarak_km'] < $results[1]['jarak_km']);
        $this->assertTrue($results[1]['jarak_km'] < $results[2]['jarak_km']);

        // Pos terdekat tidak butuh surat izin ortu
        $this->assertFalse($results[0]['requires_surat_izin_ortu']);
    }

    public function test_nearby_pos_filters_by_radius_category_and_sdg(): void
    {
        $this->seedGeospatialSampleData();

        $unesaLat = -7.3117;
        $unesaLon = 112.7275;

        // 1. Filter Radius 50 km (Hanya menjangkau Pasuruan, Jombang ~63km dan Papua terfilter)
        $responseRadius = $this->getJson("/api/geospatial/nearby-pos?lat={$unesaLat}&lon={$unesaLon}&radius_km=50");
        $responseRadius->assertStatus(200);
        $this->assertEquals(1, $responseRadius->json('total_found'));
        $this->assertEquals('Desa Berkah Makmur', $responseRadius->json('results.0.desa.nama_desa'));

        // 2. Filter Kategori 'umkm'
        $responseKategori = $this->getJson("/api/geospatial/nearby-pos?lat={$unesaLat}&lon={$unesaLon}&kategori=umkm");
        $responseKategori->assertStatus(200);
        $this->assertEquals(1, $responseKategori->json('total_found'));
        $this->assertEquals('Digitalisasi Branding UMKM Kripik', $responseKategori->json('results.0.judul'));

        // 3. Filter SDG Code 14 (Konservasi Laut - Hanya Raja Ampat)
        $responseSdg = $this->getJson("/api/geospatial/nearby-pos?lat={$unesaLat}&lon={$unesaLon}&sdg=14");
        $responseSdg->assertStatus(200);
        $this->assertEquals(1, $responseSdg->json('total_found'));
        $this->assertEquals('Desa Wisata Arborek', $responseSdg->json('results.0.desa.nama_desa'));
    }

    public function test_nearby_pos_marks_surat_izin_ortu_for_long_distance(): void
    {
        $this->seedGeospatialSampleData();

        $unesaLat = -7.3117;
        $unesaLon = 112.7275;

        $response = $this->getJson("/api/geospatial/nearby-pos?lat={$unesaLat}&lon={$unesaLon}");
        $results = $response->json('results');

        // Cari hasil Desa Raja Ampat
        $rajaAmpatResult = collect($results)->firstWhere('desa.nama_desa', 'Desa Wisata Arborek');

        $this->assertNotNull($rajaAmpatResult);
        $this->assertTrue($rajaAmpatResult['jarak_km'] > 1000);
        $this->assertTrue($rajaAmpatResult['requires_surat_izin_ortu']);
        $this->assertStringContainsString('Lintas Provinsi/Pulau', $rajaAmpatResult['travel_estimate']);
    }

    public function test_province_summary_aggregates_regional_data(): void
    {
        $this->seedGeospatialSampleData();

        $response = $this->getJson('/api/geospatial/province-summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_provinces',
                'provinces' => [
                    '*' => [
                        'provinsi',
                        'total_desa_mitra',
                        'total_pos_kebutuhan',
                        'total_kelompok_bertugas',
                        'sdg_counts',
                        'center_coordinate',
                    ]
                ]
            ]);

        $this->assertEquals(2, $response->json('total_provinces')); // Jawa Timur & Papua Barat Daya
    }

    public function test_calculate_distance_endpoint_validates_inputs_and_returns_haversine(): void
    {
        // Surabaya (UNESA) ke Monas Jakarta (~660 km)
        $payload = [
            'lat1' => -7.3117,
            'lon1' => 112.7275,
            'lat2' => -6.1754,
            'lon2' => 106.8272,
        ];

        $response = $this->postJson('/api/geospatial/calculate-distance', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'origin',
                'destination',
                'distance_km',
                'requires_surat_izin_ortu',
                'travel_estimate',
            ]);

        $distance = $response->json('distance_km');
        $this->assertGreaterThan(650, $distance);
        $this->assertLessThan(670, $distance);
        $this->assertFalse($response->json('requires_surat_izin_ortu')); // 660 km <= 1000 km
    }
}
