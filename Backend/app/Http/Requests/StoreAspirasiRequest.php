<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAspirasiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */

     public function authorize(): bool { return true; } // public, no auth

    public function rules(): array
    {
        return [
            'desa_id' => 'required|exists:profil_desa,id',
            'pelapor_nama' => 'required|string|max:255',
            'pelapor_wa' => 'required|string|max:20',
            'kategori' => 'required|in:umkm,kesehatan,lingkungan,pendidikan,fasilitas',
            'deskripsi' => 'required|string|max:2000',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'foto' => 'nullable|file|image|max:5120',
            'urgensi' => 'required|in:rendah,sedang,mendesak',
        ];
    }
}
