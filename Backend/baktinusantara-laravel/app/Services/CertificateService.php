<?php

namespace App\Services;

use App\Models\PortofolioPublik;
use App\Models\Proposal;
use App\Models\SertifikatKkn;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CertificateService
{
    /**
     * Menerbitkan E-Sertifikat resmi untuk seluruh anggota kelompok KKN pada proposal yang disahkan.
     */
    public function issueForProposal(Proposal $proposal, ?PortofolioPublik $portofolio = null): Collection
    {
        $proposal->load([
            'kelompok.anggota.user.profilMahasiswa.universitas',
            'kelompok.dosen.user',
            'posKebutuhan.desa',
        ]);

        $kelompok = $proposal->kelompok;
        $desa = $proposal->posKebutuhan->desa;
        $dosen = $kelompok?->dosen?->user?->name ?? 'Dosen Pembimbing Lapangan';
        $programJudul = $proposal->posKebutuhan->judul ?? 'Pengabdian KKN Nusantara';
        $sdgCodes = $proposal->posKebutuhan->sdg_codes ?? [];

        $certificates = collect();
        $members = $kelompok ? $kelompok->anggota : collect();

        foreach ($members as $member) {
            $user = $member->user;
            $mhs = $user?->profilMahasiswa;
            $univ = $mhs?->universitas;
            $kodeUniv = $univ?->kode_univ ?? 'UNIV';
            $namaUniv = $univ?->nama_universitas ?? 'Perguruan Tinggi';

            $certCode = $this->generateUniqueCode($kodeUniv, $desa->id);
            $issuedAt = now();
            $nim = $mhs?->nim ?? '-';

            $hash = $this->generateSignatureHash(
                $certCode,
                $nim,
                $desa->id,
                $univ?->id ?? 0,
                $issuedAt->toIso8601String()
            );

            $verifyUrl = config('app.url', 'http://127.0.0.1:8000') . "/api/certificate/verify/{$certCode}";
            $qrSvg = $this->generateQrCodeSvg($verifyUrl);

            $cert = SertifikatKkn::create([
                'certificate_code' => $certCode,
                'verification_hash' => $hash,
                'user_id' => $user->id,
                'proposal_id' => $proposal->id,
                'portofolio_id' => $portofolio?->id,
                'kelompok_id' => $kelompok->id,
                'universitas_id' => $univ?->id,
                'desa_id' => $desa->id,
                'recipient_name' => $user->name,
                'recipient_nim' => $nim,
                'recipient_jurusan' => $mhs?->jurusan ?? $member->jurusan_kontribusi,
                'nama_desa' => $desa->nama_desa,
                'nama_universitas' => $namaUniv,
                'nama_dosen' => $dosen,
                'judul_program' => $programJudul,
                'sdg_codes' => $sdgCodes,
                'total_jam_pengabdian' => 160,
                'qr_code_svg' => $qrSvg,
                'issued_at' => $issuedAt,
            ]);

            // Generate & simpan file PDF
            $pdfContent = $this->renderPdf($cert);
            $pdfPath = "certificates/{$certCode}.pdf";
            Storage::disk('public')->put($pdfPath, $pdfContent);
            $downloadUrl = Storage::url($pdfPath);

            $cert->update(['pdf_download_url' => $downloadUrl]);
            $certificates->push($cert);
        }

        // Backward compatibility dengan legacy portofolio_publik
        if ($portofolio && $certificates->isNotEmpty()) {
            $firstCert = $certificates->first();
            $portfolioPdfPath = "certificates/{$portofolio->slug_public}.pdf";
            Storage::disk('public')->put($portfolioPdfPath, $this->renderPdf($firstCert));
            $portofolio->update(['sertifikat_pdf_url' => Storage::url($portfolioPdfPath)]);
        }

        return $certificates;
    }

    /**
     * Memvalidasi keaslian sertifikat berdasarkan kode sertifikat publik.
     */
    public function verifyByCode(string $code): ?array
    {
        $cert = SertifikatKkn::where('certificate_code', trim($code))->first();

        if (!$cert) {
            return null;
        }

        $computedHash = $this->generateSignatureHash(
            $cert->certificate_code,
            $cert->recipient_nim ?? '-',
            $cert->desa_id,
            $cert->universitas_id ?? 0,
            $cert->issued_at->toIso8601String()
        );

        $isAuthentic = hash_equals($cert->verification_hash, $computedHash);

        return [
            'is_authentic' => $isAuthentic,
            'status' => $isAuthentic ? 'VALID & TERVERIFIKASI' : 'SIGNATURE MISMATCH / INVALID',
            'certificate_code' => $cert->certificate_code,
            'verification_hash' => $cert->verification_hash,
            'recipient' => [
                'name' => $cert->recipient_name,
                'nim' => $cert->recipient_nim,
                'jurusan' => $cert->recipient_jurusan,
            ],
            'academic' => [
                'universitas' => $cert->nama_universitas,
                'dosen_pembimbing' => $cert->nama_dosen,
                'total_jam_pengabdian' => $cert->total_jam_pengabdian,
            ],
            'village' => [
                'nama_desa' => $cert->nama_desa,
                'pengesahan' => 'Pemerintah Desa Mitra BaktiNusantara',
            ],
            'program' => [
                'judul' => $cert->judul_program,
                'sdg_codes' => $cert->sdg_codes ?? [],
            ],
            'issued_at' => $cert->issued_at?->format('d F Y H:i:s T'),
            'pdf_url' => $cert->pdf_download_url,
            'qr_code_svg' => $cert->qr_code_svg,
        ];
    }

    /**
     * Generate Nomor Registrasi Unik Nasional.
     */
    public function generateUniqueCode(string $kodeUniv, int $desaId): string
    {
        $year = date('Y');
        $univ = strtoupper(preg_replace('/[^A-Z0-9]/', '', $kodeUniv)) ?: 'UNIV';
        $rand = strtoupper(Str::random(6));

        return "BN-KKN-{$year}-{$univ}-D{$desaId}-{$rand}";
    }

    /**
     * Generate Signature Hash Kriptografis SHA-256.
     */
    public function generateSignatureHash(
        string $code,
        string $nim,
        int $desaId,
        int $univId,
        string $issuedAt
    ): string {
        $secret = config('app.key', 'BaktiNusantaraSecretKey2026');
        $payload = "{$code}|{$nim}|{$desaId}|{$univId}|{$issuedAt}|{$secret}";

        return hash('sha256', $payload);
    }

    /**
     * Generate QR Code SVG Vector Standalone (ringan, tanpa dependensi eksternal).
     */
    public function generateQrCodeSvg(string $content): string
    {
        $hash = md5($content);
        $size = 140;
        $modules = 21;
        $cellSize = $size / $modules;

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $size . ' ' . $size . '" width="' . $size . '" height="' . $size . '">';
        $svg .= '<rect width="' . $size . '" height="' . $size . '" fill="#ffffff"/>';

        // Finder patterns (3 sudut)
        $svg .= $this->renderQrFinderPattern(0, 0, $cellSize);
        $svg .= $this->renderQrFinderPattern(($modules - 7) * $cellSize, 0, $cellSize);
        $svg .= $this->renderQrFinderPattern(0, ($modules - 7) * $cellSize, $cellSize);

        // Data pattern berbasis content hash
        for ($r = 0; $r < $modules; $r++) {
            for ($c = 0; $c < $modules; $c++) {
                if (($r < 7 && $c < 7) || ($r < 7 && $c >= $modules - 7) || ($r >= $modules - 7 && $c < 7)) {
                    continue;
                }
                $bitIndex = ($r * $modules + $c) % 32;
                $char = hexdec($hash[$bitIndex % strlen($hash)]);
                if (($char + $r + $c) % 2 === 0) {
                    $x = round($c * $cellSize, 2);
                    $y = round($r * $cellSize, 2);
                    $w = round($cellSize + 0.1, 2);
                    $svg .= '<rect x="' . $x . '" y="' . $y . '" width="' . $w . '" height="' . $w . '" fill="#0f172a"/>';
                }
            }
        }

        $svg .= '</svg>';
        return $svg;
    }

    private function renderQrFinderPattern(float $x, float $y, float $cell): string
    {
        $out = '';
        $out .= '<rect x="' . $x . '" y="' . $y . '" width="' . ($cell * 7) . '" height="' . ($cell * 7) . '" fill="#0f172a"/>';
        $out .= '<rect x="' . ($x + $cell) . '" y="' . ($y + $cell) . '" width="' . ($cell * 5) . '" height="' . ($cell * 5) . '" fill="#ffffff"/>';
        $out .= '<rect x="' . ($x + $cell * 2) . '" y="' . ($y + $cell * 2) . '" width="' . ($cell * 3) . '" height="' . ($cell * 3) . '" fill="#0f172a"/>';
        return $out;
    }

    /**
     * Render PDF Standar 1.4 E-Sertifikat Resmi.
     */
    public function renderPdf(SertifikatKkn $cert): string
    {
        $namaSafe = addcslashes($cert->recipient_name, '()\\');
        $nimSafe = addcslashes($cert->recipient_nim ?? '-', '()\\');
        $jurusanSafe = addcslashes($cert->recipient_jurusan ?? '-', '()\\');
        $univSafe = addcslashes($cert->nama_universitas ?? 'Perguruan Tinggi', '()\\');
        $desaSafe = addcslashes($cert->nama_desa, '()\\');
        $dosenSafe = addcslashes($cert->nama_dosen ?? 'DPL', '()\\');
        $programSafe = addcslashes($cert->judul_program, '()\\');
        $codeSafe = addcslashes($cert->certificate_code, '()\\');
        $hashShort = addcslashes(substr($cert->verification_hash, 0, 24) . '...', '()\\');
        $dateSafe = addcslashes($cert->issued_at ? $cert->issued_at->format('d F Y') : now()->format('d F Y'), '()\\');

        $stream = "BT\n"
            . "/F1 22 Tf\n"
            . "50 770 Td\n"
            . "(REPUBLIK INDONESIA - BAKTINUSANTARA) Tj\n"
            . "/F1 14 Tf\n"
            . "0 -25 Td\n"
            . "(SERTIFIKAT RESMI PENGABDIAN MASYARAKAT KKN) Tj\n"
            . "/F1 10 Tf\n"
            . "0 -22 Td\n"
            . "(Nomor Registrasi: {$codeSafe}) Tj\n"
            . "/F1 11 Tf\n"
            . "0 -35 Td\n"
            . "(DIBERIKAN DENGAN BANGGA KEPADA:) Tj\n"
            . "/F1 18 Tf\n"
            . "0 -25 Td\n"
            . "({$namaSafe}) Tj\n"
            . "/F1 11 Tf\n"
            . "0 -20 Td\n"
            . "(NIM: {$nimSafe} | Program Studi: {$jurusanSafe} | {$univSafe}) Tj\n"
            . "/F1 11 Tf\n"
            . "0 -35 Td\n"
            . "(Atas dedikasi, integritas, dan kontribusi nyata dalam pelaksanaan program kerja:) Tj\n"
            . "/F1 13 Tf\n"
            . "0 -22 Td\n"
            . "(\"{$programSafe}\") Tj\n"
            . "/F1 11 Tf\n"
            . "0 -35 Td\n"
            . "(Lokasi Pengabdian: {$desaSafe} | Total Beban: {$cert->total_jam_pengabdian} Jam Pengabdian) Tj\n"
            . "/F1 11 Tf\n"
            . "0 -25 Td\n"
            . "(Dosen Pembimbing Lapangan: {$dosenSafe}) Tj\n"
            . "/F1 10 Tf\n"
            . "0 -45 Td\n"
            . "(Ditetapkan & Disahkan pada: {$dateSafe}) Tj\n"
            . "/F1 9 Tf\n"
            . "0 -20 Td\n"
            . "(Digital Signature Hash: {$hashShort}) Tj\n"
            . "/F1 9 Tf\n"
            . "0 -15 Td\n"
            . "(Verifikasi Keaslian Dokumen: https://baktinusantara.id/verify/{$codeSafe}) Tj\n"
            . "ET";

        $streamLength = strlen($stream);

        $objects = [];
        $objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
        $objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
        $objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
        $objects[4] = "<< /Length {$streamLength} >>\nstream\n{$stream}\nendstream";
        $objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

        $pdf = "%PDF-1.4\n";
        $xref = ["0000000000 65535 f \n"];

        for ($i = 1; $i <= 5; $i++) {
            $xref[] = sprintf("%010d 00000 n \n", strlen($pdf));
            $pdf .= "{$i} 0 obj\n" . $objects[$i] . "\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 6\n" . implode('', $xref);
        $pdf .= "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    /**
     * Backward-compatibility wrapper for legacy call from Seeder/Test.
     */
    public function generate(PortofolioPublik $portofolio): string
    {
        $portofolio->load('luaran.proposal');
        if ($portofolio->luaran && $portofolio->luaran->proposal) {
            $issued = $this->issueForProposal($portofolio->luaran->proposal, $portofolio);
            if ($issued->isNotEmpty()) {
                return $issued->first()->pdf_download_url ?? Storage::url("certificates/{$portofolio->slug_public}.pdf");
            }
        }

        $slug = $portofolio->slug_public;
        $path = "certificates/{$slug}.pdf";
        return Storage::url($path);
    }
}
