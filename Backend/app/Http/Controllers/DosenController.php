<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetDosenKelompokRequest;
use App\Http\Requests\ValidasiProposalDosenRequest;
use App\Models\Kelompok;
use App\Models\Proposal;
use App\Services\DosenService;
use Illuminate\Http\Request;

class DosenController extends Controller
{
    public function __construct(protected DosenService $dosenService) {}

    public function index()
    {
        return response()->json($this->dosenService->listDosenPublic());
    }

    public function listKelompok(Request $request)
    {
        return response()->json($this->dosenService->listKelompokBinaan($request->user()));
    }

    public function validasiKelayakan(ValidasiProposalDosenRequest $request, Proposal $proposal)
    {
        $proposalUpdated = $this->dosenService->validasiKelayakanProposal(
            $proposal,
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Validasi kelayakan proposal oleh dosen pembimbing berhasil disimpan',
            'data' => $proposalUpdated,
        ]);
    }

    public function setDosen(SetDosenKelompokRequest $request, Kelompok $kelompok)
    {
        $kelompokUpdated = $this->dosenService->setDosenPembimbing(
            $kelompok,
            $request->user(),
            (int) $request->dosen_id
        );

        return response()->json([
            'message' => 'Dosen pembimbing lapangan berhasil ditetapkan',
            'data' => $kelompokUpdated,
        ]);
    }
}
