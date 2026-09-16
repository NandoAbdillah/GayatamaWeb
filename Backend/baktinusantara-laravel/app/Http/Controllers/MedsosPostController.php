<?php

namespace App\Http\Controllers;

use App\Models\MedsosPost;
use Illuminate\Http\Request;

class MedsosPostController extends Controller
{
    /**
     * Display a listing of social media posts.
     */
    public function index(Request $request)
    {
        $query = MedsosPost::with(['posKebutuhan', 'profilDesa']);

        if ($request->has('pos_id') && !empty($request->pos_id)) {
            $query->where('pos_kebutuhan_id', $request->pos_id);
        }

        if ($request->has('desa_id') && !empty($request->desa_id)) {
            $query->where('profil_desa_id', $request->desa_id);
        }

        if ($request->has('platform') && !empty($request->platform)) {
            $query->where('platform', $request->platform);
        }

        $posts = $query->orderBy('posted_at', 'desc')->paginate($request->get('per_page', 12));

        return response()->json([
            'status' => 'success',
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Store a newly created social media post.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pos_kebutuhan_id' => 'nullable|exists:pos_kebutuhan,id',
            'profil_desa_id' => 'nullable|exists:profil_desa,id',
            'platform' => 'required|in:instagram,facebook,tiktok,youtube,twitter',
            'post_url' => 'required|url',
            'embed_url' => 'nullable|url',
            'author_name' => 'required|string|max:255',
            'author_username' => 'nullable|string|max:255',
            'author_avatar' => 'nullable|url',
            'caption' => 'required|string',
            'media_type' => 'nullable|in:image,video,carousel',
            'media_url' => 'nullable|url',
            'likes_count' => 'nullable|integer|min:0',
            'comments_count' => 'nullable|integer|min:0',
        ]);

        $validated['is_verified'] = true;
        $validated['posted_at'] = now();

        $post = MedsosPost::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Postingan medsos berhasil ditambahkan ke Live Report',
            'data' => $post,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(MedsosPost $medsosPost)
    {
        $medsosPost->load(['posKebutuhan', 'profilDesa']);
        return response()->json([
            'status' => 'success',
            'data' => $medsosPost,
        ]);
    }
}
