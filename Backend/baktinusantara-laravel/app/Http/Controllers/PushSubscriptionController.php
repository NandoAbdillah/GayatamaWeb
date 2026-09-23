<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    const DEFAULT_VAPID_PUBLIC_KEY = 'BGHxRpbw6tkPk01tgL65p2ThaT3zrzwRtnlSWbK6lJZC51GdYf2CdY-rrI0ol_SbhTjTeiUElZ0yeBpvQEENa1Y';

    /**
     * Get VAPID Public Key for client subscription setup
     */
    public function vapidPublicKey(): JsonResponse
    {
        $publicKey = config('services.webpush.public_key', env('VAPID_PUBLIC_KEY', self::DEFAULT_VAPID_PUBLIC_KEY));

        return response()->json([
            'publicKey' => $publicKey,
        ]);
    }

    /**
     * Store or update a Web Push subscription in MySQL database
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable',
            'role' => 'nullable|string|max:50',
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string',
            'subscription.keys' => 'required|array',
            'subscription.keys.p256dh' => 'required|string',
            'subscription.keys.auth' => 'required|string',
            'user_agent' => 'nullable|string|max:500',
        ]);

        $userId = $request->user()?->id ?? $validated['user_id'] ?? null;
        $endpoint = $validated['subscription']['endpoint'];
        $p256dh = $validated['subscription']['keys']['p256dh'];
        $auth = $validated['subscription']['keys']['auth'];
        $role = $validated['role'] ?? ($request->user()?->role ?? 'mahasiswa');
        $userAgent = $validated['user_agent'] ?? $request->header('User-Agent');

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $endpoint],
            [
                'user_id' => $userId,
                'role' => $role,
                'p256dh' => $p256dh,
                'auth' => $auth,
                'user_agent' => $userAgent,
            ]
        );

        return response()->json([
            'message' => 'Langganan Web Push berhasil disimpan di database.',
            'data' => $subscription,
        ], 201);
    }

    /**
     * Unsubscribe and remove Web Push subscription from MySQL database
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
            'user_id' => 'nullable',
        ]);

        $deleted = PushSubscription::where('endpoint', $validated['endpoint'])->delete();

        return response()->json([
            'message' => 'Langganan Web Push berhasil dicabut.',
            'deleted' => $deleted > 0,
        ]);
    }

    /**
     * List subscriptions for user (internal/admin/dispatcher)
     */
    public function listSubscriptions(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ?? $request->input('user_id');

        $query = PushSubscription::query();
        if ($userId) {
            $query->where('user_id', $userId);
        }

        $subscriptions = $query->latest()->get()->map(function ($sub) {
            return [
                'id' => $sub->id,
                'user_id' => $sub->user_id,
                'role' => $sub->role,
                'endpoint' => $sub->endpoint,
                'keys' => [
                    'p256dh' => $sub->p256dh,
                    'auth' => $sub->auth,
                ],
                'user_agent' => $sub->user_agent,
                'created_at' => $sub->created_at?->toISOString(),
            ];
        });

        return response()->json([
            'message' => 'Daftar subscription berhasil dimuat.',
            'data' => $subscriptions,
        ]);
    }
}
