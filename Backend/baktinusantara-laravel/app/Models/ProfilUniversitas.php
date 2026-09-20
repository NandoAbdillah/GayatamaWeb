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
        'ai_audit_result',
        'ai_trust_score',
        'verified_at',
    ];

    protected $casts = [
        'ai_audit_result' => 'array',
        'ai_trust_score' => 'integer',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function dosen() { return $this->hasMany(ProfilDosen::class, 'universitas_id'); }
}
