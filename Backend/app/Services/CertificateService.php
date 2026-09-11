<?php

namespace App\Services;

use App\Models\PortofolioPublik;
use Illuminate\Support\Facades\Storage;

class CertificateService
{
    /**
     * Generate a valid PDF certificate file and store it in the public disk.
     */
    public function generate(PortofolioPublik $portofolio): string
    {
        $portofolio->load([
            'luaran.proposal.kelompok.ketua',
            'luaran.proposal.posKebutuhan.desa',
        ]);

        $slug = $portofolio->slug_public;
        $kelompok = $portofolio->luaran->proposal->kelompok->nama_kelompok ?? 'Kelompok Mahasiswa';
        $desa = $portofolio->luaran->proposal->posKebutuhan->desa->nama_desa ?? 'Pemerintah Desa';
        $program = $portofolio->luaran->proposal->posKebutuhan->judul ?? 'Pengabdian KKN';
        $date = now()->format('d F Y');

        $pdfContent = $this->buildPdfContent($kelompok, $desa, $program, $date, $slug);

        $path = "certificates/{$slug}.pdf";
        Storage::disk('public')->put($path, $pdfContent);

        return Storage::url($path);
    }

    /**
     * Build minimal, standard-compliant PDF 1.4 binary string.
     */
    protected function buildPdfContent(string $kelompok, string $desa, string $program, string $date, string $code): string
    {
        $kelompokSafe = addcslashes($kelompok, '()\\');
        $desaSafe = addcslashes($desa, '()\\');
        $programSafe = addcslashes($program, '()\\');
        $dateSafe = addcslashes($date, '()\\');
        $codeSafe = addcslashes($code, '()\\');

        $stream = "BT\n"
            . "/F1 24 Tf\n"
            . "50 750 Td\n"
            . "(SERTIFIKAT PENGABDIAN KKN BAKTINUSANTARA) Tj\n"
            . "/F1 12 Tf\n"
            . "0 -35 Td\n"
            . "(Nomor Verifikasi Digital: {$codeSafe}) Tj\n"
            . "/F1 14 Tf\n"
            . "0 -40 Td\n"
            . "(Diberikan Kepada:) Tj\n"
            . "/F1 18 Tf\n"
            . "0 -30 Td\n"
            . "({$kelompokSafe}) Tj\n"
            . "/F1 13 Tf\n"
            . "0 -35 Td\n"
            . "(Atas kontribusi dan dedikasi nyata dalam program pengabdian masyarakat:) Tj\n"
            . "/F1 15 Tf\n"
            . "0 -25 Td\n"
            . "(\"{$programSafe}\") Tj\n"
            . "/F1 13 Tf\n"
            . "0 -35 Td\n"
            . "(Telah diverifikasi dan disahkan secara resmi oleh:) Tj\n"
            . "/F1 16 Tf\n"
            . "0 -25 Td\n"
            . "({$desaSafe}) Tj\n"
            . "/F1 11 Tf\n"
            . "0 -40 Td\n"
            . "(Tanggal Pengesahan: {$dateSafe} | Status: VERIFIED BY VILLAGE) Tj\n"
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
}
