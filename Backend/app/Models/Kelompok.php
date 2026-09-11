<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelompok extends Model
{
    protected $table = 'kelompok';
    protected $fillable = ['nama_kelompok', 'ketua_id', 'dosen_id', 'status'];

    public function ketua() { return $this->belongsTo(User::class, 'ketua_id'); }
    public function dosen() { return $this->belongsTo(ProfilDosen::class, 'dosen_id'); }
    public function anggota() { return $this->hasMany(AnggotaKelompok::class, 'kelompok_id'); }
    public function proposal() { return $this->hasMany(Proposal::class, 'kelompok_id'); }
}
