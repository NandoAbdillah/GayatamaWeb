<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuratIzinOrtu extends Model
{
    protected $table = 'surat_izin_ortu';
    protected $fillable = ['proposal_id', 'file_url', 'required', 'uploaded_at'];

    public function proposal() { return $this->belongsTo(Proposal::class, 'proposal_id'); }
}
