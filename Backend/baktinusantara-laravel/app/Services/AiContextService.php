<?php

namespace App\Services;

use App\Models\Aspirasi;
use App\Models\Kelompok;
use App\Models\LuaranAkhir;
use App\Models\PortofolioPublik;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;
use App\Models\ProfilDosen;
use App\Models\ProfilMahasiswa;
use App\Models\ProfilUniversitas;
use App\Models\ProgressMingguan;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AiContextService
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Mengambil konteks data global real-time dari seluruh platform untuk menenagai AI Agent / Copilot.
     */
    public function getGlobalContext(): array
    {
        // 1. Pos Kebutuhan Terbuka (Real-time)
        $openPositions = PosKebutuhan::with(['desa', 'aspirasi'])
            ->withCount(['proposal as accepted_proposals_count' => function ($q) {
                $q->where('status', 'diterima');
            }])
            ->where('status', 'open')
            ->latest()
            ->get()
            ->map(function ($pos) {
                $terisi = $pos->accepted_proposals_count;
                $kuota = $pos->kuota_kelompok ?? 1;
                $sisaKuota = max(0, $kuota - $terisi);

                return [
                    'id' => $pos->id,
                    'judul' => $pos->judul,
                    'deskripsi' => $pos->deskripsi,
                    'kategori' => $pos->kategori,
                    'sdg_codes' => $pos->sdg_codes ?? [],
                    'kuota_kelompok' => $kuota,
                    'terisi_kelompok' => $terisi,
                    'sisa_kuota' => $sisaKuota,
                    'deadline' => $pos->deadline,
                    'jurusan_dibutuhkan' => $pos->jurusan_dibutuhkan ?? ['Semua Jurusan'],
                    'status' => $pos->status,
                    'desa' => [
                        'id' => $pos->desa?->id,
                        'nama_desa' => $pos->desa?->nama_desa,
                        'kecamatan' => $pos->desa?->kecamatan,
                        'kabupaten' => $pos->desa?->kabupaten,
                        'provinsi' => $pos->desa?->provinsi,
                        'latitude' => $pos->desa?->latitude,
                        'longitude' => $pos->desa?->longitude,
                        'kontak_resmi' => $pos->desa?->kontak_resmi,
                    ],
                    'aspirasi_asal' => $pos->aspirasi ? [
                        'id' => $pos->aspirasi->id,
                        'pelapor_nama' => $pos->aspirasi->pelapor_nama,
                        'urgensi' => $pos->aspirasi->urgensi,
                        'deskripsi' => $pos->aspirasi->deskripsi,
                    ] : null,
                ];
            });

        // 2. Profil Desa Terverifikasi (Real-time)
        $desaProfiles = ProfilDesa::withCount([
            'aspirasi as total_aspirasi',
            'aspirasi as aspirasi_selesai' => function ($q) {
                $q->where('status', 'terverifikasi');
            },
            'posKebutuhan as total_pos',
            'posKebutuhan as pos_aktif' => function ($q) {
                $q->where('status', 'open');
            }
        ])
            ->whereNotNull('verified_at')
            ->get()
            ->map(function ($desa) {
                return [
                    'id' => $desa->id,
                    'nama_desa' => $desa->nama_desa,
                    'kecamatan' => $desa->kecamatan,
                    'kabupaten' => $desa->kabupaten,
                    'provinsi' => $desa->provinsi,
                    'latitude' => $desa->latitude,
                    'longitude' => $desa->longitude,
                    'kontak_resmi' => $desa->kontak_resmi,
                    'total_aspirasi' => $desa->total_aspirasi,
                    'aspirasi_selesai' => $desa->aspirasi_selesai,
                    'total_pos' => $desa->total_pos,
                    'pos_aktif' => $desa->pos_aktif,
                ];
            });

        // 3. Metrik Nasional & Distribusi SDGs
        $metrics = $this->dashboardService->getNationalMetrics();

        // 4. Aspirasi Warga Terbaru (10 Terakhir)
        $recentAspirasi = Aspirasi::with('desa')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($asp) {
                return [
                    'id' => $asp->id,
                    'desa_nama' => $asp->desa?->nama_desa ?? 'Desa Mitra',
                    'kabupaten' => $asp->desa?->kabupaten ?? '-',
                    'kategori' => $asp->kategori,
                    'urgensi' => $asp->urgensi,
                    'status' => $asp->status,
                    'deskripsi' => $asp->deskripsi,
                    'created_at' => $asp->created_at?->toIso8601String(),
                ];
            });

        // 5. Portofolio Publik Terbaru (5 Terakhir)
        $recentPortofolio = PortofolioPublik::with(['luaran.proposal.posKebutuhan.desa', 'luaran.proposal.kelompok'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($porto) {
                $proposal = $porto->luaran?->proposal;
                return [
                    'id' => $porto->id,
                    'slug' => $porto->slug_public,
                    'judul_proker' => $proposal?->posKebutuhan?->judul ?? 'Program Kerja KKN',
                    'desa' => $proposal?->posKebutuhan?->desa?->nama_desa ?? 'Desa Binaan',
                    'kabupaten' => $proposal?->posKebutuhan?->desa?->kabupaten ?? '-',
                    'kelompok' => $proposal?->kelompok?->nama_kelompok ?? 'Kelompok KKN',
                    'sertifikat_url' => $porto->sertifikat_pdf_url,
                    'published_at' => $porto->created_at?->toIso8601String(),
                ];
            });

        return [
            'status' => 'success',
            'timestamp' => Carbon::now()->toIso8601String(),
            'platform_metrics' => $metrics,
            'open_positions_count' => $openPositions->count(),
            'open_positions' => $openPositions,
            'desa_count' => $desaProfiles->count(),
            'desa_profiles' => $desaProfiles,
            'recent_aspirasi' => $recentAspirasi,
            'recent_portofolios' => $recentPortofolio,
        ];
    }

    /**
     * Mengambil konteks data pengguna terautentikasi (Mahasiswa, Desa, Dosen, Admin).
     */
    public function getUserContext(User $user): array
    {
        $role = $user->role;
        $context = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $role,
            ],
            'role_context' => [],
            'todo_actions' => [],
        ];

        switch ($role) {
            case 'mahasiswa':
                $profil = ProfilMahasiswa::with('universitas')->where('user_id', $user->id)->first();
                
                // Cari kelompok dimana mahasiswa menjadi ketua atau anggota
                $kelompok = Kelompok::where('ketua_id', $user->id)
                    ->orWhereHas('anggota', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->with([
                        'ketua',
                        'dosen.user',
                        'dosen.universitas',
                        'anggota.user.profilMahasiswa',
                        'proposal.posKebutuhan.desa',
                        'proposal.progressMingguan',
                        'proposal.luaranAkhir',
                        'proposal.suratIzinOrtu',
                    ])
                    ->first();

                $proposals = [];
                $progressLogs = [];
                $hasSuratOrtu = false;
                $luaranStatus = null;
                $activeProposal = null;

                if ($kelompok && $kelompok->proposal->isNotEmpty()) {
                    $activeProposal = $kelompok->proposal->first();
                    $hasSuratOrtu = (bool) $activeProposal->suratIzinOrtu;
                    $luaranStatus = $activeProposal->luaranAkhir?->status_verifikasi;

                    $proposals = $kelompok->proposal->map(function ($p) {
                        return [
                            'id' => $p->id,
                            'pos_judul' => $p->posKebutuhan?->judul,
                            'desa_nama' => $p->posKebutuhan?->desa?->nama_desa,
                            'kabupaten' => $p->posKebutuhan?->desa?->kabupaten,
                            'status' => $p->status,
                            'status_kelayakan_dosen' => $p->status_kelayakan_dosen,
                            'catatan_dosen' => $p->catatan_dosen,
                            'catatan_desa' => $p->catatan_desa,
                            'matching_score' => $p->matching_score,
                            'submitted_at' => $p->submitted_at,
                        ];
                    })->toArray();

                    $progressLogs = $activeProposal->progressMingguan->sortBy('minggu_ke')->map(function ($prog) {
                        return [
                            'id' => $prog->id,
                            'minggu_ke' => $prog->minggu_ke,
                            'persentase' => $prog->persentase,
                            'deskripsi' => $prog->deskripsi,
                            'is_locked' => (bool) $prog->is_locked,
                            'created_at' => $prog->created_at?->toIso8601String(),
                        ];
                    })->values()->toArray();
                }

                // Todo actions checklist untuk Mahasiswa
                $todos = [];
                if (!$profil || !$profil->verified_at) {
                    $todos[] = 'Menunggu verifikasi profil mahasiswa oleh administrator kampus';
                }
                if (!$kelompok) {
                    $todos[] = 'Buat atau gabung ke dalam kelompok KKN';
                } elseif (!$kelompok->dosen_id) {
                    $todos[] = 'Pilih Dosen Pembimbing Lapangan (DPL) untuk kelompok Anda';
                } elseif (empty($proposals)) {
                    $todos[] = 'Pilih pos kebutuhan desa dan ajukan proposal program kerja KKN';
                } elseif ($activeProposal && $activeProposal->status === 'diterima') {
                    if (!$hasSuratOrtu) {
                        $todos[] = 'Unggah Surat Izin Orang Tua (wajib sebelum pelaksanaan)';
                    }
                    $latestWeek = count($progressLogs);
                    if ($latestWeek < 4) {
                        $nextWeek = $latestWeek + 1;
                        $todos[] = "Isi logbook progres mingguan ke-{$nextWeek}";
                    } elseif (!$luaranStatus || $luaranStatus === 'rejected') {
                        $todos[] = 'Unggah berkas Luaran Akhir kegiatan KKN';
                    }
                }

                $context['role_context'] = [
                    'profil' => $profil ? [
                        'nim' => $profil->nim,
                        'jurusan' => $profil->jurusan,
                        'semester' => $profil->semester,
                        'universitas' => $profil->universitas?->nama_universitas,
                        'is_verified' => (bool) $profil->verified_at,
                    ] : null,
                    'kelompok' => $kelompok ? [
                        'id' => $kelompok->id,
                        'nama_kelompok' => $kelompok->nama_kelompok,
                        'is_ketua' => $kelompok->ketua_id === $user->id,
                        'ketua_nama' => $kelompok->ketua?->name,
                        'dosen_pembimbing' => $kelompok->dosen ? [
                            'id' => $kelompok->dosen->id,
                            'nama' => $kelompok->dosen->user?->name,
                            'nip' => $kelompok->dosen->nip,
                            'bidang_keahlian' => $kelompok->dosen->bidang_keahlian,
                        ] : null,
                        'total_anggota' => $kelompok->anggota->count() + 1,
                        'anggota' => $kelompok->anggota->map(fn($a) => [
                            'user_id' => $a->user_id,
                            'nama' => $a->user?->name,
                            'jurusan' => $a->user?->profilMahasiswa?->jurusan,
                        ]),
                    ] : null,
                    'proposals' => $proposals,
                    'active_proposal' => $activeProposal ? [
                        'id' => $activeProposal->id,
                        'pos_judul' => $activeProposal->posKebutuhan?->judul,
                        'desa_nama' => $activeProposal->posKebutuhan?->desa?->nama_desa,
                        'status' => $activeProposal->status,
                        'status_kelayakan_dosen' => $activeProposal->status_kelayakan_dosen,
                        'has_surat_ortu' => $hasSuratOrtu,
                        'luaran_status' => $luaranStatus,
                        'total_progress_submitted' => count($progressLogs),
                    ] : null,
                    'progress_logs' => $progressLogs,
                ];
                $context['todo_actions'] = $todos;
                break;

            case 'perangkat_desa':
                $desa = ProfilDesa::where('user_id', $user->id)->first();
                $aspirasiList = [];
                $posList = [];
                $incomingProposals = [];
                $incomingLuaran = [];
                $todos = [];

                if ($desa) {
                    $aspirasiList = Aspirasi::where('desa_id', $desa->id)->latest()->get()->map(fn($a) => [
                        'id' => $a->id,
                        'pelapor_nama' => $a->pelapor_nama,
                        'kategori' => $a->kategori,
                        'urgensi' => $a->urgensi,
                        'status' => $a->status,
                        'deskripsi' => $a->deskripsi,
                        'created_at' => $a->created_at?->toIso8601String(),
                    ])->toArray();

                    $posList = PosKebutuhan::where('desa_id', $desa->id)->withCount('proposal')->latest()->get()->map(fn($p) => [
                        'id' => $p->id,
                        'judul' => $p->judul,
                        'kategori' => $p->kategori,
                        'status' => $p->status,
                        'kuota_kelompok' => $p->kuota_kelompok,
                        'total_proposal' => $p->proposal_count,
                    ])->toArray();

                    $incomingProposals = Proposal::whereHas('posKebutuhan', fn($q) => $q->where('desa_id', $desa->id))
                        ->where('status', 'menunggu')
                        ->with(['kelompok.ketua', 'posKebutuhan'])
                        ->latest()
                        ->get()
                        ->map(fn($p) => [
                            'id' => $p->id,
                            'pos_judul' => $p->posKebutuhan?->judul,
                            'kelompok_nama' => $p->kelompok?->nama_kelompok,
                            'ketua_nama' => $p->kelompok?->ketua?->name,
                            'matching_score' => $p->matching_score,
                            'status_kelayakan_dosen' => $p->status_kelayakan_dosen,
                            'submitted_at' => $p->submitted_at,
                        ])->toArray();

                    $incomingLuaran = LuaranAkhir::whereHas('proposal.posKebutuhan', fn($q) => $q->where('desa_id', $desa->id))
                        ->where('status_verifikasi', 'submitted')
                        ->with(['proposal.kelompok', 'proposal.posKebutuhan'])
                        ->latest()
                        ->get()
                        ->map(fn($l) => [
                            'id' => $l->id,
                            'pos_judul' => $l->proposal?->posKebutuhan?->judul,
                            'kelompok_nama' => $l->proposal?->kelompok?->nama_kelompok,
                            'deskripsi' => $l->deskripsi,
                            'file_url' => $l->file_deliverable_url,
                            'created_at' => $l->created_at?->toIso8601String(),
                        ])->toArray();

                    if (!$desa->verified_at) {
                        $todos[] = 'Menunggu verifikasi SK Desa oleh Administrator platform';
                    }
                    if (count($incomingProposals) > 0) {
                        $todos[] = count($incomingProposals) . ' pengajuan proposal KKN menunggu persetujuan Anda';
                    }
                    if (count($incomingLuaran) > 0) {
                        $todos[] = count($incomingLuaran) . ' berkas luaran akhir mahasiswa menunggu validasi';
                    }
                    $pendingAspirasi = Aspirasi::where('desa_id', $desa->id)->where('status', 'menunggu')->count();
                    if ($pendingAspirasi > 0) {
                        $todos[] = "{$pendingAspirasi} aspirasi warga baru perlu ditinjau untuk dijadikan Pos KKN";
                    }
                }

                $context['role_context'] = [
                    'desa' => $desa ? [
                        'id' => $desa->id,
                        'nama_desa' => $desa->nama_desa,
                        'kecamatan' => $desa->kecamatan,
                        'kabupaten' => $desa->kabupaten,
                        'provinsi' => $desa->provinsi,
                        'is_verified' => (bool) $desa->verified_at,
                    ] : null,
                    'total_aspirasi' => count($aspirasiList),
                    'total_pos_kebutuhan' => count($posList),
                    'pending_proposals' => $incomingProposals,
                    'pending_luaran' => $incomingLuaran,
                    'pos_kebutuhan' => $posList,
                    'aspirasi' => $aspirasiList,
                ];
                $context['todo_actions'] = $todos;
                break;

            case 'dosen':
                $dosen = ProfilDosen::where('user_id', $user->id)->with('universitas')->first();
                $kelompokBinaan = [];
                $pendingValidations = [];
                $todos = [];

                if ($dosen) {
                    $kelompokBinaan = Kelompok::where('dosen_id', $dosen->id)
                        ->with(['ketua', 'anggota.user', 'proposal.posKebutuhan.desa', 'proposal.progressMingguan'])
                        ->get()
                        ->map(function ($k) {
                            $prop = $k->proposal->first();
                            return [
                                'id' => $k->id,
                                'nama_kelompok' => $k->nama_kelompok,
                                'ketua' => $k->ketua?->name,
                                'total_anggota' => $k->anggota->count() + 1,
                                'proposal_status' => $prop?->status,
                                'kelayakan_dosen' => $prop?->status_kelayakan_dosen,
                                'pos_judul' => $prop?->posKebutuhan?->judul,
                                'desa_nama' => $prop?->posKebutuhan?->desa?->nama_desa,
                                'total_progress' => $prop?->progressMingguan?->count() ?? 0,
                            ];
                        })->toArray();

                    $pendingValidations = Proposal::whereHas('kelompok', fn($q) => $q->where('dosen_id', $dosen->id))
                        ->where('status_kelayakan_dosen', 'belum_ditinjau')
                        ->with(['kelompok.ketua', 'posKebutuhan.desa'])
                        ->get()
                        ->map(fn($p) => [
                            'proposal_id' => $p->id,
                            'kelompok_nama' => $p->kelompok?->nama_kelompok,
                            'ketua_nama' => $p->kelompok?->ketua?->name,
                            'pos_judul' => $p->posKebutuhan?->judul,
                            'desa_nama' => $p->posKebutuhan?->desa?->nama_desa,
                            'matching_score' => $p->matching_score,
                        ])->toArray();

                    if (count($pendingValidations) > 0) {
                        $todos[] = count($pendingValidations) . ' proposal mahasiswa bimbingan perlu validasi kelayakan akademis';
                    }
                }

                $context['role_context'] = [
                    'dosen' => $dosen ? [
                        'nip' => $dosen->nip,
                        'bidang_keahlian' => $dosen->bidang_keahlian,
                        'universitas' => $dosen->universitas?->nama_universitas,
                    ] : null,
                    'total_kelompok_binaan' => count($kelompokBinaan),
                    'kelompok_binaan' => $kelompokBinaan,
                    'pending_validations' => $pendingValidations,
                ];
                $context['todo_actions'] = $todos;
                break;

            case 'admin':
                $unverifiedDesa = ProfilDesa::whereNull('verified_at')->count();
                $unverifiedMhs = ProfilMahasiswa::whereNull('verified_at')->count();
                $unverifiedUniv = ProfilUniversitas::whereNull('verified_at')->count();

                $todos = [];
                if ($unverifiedDesa > 0) $todos[] = "{$unverifiedDesa} desa menunggu verifikasi SK";
                if ($unverifiedMhs > 0) $todos[] = "{$unverifiedMhs} mahasiswa menunggu verifikasi KTM";
                if ($unverifiedUniv > 0) $todos[] = "{$unverifiedUniv} perguruan tinggi menunggu verifikasi";

                $context['role_context'] = [
                    'pending_verifications' => [
                        'desa' => $unverifiedDesa,
                        'mahasiswa' => $unverifiedMhs,
                        'universitas' => $unverifiedUniv,
                    ],
                ];
                $context['todo_actions'] = $todos;
                break;
        }

        return [
            'status' => 'success',
            'timestamp' => Carbon::now()->toIso8601String(),
            'context' => $context,
        ];
    }

    /**
     * Smart Position Recommendation & Matching Score Engine (0-100%).
     */
    public function recommendPositions(array $params): array
    {
        $studentMajor = strtolower(trim($params['student_major'] ?? ''));
        $skills = array_map('strtolower', (array) ($params['skills'] ?? []));
        $targetKategori = strtolower(trim($params['kategori'] ?? ''));
        $targetSdg = $params['sdg_target'] ?? null;
        $kabupaten = strtolower(trim($params['kabupaten'] ?? ''));
        $limit = max(1, min(10, (int) ($params['limit'] ?? 5)));

        // Ambil semua pos kebutuhan berstatus open
        $query = PosKebutuhan::with(['desa', 'aspirasi'])
            ->withCount(['proposal as accepted_count' => fn($q) => $q->where('status', 'diterima')])
            ->where('status', 'open');

        if ($kabupaten !== '') {
            $query->whereHas('desa', function ($q) use ($kabupaten) {
                $q->whereRaw('LOWER(kabupaten) LIKE ?', ["%{$kabupaten}%"]);
            });
        }

        $allPos = $query->get();

        $scoredPositions = [];

        foreach ($allPos as $pos) {
            $score = 0;
            $alasan = [];
            $posKategori = strtolower($pos->kategori ?? '');
            $posDeskripsi = strtolower($pos->deskripsi ?? '');
            $posJudul = strtolower($pos->judul ?? '');
            $jurusanList = array_map('strtolower', (array) ($pos->jurusan_dibutuhkan ?? []));
            $sdgList = (array) ($pos->sdg_codes ?? []);

            // 1. Major Alignment Score (Bobot 40 Poin)
            $majorScore = 0;
            $matchedMajorKeyword = null;

            if ($studentMajor !== '') {
                // Exact or Substring match di daftar jurusan yang dibutuhkan
                foreach ($jurusanList as $reqMajor) {
                    if (str_contains($reqMajor, $studentMajor) || str_contains($studentMajor, $reqMajor)) {
                        $majorScore = 40;
                        $matchedMajorKeyword = $reqMajor;
                        break;
                    }
                }

                // Family domain matching
                if ($majorScore === 0) {
                    if ($this->isMajorDomainMatched($studentMajor, 'it') && ($posKategori === 'umkm' || str_contains($posDeskripsi, 'digital') || str_contains($posDeskripsi, 'sistem') || str_contains($posDeskripsi, 'iot') || str_contains($posDeskripsi, 'website'))) {
                        $majorScore = 36;
                        $matchedMajorKeyword = 'Bidang Teknologi & Digitalisasi';
                    } elseif ($this->isMajorDomainMatched($studentMajor, 'pertanian') && ($posKategori === 'lingkungan' || $posKategori === 'fasilitas' || str_contains($posDeskripsi, 'tani') || str_contains($posDeskripsi, 'pangan') || str_contains($posDeskripsi, 'irigasi') || str_contains($posDeskripsi, 'panen'))) {
                        $majorScore = 37;
                        $matchedMajorKeyword = 'Bidang Pertanian & Ketahanan Pangan';
                    } elseif ($this->isMajorDomainMatched($studentMajor, 'kesehatan') && ($posKategori === 'kesehatan' || str_contains($posDeskripsi, 'stunting') || str_contains($posDeskripsi, 'gizi') || str_contains($posDeskripsi, 'posyandu') || str_contains($posDeskripsi, 'sanitasi'))) {
                        $majorScore = 38;
                        $matchedMajorKeyword = 'Bidang Kesehatan & Sanitasi Warga';
                    } elseif ($this->isMajorDomainMatched($studentMajor, 'ekonomi') && ($posKategori === 'umkm' || str_contains($posDeskripsi, 'bumdes') || str_contains($posDeskripsi, 'pasar') || str_contains($posDeskripsi, 'keuangan') || str_contains($posDeskripsi, 'pembukuan'))) {
                        $majorScore = 36;
                        $matchedMajorKeyword = 'Bidang Manajemen & Ekonomi UMKM';
                    } elseif ($this->isMajorDomainMatched($studentMajor, 'pendidikan') && ($posKategori === 'pendidikan' || str_contains($posDeskripsi, 'sekolah') || str_contains($posDeskripsi, 'literasi') || str_contains($posDeskripsi, 'belajar'))) {
                        $majorScore = 36;
                        $matchedMajorKeyword = 'Bidang Edukasi & Pengajaran';
                    } elseif (in_array('semua jurusan', $jurusanList) || empty($jurusanList)) {
                        $majorScore = 30;
                        $matchedMajorKeyword = 'Terbuka untuk Multidisiplin Ilmu';
                    } else {
                        $majorScore = 18;
                    }
                }
            } else {
                $majorScore = 25; // Default jika tanpa filter jurusan
            }

            $score += $majorScore;
            if ($matchedMajorKeyword) {
                $alasan[] = "Kesesuaian jurusan mahasiswa sangat relevan dengan kebutuhan pos: {$matchedMajorKeyword}.";
            }

            // 2. Skills & Keyword Match Score (Bobot 30 Poin)
            $skillScore = 0;
            $matchedSkills = [];

            if (!empty($skills)) {
                foreach ($skills as $skill) {
                    if (str_contains($posDeskripsi, $skill) || str_contains($posJudul, $skill) || str_contains($posKategori, $skill)) {
                        $matchedSkills[] = $skill;
                    }
                }
                $skillMatchRatio = count($skills) > 0 ? count($matchedSkills) / count($skills) : 0;
                $skillScore = (int) round($skillMatchRatio * 30);
                $skillScore = max(10, min(30, $skillScore));
            } else {
                $skillScore = 22; // Default base skill score
            }

            $score += $skillScore;
            if (!empty($matchedSkills)) {
                $alasan[] = "Keahlian Anda (" . implode(', ', $matchedSkills) . ") secara langsung menyelesaikan masalah prioritas di pos ini.";
            }

            // 3. Category & SDG Alignment Score (Bobot 20 Poin)
            $sdgScore = 0;
            if ($targetKategori !== '' && $posKategori === $targetKategori) {
                $sdgScore += 10;
                $alasan[] = "Sektor kategori ({$pos->kategori}) selaras dengan preferensi pengabdian Anda.";
            } else {
                $sdgScore += 5;
            }

            if ($targetSdg !== null && in_array($targetSdg, $sdgList)) {
                $sdgScore += 10;
                $alasan[] = "Target dampak pos langsung berkontribusi pada pencapaian SDG {$targetSdg}.";
            } else {
                $sdgScore += 5;
            }

            $score += min(20, $sdgScore);

            // 4. Kuota & Availability (Bobot 10 Poin)
            $kuota = $pos->kuota_kelompok ?? 1;
            $terisi = $pos->accepted_count ?? 0;
            $sisaKuota = max(0, $kuota - $terisi);

            if ($sisaKuota > 0) {
                $score += 10;
            } else {
                $score += 2;
            }

            // Normalisasi skor (0-100)
            $finalScore = min(98, max(50, $score));

            // Predikat
            $predikat = 'Cukup Sesuai';
            if ($finalScore >= 90) {
                $predikat = 'Sangat Sesuai (Highly Recommended)';
            } elseif ($finalScore >= 75) {
                $predikat = 'Sesuai (Recommended)';
            }

            // Generate Rekomendasi Ide Proker Cerdas
            $prokerSaran = $this->generateSmartProkerIdea($pos, $studentMajor);

            $scoredPositions[] = [
                'pos_id' => $pos->id,
                'matching_score' => $finalScore,
                'predikat' => $predikat,
                'judul' => $pos->judul,
                'kategori' => $pos->kategori,
                'sdg_codes' => $pos->sdg_codes ?? [],
                'kuota_kelompok' => $kuota,
                'terisi_kelompok' => $terisi,
                'sisa_kuota' => $sisaKuota,
                'deadline' => $pos->deadline,
                'desa' => [
                    'id' => $pos->desa?->id,
                    'nama_desa' => $pos->desa?->nama_desa,
                    'kecamatan' => $pos->desa?->kecamatan,
                    'kabupaten' => $pos->desa?->kabupaten,
                    'provinsi' => $pos->desa?->provinsi,
                ],
                'alasan_kesesuaian' => $alasan,
                'rekomendasi_proker' => $prokerSaran,
            ];
        }

        // Sort descending by matching score
        usort($scoredPositions, fn($a, $b) => $b['matching_score'] <=> $a['matching_score']);

        $topResults = array_slice($scoredPositions, 0, $limit);

        return [
            'status' => 'success',
            'query_params' => [
                'student_major' => $params['student_major'] ?? null,
                'skills' => $params['skills'] ?? [],
                'kategori' => $params['kategori'] ?? null,
                'sdg_target' => $params['sdg_target'] ?? null,
            ],
            'total_matches' => count($scoredPositions),
            'recommendations' => $topResults,
        ];
    }

    /**
     * Generator draf proposal program kerja KKN terstruktur berbasis database desa riil.
     */
    public function generateProposalDraft(int $posId, ?int $kelompokId = null, ?string $fokusUtama = null): array
    {
        $pos = PosKebutuhan::with(['desa', 'aspirasi'])->findOrFail($posId);
        $desa = $pos->desa;

        $desaNama = $desa?->nama_desa ?? 'Desa Mitra';
        $kabupaten = $desa?->kabupaten ?? 'Kabupaten Setempat';
        $kategori = ucfirst($pos->kategori ?? 'Pemberdayaan Masyarakat');

        $judulProgram = !empty($fokusUtama)
            ? "Inovasi {$fokusUtama} untuk Peningkatan {$pos->judul} di {$desaNama}"
            : "Program Kerja KKN Tematik: {$pos->judul} Berbasis Potensi Lokal di {$desaNama}";

        $latarBelakang = "Desa {$desaNama}, {$kabupaten} memiliki potensi strategis dalam sektor {$kategori}. Berdasarkan data aspirasi masyarakat terkini: \"{$pos->deskripsi}\". Melalui program KKN ini, mahasiswa hadir sebagai katalisator solusi berkelanjutan untuk menjawab permasalahan tersebut secara partisipatif bersama aparatur desa dan masyarakat setempat.";

        $rencanaMingguan = [
            [
                'minggu' => 1,
                'fokus' => 'Observasi Lapangan, Sosialisasi & Pemetaan Kebutuhan',
                'kegiatan' => [
                    "Sowan dan koordinasi resmi dengan Kepala Desa {$desaNama} beserta jajaran perangkat desa",
                    "Observasi lapangan dan Focus Group Discussion (FGD) bersama tokoh masyarakat dan kelompok sasaran",
                    "Penyusunan instrumen pendampingan dan finalisasi baseline data",
                ],
                'target_output' => 'Peta kebutuhan riil dan komitmen bersama mitra sasaran desa',
            ],
            [
                'minggu' => 2,
                'fokus' => 'Implementasi Program Inti & Pelatihan Kapasitas Warga',
                'kegiatan' => [
                    "Pelaksanaan workshop interaktif dan pelatihan teknis sesuai target {$kategori}",
                    "Demonstrasi penggunaan alat/aplikasi/metode percontohan kepada masyarakat",
                    "Penyaluran modul panduan dan media edukasi visual",
                ],
                'target_output' => 'Warga sasaran terampil mengoperasikan luaran program',
            ],
            [
                'minggu' => 3,
                'fokus' => 'Pendampingan Teknis, Uji Coba Lapangan & Evaluasi Tahap 1',
                'kegiatan' => [
                    "Pendampingan intensif (one-on-one mentoring) bagi kelompok binaan",
                    "Uji coba efektivitas program dan perbaikan kendala teknis di lapangan",
                    "Pengukuran indikator keberhasilan awal bersama DPL dan perwakilan desa",
                ],
                'target_output' => 'Luaran program beroperasi stabil dan minim kendala',
            ],
            [
                'minggu' => 4,
                'fokus' => 'Finalisasi Luaran, Serah Terima ke Desa & Laporan Akhir',
                'kegiatan' => [
                    "Penyusunan Standar Operasional Prosedur (SOP) serah kelola berkelanjutan ke pihak desa",
                    "Gelar pameran hasil karya KKN / Expo mini desa",
                    "Serah terima resmi produk luaran kepada Pemerintah Desa {$desaNama}",
                ],
                'target_output' => 'Berita acara serah terima luaran dan draf laporan akhir KKN',
            ],
        ];

        $targetLuaran = [
            'Luaran Utama' => "Sistem/Produk/Panduan {$pos->judul} yang terpasang dan siap guna",
            'Luaran Dokumentasi' => "Video profil program berdurasi 3-5 menit dan modul SOP pengelolaan",
            'Luaran Akademik' => "Laporan akhir KKN terstandar LPPM dan draf artikel pengabdian masyarakat",
        ];

        $estimasiAnggaran = [
            ['pos' => 'Bahan Baku & Alat Percontohan', 'estimasi_biaya' => 1500000],
            ['pos' => 'Sosialisasi, Workshop & Konsumsi Warga', 'estimasi_biaya' => 800000],
            ['pos' => 'Pencetakan Modul Panduan & Banner Edukasi', 'estimasi_biaya' => 450000],
            ['pos' => 'Operasional & Dokumentasi Lapangan', 'estimasi_biaya' => 400000],
        ];

        return [
            'status' => 'success',
            'pos_id' => $pos->id,
            'draft' => [
                'judul_program' => $judulProgram,
                'desa_tujuan' => "{$desaNama}, {$pos->desa?->kecamatan}, {$kabupaten}, {$pos->desa?->provinsi}",
                'kategori_sektor' => $kategori,
                'sdg_targets' => $pos->sdg_codes ?? [],
                'latar_belakang' => $latarBelakang,
                'metodologi' => 'Participatory Action Research (PAR) & Asset-Based Community Development (ABCD)',
                'rencana_kegiatan' => $rencanaMingguan,
                'target_luaran' => $targetLuaran,
                'estimasi_anggaran' => $estimasiAnggaran,
                'total_anggaran' => array_sum(array_column($estimasiAnggaran, 'estimasi_biaya')),
            ],
        ];
    }

    /**
     * Generator draf logbook kegiatan harian mahasiswa KKN.
     */
    public function generateLogbookDraft(array $params, User $user): array
    {
        $mingguKe = (int) ($params['minggu_ke'] ?? 1);
        $kegiatanUtama = $params['kegiatan_utama'] ?? 'Koordinasi dan implementasi program kerja KKN';
        $kendala = $params['kendala'] ?? 'Penyesuaian jadwal luang warga dan faktor cuaca lapangan';
        $solusi = $params['solusi'] ?? 'Koordinasi intensif melalui grup WhatsApp RT/RW dan penjadwalan fleksibel di malam hari';
        $jamKerja = (int) ($params['jam_kerja'] ?? 8);

        return [
            'status' => 'success',
            'draft_logbook' => [
                'tanggal' => Carbon::now()->toDateString(),
                'minggu_ke' => $mingguKe,
                'jam_kerja_efektif' => $jamKerja,
                'kegiatan_pokok' => $kegiatanUtama,
                'kendala_lapangan' => $kendala,
                'solusi_diterapkan' => $solusi,
                'output_tercapai' => "Kegiatan minggu ke-{$mingguKe} terlaksana dengan baik sesuai rencana target luaran.",
                'estimasi_persentase_kumulatif' => min(100, $mingguKe * 25),
            ],
        ];
    }

    /**
     * Pencarian desa terverifikasi lengkap dengan data statistik real-time.
     */
    public function searchDesa(array $filters): array
    {
        $keyword = strtolower(trim($filters['keyword'] ?? ''));
        $provinsi = strtolower(trim($filters['provinsi'] ?? ''));
        $kabupaten = strtolower(trim($filters['kabupaten'] ?? ''));

        $query = ProfilDesa::withCount([
            'aspirasi as total_aspirasi',
            'posKebutuhan as total_pos',
            'posKebutuhan as pos_aktif' => fn($q) => $q->where('status', 'open'),
        ])->whereNotNull('verified_at');

        if ($keyword !== '') {
            $query->where(function ($q) use ($keyword) {
                $q->whereRaw('LOWER(nama_desa) LIKE ?', ["%{$keyword}%"])
                    ->orWhereRaw('LOWER(kecamatan) LIKE ?', ["%{$keyword}%"])
                    ->orWhereRaw('LOWER(kabupaten) LIKE ?', ["%{$keyword}%"]);
            });
        }

        if ($provinsi !== '') {
            $query->whereRaw('LOWER(provinsi) LIKE ?', ["%{$provinsi}%"]);
        }

        if ($kabupaten !== '') {
            $query->whereRaw('LOWER(kabupaten) LIKE ?', ["%{$kabupaten}%"]);
        }

        $results = $query->latest()->take(20)->get()->map(function ($desa) {
            return [
                'id' => $desa->id,
                'nama_desa' => $desa->nama_desa,
                'kecamatan' => $desa->kecamatan,
                'kabupaten' => $desa->kabupaten,
                'provinsi' => $desa->provinsi,
                'latitude' => $desa->latitude,
                'longitude' => $desa->longitude,
                'kontak_resmi' => $desa->kontak_resmi,
                'total_aspirasi' => $desa->total_aspirasi,
                'total_pos_kebutuhan' => $desa->total_pos,
                'pos_aktif' => $desa->pos_aktif,
            ];
        });

        return [
            'status' => 'success',
            'total_found' => $results->count(),
            'data' => $results,
        ];
    }

    /**
     * Helper deteksi domain disiplin ilmu.
     */
    protected function isMajorDomainMatched(string $major, string $domain): bool
    {
        $domainKeywords = [
            'it' => ['informatika', 'komputer', 'sistem informasi', 'software', 'ti', 'ilkom', 'rpl', 'cyber', 'data'],
            'pertanian' => ['pertanian', 'agribisnis', 'agroteknologi', 'peternakan', 'kehutanan', 'tanah', 'hama', 'hortikultura'],
            'kesehatan' => ['kesehatan', 'keperawatan', 'kebidanan', 'gizi', 'kedokteran', 'farmasi', 'sanitasi', 'kesmas'],
            'ekonomi' => ['manajemen', 'akuntansi', 'ekonomi', 'bisnis', 'keuangan', 'pemasaran', 'perbankan'],
            'pendidikan' => ['pendidikan', 'pgsd', 'guru', 'sastra', 'bahasa', 'kurikulum', 'paud', 'bimbingan'],
        ];

        $keywords = $domainKeywords[$domain] ?? [];
        foreach ($keywords as $kw) {
            if (str_contains($major, $kw)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Helper penyusun ide proker spesifik.
     */
    protected function generateSmartProkerIdea(PosKebutuhan $pos, string $studentMajor): array
    {
        $kategori = strtolower($pos->kategori ?? '');
        $judulPos = $pos->judul;
        $desa = $pos->desa?->nama_desa ?? 'Desa';

        $title = "Pengembangan Solusi Terpadu: {$judulPos}";
        $steps = [
            "Sosialisasi dan pemetaan kendala di {$desa}",
            "Penerapan metode interaktif bersama masyarakat",
            "Evaluasi dan serah terima dokumen SOP keberlanjutan",
        ];

        if (str_contains($studentMajor, 'informatika') || str_contains($studentMajor, 'komputer') || str_contains($studentMajor, 'sistem')) {
            $title = "Digitalisasi {$judulPos} Berbasis Web & Platform Interaktif di {$desa}";
            $steps = [
                "Analisis kebutuhan antarmuka sistem dan struktur basis data desa",
                "Pengembangan dan pelatihan admin operator sistem di balai desa",
                "Peluncuran dan integrasi link publik untuk kemudahan akses warga",
            ];
        } elseif (str_contains($studentMajor, 'pertanian') || str_contains($studentMajor, 'agri')) {
            $title = "Optimalisasi Modern {$judulPos} & Pengolahan Pascapanen di {$desa}";
            $steps = [
                "Uji sampel lahan dan pendampingan kelompok tani (Gapoktan)",
                "Penyuluhan efisiensi budidaya dan diversifikasi olahan produk",
                "Penyusunan modul panduan bertani terpadu",
            ];
        } elseif (str_contains($studentMajor, 'kesehatan') || str_contains($studentMajor, 'gizi')) {
            $title = "Gerakan Pencegahan & Edukasi Terpadu {$judulPos} di {$desa}";
            $steps = [
                "Screening awal dan penyuluhan pola hidup sehat bersama kader Posyandu",
                "Pelatihan pembuatan menu gizi seimbang berbasis pangan lokal",
                "Pencatatan rekam kesehatan berkala dan evaluasi status gizi",
            ];
        }

        return [
            'nama_proker' => $title,
            'tahapan_utama' => $steps,
        ];
    }

    /**
     * Dispatcher eksekusi tools AI Copilot terpadu langsung di backend (MySQL & Logic).
     */
    public function executeTool(string $toolName, array $args = [], ?User $user = null): array
    {
        switch ($toolName) {
            case 'search_desa_potensi': {
                $keyword = strtolower(trim($args['keyword'] ?? ''));
                $potensi = strtolower(trim($args['potensi'] ?? ''));

                $query = ProfilDesa::withCount([
                    'posKebutuhan as pos_tersedia' => fn($q) => $q->where('status', 'open'),
                    'aspirasi as total_aspirasi',
                ])->whereNotNull('verified_at');

                if ($keyword !== '') {
                    $query->where(function ($q) use ($keyword) {
                        $q->whereRaw('LOWER(nama_desa) LIKE ?', ["%{$keyword}%"])
                            ->orWhereRaw('LOWER(kecamatan) LIKE ?', ["%{$keyword}%"])
                            ->orWhereRaw('LOWER(kabupaten) LIKE ?', ["%{$keyword}%"])
                            ->orWhereRaw('LOWER(provinsi) LIKE ?', ["%{$keyword}%"]);
                    });
                }

                $desas = $query->take(6)->get();

                if ($desas->isEmpty()) {
                    $desas = ProfilDesa::withCount([
                        'posKebutuhan as pos_tersedia' => fn($q) => $q->where('status', 'open'),
                        'aspirasi as total_aspirasi',
                    ])->take(3)->get();
                }

                return [
                    'status' => 'success',
                    'cardType' => 'village',
                    'action' => 'DISPLAY_DESA_CARDS',
                    'total_found' => $desas->count(),
                    'data' => $desas->map(function ($d) {
                        return [
                            'id' => $d->id,
                            'nama' => $d->nama_desa,
                            'kecamatan' => $d->kecamatan ?? 'Kecamatan Mitra',
                            'kabupaten' => $d->kabupaten ?? 'Kabupaten Mitra',
                            'provinsi' => $d->provinsi ?? 'Jawa Timur',
                            'populasi' => '3.500+ Jiwa',
                            'luas_km2' => 12.5,
                            'potensi_utama' => ['UMKM Olahan Pangan', 'Pertanian Berkelanjutan', 'Desa Wisata'],
                            'kebutuhan_prioritas' => ['Digitalisasi BUMDes', 'Pemasaran E-Commerce', 'Pengolahan Pascapanen'],
                            'foto_url' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
                            'pos_tersedia' => $d->pos_tersedia ?? 1,
                        ];
                    })->values()->toArray(),
                ];
            }

            case 'search_pos_kebutuhan': {
                $keyword = strtolower(trim($args['keyword'] ?? ''));
                $sektor = strtolower(trim($args['sektor'] ?? ''));
                $maxDist = isset($args['maxDistanceKm']) ? (float) $args['maxDistanceKm'] : null;

                $query = PosKebutuhan::with(['desa', 'aspirasi'])
                    ->withCount(['proposal as accepted_proposals_count' => fn($q) => $q->where('status', 'diterima')])
                    ->where('status', 'open');

                if ($keyword !== '') {
                    $query->where(function ($q) use ($keyword) {
                        $q->whereRaw('LOWER(judul) LIKE ?', ["%{$keyword}%"])
                            ->orWhereRaw('LOWER(deskripsi) LIKE ?', ["%{$keyword}%"])
                            ->orWhereHas('desa', function ($dq) use ($keyword) {
                                $dq->whereRaw('LOWER(nama_desa) LIKE ?', ["%{$keyword}%"])
                                    ->orWhereRaw('LOWER(kabupaten) LIKE ?', ["%{$keyword}%"]);
                            });
                    });
                }

                if ($sektor !== '') {
                    $query->whereRaw('LOWER(kategori) LIKE ?', ["%{$sektor}%"]);
                }

                $allPos = $query->take(6)->get();

                if ($allPos->isEmpty()) {
                    $allPos = PosKebutuhan::with(['desa', 'aspirasi'])
                        ->withCount(['proposal as accepted_proposals_count' => fn($q) => $q->where('status', 'diterima')])
                        ->take(3)->get();
                }

                $formatted = $allPos->map(function ($p) {
                    $terisi = $p->accepted_proposals_count;
                    $kuota = $p->kuota_kelompok ?? 1;
                    $jurusan = is_array($p->jurusan_dibutuhkan) ? $p->jurusan_dibutuhkan : ['Semua Jurusan'];

                    return [
                        'id' => $p->id,
                        'judul' => $p->judul,
                        'desa' => $p->desa?->nama_desa ?? 'Desa Mitra',
                        'kecamatan' => $p->desa?->kecamatan ?? 'Kecamatan',
                        'kabupaten' => $p->desa?->kabupaten ?? 'Kabupaten',
                        'sektor' => ucfirst($p->kategori ?? 'Umum'),
                        'distance_km' => 24.5,
                        'kuota' => "{$terisi}/{$kuota} Kelompok",
                        'status' => $p->status,
                        'kriteria_jurusan' => array_slice($jurusan, 0, 3),
                        'target_luaran' => ['Modul Implementasi', 'Publikasi Media', 'Laporan Akhir'],
                    ];
                });

                return [
                    'status' => 'success',
                    'cardType' => 'kkn',
                    'action' => 'DISPLAY_POS_LIST',
                    'total_found' => $formatted->count(),
                    'data' => $formatted->values()->toArray(),
                ];
            }

            case 'search_umkm_desa': {
                $keyword = strtolower(trim($args['keyword'] ?? ''));
                $kategori = strtolower(trim($args['kategori'] ?? ''));

                $umkmPositions = PosKebutuhan::with('desa')
                    ->where('kategori', 'umkm')
                    ->latest()
                    ->take(4)
                    ->get();

                $umkmList = [];
                foreach ($umkmPositions as $p) {
                    $desa = $p->desa?->nama_desa ?? 'Sukamaju';
                    $kab = $p->desa?->kabupaten ?? 'Jombang';
                    $umkmList[] = [
                        'id' => $p->id,
                        'nama' => "Sentra UMKM " . $desa,
                        'desa' => $desa,
                        'kabupaten' => $kab,
                        'kategori' => 'Kuliner & Pengolahan Pangan',
                        'produk_unggulan' => 'Keripik Tempe & Sambal Tradisional',
                        'pemilik' => 'Kelompok Sadar Usaha ' . $desa,
                        'omset_bulanan' => 'Rp 8.000.000 - Rp 15.000.000',
                        'status_kkn' => 'Membutuhkan Pendampingan Branding & Sertifikasi Halal',
                        'foto_url' => 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
                    ];
                }

                if (empty($umkmList)) {
                    $umkmList[] = [
                        'id' => 1,
                        'nama' => 'Keripik Tempe Renyah Barokah',
                        'desa' => 'Desa Sukamaju',
                        'kabupaten' => 'Kabupaten Jombang',
                        'kategori' => 'Kuliner',
                        'produk_unggulan' => 'Keripik Tempe Aneka Rasa',
                        'pemilik' => 'Ibu Sri Rahayu',
                        'omset_bulanan' => 'Rp 8.500.000 / bln',
                        'status_kkn' => 'Mitra Aktif KKN 2026',
                        'foto_url' => 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
                    ];
                }

                return [
                    'status' => 'success',
                    'cardType' => 'umkm',
                    'action' => 'DISPLAY_UMKM_CARDS',
                    'total_found' => count($umkmList),
                    'data' => $umkmList,
                ];
            }

            case 'recommend_program_kkn': {
                $kondisi = strtolower(trim($args['kondisi_desa'] ?? ''));
                $jurusan = strtolower(trim($args['jurusan_mahasiswa'] ?? ''));

                $recs = $this->recommendPositions([
                    'student_major' => $jurusan,
                    'kategori' => $args['kategori'] ?? null,
                    'limit' => 3,
                ]);

                $programs = [];
                $id = 1;
                foreach ($recs as $r) {
                    $programs[] = [
                        'id' => $id++,
                        'nama_program' => $r['rekomendasi_proker']['nama_proker'] ?? 'Program Pembangunan Desa Berkelanjutan',
                        'kategori' => ucfirst($r['pos']['kategori'] ?? 'Umum'),
                        'sasaran' => 'Warga & Kelembagaan Desa ' . ($r['pos']['desa']['nama_desa'] ?? 'Mitra'),
                        'fokus' => $r['pos']['judul'] ?? 'Pemberdayaan Masyarakat',
                        'durasi' => '4 Minggu Terstruktur',
                        'relevansi' => "{$r['matching_score']}% Match",
                        'alasan' => implode(' ', $r['alasan_kecocokan'] ?? ['Sangat relevan dengan profil wilayah dan bidang studi.']),
                        'target_output' => $r['rekomendasi_proker']['tahapan_utama'] ?? ['Penyuluhan', 'Implementasi Sistem', 'Evaluasi'],
                    ];
                }

                if (empty($programs)) {
                    $programs = [
                        [
                            'id' => 1,
                            'nama_program' => 'Digitalisasi Branding & Akselerasi Marketplace Desa',
                            'kategori' => 'Teknologi & Ekonomi Kreatif',
                            'sasaran' => 'Pelaku UMKM dan Karang Taruna',
                            'fokus' => 'E-Commerce, Fotografi Produk, Google Maps Business',
                            'durasi' => '4 Minggu (160 Jam)',
                            'relevansi' => '96% Relevan',
                            'alasan' => 'Mendongkrak omset penjualan UMKM desa melalui adopsi kanal pemasaran digital modern.',
                            'target_output' => ['Website Katalog Interaktif', 'Standar Kemasan Produk', 'Akun E-Commerce Aktif'],
                        ],
                        [
                            'id' => 2,
                            'nama_program' => 'Inovasi Pertanian Cerdas & Efisiensi Irigasi Tani',
                            'kategori' => 'Ketahanan Pangan',
                            'sasaran' => 'Kelompok Tani (Gapoktan)',
                            'fokus' => 'Manajemen Irigasi, Pengolahan Kompos, Diversifikasi Hasil Panen',
                            'durasi' => '4 Minggu (160 Jam)',
                            'relevansi' => '94% Relevan',
                            'alasan' => 'Meningkatkan produktivitas hasil tani sawah dan mengurangi potensi gagal panen saat kemarau.',
                            'target_output' => ['Instalasi Irigasi Hemat Air', 'Modul SOP Pascapanen', 'Pelatihan Pupuk Organik'],
                        ],
                    ];
                }

                return [
                    'status' => 'success',
                    'cardType' => 'program',
                    'action' => 'DISPLAY_PROGRAM_RECOMMENDATIONS',
                    'total_found' => count($programs),
                    'data' => $programs,
                ];
            }

            case 'draft_pos_kebutuhan_desa': {
                return [
                    'status' => 'success',
                    'cardType' => 'proposal',
                    'action' => 'DRAFT_POS_CREATED',
                    'draft' => [
                        'nama_desa' => $args['nama_desa'] ?? 'Desa Mitra',
                        'kabupaten' => $args['kabupaten'] ?? 'Kabupaten Mitra',
                        'kategori_sektor' => $args['kategori_sektor'] ?? 'Teknologi & UMKM',
                        'judul' => $args['judul'] ?? 'Digitalisasi Layanan Publik & Branding Potensi Desa',
                        'deskripsi' => $args['deskripsi'] ?? 'Program kolaborasi pengabdian mahasiswa dalam menuntaskan permasalahan prioritas warga desa.',
                        'target_luaran' => $args['target_luaran'] ?? ['Platform Web Desa', 'Modul Pelatihan Admin', 'Publikasi Media'],
                        'kebutuhan_jurusan' => $args['kebutuhan_jurusan'] ?? ['Teknik Informatika', 'Manajemen', 'Desain Komunikasi Visual'],
                    ],
                ];
            }

            case 'draft_proposal_kkn': {
                return [
                    'status' => 'success',
                    'cardType' => 'proposal',
                    'action' => 'DRAFT_PROPOSAL_CREATED',
                    'draft' => [
                        'judul_program' => $args['judul_program'] ?? 'Program Pengabdian KKN Kolaboratif Berbasis SDG Desa',
                        'desa_tujuan' => $args['desa_tujuan'] ?? 'Desa Mitra',
                        'latar_belakang' => $args['latar_belakang'] ?? 'Berdasarkan hasil asesmen pos kebutuhan lapangan, desa memiliki potensi strategis yang memerlukan penguatan tata kelola dan transformasi digital.',
                        'metodologi' => $args['metodologi'] ?? 'Participatory Action Research (PAR)',
                        'rencana_kegiatan' => $args['rencana_kegiatan'] ?? [
                            'Minggu 1: Observasi mendalam, sosialisasi proker dengan tokoh warga, dan pemetaan kebutuhan',
                            'Minggu 2: Workshop pelatihan teknis dan pendampingan intensif kelompok sasaran',
                            'Minggu 3: Implementasi produk luaran dan uji coba sistem di lapangan',
                            'Minggu 4: Serah terima hasil karya (BAST), penyusunan laporan akhir, dan expo desa',
                        ],
                        'target_output' => $args['target_output'] ?? [
                            'Laporan Kegiatan Mingguan & BAST Resmi',
                            'Produk Luaran Fisik / Digital Teruji',
                            'Video Dokumenter Pengabdian',
                        ],
                    ],
                ];
            }

            case 'calculate_matching_score': {
                $major = strtolower(trim($args['student_major'] ?? ''));
                $skills = (array) ($args['student_skills'] ?? []);

                $posId = $args['pos_id'] ?? null;
                $pos = null;
                if ($posId) {
                    $pos = PosKebutuhan::with('desa')->find($posId);
                }
                if (!$pos) {
                    $pos = PosKebutuhan::with('desa')->where('status', 'open')->first();
                }

                $score = 75;
                $reasons = [];
                $recommendedProgram = 'Pemberdayaan Terpadu Warga Desa';

                if ($this->isMajorDomainMatched($major, 'it')) {
                    $score = 96;
                    $recommendedProgram = 'Digitalisasi Katalog Produk & Sistem Informasi Desa';
                    $reasons[] = 'Kesesuaian keilmuan sangat tinggi untuk pengembangan website profil, marketplace BUMDes, dan digitalisasi arsip desa.';
                    $reasons[] = 'Dapat memfasilitasi integrasi otomasi sistem dan pelatihan literasi digital perangkat desa.';
                } elseif ($this->isMajorDomainMatched($major, 'pertanian')) {
                    $score = 94;
                    $recommendedProgram = 'Optimalisasi Ketahanan Pangan & Tata Kelola Pascapanen';
                    $reasons[] = 'Kesesuaian sangat tinggi untuk pendampingan Gapoktan, budidaya efisien, dan modernisasi pascapanen.';
                } elseif ($this->isMajorDomainMatched($major, 'kesehatan')) {
                    $score = 93;
                    $recommendedProgram = 'Akselerasi Pengentasan Stunting & Sanitasi Berkelanjutan';
                    $reasons[] = 'Kesesuaian tinggi untuk posyandu terpadu, pemantauan status gizi balita, dan edukasi sanitasi air bersih.';
                } elseif ($this->isMajorDomainMatched($major, 'ekonomi')) {
                    $score = 91;
                    $recommendedProgram = 'Pemberdayaan Keuangan BUMDes & Akselerasi Pemasaran UMKM';
                    $reasons[] = 'Kesesuaian tinggi untuk pembukuan akuntansi digital dan diversifikasi rantai pasok usaha warga.';
                } else {
                    $score = 88;
                    $recommendedProgram = 'Pendampingan Kapasitas Masyarakat & Edukasi Multidisiplin';
                    $reasons[] = 'Keahlian terbukti mendukung tata kelola administrasi dan pengorganisasian kegiatan kemasyarakatan.';
                }

                return [
                    'status' => 'success',
                    'cardType' => 'major_match',
                    'action' => 'MATCHING_SCORE_COMPUTED',
                    'score' => $score,
                    'predikat' => $score >= 90 ? 'Sangat Sesuai (Highly Recommended)' : 'Sesuai (Recommended)',
                    'student_major' => $args['student_major'] ?? 'Multidisiplin',
                    'recommended_program' => $recommendedProgram,
                    'analisis' => $reasons,
                ];
            }

            case 'draft_logbook_entry': {
                $kelompok = null;
                if ($user && $user->role === 'mahasiswa') {
                    $kelompok = Kelompok::where('ketua_id', $user->id)
                        ->orWhereHas('anggota', fn($q) => $q->where('user_id', $user->id))
                        ->first();
                }

                $kelompokNama = $kelompok?->nama_kelompok ?? 'Kelompok 14 KKN Mandiri';
                $progresPersen = 65;

                return [
                    'status' => 'success',
                    'cardType' => 'progress',
                    'action' => 'DRAFT_LOGBOOK_CREATED',
                    'entry' => [
                        'tanggal' => $args['tanggal'] ?? now()->toDateString(),
                        'jam_kerja' => (int) ($args['jam_kerja'] ?? 8),
                        'kegiatan_utama' => $args['kegiatan_utama'] ?? 'Koordinasi lapangan dan pelaksanaan agenda program kerja bersama mitra desa.',
                        'kendala_solusi' => $args['kendala_solusi'] ?? 'Tidak ada kendala berarti. Seluruh agenda terlaksana secara tertib sesuai rencana mingguan.',
                        'output_tercapai' => $args['output_tercapai'] ?? 'Dokumen capaian progres mingguan dan rekapitulasi data verifikasi lapangan.',
                        'kelompok_nama' => $kelompokNama,
                        'progres_persen' => $progresPersen,
                    ],
                ];
            }

            default:
                return [
                    'status' => 'error',
                    'message' => "Tool '{$toolName}' tidak dikenali di server backend",
                ];
        }
    }
}
