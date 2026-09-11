<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LuaranAkhir extends Model
{
    protected $table = 'luaran_akhir';
    protected $fillable = ['proposal_id', 'file_deliverable_url', 'deskripsi', 'status_verifikasi', 'disahkan_oleh', 'disahkan_at'];

    public function proposal() { return $this->belongsTo(Proposal::class, 'proposal_id'); }
    public function disahkanOleh() { return $this->belongsTo(User::class, 'disahkan_oleh'); }
    public function portofolio() { return $this->hasOne(PortofolioPublik::class, 'luaran_id'); }
}
