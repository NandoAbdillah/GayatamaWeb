<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrasiMahasiswaRequest;
use App\Models\ProfilMahasiswa;
use App\Services\MahasiswaService;

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
}
