<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aspirasi extends Model
{
    protected $table = 'aspirasi';
    protected $fillable = ['desa_id', 'pelapor_nama', 'pelapor_wa', 'kategori', 'deskripsi', 'latitude', 'longitude', 'foto_url', 'urgensi', 'status', 'alasan_tolak'];

    public function desa() { return $this->belongsTo(ProfilDesa::class, 'desa_id'); }
    public function posKebutuhan() { return $this->hasOne(PosKebutuhan::class, 'aspirasi_id'); }
}
