<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterUniversitasRequest;
use App\Http\Requests\StoreDosenRequest;
use App\Models\LaporanDosen;
use App\Models\ProfilUniversitas;
use App\Services\UniversitasService;
use Illuminate\Http\Request;

class UniversitasController extends Controller
{
    public function __construct(protected UniversitasService $universitasService) {}

    public function index()
    {
        return response()->json($this->universitasService->listVerifiedPublic());
    }

    public function master(Request $request)
    {
        return response()->json($this->universitasService->getMasterList($request->query('search')));
    }

    public function checkKodeAvailability(Request $request)
    {
        $request->validate(['kode_univ' => 'required|string|max:50']);
        $kode = trim($request->input('kode_univ'));

        $isTaken = ProfilUniversitas::where('kode_univ', $kode)->exists();

        return response()->json([
            'available' => !$isTaken,
            'is_registered' => $isTaken,
            'message' => $isTaken 
                ? 'Perguruan Tinggi dengan Kode PT ini telah terdaftar atau dalam peninjauan LPPM resmi.' 
                : 'Kode PT belum terdaftar dan siap untuk didaftarkan.',
        ]);
    }

    public function scanDocumentRealtime(Request $request, \App\Services\AiDocumentAuditorService $auditor)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'nama_universitas' => 'nullable|string',
            'kode_univ' => 'nullable|string',
            'email' => 'nullable|string',
            'name' => 'nullable|string',
            'nip_admin' => 'nullable|string',
        ]);

        $result = $auditor->scanAndExtractRealtime($request->file('file'), $request->all());

        return response()->json($result);
    }

    public function register(RegisterUniversitasRequest $request)
    {
        $skFile = $request->file('sk_file') ?: $request->file('mou_file');
        $sptjmFile = $request->file('sptjm_file');
        $signatureFile = $request->file('signature_file');
        $univ = $this->universitasService->register($request->validated(), $skFile, $sptjmFile, $signatureFile);

        return response()->json([
            'message' => 'Registrasi institusi universitas berhasil! Berkas sedang diverifikasi admin.',
            'data' => $univ,
        ], 201);
    }

    public function verify(ProfilUniversitas $profilUniversitas)
    {
        $univ = $this->universitasService->verifyByAdmin($profilUniversitas);

        return response()->json([
            'message' => 'Institusi universitas berhasil diverifikasi',
            'data' => $univ,
        ]);
    }

    public function suspend(ProfilUniversitas $profilUniversitas)
    {
        $this->universitasService->suspend($profilUniversitas);

        return response()->json([
            'message' => 'Akun universitas berhasil dinonaktifkan (suspended)',
        ]);
    }

    public function activate(ProfilUniversitas $profilUniversitas)
    {
        $this->universitasService->activate($profilUniversitas);

        return response()->json([
            'message' => 'Akun universitas berhasil diaktifkan kembali',
        ]);
    }

    public function storeDosen(StoreDosenRequest $request)
    {
        $dosen = $this->universitasService->createDosen(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Dosen pembimbing lapangan berhasil ditambahkan',
            'data' => $dosen,
        ], 201);
    }

    public function listDosen(Request $request)
    {
        return response()->json($this->universitasService->listDosenByUniv($request->user()));
    }

    public function listLaporan(Request $request)
    {
        return response()->json($this->universitasService->listLaporanDosen($request->user()));
    }

    public function updateLaporan(Request $request, LaporanDosen $laporanDosen)
    {
        $request->validate(['status' => 'required|in:menunggu,ditinjau,selesai']);

        $laporan = $this->universitasService->updateStatusLaporan(
            $laporanDosen,
            $request->user(),
            $request->status
        );

        return response()->json([
            'message' => 'Status laporan kinerja dosen berhasil diperbarui',
            'data' => $laporan,
        ]);
    }

    public function metrics(Request $request)
    {
        return response()->json([
            'message' => 'Statistik & metrik program KKN internal kampus berhasil dimuat',
            'data' => $this->universitasService->getCampusMetrics($request->user()),
        ]);
    }

    public function listKelompok(Request $request)
    {
        return response()->json([
            'message' => 'Daftar kelompok KKN binaan kampus berhasil dimuat',
            'data' => $this->universitasService->listKelompokByUniv($request->user()),
        ]);
    }

    public function listLogs(Request $request)
    {
        return response()->json([
            'message' => 'Daftar aktivitas & audit log civitas kampus berhasil dimuat',
            'data' => $this->universitasService->listAuditLogsByUniv($request->user()),
        ]);
    }

    public function listLogbook(Request $request)
    {
        return response()->json([
            'message' => 'Daftar logbook harian / mingguan mahasiswa KKN kampus berhasil dimuat',
            'data' => $this->universitasService->listLogbookByUniv($request->user()),
        ]);
    }

    public function storeMahasiswa(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nim' => 'required|string|max:50|unique:profil_mahasiswa,nim',
            'jurusan' => 'required|string|max:100',
            'semester' => 'nullable|integer|min:1|max:14',
            'phone_wa' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
        ]);

        $mhs = $this->universitasService->createMahasiswa($request->user(), $validated);

        return response()->json([
            'message' => 'Mahasiswa berhasil didaftarkan oleh LPPM Kampus',
            'data' => $mhs,
        ], 201);
    }

    public function batchMahasiswa(Request $request)
    {
        $request->validate([
            'students' => 'required|array|min:1',
            'students.*.name' => 'required|string|max:255',
            'students.*.email' => 'required|email|unique:users,email',
            'students.*.nim' => 'required|string|max:50|unique:profil_mahasiswa,nim',
            'students.*.jurusan' => 'required|string|max:100',
            'students.*.semester' => 'nullable|integer',
            'students.*.phone_wa' => 'nullable|string',
        ]);

        $results = $this->universitasService->batchCreateMahasiswa($request->user(), $request->students);

        return response()->json([
            'message' => count($results) . ' mahasiswa berhasil diimpor/didaftarkan oleh LPPM',
            'data' => $results,
        ], 201);
    }

    public function batchDosen(Request $request)
    {
        $request->validate([
            'lecturers' => 'required|array|min:1',
            'lecturers.*.name' => 'required|string|max:255',
            'lecturers.*.email' => 'required|email|unique:users,email',
            'lecturers.*.nip' => 'required|string|max:50|unique:profil_dosen,nip',
            'lecturers.*.phone_wa' => 'nullable|string',
            'lecturers.*.password' => 'nullable|string|min:6',
        ]);

        $results = $this->universitasService->batchCreateDosen($request->user(), $request->lecturers);

        return response()->json([
            'message' => count($results) . ' dosen pembimbing berhasil didaftarkan oleh LPPM',
            'data' => $results,
        ], 201);
    }
}
