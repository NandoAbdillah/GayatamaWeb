<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLuaranRequest;
use App\Http\Requests\VerifyLuaranRequest;
use App\Models\LuaranAkhir;
use App\Models\Proposal;
use App\Services\LuaranService;
use Illuminate\Http\Request;

class LuaranController extends Controller
{
    public function __construct(protected LuaranService $luaranService) {}

    public function store(StoreLuaranRequest $request)
    {
        $luaran = $this->luaranService->store(
            $request->user(),
            $request->validated(),
            $request->file('file_deliverable')
        );

        return response()->json([
            'message' => 'Luaran akhir KKN berhasil diunggah',
            'data' => $luaran,
        ], 201);
    }

    public function indexByDesa(Request $request)
    {
        return response()->json($this->luaranService->listByDesa($request->user()));
    }

    public function showByProposal(Proposal $proposal, Request $request)
    {
        $luaran = $this->luaranService->getByProposal($proposal, $request->user());

        return response()->json([
            'message' => 'Data luaran berhasil diambil',
            'data' => $luaran,
        ]);
    }

    public function verify(VerifyLuaranRequest $request, LuaranAkhir $luaran)
    {
        $portofolio = $this->luaranService->verifyByDesa(
            $luaran,
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Luaran akhir berhasil diverifikasi dan portofolio publik telah diterbitkan',
            'data' => $portofolio,
        ]);
    }
}
