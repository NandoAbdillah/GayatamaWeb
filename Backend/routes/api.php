<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AspirasiController;
use App\Http\Controllers\DesaController;
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\KelompokController;
use App\Http\Controllers\PosKebutuhanController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\LuaranController;
use App\Http\Controllers\PortofolioController;
use App\Http\Controllers\UniversitasController;
use App\Http\Controllers\DosenController;
use App\Http\Controllers\LaporanDosenController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\WilayahController;

Route::post('/aspirasi', [AspirasiController::class, 'store']);
Route::get('/aspirasi/{ticket}', [AspirasiController::class, 'show']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::post('/register/mahasiswa', [MahasiswaController::class, 'register']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register/desa', [DesaController::class, 'register']);
Route::post('/register/universitas', [UniversitasController::class, 'register']);

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::patch('/admin/desa/{profilDesa}/verify', [DesaController::class, 'verify']);
    Route::patch('/admin/mahasiswa/{profilMahasiswa}/verify', [MahasiswaController::class, 'verify']);
    Route::patch('/admin/universitas/{profilUniversitas}/verify', [UniversitasController::class, 'verify']);
});

Route::get('/pos-kebutuhan', [PosKebutuhanController::class, 'index']);
Route::get('/pos-kebutuhan/{posKebutuhan}', [PosKebutuhanController::class, 'show']);
Route::get('/portofolio/{slug}', [PortofolioController::class, 'show']);
Route::get('/dosen', [DosenController::class, 'index']);
Route::get('/universitas', [UniversitasController::class, 'index']);
Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

Route::prefix('wilayah')->group(function () {
    Route::get('/provinsi', [WilayahController::class, 'provinsi']);
    Route::get('/kabupaten/{provinceId}', [WilayahController::class, 'kabupaten']);
    Route::get('/kecamatan/{regencyId}', [WilayahController::class, 'kecamatan']);
    Route::get('/desa/{districtId}', [WilayahController::class, 'desa']);
});

Route::middleware(['auth:sanctum', 'role:perangkat_desa'])->group(function () {
    Route::get('/desa/aspirasi', [AspirasiController::class, 'indexByDesa']);
    Route::patch('/desa/aspirasi/{aspirasi}/decide', [AspirasiController::class, 'decide']);
    Route::post('/desa/pos-kebutuhan', [PosKebutuhanController::class, 'store']);
    Route::get('/desa/pos-kebutuhan', [PosKebutuhanController::class, 'indexByDesa']);
    Route::get('/desa/proposal', [ProposalController::class, 'indexByDesa']);
    Route::patch('/desa/proposal/{proposal}/decide', [ProposalController::class, 'decide']);
    Route::get('/desa/luaran', [LuaranController::class, 'indexByDesa']);
    Route::patch('/desa/luaran/{luaran}/verify', [LuaranController::class, 'verify']);
    Route::post('/desa/laporan-dosen', [LaporanDosenController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:universitas'])->group(function () {
    Route::post('/universitas/dosen', [UniversitasController::class, 'storeDosen']);
    Route::get('/universitas/dosen', [UniversitasController::class, 'listDosen']);
    Route::get('/universitas/laporan-dosen', [UniversitasController::class, 'listLaporan']);
    Route::patch('/universitas/laporan-dosen/{laporanDosen}/status', [UniversitasController::class, 'updateLaporan']);
});

Route::middleware(['auth:sanctum', 'role:dosen'])->group(function () {
    Route::get('/dosen/kelompok', [DosenController::class, 'listKelompok']);
    Route::patch('/dosen/proposal/{proposal}/kelayakan', [DosenController::class, 'validasiKelayakan']);
});

Route::middleware(['auth:sanctum', 'role:mahasiswa'])->group(function () {
    Route::post('/kelompok', [KelompokController::class, 'store']);
    Route::post('/kelompok/{kelompok}/join', [KelompokController::class, 'join']);
    Route::get('/kelompok/{kelompok}', [KelompokController::class, 'show']);
    Route::post('/kelompok/{kelompok}/set-dosen', [DosenController::class, 'setDosen']);
    Route::post('/proposal', [ProposalController::class, 'store']);
    Route::get('/proposal/mine', [ProposalController::class, 'myProposals']);
    Route::post('/progress', [ProgressController::class, 'store']);
    Route::post('/proposal/{proposal}/surat-izin-ortu', [ProgressController::class, 'uploadSuratOrtu']);
    Route::post('/luaran', [LuaranController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/proposal/{proposal}/progress', [ProgressController::class, 'indexByProposal']);
    Route::get('/proposal/{proposal}/luaran', [LuaranController::class, 'showByProposal']);
    Route::get('/notifikasi', [NotificationController::class, 'index']);
    Route::patch('/notifikasi/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifikasi/{notifikasi}/read', [NotificationController::class, 'markAsRead']);
});