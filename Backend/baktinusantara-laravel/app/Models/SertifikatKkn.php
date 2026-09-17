<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SertifikatKkn extends Model
{
    use HasFactory;

    protected $table = 'sertifikat_kkn';

    protected $fillable = [
        'certificate_code',
        'verification_hash',
        'user_id',
        'proposal_id',
        'portofolio_id',
        'kelompok_id',
        'universitas_id',
        'desa_id',
        'recipient_name',
        'recipient_nim',
        'recipient_jurusan',
        'nama_desa',
        'nama_universitas',
        'nama_dosen',
        'judul_program',
        'sdg_codes',
        'total_jam_pengabdian',
        'qr_code_svg',
        'pdf_download_url',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'sdg_codes' => 'array',
            'issued_at' => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function proposal() { return $this->belongsTo(Proposal::class); }
    public function portofolio() { return $this->belongsTo(PortofolioPublik::class, 'portofolio_id'); }
    public function kelompok() { return $this->belongsTo(Kelompok::class); }
    public function universitas() { return $this->belongsTo(ProfilUniversitas::class, 'universitas_id'); }
    public function desa() { return $this->belongsTo(ProfilDesa::class, 'desa_id'); }
}
