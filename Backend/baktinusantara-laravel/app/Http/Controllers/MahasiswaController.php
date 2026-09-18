<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrasiMahasiswaRequest;
use App\Models\ProfilMahasiswa;
use App\Services\MahasiswaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MahasiswaController extends Controller
{
    public function __construct(protected MahasiswaService $mahasiswaService) {}

    public function register(RegistrasiMahasiswaRequest $request)
    {
        $mhs = $this->mahasiswaService->register($request->validated(), $request->file('ktm_file'));

        return response()->json([
            'message' => 'Registrasi berhasil, menunggu verifikasi admin',
            'data' => $mhs,
        ], 201);
    }

    public function verify(ProfilMahasiswa $profilMahasiswa)
    {
        $this->mahasiswaService->verify($profilMahasiswa);
        return response()->json(['message' => 'Mahasiswa berhasil diverifikasi']);
    }

    public function downloadKtm(ProfilMahasiswa $profilMahasiswa, Request $request)
    {
        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin';
        $isOwner = $user && $user->profilMahasiswa && $user->profilMahasiswa->id === $profilMahasiswa->id;
        $isUniv = $user && $user->role === 'universitas' && $user->profilUniversitas && $user->profilUniversitas->id === $profilMahasiswa->universitas_id;

        if (!$isAdmin && !$isOwner && !$isUniv) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengakses berkas KTM Mahasiswa ini.');
        }

        $path = $profilMahasiswa->ktm_file_url;
        if (!$path) {
            abort(404, 'Berkas KTM Mahasiswa belum diunggah.');
        }

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        abort(404, 'Berkas fisik KTM Mahasiswa tidak ditemukan.');
    }
}
