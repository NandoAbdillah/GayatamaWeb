<?php
        
namespace App\Http\Controllers;

use App\Http\Requests\StoreProposalRequest;
use App\Http\Requests\DecideProposalRequest;
use App\Models\Kelompok;
use App\Models\Proposal;
use App\Services\ProposalService;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    public function __construct(protected ProposalService $proposalService) {}

    public function store(StoreProposalRequest $request)
    {
        $proposal = $this->proposalService->create(
            $request->user(),
            $request->validated(),
            $request->file('file_proposal'),
            $request->file('surat_pengantar')
        );

        return response()->json([
            'message' => 'Proposal berhasil diajukan',
            'data' => $proposal,
        ], 201);
    }

    public function myProposals(Request $request)
    {
        $kelompok = Kelompok::where('ketua_id', $request->user()->id)->first();

        if (!$kelompok) {
            return response()->json([]);
        }

        return response()->json($kelompok->proposal()->with('posKebutuhan')->get());
    }

    public function indexByDesa(Request $request)
    {
        $desaId = $request->user()->profilDesa->id;

        $proposals = Proposal::whereHas('posKebutuhan', fn($q) => $q->where('desa_id', $desaId))
            ->with('kelompok.anggota', 'posKebutuhan')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($proposals);
    }

    public function decide(DecideProposalRequest $request, Proposal $proposal)
    {
        $proposal = $this->proposalService->decideByDesa($proposal, $request->user(), $request->validated());

        return response()->json([
            'message' => $request->validated()['action'] === 'approve' ? 'Proposal diterima' : 'Proposal ditolak',
            'data' => $proposal,
        ]);
    }
}