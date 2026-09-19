<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilUniversitas extends Model
{
    protected $table = 'profil_universitas';
    protected $fillable = [
        'user_id',
        'nama_universitas',
        'kode_univ',
        'sk_file_url',
        'nip_admin',
        'akreditasi',
        'alamat_kampus',
        'latitude',
        'longitude',
        'verified_at',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function dosen() { return $this->hasMany(ProfilDosen::class, 'universitas_id'); }
}
