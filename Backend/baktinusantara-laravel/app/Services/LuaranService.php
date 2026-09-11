<?php

namespace App\Services;

use App\Models\LuaranAkhir;
use App\Models\PortofolioPublik;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LuaranService
{
    public function __construct(
        protected CertificateService $certificateService,
        protected NotificationService $notificationService
    ) {}

    protected function assertAnggotaKelompok(Proposal $proposal, User $user): void
    {
        $isMember = $proposal->kelompok->anggota()->where('user_id', $user->id)->exists()
            || $proposal->kelompok->ketua_id === $user->id;

        if (!$isMember) {
            abort(403, 'Anda bukan anggota dari kelompok pemilik proposal ini.');
        }
    }

    public function store(User $user, array $data, $file): LuaranAkhir
    {
        $proposal = Proposal::with('kelompok')->findOrFail($data['proposal_id']);

        $this->assertAnggotaKelompok($proposal, $user);

        if ($proposal->status !== 'diterima') {
            throw ValidationException::withMessages([
                'proposal' => 'Luaran akhir hanya dapat diunggah jika proposal berstatus diterima.',
            ]);
        }

        $existing = LuaranAkhir::where('proposal_id', $proposal->id)->first();
        if ($existing && $existing->status_verifikasi === 'verified') {
            throw ValidationException::withMessages([
                'luaran' => 'Luaran akhir untuk proposal ini sudah diverifikasi dan tidak dapat diubah.',
            ]);
        }

        // BAB 7.1: Simpan berkas ke private disk (local) sampai diverifikasi oleh desa
        $path = $file->store('luaran-deliverables', 'local');

        if ($existing) {
            $existing->update([
                'file_deliverable_url' => $path,
                'deskripsi' => $data['deskripsi'],
                'status_verifikasi' => 'menunggu',
            ]);
            $luaran = $existing;
        } else {
            $luaran = LuaranAkhir::create([
                'proposal_id' => $proposal->id,
                'file_deliverable_url' => $path,
                'deskripsi' => $data['deskripsi'],
                'status_verifikasi' => 'menunggu',
            ]);
        }

        $proposal->load('posKebutuhan.desa');
        if ($proposal->posKebutuhan && $proposal->posKebutuhan->desa && $proposal->posKebutuhan->desa->user_id) {
            $this->notificationService->send(
                $proposal->posKebutuhan->desa->user_id,
                "Kelompok '{$proposal->kelompok->nama_kelompok}' telah mengunggah luaran akhir KKN untuk divalidasi."
            );
        }

        return $luaran;
    }

    public function verifyByDesa(LuaranAkhir $luaran, User $user, array $data): PortofolioPublik
    {
        $luaran->load('proposal.posKebutuhan', 'proposal.kelompok.dosen');

        if (!$user->profilDesa || $luaran->proposal->posKebutuhan->desa_id !== $user->profilDesa->id) {
            abort(403, 'Anda tidak memiliki wewenang untuk memverifikasi luaran ini.');
        }

        // Publikasikan berkas deliverables dari private disk ke public disk
        $localPath = $luaran->file_deliverable_url;
        $publicUrl = $localPath;
        if (Storage::disk('local')->exists($localPath)) {
            $fileContent = Storage::disk('local')->get($localPath);
            $fileName = basename($localPath);
            $publicPath = "luaran-deliverables/{$fileName}";
            Storage::disk('public')->put($publicPath, $fileContent);
            $publicUrl = Storage::url($publicPath);
        }

        $luaran->update([
            'file_deliverable_url' => $publicUrl,
            'status_verifikasi' => 'verified',
            'disahkan_oleh' => $user->id,
            'disahkan_at' => now(),
        ]);

        $baseSlug = Str::slug($luaran->proposal->posKebutuhan->judul ?? 'portofolio-kkn');
        $slug = $baseSlug . '-' . Str::lower(Str::random(6));

        while (PortofolioPublik::where('slug_public', $slug)->exists()) {
            $slug = $baseSlug . '-' . Str::lower(Str::random(6));
        }

        $portofolio = PortofolioPublik::updateOrCreate(
            ['luaran_id' => $luaran->id],
            [
                'slug_public' => $slug,
                'ringkasan_dampak' => $data['ringkasan_dampak'],
                'testimoni_desa' => $data['testimoni_desa'],
                'published_at' => now(),
            ]
        );

        // Generate PDF Sertifikat Asli
        $certificateUrl = $this->certificateService->generate($portofolio);
        $portofolio->update(['sertifikat_pdf_url' => $certificateUrl]);

        // Kirim notifikasi ke ketua kelompok
        if ($luaran->proposal->kelompok && $luaran->proposal->kelompok->ketua_id) {
            $this->notificationService->send(
                $luaran->proposal->kelompok->ketua_id,
                "Selamat! Luaran akhir kelompok Anda telah divalidasi oleh desa '{$user->profilDesa->nama_desa}'. E-Portofolio publik dan sertifikat Anda telah terbit."
            );
        }

        // Kirim notifikasi ke dosen pembimbing jika ada
        if ($luaran->proposal->kelompok && $luaran->proposal->kelompok->dosen && $luaran->proposal->kelompok->dosen->user_id) {
            $this->notificationService->send(
                $luaran->proposal->kelompok->dosen->user_id,
                "Luaran akhir kelompok bimbingan '{$luaran->proposal->kelompok->nama_kelompok}' telah berhasil diverifikasi oleh desa."
            );
        }

        return $portofolio->load('luaran.proposal.kelompok', 'luaran.proposal.posKebutuhan.desa');
    }

    public function listByDesa(User $user)
    {
        $desaId = $user->profilDesa?->id;
        if (!$desaId) {
            abort(403, 'Profil desa tidak ditemukan.');
        }

        return LuaranAkhir::whereHas('proposal.posKebutuhan', fn($q) => $q->where('desa_id', $desaId))
            ->with('proposal.kelompok', 'proposal.posKebutuhan', 'portofolio')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getByProposal(Proposal $proposal, User $user): ?LuaranAkhir
    {
        $proposal->load('kelompok', 'posKebutuhan');

        $isMember = $proposal->kelompok->anggota()->where('user_id', $user->id)->exists()
            || $proposal->kelompok->ketua_id === $user->id;
        $isDesa = $user->profilDesa && $proposal->posKebutuhan->desa_id === $user->profilDesa->id;
        $isDosen = $user->profilDosen && $proposal->kelompok->dosen_id === $user->profilDosen->id;
        $isAdmin = $user->role === 'admin';

        if (!$isMember && !$isDesa && !$isDosen && !$isAdmin) {
            abort(403, 'Anda tidak memiliki wewenang untuk melihat luaran proposal ini.');
        }

        return $proposal->luaranAkhir()->with('portofolio', 'disahkanOleh')->first();
    }

    public function getPublicPortfolio(string $slug): PortofolioPublik
    {
        return PortofolioPublik::where('slug_public', $slug)
            ->with([
                'luaran' => function ($query) {
                    $query->select('id', 'proposal_id', 'file_deliverable_url', 'deskripsi', 'status_verifikasi', 'disahkan_at', 'disahkan_oleh');
                },
                'luaran.disahkanOleh' => function ($query) {
                    $query->select('id', 'name');
                },
                'luaran.disahkanOleh.profilDesa' => function ($query) {
                    $query->select('id', 'user_id', 'nama_desa', 'kecamatan', 'kabupaten', 'provinsi', 'verified_at');
                },
                'luaran.proposal' => function ($query) {
                    $query->select('id', 'kelompok_id', 'pos_kebutuhan_id', 'status', 'submitted_at');
                },
                'luaran.proposal.posKebutuhan' => function ($query) {
                    $query->select('id', 'desa_id', 'judul', 'deskripsi', 'kategori', 'sdg_codes');
                },
                'luaran.proposal.posKebutuhan.desa' => function ($query) {
                    $query->select('id', 'user_id', 'nama_desa', 'kecamatan', 'kabupaten', 'provinsi', 'verified_at');
                },
                'luaran.proposal.kelompok' => function ($query) {
                    $query->select('id', 'nama_kelompok', 'ketua_id', 'dosen_id');
                },
                'luaran.proposal.kelompok.ketua' => function ($query) {
                    $query->select('id', 'name');
                },
                'luaran.proposal.kelompok.anggota' => function ($query) {
                    $query->select('id', 'kelompok_id', 'user_id', 'jurusan_kontribusi', 'role_in_group');
                },
                'luaran.proposal.kelompok.anggota.user' => function ($query) {
                    $query->select('id', 'name');
                },
                'luaran.proposal.kelompok.anggota.user.profilMahasiswa' => function ($query) {
                    $query->select('id', 'user_id', 'universitas_id', 'nim', 'jurusan', 'semester');
                },
                'luaran.proposal.kelompok.anggota.user.profilMahasiswa.universitas' => function ($query) {
                    $query->select('id', 'nama_universitas', 'kode_univ');
                },
                'luaran.proposal.kelompok.dosen' => function ($query) {
                    $query->select('id', 'user_id', 'universitas_id', 'nip');
                },
                'luaran.proposal.kelompok.dosen.user' => function ($query) {
                    $query->select('id', 'name');
                },
                'luaran.proposal.kelompok.dosen.universitas' => function ($query) {
                    $query->select('id', 'nama_universitas', 'kode_univ');
                },
            ])
            ->firstOrFail();
    }
}
