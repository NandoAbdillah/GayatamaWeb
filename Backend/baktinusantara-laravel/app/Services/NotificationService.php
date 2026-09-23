<?php

namespace App\Services;

use App\Models\Notifikasi;
use App\Models\User;

class NotificationService
{
    public function send(
        User|int $user,
        string $pesan,
        string $channel = 'in_app',
        ?string $title = null,
        ?string $type = 'info',
        ?string $actionUrl = null
    ): Notifikasi {
        $userId = $user instanceof User ? $user->id : $user;

        return Notifikasi::create([
            'user_id' => $userId,
            'title' => $title,
            'pesan' => $pesan,
            'channel' => $channel,
            'type' => $type ?? 'info',
            'action_url' => $actionUrl,
            'is_read' => false,
        ]);
    }

    public function getUserNotifications(User $user, bool $onlyUnread = false, int $perPage = 50)
    {
        $query = Notifikasi::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($onlyUnread) {
            $query->where('is_read', false);
        }

        return $query->paginate($perPage);
    }

    public function markAsRead(Notifikasi $notifikasi, User $user): Notifikasi
    {
        if ($notifikasi->user_id !== $user->id) {
            abort(403, 'Akses tidak diizinkan. Notifikasi ini bukan milik Anda.');
        }

        $notifikasi->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return $notifikasi->fresh();
    }

    public function markAllAsRead(User $user): int
    {
        return Notifikasi::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }
}