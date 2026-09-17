<?php

namespace App\Services;

use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;

class GeospatialService
{
    public const EARTH_RADIUS_KM = 6371;
    public const SURAT_IZIN_THRESHOLD_KM = 1000;

    public function calculateHaversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2 +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(max(0, 1 - $a)));

        return round(self::EARTH_RADIUS_KM * $c, 2);
    }

    public function isSuratIzinOrtuRequired(float $jarakKm): bool
    {
        return $jarakKm > self::SURAT_IZIN_THRESHOLD_KM;
    }

    public function estimateTravelTime(float $jarakKm): string
    {
        if ($jarakKm <= 20) {
            return "± " . max(10, round($jarakKm * 2)) . " menit (Darat/Motor)";
        } elseif ($jarakKm <= 100) {
            $hours = round($jarakKm / 40, 1);
            return "± {$hours} jam (Darat/Mobil)";
        } elseif ($jarakKm <= 500) {
            $hours = round($jarakKm / 60, 1);
            return "± {$hours} jam (Darat/Kereta/Bus)";
        }

        return "Lintas Provinsi/Pulau (Transportasi Udara/Laut)";
    }

    public function getMapPins(?string $provinsi = null, ?string $kategori = null, ?int $sdg = null): array
    {
        $desaQuery = ProfilDesa::whereNotNull('verified_at')
            ->with([
                'posKebutuhan' => function ($q) {
                    $q->whereIn('status', ['open', 'in_progress'])
                        ->with(['proposal' => fn($pq) => $pq->where('status', 'diterima')]);
                },
                'aspirasi' => function ($q) {
                    $q->select('id', 'desa_id', 'urgensi', 'status', 'kategori');
                }
            ]);

        if ($provinsi) {
            $desaQuery->where('provinsi', 'like', "%{$provinsi}%");
        }

        $desaList = $desaQuery->get();
        $pins = [];

        foreach ($desaList as $desa) {
            $posList = $desa->posKebutuhan;

            if ($kategori) {
                $posList = $posList->filter(fn($p) => $p->kategori === $kategori);
            }

            if ($sdg) {
                $posList = $posList->filter(function ($p) use ($sdg) {
                    $codes = is_array($p->sdg_codes) ? $p->sdg_codes : [];
                    return in_array($sdg, $codes) || in_array((string)$sdg, $codes);
                });
            }

            if (($kategori || $sdg) && $posList->isEmpty()) {
                continue;
            }

            $sdgCodes = [];
            $kategoriList = [];
            $totalActiveProposals = 0;

            foreach ($desa->posKebutuhan as $p) {
                if (is_array($p->sdg_codes)) {
                    foreach ($p->sdg_codes as $code) {
                        $sdgCodes[] = (int) $code;
                    }
                }
                if ($p->kategori) {
                    $kategoriList[] = $p->kategori;
                }
                $totalActiveProposals += $p->proposal->count();
            }

            $sdgCodes = array_values(array_unique($sdgCodes));
            sort($sdgCodes);
            $kategoriList = array_values(array_unique($kategoriList));

            $urgensiLevel = 'rendah';
            $urgensiList = $desa->aspirasi->pluck('urgensi')->toArray();
            if (in_array('mendesak', $urgensiList)) {
                $urgensiLevel = 'mendesak';
            } elseif (in_array('sedang', $urgensiList)) {
                $urgensiLevel = 'sedang';
            }

            $posSummaries = $posList->map(function ($p) {
                return [
                    'id' => $p->id,
                    'judul' => $p->judul,
                    'kategori' => $p->kategori,
                    'sdg_codes' => $p->sdg_codes,
                    'kuota_kelompok' => $p->kuota_kelompok,
                    'kuota_terisi' => $p->proposal->count(),
                    'deadline' => $p->deadline,
                    'status' => $p->status,
                ];
            })->values()->toArray();

            $pins[] = [
                'desa_id' => $desa->id,
                'nama_desa' => $desa->nama_desa,
                'kecamatan' => $desa->kecamatan,
                'kabupaten' => $desa->kabupaten,
                'provinsi' => $desa->provinsi,
                'latitude' => (float) $desa->latitude,
                'longitude' => (float) $desa->longitude,
                'kontak_resmi' => $desa->kontak_resmi,
                'total_pos_aktif' => $posList->count(),
                'total_kelompok_kkn' => $totalActiveProposals,
                'sdgs_fokus' => $sdgCodes,
                'kategori_pos' => $kategoriList,
                'aspirasi_urgensi_tertinggi' => $urgensiLevel,
                'pos_kebutuhan' => $posSummaries,
            ];
        }

        return [
            'total_desa_mitra' => count($pins),
            'pins' => $pins,
        ];
    }

    public function getNearbyPositions(
        float $originLat,
        float $originLon,
        ?float $radiusKm = null,
        ?string $kategori = null,
        ?int $sdg = null,
        ?string $jurusan = null
    ): array {
        $posQuery = PosKebutuhan::where('status', 'open')
            ->with(['desa', 'proposal' => fn($q) => $q->where('status', 'diterima')]);

        if ($kategori) {
            $posQuery->where('kategori', $kategori);
        }

        $allPos = $posQuery->get();
        $nearbyList = [];

        foreach ($allPos as $pos) {
            if (!$pos->desa || $pos->desa->latitude === null || $pos->desa->longitude === null) {
                continue;
            }

            if ($sdg) {
                $codes = is_array($pos->sdg_codes) ? $pos->sdg_codes : [];
                if (!in_array($sdg, $codes) && !in_array((string)$sdg, $codes)) {
                    continue;
                }
            }

            if ($jurusan && is_array($pos->jurusan_dibutuhkan)) {
                $requiredMajors = array_keys($pos->jurusan_dibutuhkan);
                $isMatched = false;
                foreach ($requiredMajors as $major) {
                    if (stripos($major, $jurusan) !== false || stripos($jurusan, $major) !== false) {
                        $isMatched = true;
                        break;
                    }
                }
                if (!$isMatched) {
                    continue;
                }
            }

            $desaLat = (float) $pos->desa->latitude;
            $desaLon = (float) $pos->desa->longitude;
            $distanceKm = $this->calculateHaversineDistance($originLat, $originLon, $desaLat, $desaLon);

            if ($radiusKm !== null && $distanceKm > $radiusKm) {
                continue;
            }

            $terisi = $pos->proposal->count();
            $sisaKuota = max(0, $pos->kuota_kelompok - $terisi);

            $nearbyList[] = [
                'pos_id' => $pos->id,
                'judul' => $pos->judul,
                'deskripsi' => $pos->deskripsi,
                'kategori' => $pos->kategori,
                'sdg_codes' => $pos->sdg_codes ?? [],
                'kuota_kelompok' => $pos->kuota_kelompok,
                'kuota_terisi' => $terisi,
                'sisa_kuota' => $sisaKuota,
                'deadline' => $pos->deadline,
                'jurusan_dibutuhkan' => $pos->jurusan_dibutuhkan ?? [],
                'desa' => [
                    'id' => $pos->desa->id,
                    'nama_desa' => $pos->desa->nama_desa,
                    'kecamatan' => $pos->desa->kecamatan,
                    'kabupaten' => $pos->desa->kabupaten,
                    'provinsi' => $pos->desa->provinsi,
                    'latitude' => $desaLat,
                    'longitude' => $desaLon,
                ],
                'jarak_km' => $distanceKm,
                'requires_surat_izin_ortu' => $this->isSuratIzinOrtuRequired($distanceKm),
                'travel_estimate' => $this->estimateTravelTime($distanceKm),
            ];
        }

        usort($nearbyList, fn($a, $b) => $a['jarak_km'] <=> $b['jarak_km']);

        return [
            'origin' => [
                'latitude' => $originLat,
                'longitude' => $originLon,
            ],
            'radius_filter_km' => $radiusKm,
            'total_found' => count($nearbyList),
            'results' => $nearbyList,
        ];
    }

    public function getProvinceSummary(): array
    {
        $desaList = ProfilDesa::whereNotNull('verified_at')
            ->with(['posKebutuhan.proposal' => fn($q) => $q->where('status', 'diterima')])
            ->get();

        $byProvince = [];

        foreach ($desaList as $desa) {
            $prov = $desa->provinsi ?: 'Lainnya';

            if (!isset($byProvince[$prov])) {
                $byProvince[$prov] = [
                    'provinsi' => $prov,
                    'total_desa_mitra' => 0,
                    'total_pos_kebutuhan' => 0,
                    'total_kelompok_bertugas' => 0,
                    'sdg_counts' => [],
                    'center_coordinate' => [
                        'latitude' => (float) $desa->latitude,
                        'longitude' => (float) $desa->longitude,
                    ],
                ];
            }

            $byProvince[$prov]['total_desa_mitra']++;
            $byProvince[$prov]['total_pos_kebutuhan'] += $desa->posKebutuhan->count();

            foreach ($desa->posKebutuhan as $pos) {
                $byProvince[$prov]['total_kelompok_bertugas'] += $pos->proposal->count();

                if (is_array($pos->sdg_codes)) {
                    foreach ($pos->sdg_codes as $code) {
                        $key = 'SDG ' . $code;
                        $byProvince[$prov]['sdg_counts'][$key] = ($byProvince[$prov]['sdg_counts'][$key] ?? 0) + 1;
                    }
                }
            }
        }

        $result = [];
        foreach ($byProvince as $prov => $data) {
            arsort($data['sdg_counts']);
            $result[] = $data;
        }

        usort($result, fn($a, $b) => $b['total_desa_mitra'] <=> $a['total_desa_mitra']);

        return [
            'total_provinces' => count($result),
            'provinces' => $result,
        ];
    }
}
