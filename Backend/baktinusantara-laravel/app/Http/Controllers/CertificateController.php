<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use App\Models\SertifikatKkn;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    public function __construct(
        protected CertificateService $certificateService
    ) {}

    /**
     * Verifikasi publik keaslian E-Sertifikat KKN berdasarkan kode registrasi (No-Auth).
     */
    public function verify(string $code)
    {
        $result = $this->certificateService->verifyByCode($code);

        if (!$result) {
            return response()->json([
                'is_authentic' => false,
                'status' => 'INVALID_OR_NOT_FOUND',
                'message' => 'Sertifikat dengan kode tersebut tidak ditemukan dalam pangkalan data resmi BaktiNusantara.',
            ], 404);
        }

        return response()->json($result);
    }

    /**
     * Unduh berkas PDF E-Sertifikat resmi (No-Auth).
     */
    public function download(string $code)
    {
        $cert = SertifikatKkn::where('certificate_code', trim($code))->first();

        if (!$cert) {
            return response()->json([
                'message' => 'Berkas sertifikat tidak ditemukan.',
            ], 404);
        }

        $pdfPath = "certificates/{$cert->certificate_code}.pdf";

        if (!Storage::disk('public')->exists($pdfPath)) {
            $pdfContent = $this->certificateService->renderPdf($cert);
            Storage::disk('public')->put($pdfPath, $pdfContent);
        }

        $content = Storage::disk('public')->get($pdfPath);

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Sertifikat-KKN-' . $cert->certificate_code . '.pdf"',
        ]);
    }

    /**
     * Daftar sertifikat yang diraih oleh mahasiswa yang sedang login.
     */
    public function myCertificates(Request $request)
    {
        $user = $request->user();

        $certificates = SertifikatKkn::where('user_id', $user->id)
            ->with(['proposal.posKebutuhan.desa', 'universitas', 'desa'])
            ->orderBy('issued_at', 'desc')
            ->get();

        return response()->json([
            'total' => $certificates->count(),
            'certificates' => $certificates,
        ]);
    }

    /**
     * Daftar seluruh sertifikat anggota kelompok pada proposal tertentu.
     */
    public function getProposalCertificates(Proposal $proposal, Request $request)
    {
        $certificates = SertifikatKkn::where('proposal_id', $proposal->id)
            ->with(['user.profilMahasiswa', 'universitas', 'desa'])
            ->get();

        return response()->json([
            'proposal_id' => $proposal->id,
            'total_issued' => $certificates->count(),
            'certificates' => $certificates,
        ]);
    }
}
