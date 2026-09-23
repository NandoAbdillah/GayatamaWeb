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
        'nomor_sk',
        'judul_sk',
        'pejabat_penandatangan',
        'berlaku_sampai',
        'sptjm_file_url',
        'nip_admin',
        'akreditasi',
        'alamat_kampus',
        'latitude',
        'longitude',
        'ai_audit_result',
        'ai_trust_score',
        'tanda_tangan_url',
        'is_manual_entry',
        'website_kampus',
        'verified_at',
    ];

    protected $casts = [
        'ai_audit_result' => 'array',
        'ai_trust_score' => 'integer',
        'is_manual_entry' => 'boolean',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function dosen() { return $this->hasMany(ProfilDosen::class, 'universitas_id'); }
}
