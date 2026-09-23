<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user && $request->filled('user_id')) {
            $user = \App\Models\User::find($request->input('user_id'));
        }

        if (!$user) {
            return response()->json([
                'message' => 'User tidak terautentikasi.',
                'data' => [],
            ], 401);
        }

        $onlyUnread = $request->boolean('unread');
        $perPage = (int) $request->input('per_page', 50);

        $notifications = $this->notificationService->getUserNotifications($user, $onlyUnread, $perPage);

        return response()->json([
            'message' => 'Daftar notifikasi berhasil dimuat.',
            'data' => $notifications->items(),
            'pagination' => [
                'total' => $notifications->total(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'nullable|string|max:255',
            'message' => 'required_without:pesan|string|max:1000',
            'pesan' => 'nullable|string|max:1000',
            'type' => 'nullable|string|max:50',
            'action_url' => 'nullable|string|max:500',
        ]);

        $pesan = $validated['pesan'] ?? $validated['message'];
        $title = $validated['title'] ?? 'Pemberitahuan';
        $type = $validated['type'] ?? 'info';
        $actionUrl = $validated['action_url'] ?? '/';

        $notif = $this->notificationService->send(
            (int) $validated['user_id'],
            $pesan,
            'in_app',
            $title,
            $type,
            $actionUrl
        );

        return response()->json([
            'message' => 'Notifikasi berhasil dibuat.',
            'data' => $notif,
        ], 201);
    }

    public function markAsRead(Notifikasi $notifikasi, Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user && $request->filled('user_id')) {
            $user = \App\Models\User::find($request->input('user_id'));
        }

        $updated = $this->notificationService->markAsRead($notifikasi, $user ?: $notifikasi->user);

        return response()->json([
            'message' => 'Notifikasi berhasil ditandai telah dibaca.',
            'data' => $updated,
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user && $request->filled('user_id')) {
            $user = \App\Models\User::find($request->input('user_id'));
        }

        if (!$user) {
            return response()->json(['message' => 'User required', 'updated_count' => 0], 400);
        }

        $count = $this->notificationService->markAllAsRead($user);

        return response()->json([
            'message' => 'Semua notifikasi berhasil ditandai telah dibaca.',
            'updated_count' => $count,
        ]);
    }
}