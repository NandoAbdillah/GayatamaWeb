<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */

    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['name', 'email', 'password', 'phone_wa', 'role', 'is_verified'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profilMahasiswa() { return $this->hasOne(ProfilMahasiswa::class); }
    public function profilDesa() { return $this->hasOne(ProfilDesa::class); }
    public function profilDosen() { return $this->hasOne(ProfilDosen::class); }
    public function profilUniversitas() { return $this->hasOne(ProfilUniversitas::class); }
    public function kelompokDiketuai() { return $this->hasMany(Kelompok::class, 'ketua_id'); }
    public function notifikasi() { return $this->hasMany(Notifikasi::class); }
}
