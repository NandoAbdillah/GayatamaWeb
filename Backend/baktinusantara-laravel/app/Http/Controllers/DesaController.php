<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrasiDesaRequest;
use App\Models\ProfilDesa;
use App\Services\DesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DesaController extends Controller
{
    public function __construct(protected DesaService $desaService) {}

    public function register(RegistrasiDesaRequest $request)
    {
        $desa = $this->desaService->register($request->validated(), $request->file('sk_file'));

        return response()->json([
            'message' => 'Registrasi berhasil, menunggu verifikasi admin',
            'data' => $desa,
        ], 201);
    }

    public function verify(ProfilDesa $profilDesa)
    {
        $this->desaService->verify($profilDesa);

        return response()->json(['message' => 'Desa berhasil diverifikasi']);
    }

    public function suspend(ProfilDesa $profilDesa)
    {
        $this->desaService->suspend($profilDesa);

        return response()->json(['message' => 'Akun desa berhasil dinonaktifkan (suspended)']);
    }

    public function activate(ProfilDesa $profilDesa)
    {
        $this->desaService->activate($profilDesa);

        return response()->json(['message' => 'Akun desa berhasil diaktifkan kembali']);
    }

    public function downloadSk(ProfilDesa $profilDesa, Request $request)
    {
        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin';
        $isOwner = $user && $user->profilDesa && $user->profilDesa->id === $profilDesa->id;

        if (!$isAdmin && !$isOwner) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengakses berkas SK Desa ini.');
        }

        $path = $profilDesa->sk_file_url;
        if (!$path) {
            abort(404, 'Berkas SK Desa belum diunggah.');
        }

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        abort(404, 'Berkas fisik SK Desa tidak ditemukan.');
    }
}