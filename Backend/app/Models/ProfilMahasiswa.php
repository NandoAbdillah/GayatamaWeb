<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilMahasiswa extends Model
{
    protected $table = 'profil_mahasiswa';
    protected $fillable = ['user_id', 'universitas_id', 'nim', 'jurusan', 'semester', 'ktm_file_url', 'verified_at'];
    protected $hidden = ['ktm_file_url'];

    public function user() { return $this->belongsTo(User::class); }
    public function universitas() { return $this->belongsTo(ProfilUniversitas::class, 'universitas_id'); }
}