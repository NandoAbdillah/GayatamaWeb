<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $table = 'push_subscriptions';

    protected $fillable = [
        'user_id',
        'role',
        'endpoint',
        'p256dh',
        'auth',
        'user_agent',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
