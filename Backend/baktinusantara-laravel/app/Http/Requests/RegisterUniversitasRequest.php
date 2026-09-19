<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUniversitasRequest extends FormRequest
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
            'nama_universitas' => 'required|string|max:255',
            'kode_univ' => 'nullable|string|max:50',
            'phone_wa' => 'nullable|string|max:20',
            'nip_admin' => 'nullable|string|max:50',
            'akreditasi' => 'nullable|string|max:50',
            'alamat_kampus' => 'nullable|string|max:1000',
            'sk_file' => 'nullable|file|max:10240',
            'mou_file' => 'nullable|file|max:10240',
        ];
    }
}
