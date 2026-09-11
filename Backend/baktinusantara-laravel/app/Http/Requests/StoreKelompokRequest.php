<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreKelompokRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'nama_kelompok' => 'required|string|max:255',
            'jurusan_kontribusi' => 'required|string|max:255',
        ];
    }
}
