<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnggotaKelompok extends Model
{
    protected $table = 'anggota_kelompok';
    protected $fillable = ['kelompok_id', 'user_id', 'jurusan_kontribusi', 'role_in_group'];

    public function kelompok() { return $this->belongsTo(Kelompok::class, 'kelompok_id'); }
    public function user() { return $this->belongsTo(User::class); }
}
