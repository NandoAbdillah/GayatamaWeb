<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class PortofolioPublik extends Model
{
    protected $table = 'portofolio_publik';
    protected $fillable = ['luaran_id', 'slug_public', 'ringkasan_dampak', 'testimoni_desa', 'sertifikat_pdf_url', 'published_at'];

    public function luaran() { return $this->belongsTo(LuaranAkhir::class, 'luaran_id'); }
}