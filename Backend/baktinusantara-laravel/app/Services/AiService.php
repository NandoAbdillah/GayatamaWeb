<?php

namespace App\Services;

use App\Models\ProfilDesa;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    /**
     * Analisis deskripsi aspirasi warga untuk mengekstrak desa, kategori, urgensi, dan SDGs.
     */
    public function parseAspirasi(string $text): array
    {
        $geminiKey = config('services.gemini.key');

        if (!empty($geminiKey)) {
            try {
                $aiResult = $this->callGeminiForAspirasi($text, $geminiKey);
                if ($aiResult) {
                    return $aiResult;
                }
            } catch (\Throwable $e) {
                Log::warning("Gemini AI API call failed, falling back to rule engine: " . $e->getMessage());
            }
        }

        return $this->ruleBasedParseAspirasi($text);
    }

    /**
     * Pemanggilan Gemini AI via REST API.
     */
    protected function callGeminiForAspirasi(string $text, string $key): ?array
    {
        $prompt = <<<PROMPT
Anda adalah asisten AI klasifikasi aspirasi masyarakat desa untuk platform BaktiNusantara.
Analisis pesan berikut dan ekstrak data ke dalam format JSON murni tanpa markdown:
{
  "desa_nama": "nama desa yang disebut atau null jika tidak ada",
  "kategori": "salah satu dari: umkm, kesehatan, lingkungan, pendidikan, fasilitas",
  "deskripsi": "ringkasan keluhan/masalah warga",
  "urgensi": "salah satu dari: rendah, sedang, mendesak",
  "sdg_codes": ["array nomor SDG misal 3, 4, 8, 11, 13"]
}

Pesan warga:
"{$text}"
PROMPT;

        $response = Http::timeout(5)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$key}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.1,
                ]
            ]);

        if ($response->successful()) {
            $jsonText = $response->json('candidates.0.content.parts.0.text');
            $data = json_decode($jsonText, true);
            if (is_array($data) && isset($data['kategori'])) {
                return $data;
            }
        }

        return null;
    }

    /**
     * Rule-based engine fallback (cepat, akurat, dan tidak bergantung koneksi eksternal).
     */
    public function ruleBasedParseAspirasi(string $text): array
    {
        $lower = strtolower($text);

        // 1. Ekstrak Kategori & SDGs
        $kategori = 'fasilitas';
        $sdgCodes = [11];

        if (preg_match('/\b(umkm|jualan|dagang|produk|kemasan|logo|pembukuan|pasar|modal|bisnis|keripik|usaha|omzet)\b/i', $lower)) {
            $kategori = 'umkm';
            $sdgCodes = [8, 1];
        } elseif (preg_match('/\b(kesehatan|stunting|posyandu|gizi|balita|ibu hamil|sakit|puskesmas|imunisasi|sanitasi|jamban)\b/i', $lower)) {
            $kategori = 'kesehatan';
            $sdgCodes = [3, 6];
        } elseif (preg_match('/\b(lingkungan|sampah|sungai|banjir|polusi|biogas|daur ulang|kebersihan|saluran air|got|limbah)\b/i', $lower)) {
            $kategori = 'lingkungan';
            $sdgCodes = [13, 15, 6];
        } elseif (preg_match('/\b(pendidikan|sekolah|les|belajar|bimbingan|literasi|anak|mengajar|guru|paud|sd|buku)\b/i', $lower)) {
            $kategori = 'pendidikan';
            $sdgCodes = [4];
        } elseif (preg_match('/\b(jalan|rusak|lubang|lampu|penerangan|jembatan|gapura|balai|gedung|aspal|paving|lapangan)\b/i', $lower)) {
            $kategori = 'fasilitas';
            $sdgCodes = [9, 11];
        }

        // 2. Ekstrak Urgensi
        $urgensi = 'sedang';
        if (preg_match('/\b(darurat|bahaya|parah|segera|mendesak|urgent|roboh|putus|kecelakaan)\b/i', $lower)) {
            $urgensi = 'mendesak';
        } elseif (preg_match('/\b(usulan|rencana|saran|kalau bisa|ide)\b/i', $lower)) {
            $urgensi = 'rendah';
        }

        // 3. Deteksi Desa
        $desaNama = null;
        $daftarDesa = ProfilDesa::pluck('nama_desa')->all();
        foreach ($daftarDesa as $nama) {
            $namaClean = trim(str_ireplace(['desa', 'kelurahan'], '', $nama));
            if ($namaClean !== '' && str_contains($lower, strtolower($namaClean))) {
                $desaNama = $nama;
                break;
            }
        }

        return [
            'desa_nama' => $desaNama,
            'kategori' => $kategori,
            'deskripsi' => $text,
            'urgensi' => $urgensi,
            'sdg_codes' => $sdgCodes,
        ];
    }
}