<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilDosen extends Model
{
    protected $table = 'profil_dosen';
    protected $fillable = ['user_id', 'universitas_id', 'ditambahkan_oleh', 'nip', 'no_hp'];

    public function user() { return $this->belongsTo(User::class); }
    public function universitas() { return $this->belongsTo(ProfilUniversitas::class, 'universitas_id'); }
    public function ditambahkanOleh() { return $this->belongsTo(User::class, 'ditambahkan_oleh'); }
    public function kelompokBinaan() { return $this->hasMany(Kelompok::class, 'dosen_id'); }
    public function laporan() { return $this->hasMany(LaporanDosen::class, 'dosen_id'); }
}
