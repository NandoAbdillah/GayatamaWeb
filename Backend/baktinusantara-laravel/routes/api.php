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
use App\Http\Controllers\WhatsAppWebhookController;
use App\Http\Controllers\MedsosPostController;
use App\Http\Controllers\AiContextController;
use App\Http\Controllers\GeospatialController;

// Geospatial & Map Engine Endpoints
Route::prefix('geospatial')->group(function () {
    Route::get('/map-data', [GeospatialController::class, 'mapData']);
    Route::get('/nearby-pos', [GeospatialController::class, 'nearbyPos']);
    Route::get('/province-summary', [GeospatialController::class, 'provinceSummary']);
    Route::post('/calculate-distance', [GeospatialController::class, 'calculateDistance']);
});

// AI Realtime Context & Smart Matching Endpoints
Route::prefix('ai')->group(function () {
    Route::get('/context', [AiContextController::class, 'globalContext']);
    Route::get('/search-desa', [AiContextController::class, 'searchDesa']);
    Route::post('/recommend-pos', [AiContextController::class, 'recommendPos']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user-context', [AiContextController::class, 'userContext']);
        Route::post('/draft-proposal', [AiContextController::class, 'draftProposal']);
        Route::post('/draft-logbook', [AiContextController::class, 'draftLogbook']);
    });
});

Route::post('/webhook/whatsapp', [WhatsAppWebhookController::class, 'handle']);

Route::get('/medsos-posts', [MedsosPostController::class, 'index']);
Route::post('/medsos-posts', [MedsosPostController::class, 'store']);
Route::get('/medsos-posts/{medsosPost}', [MedsosPostController::class, 'show']);

Route::post('/aspirasi', [AspirasiController::class, 'store']);
Route::get('/aspirasi/{ticket}', [AspirasiController::class, 'show']);

// Auth & Multi-Channel OTP Endpoints
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/register/verify-otp', [AuthController::class, 'verifyRegisterOtp']);
Route::post('/otp/resend', [AuthController::class, 'resendOtp']);
Route::post('/otp/verify', [AuthController::class, 'verifyOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/forgot-email', [AuthController::class, 'forgotEmail']);

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
    Route::get('/universitas/metrics', [UniversitasController::class, 'metrics']);
    Route::get('/universitas/kelompok', [UniversitasController::class, 'listKelompok']);
    Route::get('/universitas/logs', [UniversitasController::class, 'listLogs']);
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