<?php

namespace App\Services;

use App\Models\LaporanDosen;
use App\Models\ProfilDosen;
use App\Models\ProfilUniversitas;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UniversitasService
{
    public function __construct(
        protected NotificationService $notificationService,
        protected OtpService $otpService,
        protected AiDocumentAuditorService $aiAuditorService
    ) {}

    public function register(array $data, $skFile = null, $sptjmFile = null, $signatureFile = null): ProfilUniversitas
    {
        // 1. Resolve Official PDDikti / BAN-PT Accreditation & Kode PT
        $realAkreditasi = $data['akreditasi'] ?? 'Baik';
        $kodeUniv = $data['kode_univ'] ?? null;
        $isManual = !empty($data['is_manual_entry']);

        if (!$isManual && (!empty($kodeUniv) || !empty($data['nama_universitas']))) {
            $jsonPath = database_path('data/master_kampus_indonesia.json');
            if (file_exists($jsonPath)) {
                $allCampuses = json_decode(file_get_contents($jsonPath), true) ?: [];
                $qKode = strtolower(trim($kodeUniv ?? ''));
                $qNama = strtolower(trim($data['nama_universitas'] ?? ''));

                foreach ($allCampuses as $campus) {
                    if (
                        ($qKode && strtolower(trim($campus['kode_univ'] ?? '')) === $qKode) ||
                        ($qNama && strtolower(trim($campus['nama_universitas'] ?? '')) === $qNama)
                    ) {
                        $realAkreditasi = $campus['akreditasi'] ?? $realAkreditasi;
                        $kodeUniv = $campus['kode_univ'] ?? $kodeUniv;
                        break;
                    }
                }
            }
        }

        // 2. Anti-Claim Duplicate Protection (Zero-Trust Single-Master Policy)
        if (!empty($kodeUniv)) {
            $existing = ProfilUniversitas::where('kode_univ', $kodeUniv)->first();
            if ($existing) {
                throw ValidationException::withMessages([
                    'nama_universitas' => "Institusi Perguruan Tinggi ini ({$data['nama_universitas']}) telah terdaftar atau dalam proses peninjauan LPPM resmi. Demi keamanan dan integritas kelembagaan, satu universitas hanya memiliki 1 akun induk LPPM. Silakan hubungi admin utama institusi Anda.",
                ]);
            }
        }

        // 3. Store SK & SPTJM document files
        $skPath = null;
        if ($skFile) {
            $skPath = $skFile->store('sk-universitas', 'local');
        }

        $sptjmPath = null;
        if ($sptjmFile) {
            $sptjmPath = $sptjmFile->store('sptjm-universitas', 'local');
        }

        // 3b. Store Signature (File or Base64 Canvas)
        $signaturePath = null;
        if ($signatureFile) {
            $signaturePath = $signatureFile->store('signatures-universitas', 'local');
        } elseif (!empty($data['signature_data'])) {
            $base64Str = $data['signature_data'];
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Str, $type)) {
                $base64Str = substr($base64Str, strpos($base64Str, ',') + 1);
                $ext = strtolower($type[1]);
                if (!in_array($ext, ['jpg', 'jpeg', 'gif', 'png'])) {
                    $ext = 'png';
                }
                $decoded = base64_decode($base64Str);
                if ($decoded !== false) {
                    $sigFileName = 'signatures-universitas/sig_' . time() . '_' . uniqid() . '.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('local')->put($sigFileName, $decoded);
                    $signaturePath = $sigFileName;
                }
            }
        }

        // 4. Run AI Document & Fraud Risk Auditor (Gemini Flash Multimodal / Heuristic)
        $aiAudit = $this->aiAuditorService->auditRegistrationDocument($skPath, [
            'name' => $data['name'],
            'email' => $data['email'],
            'nama_universitas' => $data['nama_universitas'],
            'nip_admin' => $data['nip_admin'] ?? '',
            'kode_univ' => $kodeUniv,
        ]);

        // 5. Create User
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone_wa' => $data['phone_wa'] ?? null,
            'role' => 'universitas',
            'is_verified' => false,
        ]);

        // 6. Create Profil Universitas with AI Audit Result and Legalitas fields
        $univ = ProfilUniversitas::create([
            'user_id' => $user->id,
            'nama_universitas' => $data['nama_universitas'],
            'kode_univ' => $kodeUniv,
            'sk_file_url' => $skPath,
            'sptjm_file_url' => $sptjmPath,
            'tanda_tangan_url' => $signaturePath,
            'is_manual_entry' => $isManual,
            'website_kampus' => $data['website_kampus'] ?? null,
            'nomor_sk' => $data['nomor_sk'] ?? ($aiAudit['extracted_data']['nomor_sk'] ?? null),
            'judul_sk' => $data['judul_sk'] ?? ($aiAudit['extracted_data']['judul_sk'] ?? null),
            'pejabat_penandatangan' => $data['pejabat_penandatangan'] ?? ($aiAudit['extracted_data']['nama_pejabat'] ?? null),
            'berlaku_sampai' => $data['berlaku_sampai'] ?? ($aiAudit['extracted_data']['berlaku_sampai'] ?? null),
            'nip_admin' => $data['nip_admin'] ?? null,
            'akreditasi' => $realAkreditasi,
            'alamat_kampus' => $data['alamat_kampus'] ?? null,
            'ai_audit_result' => $aiAudit,
            'ai_trust_score' => $aiAudit['trust_score'] ?? null,
            'verified_at' => null,
        ])->load('user');

        // Dispatch OTP registrasi
        $target = $user->phone_wa ?: $user->email;
        if ($target) {
            $this->otpService->generateAndSend($target, 'registration', 'whatsapp', $user);
        }

        return $univ;
    }

    public function verifyByAdmin(ProfilUniversitas $univ): ProfilUniversitas
    {
        $univ->update(['verified_at' => now()]);
        $univ->user()->update([
            'is_verified' => true,
            'account_status' => 'active',
        ]);

        return $univ->load('user');
    }

    public function suspend(ProfilUniversitas $univ): ProfilUniversitas
    {
        $univ->user()->update(['account_status' => 'suspended']);
        $univ->user->tokens()->delete();
        return $univ;
    }

    public function activate(ProfilUniversitas $univ): ProfilUniversitas
    {
        $univ->update(['verified_at' => now()]);
        $univ->user()->update([
            'is_verified' => true,
            'account_status' => 'active',
        ]);
        return $univ;
    }

    public function createDosen(User $userUniv, array $data): ProfilDosen
    {
        $univ = $userUniv->profilUniversitas;

        if (!$univ || !$univ->verified_at) {
            throw ValidationException::withMessages([
                'universitas' => 'Institusi universitas belum diverifikasi oleh admin platform.',
            ]);
        }

        $userDosen = User::create([
            'name' => $data['name'],
            'email' => strtolower(trim($data['email'])),
            'password' => !empty($data['password']) ? Hash::make($data['password']) : null,
            'phone_wa' => $data['no_hp'] ?? $data['phone_wa'] ?? null,
            'role' => 'dosen',
            'is_verified' => true,
            'account_status' => 'active',
        ]);

        return ProfilDosen::create([
            'user_id' => $userDosen->id,
            'universitas_id' => $univ->id,
            'ditambahkan_oleh' => $userUniv->id,
            'nip' => $data['nip'],
            'no_hp' => $data['no_hp'] ?? $data['phone_wa'] ?? null,
        ])->load('user', 'universitas');
    }

    public function createMahasiswa(User $userUniv, array $data): \App\Models\ProfilMahasiswa
    {
        $univ = $userUniv->profilUniversitas;

        if (!$univ || !$univ->verified_at) {
            throw ValidationException::withMessages([
                'universitas' => 'Institusi universitas belum diverifikasi oleh admin platform.',
            ]);
        }

        $userMhs = User::create([
            'name' => $data['name'],
            'email' => strtolower(trim($data['email'])),
            'password' => !empty($data['password']) ? Hash::make($data['password']) : null,
            'phone_wa' => $data['phone_wa'] ?? null,
            'role' => 'mahasiswa',
            'is_verified' => true,
            'account_status' => 'active',
        ]);

        return \App\Models\ProfilMahasiswa::create([
            'user_id' => $userMhs->id,
            'universitas_id' => $univ->id,
            'nim' => $data['nim'],
            'jurusan' => $data['jurusan'],
            'semester' => $data['semester'] ?? 5,
            'ktm_file_url' => $data['ktm_file_url'] ?? null,
            'verified_at' => now(),
        ])->load('user', 'universitas');
    }

    public function batchCreateMahasiswa(User $userUniv, array $students): array
    {
        $results = [];
        foreach ($students as $data) {
            $results[] = $this->createMahasiswa($userUniv, $data);
        }
        return $results;
    }

    public function batchCreateDosen(User $userUniv, array $lecturers): array
    {
        $results = [];
        foreach ($lecturers as $data) {
            $results[] = $this->createDosen($userUniv, $data);
        }
        return $results;
    }

    public function listDosenByUniv(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        return ProfilDosen::where('universitas_id', $univId)
            ->with('user', 'kelompokBinaan')
            ->get();
    }

    public function listLaporanDosen(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        return LaporanDosen::whereHas('dosen', fn($q) => $q->where('universitas_id', $univId))
            ->with('dosen.user', 'desa', 'proposal.posKebutuhan')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function updateStatusLaporan(LaporanDosen $laporan, User $userUniv, string $status): LaporanDosen
    {
        $laporan->load('dosen');

        if (!$userUniv->profilUniversitas || $laporan->dosen->universitas_id !== $userUniv->profilUniversitas->id) {
            abort(403, 'Anda tidak memiliki wewenang untuk meninjau laporan ini.');
        }

        $laporan->update(['status' => $status]);

        $laporan->load('dosen.user', 'desa.user');
        if ($laporan->desa && $laporan->desa->user_id) {
            $this->notificationService->send(
                $laporan->desa->user_id,
                "Universitas telah meninjau laporan evaluasi kinerja DPL dengan status: " . strtoupper($status) . "."
            );
        }

        return $laporan;
    }

    public function getMasterList(?string $search = null)
    {
        $acronyms = [
            'unesa' => 'universitas negeri surabaya',
            'its' => 'sepuluh nopember',
            'unair' => 'airlangga',
            'ub' => 'brawijaya',
            'ugm' => 'gadjah mada',
            'ui' => 'universitas indonesia',
            'itb' => 'teknologi bandung',
            'ipb' => 'pertanian bogor',
            'undip' => 'diponegoro',
            'uns' => 'sebelas maret',
            'unpad' => 'padjadjaran',
            'unhas' => 'hasanuddin',
            'um' => 'negeri malang',
            'uny' => 'negeri yogyakarta',
            'upi' => 'pendidikan indonesia',
            'unej' => 'universitas jember',
            'upn' => 'upn veteran',
            'binus' => 'bina nusantara',
            'telkom' => 'universitas telkom',
            'tel-u' => 'universitas telkom',
            'pancasila' => 'universitas pancasila',
            'trisakti' => 'universitas trisakti',
            'untar' => 'universitas tarumanagara',
            'uajy' => 'atma jaya',
            'unpar' => 'parahyangan',
            'petra' => 'kristen petra',
            'pcu' => 'kristen petra',
            'umm' => 'muhammadiyah malang',
            'umy' => 'muhammadiyah yogyakarta',
            'ums' => 'muhammadiyah surakarta',
            'unisma' => 'islam malang',
            'uii' => 'islam indonesia',
            'polinema' => 'politeknik negeri malang',
            'pens' => 'politeknik elektronika negeri surabaya',
            'ppns' => 'politeknik perkapalan negeri surabaya',
            'polban' => 'politeknik negeri bandung',
            'pnj' => 'politeknik negeri jakarta',
            'polines' => 'politeknik negeri semarang',
            'polmed' => 'politeknik negeri medan',
            'polsri' => 'politeknik negeri sriwijaya',
            'polije' => 'politeknik negeri jember',
            'polibatam' => 'politeknik negeri batam',
            'politala' => 'politeknik negeri tanah laut',
            'utm' => 'trunojoyo madura',
            'unand' => 'universitas andalas',
            'unri' => 'universitas riau',
            'usk' => 'syiah kuala',
            'unsyiah' => 'syiah kuala',
            'unsrat' => 'sam ratulangi',
            'untad' => 'tadulako',
            'uncen' => 'cenderawasih',
            'unram' => 'mataram',
            'unpatti' => 'pattimura',
            'unsoed' => 'soedirman',
            'unnes' => 'negeri semarang',
            'unm' => 'negeri makassar',
            'unp' => 'negeri padang',
            'unimed' => 'negeri medan',
            'unj' => 'negeri jakarta',
            'unsri' => 'sriwijaya',
            'untan' => 'tanjungpura',
            'unmul' => 'mulawarman',
            'unila' => 'universitas lampung',
            'ulm' => 'lambung mangkurat',
            'unib' => 'universitas bengkulu',
            'uho' => 'halu oleo',
            'unkhair' => 'khairun',
            'unimal' => 'malikussaleh',
            'umrah' => 'maritim raja ali haji',
            'ubb' => 'bangka belitung',
            'ubt' => 'borneo tarakan',
            'musamus' => 'musamus merauke',
            'unsam' => 'universitas samudra',
            'unsil' => 'siliwangi',
            'usn' => 'sembilanbelas november',
            'untidar' => 'tidar',
            'utu' => 'teuku umar',
            'umsida' => 'universitas muhammadiyah sidoarjo',
            'unusida' => 'universitas nahdlatul ulama sidoarjo',
            'umaha' => 'universitas maarif hasyim latif',
            'unusa' => 'universitas nahdlatul ulama surabaya',
            'ubaya' => 'universitas surabaya',
            'ukwms' => 'katolik widya mandala surabaya',
            'untag' => '17 agustus 1945',
            'unitomo' => 'dr. soetomo',
            'ubhara' => 'bhayangkara surabaya',
            'uwks' => 'wijaya kusuma surabaya',
            'uht' => 'hang tuah',
            'unnar' => 'narotama',
            'unipa' => 'pgri adi buana',
            'undika' => 'dinamika',
            'uad' => 'ahmad dahlan',
            'ump' => 'muhammadiyah purwokerto',
            'unimus' => 'muhammadiyah semarang',
            'unimma' => 'muhammadiyah magelang',
            'uhamka' => 'muhammadiyah prof. dr. hamka',
            'umj' => 'muhammadiyah jakarta',
            'umsu' => 'muhammadiyah sumatera utara',
            'umri' => 'muhammadiyah riau',
            'unismuh' => 'muhammadiyah makassar',
            'umpalembang' => 'muhammadiyah palembang',
            'umb' => 'mercu buana',
            'umkt' => 'muhammadiyah kalimantan timur',
            'umk' => 'muria kudus',
            'ummat' => 'muhammadiyah mataram',
            'ubsi' => 'bina sarana informatika',
            'gunadarma' => 'gunadarma',
            'uph' => 'pelita harapan',
            'umn' => 'multimedia nusantara',
            'udinus' => 'dian nuswantoro',
            'uksw' => 'satya wacana',
            'usd' => 'sanata dharma',
        ];

        // 1. Load Master Dataset (2,850 clean Indonesian colleges & universities)
        $jsonPath = database_path('data/master_kampus_indonesia.json');
        $allCampuses = \Illuminate\Support\Facades\Cache::rememberForever('master_kampus_indonesia', function () use ($jsonPath) {
            if (file_exists($jsonPath)) {
                return json_decode(file_get_contents($jsonPath), true) ?: [];
            }
            return [];
        });

        // 2. Local Database Registered Universities
        $dbUnivs = ProfilUniversitas::all()->map(function ($u) {
            return [
                'nama_universitas' => $u->nama_universitas,
                'kode_univ' => $u->kode_univ,
                'akreditasi' => $u->akreditasi ?: 'Unggul',
                'alamat_kampus' => $u->alamat_kampus ?: '',
                'provinsi' => 'Indonesia',
                'kabupaten_kota' => '',
                'kelompok' => 'PTN',
                'is_verified' => !is_null($u->verified_at),
            ];
        })->toArray();

        // 3. Search Mode
        if (!empty($search) && strlen(trim($search)) >= 2) {
            $rawQuery = strtolower(trim($search));
            $effectiveQuery = $acronyms[$rawQuery] ?? $rawQuery;

            $matches = [];
            $seen = [];

            // Check registered DB first
            foreach ($dbUnivs as $u) {
                if (
                    str_contains(strtolower($u['nama_universitas']), $rawQuery) ||
                    str_contains(strtolower($u['kode_univ']), $rawQuery)
                ) {
                    $key = strtolower($u['nama_universitas']);
                    if (!isset($seen[$key])) {
                        $matches[] = $u;
                        $seen[$key] = true;
                    }
                }
            }

            // Search 2,850 master campuses
            foreach ($allCampuses as $c) {
                $cName = strtolower($c['nama_universitas']);
                $cSingkat = strtolower($c['nama_singkat'] ?? '');
                $cKode = strtolower($c['kode_univ'] ?? '');
                $cKab = strtolower($c['kabupaten_kota'] ?? '');
                $cProv = strtolower($c['provinsi'] ?? '');

                if (
                    str_contains($cName, $effectiveQuery) ||
                    str_contains($cName, $rawQuery) ||
                    ($cSingkat && str_contains($cSingkat, $rawQuery)) ||
                    str_contains($cKode, $rawQuery) ||
                    str_contains($cKab, $rawQuery) ||
                    str_contains($cProv, $rawQuery)
                ) {
                    $key = $cName;
                    if (!isset($seen[$key])) {
                        $matches[] = [
                            'nama_universitas' => $c['nama_universitas'],
                            'nama_singkat' => $c['nama_singkat'] ?? null,
                            'kode_univ' => $c['kode_univ'],
                            'jenis' => $c['jenis'] ?? 'universitas',
                            'kelompok' => $c['kelompok'] ?? 'PTS',
                            'akreditasi' => $c['akreditasi'] ?? 'Unggul',
                            'alamat_kampus' => $c['alamat_kampus'] ?? ($c['kabupaten_kota'] . ', ' . $c['provinsi']),
                            'provinsi' => $c['provinsi'] ?? '',
                            'kabupaten_kota' => $c['kabupaten_kota'] ?? '',
                            'website' => $c['website'] ?? null,
                            'latitude' => $c['latitude'] ?? null,
                            'longitude' => $c['longitude'] ?? null,
                            'is_verified' => false,
                        ];
                        $seen[$key] = true;
                        if (count($matches) >= 35) break;
                    }
                }
            }

            return collect($matches)->values();
        }

        // 4. Default Mode (Initial Load without search query)
        // Return registered DB universities + top diverse national institutions across Indonesia
        $defaultMaster = array_slice($allCampuses, 0, 35);
        $formattedDefaults = array_map(function ($c) {
            return [
                'nama_universitas' => $c['nama_universitas'],
                'nama_singkat' => $c['nama_singkat'] ?? null,
                'kode_univ' => $c['kode_univ'],
                'jenis' => $c['jenis'] ?? 'universitas',
                'kelompok' => $c['kelompok'] ?? 'PTN',
                'akreditasi' => $c['akreditasi'] ?? 'Unggul',
                'alamat_kampus' => $c['alamat_kampus'] ?? ($c['kabupaten_kota'] . ', ' . $c['provinsi']),
                'provinsi' => $c['provinsi'] ?? '',
                'kabupaten_kota' => $c['kabupaten_kota'] ?? '',
                'website' => $c['website'] ?? null,
                'latitude' => $c['latitude'] ?? null,
                'longitude' => $c['longitude'] ?? null,
                'is_verified' => false,
            ];
        }, $defaultMaster);

        return collect(array_merge($dbUnivs, $formattedDefaults))->unique('nama_universitas')->values();
    }

    public function listVerifiedPublic()
    {
        return ProfilUniversitas::whereNotNull('verified_at')
            ->select('id', 'nama_universitas', 'kode_univ')
            ->get();
    }

    /**
     * Metrik & statistik KKN khusus lingkup institusi kampus sendiri (LPPM).
     */
    public function getCampusMetrics(User $userUniv): array
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        // 1. Dosen & Mahasiswa internal kampus
        $totalDosen = ProfilDosen::where('universitas_id', $univId)->count();
        $totalMahasiswa = \App\Models\ProfilMahasiswa::where('universitas_id', $univId)->count();

        // 2. Kelompok KKN bimbingan dosen kampus atau mahasiswa kampus
        $kelompokQuery = \App\Models\Kelompok::where(function ($q) use ($univId) {
            $q->whereHas('dosen', fn($dq) => $dq->where('universitas_id', $univId))
              ->orWhereHas('ketua.profilMahasiswa', fn($mq) => $mq->where('universitas_id', $univId));
        });

        $totalKelompok = $kelompokQuery->count();
        $kelompokIds = (clone $kelompokQuery)->pluck('id');

        // 3. Jam Pengabdian Mahasiswa Kampus
        $progressReports = \App\Models\ProgressMingguan::whereHas('proposal', function ($q) use ($kelompokIds) {
            $q->whereIn('kelompok_id', $kelompokIds);
        })->with('proposal.kelompok.anggota')->get();

        $totalJamPengabdian = (int) $progressReports->sum(function ($p) {
            $anggotaCount = $p->proposal?->kelompok?->anggota?->count() ?: 1;
            return $anggotaCount * 40;
        });

        // 4. Status Proposal Kampus
        $proposals = \App\Models\Proposal::whereIn('kelompok_id', $kelompokIds)->get();
        $proposalBreakdown = [
            'total' => $proposals->count(),
            'menunggu' => $proposals->where('status', 'menunggu')->count(),
            'diterima' => $proposals->where('status', 'diterima')->count(),
            'ditolak' => $proposals->where('status', 'ditolak')->count(),
        ];

        // 5. Luaran Terverifikasi
        $totalLuaranTerverifikasi = \App\Models\LuaranAkhir::where('status_verifikasi', 'verified')
            ->whereHas('proposal', fn($q) => $q->whereIn('kelompok_id', $kelompokIds))
            ->count();

        // 6. Desa Terbantu Mitra Kampus
        $desaTerbantu = \App\Models\PosKebutuhan::whereHas('proposal', function ($q) use ($kelompokIds) {
            $q->whereIn('kelompok_id', $kelompokIds)->where('status', 'diterima');
        })->distinct('desa_id')->count('desa_id');

        // 7. Kontribusi SDGs Kampus
        $sdgCodes = \App\Models\PosKebutuhan::whereHas('proposal', function ($q) use ($kelompokIds) {
            $q->whereIn('kelompok_id', $kelompokIds)->where('status', 'diterima');
        })->pluck('sdg_codes');

        $sdgsDistribution = [];
        foreach ($sdgCodes as $codes) {
            if (is_array($codes)) {
                foreach ($codes as $c) {
                    $key = is_numeric($c) ? 'SDG ' . $c : (string) $c;
                    $sdgsDistribution[$key] = ($sdgsDistribution[$key] ?? 0) + 1;
                }
            }
        }
        ksort($sdgsDistribution);

        return [
            'campus_name' => $userUniv->profilUniversitas?->nama_universitas,
            'kode_univ' => $userUniv->profilUniversitas?->kode_univ,
            'total_dosen' => $totalDosen,
            'total_mahasiswa' => $totalMahasiswa,
            'total_kelompok_kkn' => $totalKelompok,
            'total_desa_terbantu' => $desaTerbantu,
            'total_jam_pengabdian' => $totalJamPengabdian,
            'total_luaran_terverifikasi' => $totalLuaranTerverifikasi,
            'status_proposal_breakdown' => $proposalBreakdown,
            'sdgs_distribution' => $sdgsDistribution,
        ];
    }

    /**
     * Monitoring kelompok KKN khusus bimbingan kampus sendiri.
     */
    public function listKelompokByUniv(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        return \App\Models\Kelompok::where(function ($q) use ($univId) {
            $q->whereHas('dosen', fn($dq) => $dq->where('universitas_id', $univId))
              ->orWhereHas('ketua.profilMahasiswa', fn($mq) => $mq->where('universitas_id', $univId));
        })
        ->with([
            'ketua.profilMahasiswa',
            'dosen.user',
            'anggota.user.profilMahasiswa',
            'proposal.posKebutuhan.desa',
            'proposal.progressMingguan',
            'proposal.luaranAkhir'
        ])
        ->get();
    }

    /**
     * Audit log & rekam jejak aktivitas civitas kampus sendiri.
     */
    public function listAuditLogsByUniv(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        $userUnivIds = User::where('id', $userUniv->id)
            ->orWhereHas('profilDosen', fn($q) => $q->where('universitas_id', $univId))
            ->orWhereHas('profilMahasiswa', fn($q) => $q->where('universitas_id', $univId))
            ->pluck('id');

        return \App\Models\Notifikasi::whereIn('user_id', $userUnivIds)
            ->with('user')
            ->latest()
            ->take(50)
            ->get();
    }

    /**
     * Monitoring seluruh logbook harian / mingguan kelompok KKN civitas kampus sendiri.
     */
    public function listLogbookByUniv(User $userUniv)
    {
        $univId = $userUniv->profilUniversitas?->id;
        if (!$univId) {
            abort(403, 'Profil universitas tidak ditemukan.');
        }

        $kelompokIds = \App\Models\Kelompok::where(function ($q) use ($univId) {
            $q->whereHas('dosen', fn($dq) => $dq->where('universitas_id', $univId))
              ->orWhereHas('ketua.profilMahasiswa', fn($mq) => $mq->where('universitas_id', $univId));
        })->pluck('id');

        return \App\Models\ProgressMingguan::whereHas('proposal', fn($q) => $q->whereIn('kelompok_id', $kelompokIds))
            ->with([
                'proposal.kelompok.ketua.profilMahasiswa',
                'proposal.kelompok.dosen.user',
                'proposal.posKebutuhan.desa'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
