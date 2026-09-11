<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanDosen extends Model
{
    protected $table = 'laporan_dosen';
    protected $fillable = ['dosen_id', 'desa_id', 'proposal_id', 'status', 'isi'];

    public function dosen() { return $this->belongsTo(ProfilDosen::class, 'dosen_id'); }
    public function desa() { return $this->belongsTo(ProfilDesa::class, 'desa_id'); }
    public function proposal() { return $this->belongsTo(Proposal::class, 'proposal_id'); }
}
