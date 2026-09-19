<?php

namespace App\Http\Controllers;

use App\Models\ProfilDesa;
use App\Models\ProfilUniversitas;
use App\Services\DesaService;
use App\Services\UniversitasService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVerifikasiController extends Controller
{
    public function __construct(
        protected DesaService $desaService,
        protected UniversitasService $universitasService
    ) {}

    /**
     * Get all entities (Universitas and Desa) requiring verification or already verified.
     */
    public function index(): JsonResponse
    {
        // 1. Fetch Universities
        $universitasList = ProfilUniversitas::with(['user', 'dosen'])->get()->map(function ($univ) {
            $isVerified = !is_null($univ->verified_at);
            $createdAt = $univ->created_at ? Carbon::parse($univ->created_at) : Carbon::now();
            $dosenCount = $univ->dosen ? $univ->dosen->count() : 0;
            $namaUniv = $univ->nama_universitas ?: ($univ->user?->name ?: 'Universitas');

            return [
                'id' => (int) $univ->id,
                'entity_type' => 'universitas',
                'nama' => $namaUniv,
                'sub_info' => 'Lembaga Pengabdian Masyarakat & Inovasi (LPPM / LPM)',
                'pemohon' => $univ->user?->name ?: 'Admin LPPM ' . $namaUniv,
                'email' => $univ->user?->email ?: '-',
                'kontak' => $univ->user?->phone_wa ?: '-',
                'dokumen' => $univ->sk_file_url ? basename($univ->sk_file_url) : ('SK_Rektor_Pendirian_LPPM_' . ($univ->kode_univ ?: $univ->id) . '.pdf'),
                'dokumen_url' => $univ->sk_file_url ? asset('storage/' . $univ->sk_file_url) : null,
                'status' => $isVerified ? 'verified' : 'pending',
                'tanggal_pengajuan' => $createdAt->translatedFormat('d F Y'),
                'created_at_raw' => $createdAt->toIso8601String(),
                'detail_info' => [
                    ['label' => 'Kode Institusi', 'value' => $univ->kode_univ ?: 'UNIV-' . $univ->id],
                    ['label' => 'Status Legalitas', 'value' => $isVerified ? 'Terverifikasi Resmi oleh Admin Platform' : 'Menunggu Validasi Dokumen Legalitas'],
                    ['label' => 'DPL Terdaftar', 'value' => $dosenCount . ' Dosen DPL Aktif'],
                    ['label' => 'Email Resmi Institusi', 'value' => $univ->user?->email ?: '-'],
                ],
            ];
        });

        // 2. Fetch Desa
        $desaList = ProfilDesa::with(['user', 'posKebutuhan'])->get()->map(function ($desa) {
            $isVerified = !is_null($desa->verified_at);
            $createdAt = $desa->created_at ? Carbon::parse($desa->created_at) : Carbon::now();
            $posCount = $desa->posKebutuhan ? $desa->posKebutuhan->count() : 0;
            $namaDesa = $desa->nama_desa ?: ($desa->user?->name ?: 'Desa');
            
            $wilayahParts = array_filter([
                $desa->kecamatan ? 'Kec. ' . $desa->kecamatan : null,
                $desa->kabupaten,
                $desa->provinsi,
            ]);
            $wilayah = count($wilayahParts) > 0 ? implode(', ', $wilayahParts) : 'Wilayah Belum Diatur';

            $docName = $desa->sk_file_url ? basename($desa->sk_file_url) : ('SK_Bupati_Kades_' . str_replace(' ', '_', $namaDesa) . '.pdf');

            return [
                'id' => (int) $desa->id,
                'entity_type' => 'desa',
                'nama' => $namaDesa,
                'sub_info' => $wilayah,
                'pemohon' => $desa->user?->name ?: 'Pemerintah ' . $namaDesa,
                'email' => $desa->user?->email ?: '-',
                'kontak' => $desa->kontak_resmi ?: ($desa->user?->phone_wa ?: '-'),
                'dokumen' => $docName,
                'dokumen_url' => $desa->sk_file_url ? asset('storage/' . $desa->sk_file_url) : null,
                'status' => $isVerified ? 'verified' : 'pending',
                'tanggal_pengajuan' => $createdAt->translatedFormat('d F Y'),
                'created_at_raw' => $createdAt->toIso8601String(),
                'detail_info' => [
                    ['label' => 'Wilayah Administratif', 'value' => $wilayah],
                    ['label' => 'Koordinat Lokasi', 'value' => ($desa->latitude && $desa->longitude) ? ($desa->latitude . ', ' . $desa->longitude) : 'Belum ditentukan'],
                    ['label' => 'Pos Kebutuhan Terdata', 'value' => $posCount . ' Pos Kebutuhan Aktif'],
                    ['label' => 'Kontak Resmi Perangkat', 'value' => $desa->kontak_resmi ?: ($desa->user?->phone_wa ?: '-')],
                ],
            ];
        });

        // Merge & Sort: Pending first, then newest
        $combined = $universitasList->concat($desaList)->sortBy([
            ['status', 'asc'], // 'pending' comes before 'verified'
            ['created_at_raw', 'desc'],
        ])->values();

        $pendingCount = $combined->where('status', 'pending')->count();
        $verifiedCount = $combined->where('status', 'verified')->count();

        return response()->json([
            'success' => true,
            'total' => $combined->count(),
            'pending_count' => $pendingCount,
            'verified_count' => $verifiedCount,
            'data' => $combined,
        ]);
    }

    /**
     * Get single entity verification detail.
     */
    public function show(string $type, int $id): JsonResponse
    {
        if ($type === 'universitas') {
            $univ = ProfilUniversitas::with(['user', 'dosen'])->find($id);
            if (!$univ) {
                return response()->json(['success' => false, 'message' => 'Entitas Perguruan Tinggi tidak ditemukan.'], 404);
            }

            $isVerified = !is_null($univ->verified_at);
            $createdAt = $univ->created_at ? Carbon::parse($univ->created_at) : Carbon::now();
            $dosenCount = $univ->dosen ? $univ->dosen->count() : 0;
            $namaUniv = $univ->nama_universitas ?: ($univ->user?->name ?: 'Universitas');

            $data = [
                'id' => (int) $univ->id,
                'entity_type' => 'universitas',
                'nama' => $namaUniv,
                'sub_info' => 'Lembaga Pengabdian Masyarakat & Inovasi (LPPM / LPM)',
                'pemohon' => $univ->user?->name ?: 'Admin LPPM ' . $namaUniv,
                'email' => $univ->user?->email ?: '-',
                'kontak' => $univ->user?->phone_wa ?: '-',
                'dokumen' => $univ->sk_file_url ? basename($univ->sk_file_url) : ('SK_Rektor_Pendirian_LPPM_' . ($univ->kode_univ ?: $univ->id) . '.pdf'),
                'dokumen_url' => $univ->sk_file_url ? asset('storage/' . $univ->sk_file_url) : null,
                'status' => $isVerified ? 'verified' : 'pending',
                'tanggal_pengajuan' => $createdAt->translatedFormat('d F Y'),
                'detail_info' => [
                    ['label' => 'Kode Institusi', 'value' => $univ->kode_univ ?: 'UNIV-' . $univ->id],
                    ['label' => 'Status Legalitas', 'value' => $isVerified ? 'Terverifikasi Resmi oleh Admin Platform' : 'Menunggu Validasi Dokumen Legalitas'],
                    ['label' => 'DPL Terdaftar', 'value' => $dosenCount . ' Dosen DPL Aktif'],
                    ['label' => 'Email Resmi Institusi', 'value' => $univ->user?->email ?: '-'],
                ],
            ];

            return response()->json(['success' => true, 'data' => $data]);
        }

        if ($type === 'desa') {
            $desa = ProfilDesa::with(['user', 'posKebutuhan'])->find($id);
            if (!$desa) {
                return response()->json(['success' => false, 'message' => 'Entitas Mitra Desa tidak ditemukan.'], 404);
            }

            $isVerified = !is_null($desa->verified_at);
            $createdAt = $desa->created_at ? Carbon::parse($desa->created_at) : Carbon::now();
            $posCount = $desa->posKebutuhan ? $desa->posKebutuhan->count() : 0;
            $namaDesa = $desa->nama_desa ?: ($desa->user?->name ?: 'Desa');

            $wilayahParts = array_filter([
                $desa->kecamatan ? 'Kec. ' . $desa->kecamatan : null,
                $desa->kabupaten,
                $desa->provinsi,
            ]);
            $wilayah = count($wilayahParts) > 0 ? implode(', ', $wilayahParts) : 'Wilayah Belum Diatur';

            $docName = $desa->sk_file_url ? basename($desa->sk_file_url) : ('SK_Bupati_Kades_' . str_replace(' ', '_', $namaDesa) . '.pdf');

            $data = [
                'id' => (int) $desa->id,
                'entity_type' => 'desa',
                'nama' => $namaDesa,
                'sub_info' => $wilayah,
                'pemohon' => $desa->user?->name ?: 'Pemerintah ' . $namaDesa,
                'email' => $desa->user?->email ?: '-',
                'kontak' => $desa->kontak_resmi ?: ($desa->user?->phone_wa ?: '-'),
                'dokumen' => $docName,
                'dokumen_url' => $desa->sk_file_url ? asset('storage/' . $desa->sk_file_url) : null,
                'status' => $isVerified ? 'verified' : 'pending',
                'tanggal_pengajuan' => $createdAt->translatedFormat('d F Y'),
                'detail_info' => [
                    ['label' => 'Wilayah Administratif', 'value' => $wilayah],
                    ['label' => 'Koordinat Lokasi', 'value' => ($desa->latitude && $desa->longitude) ? ($desa->latitude . ', ' . $desa->longitude) : 'Belum ditentukan'],
                    ['label' => 'Pos Kebutuhan Terdata', 'value' => $posCount . ' Pos Kebutuhan Aktif'],
                    ['label' => 'Kontak Resmi Perangkat', 'value' => $desa->kontak_resmi ?: ($desa->user?->phone_wa ?: '-')],
                ],
            ];

            return response()->json(['success' => true, 'data' => $data]);
        }

        return response()->json(['success' => false, 'message' => 'Tipe entitas tidak valid.'], 400);
    }

    /**
     * Verify Village
     */
    public function verifyDesa(ProfilDesa $profilDesa): JsonResponse
    {
        $this->desaService->verify($profilDesa);
        return response()->json(['success' => true, 'message' => 'Desa ' . $profilDesa->nama_desa . ' berhasil diverifikasi dan disahkan.']);
    }

    /**
     * Verify University
     */
    public function verifyUniversitas(ProfilUniversitas $profilUniversitas): JsonResponse
    {
        $univ = $this->universitasService->verifyByAdmin($profilUniversitas);
        return response()->json(['success' => true, 'message' => 'Universitas ' . $profilUniversitas->nama_universitas . ' berhasil diverifikasi dan disahkan.', 'data' => $univ]);
    }
}
