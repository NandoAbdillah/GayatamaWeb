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
            'kode_univ' => 'required|string|max:50|unique:profil_universitas,kode_univ',
            'phone_wa' => 'nullable|string|max:20',
        ];
    }
}
