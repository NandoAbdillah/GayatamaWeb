<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    protected $table = 'proposal';
    protected $fillable = [
        'kelompok_id',
        'pos_kebutuhan_id',
        'draf_proker',
        'file_proposal_url',
        'surat_pengantar_url',
        'status',
        'status_kelayakan_dosen',
        'catatan_dosen',
        'dosen_reviewed_at',
        'catatan_desa',
        'matching_score',
        'jarak_km',
        'submitted_at',
    ];

    public function kelompok() { return $this->belongsTo(Kelompok::class, 'kelompok_id'); }
    public function posKebutuhan() { return $this->belongsTo(PosKebutuhan::class, 'pos_kebutuhan_id'); }
    public function suratIzinOrtu() { return $this->hasOne(SuratIzinOrtu::class, 'proposal_id'); }
    public function progressMingguan() { return $this->hasMany(ProgressMingguan::class, 'proposal_id'); }
    public function luaranAkhir() { return $this->hasOne(LuaranAkhir::class, 'proposal_id'); }
}