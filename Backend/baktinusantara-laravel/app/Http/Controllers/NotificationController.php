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
        $onlyUnread = $request->boolean('unread');
        $perPage = (int) $request->input('per_page', 50);

        $notifications = $this->notificationService->getUserNotifications($request->user(), $onlyUnread, $perPage);

        return response()->json([
            'message' => 'Daftar notifikasi berhasil dimuat.',
            'data' => $notifications,
        ]);
    }

    public function markAsRead(Notifikasi $notifikasi, Request $request): JsonResponse
    {
        $updated = $this->notificationService->markAsRead($notifikasi, $request->user());

        return response()->json([
            'message' => 'Notifikasi berhasil ditandai telah dibaca.',
            'data' => $updated,
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($request->user());

        return response()->json([
            'message' => 'Semua notifikasi berhasil ditandai telah dibaca.',
            'updated_count' => $count,
        ]);
    }
}