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
            'kategori' => 'required|string|max:255',
            'target_luaran' => 'nullable',
            'luaran' => 'nullable',
            'luaran_diharapkan' => 'nullable',
            'aspirasi_id' => 'nullable|exists:aspirasi,id',
            'sdg_codes' => 'nullable|array',
            'kuota_kelompok' => 'nullable|integer|min:1',
            'deadline' => 'nullable',
            'jurusan_dibutuhkan' => 'nullable',
        ];
    }
}
