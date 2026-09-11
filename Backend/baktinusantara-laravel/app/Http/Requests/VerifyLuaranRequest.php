<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyLuaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ringkasan_dampak' => 'required|string|max:5000',
            'testimoni_desa' => 'required|string|max:2000',
        ];
    }
}
