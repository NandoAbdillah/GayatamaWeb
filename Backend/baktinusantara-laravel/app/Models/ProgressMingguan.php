<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressMingguan extends Model
{
    protected $table = 'progress_mingguan';
    protected $fillable = ['proposal_id', 'minggu_ke', 'persentase', 'deskripsi', 'foto_url', 'is_locked'];

    public function proposal() { return $this->belongsTo(Proposal::class, 'proposal_id'); }
}