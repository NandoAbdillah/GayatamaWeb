<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Upload an asset or document.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:20480', // max 20MB
            'folder' => 'nullable|string|alpha_dash|max:50',
            'disk' => 'nullable|in:public,local',
        ]);

        $file = $request->file('file');
        $folder = $request->input('folder', 'uploads');
        $disk = $request->input('disk', 'public');

        $storedPath = $file->store($folder, $disk);
        $url = $disk === 'public' ? Storage::disk('public')->url($storedPath) : $storedPath;

        return response()->json([
            'status' => 'success',
            'message' => 'Berkas berhasil diunggah',
            'data' => [
                'url' => $url,
                'path' => $storedPath,
                'filename' => $file->getClientOriginalName(),
                'extension' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'disk' => $disk,
            ],
        ], 201);
    }
}
