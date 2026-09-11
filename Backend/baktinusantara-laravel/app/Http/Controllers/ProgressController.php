<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProgressRequest;
use App\Http\Requests\UploadSuratIzinOrtuRequest;
use App\Models\Proposal;
use App\Services\ProgressService;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function __construct(protected ProgressService $progressService) {}

    public function store(StoreProgressRequest $request)
    {
        $progress = $this->progressService->store(
            $request->user(),
            $request->validated(),
            $request->file('foto')
        );

        return response()->json([
            'message' => 'Progress mingguan berhasil dicatat dan dikunci',
            'data' => $progress,
        ], 201);
    }

    public function indexByProposal(Proposal $proposal, Request $request)
    {
        return response()->json($this->progressService->getByProposal($proposal, $request->user()));
    }

    public function uploadSuratOrtu(UploadSuratIzinOrtuRequest $request, Proposal $proposal)
    {
        $surat = $this->progressService->uploadSuratIzinOrtu(
            $proposal,
            $request->user(),
            $request->file('file_surat')
        );

        return response()->json([
            'message' => 'Surat izin orang tua berhasil diunggah',
            'data' => $surat,
        ]);
    }
}
