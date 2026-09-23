<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosKebutuhan extends Model
{
    protected $table = 'pos_kebutuhan';
    protected $fillable = [
        'desa_id',
        'aspirasi_id',
        'judul',
        'deskripsi',
        'kategori',
        'target_luaran',
        'sdg_codes',
        'kuota_kelompok',
        'deadline',
        'jurusan_dibutuhkan',
        'status',
    ];
    protected $casts = [
        'target_luaran' => 'array',
        'sdg_codes' => 'array',
        'jurusan_dibutuhkan' => 'array',
    ];

    public function desa() { return $this->belongsTo(ProfilDesa::class, 'desa_id'); }
    public function aspirasi() { return $this->belongsTo(Aspirasi::class, 'aspirasi_id'); }
    public function proposal() { return $this->hasMany(Proposal::class, 'pos_kebutuhan_id'); }
}