<?php

namespace App\Services;

use App\Models\AnggotaKelompok;
use App\Models\Kelompok;
use App\Models\LuaranAkhir;
use App\Models\PortofolioPublik;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProgressMingguan;
use App\Models\Proposal;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Calculate and return national aggregated impact metrics.
     */
    public function getNationalMetrics(): array
    {
        // 1. Total Desa Terbantu (desa dengan pos kebutuhan aktif / selesai / luaran terverifikasi)
        $desaFromPos = PosKebutuhan::whereIn('status', ['in_progress', 'completed'])
            ->orWhereHas('proposal', function ($q) {
                $q->where('status', 'diterima');
            })
            ->pluck('desa_id');

        $desaFromLuaran = LuaranAkhir::where('luaran_akhir.status_verifikasi', 'verified')
            ->join('proposal', 'luaran_akhir.proposal_id', '=', 'proposal.id')
            ->join('pos_kebutuhan', 'proposal.pos_kebutuhan_id', '=', 'pos_kebutuhan.id')
            ->pluck('pos_kebutuhan.desa_id');

        $totalDesaTerbantu = $desaFromPos->merge($desaFromLuaran)->unique()->filter()->count();

        // 2. Total UMKM Terdigitalisasi (pos kategori UMKM yang sedang berjalan / selesai / luaran terverifikasi)
        $totalUmkmTerdigitalisasi = PosKebutuhan::whereRaw('LOWER(kategori) = ?', ['umkm'])
            ->where(function ($query) {
                $query->whereIn('status', ['in_progress', 'completed'])
                    ->orWhereHas('proposal', function ($q) {
                        $q->where('status', 'diterima');
                    });
            })
            ->count();

        // 3. Kelompok KKN & Mahasiswa Terlibat
        $totalKelompokKkn = Kelompok::count();
        $totalMahasiswaTerlibat = AnggotaKelompok::distinct('user_id')->count('user_id');

        // 4. Estimasi Total Jam Pengabdian
        // Standard KKN: 1 minggu laporan progress = ~40 jam pengabdian per mahasiswa dalam kelompok
        $progressReports = ProgressMingguan::with('proposal.kelompok.anggota')->get();
        $totalJamPengabdian = (int) $progressReports->sum(function ($p) {
            $anggotaCount = $p->proposal?->kelompok?->anggota?->count() ?: 1;
            return $anggotaCount * 40;
        });

        // 5. Total Pos Kebutuhan & Status Breakdown
        $totalPosKebutuhan = PosKebutuhan::count();
        $posKebutuhanBreakdown = [
            'open' => PosKebutuhan::where('status', 'open')->count(),
            'in_progress' => PosKebutuhan::where('status', 'in_progress')->count(),
            'completed' => PosKebutuhan::where('status', 'completed')->count(),
        ];

        // 6. Luaran & Portofolio
        $totalLuaranTerverifikasi = LuaranAkhir::where('status_verifikasi', 'verified')->count();
        $totalPortofolioPublik = PortofolioPublik::count();

        // 7. Kategori Breakdown
        $kategoriBreakdown = PosKebutuhan::select('kategori', DB::raw('count(*) as total'))
            ->groupBy('kategori')
            ->pluck('total', 'kategori')
            ->toArray();

        // 8. SDGs Distribution
        $allSdgs = PosKebutuhan::whereNotNull('sdg_codes')->pluck('sdg_codes');
        $sdgsDistribution = [];
        foreach ($allSdgs as $sdgList) {
            if (is_array($sdgList)) {
                foreach ($sdgList as $code) {
                    $key = is_numeric($code) ? 'SDG ' . $code : (string) $code;
                    $sdgsDistribution[$key] = ($sdgsDistribution[$key] ?? 0) + 1;
                }
            }
        }
        ksort($sdgsDistribution);

        return [
            'total_desa_terbantu' => $totalDesaTerbantu,
            'total_umkm_terdigitalisasi' => $totalUmkmTerdigitalisasi,
            'total_kelompok_kkn' => $totalKelompokKkn,
            'total_mahasiswa_terlibat' => $totalMahasiswaTerlibat,
            'total_jam_pengabdian' => $totalJamPengabdian,
            'total_pos_kebutuhan' => $totalPosKebutuhan,
            'status_pos_breakdown' => $posKebutuhanBreakdown,
            'total_luaran_terverifikasi' => $totalLuaranTerverifikasi,
            'total_portofolio_publik' => $totalPortofolioPublik,
            'kategori_breakdown' => $kategoriBreakdown,
            'sdgs_distribution' => $sdgsDistribution,
        ];
    }
}