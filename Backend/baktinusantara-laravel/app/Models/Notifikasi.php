<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';
    protected $fillable = [
        'user_id',
        'title',
        'pesan',
        'type',
        'action_url',
        'channel',
        'is_read',
        'read_at',
    ];

    protected $appends = ['message'];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function getMessageAttribute(): string
    {
        return $this->pesan ?? '';
    }

    public function user() { return $this->belongsTo(User::class); }
}