<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrasiDesaRequest;
use App\Models\ProfilDesa;
use App\Services\DesaService;

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
}