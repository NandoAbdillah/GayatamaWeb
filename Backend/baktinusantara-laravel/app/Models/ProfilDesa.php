<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilDesa extends Model
{
    protected $table = 'profil_desa';
    protected $fillable = ['user_id', 'nama_desa', 'kecamatan', 'kabupaten', 'provinsi', 'latitude', 'longitude', 'sk_file_url', 'verified_at', 'kontak_resmi'];

    public function user() { return $this->belongsTo(User::class); }
    public function aspirasi() { return $this->hasMany(Aspirasi::class, 'desa_id'); }
    public function posKebutuhan() { return $this->hasMany(PosKebutuhan::class, 'desa_id'); }
    public function laporanDosen() { return $this->hasMany(LaporanDosen::class, 'desa_id'); }
}