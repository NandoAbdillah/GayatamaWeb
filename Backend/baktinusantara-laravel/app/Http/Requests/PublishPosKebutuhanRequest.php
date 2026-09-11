<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PublishPosKebutuhanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string|max:5000',
            'kategori' => 'required|in:umkm,kesehatan,lingkungan,pendidikan,fasilitas',
            'sdg_codes' => 'nullable|array',
            'kuota_kelompok' => 'required|integer|min:1',
            'deadline' => 'required|date|after:today',
            'jurusan_dibutuhkan' => 'required|array|min:1',
            'jurusan_dibutuhkan.*' => 'required|integer|min:1|max:100',
        ];
    }
}
