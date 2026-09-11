<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegistrasiMahasiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone_wa' => 'nullable|string|max:20',
            'nim' => 'required|string|max:30',
            'universitas_id' => ['required', Rule::exists('profil_universitas', 'id')->whereNotNull('verified_at')],
            'jurusan' => 'required|string|max:255',
            'semester' => 'nullable|integer|min:1|max:14',
            'ktm_file' => 'required|file|mimes:jpg,png,pdf|max:3072',
        ];
    }
}