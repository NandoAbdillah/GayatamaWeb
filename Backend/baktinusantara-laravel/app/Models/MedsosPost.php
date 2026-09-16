<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedsosPost extends Model
{
    use HasFactory;

    protected $table = 'medsos_posts';

    protected $fillable = [
        'pos_kebutuhan_id',
        'profil_desa_id',
        'platform',
        'post_url',
        'embed_url',
        'author_name',
        'author_username',
        'author_avatar',
        'caption',
        'media_type',
        'media_url',
        'likes_count',
        'comments_count',
        'is_verified',
        'posted_at',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'is_verified' => 'boolean',
        'posted_at' => 'datetime',
    ];

    public function posKebutuhan()
    {
        return $this->belongsTo(PosKebutuhan::class, 'pos_kebutuhan_id');
    }

    public function profilDesa()
    {
        return $this->belongsTo(ProfilDesa::class, 'profil_desa_id');
    }
}
