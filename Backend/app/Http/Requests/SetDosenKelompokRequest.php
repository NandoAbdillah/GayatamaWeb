<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetDosenKelompokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dosen_id' => 'required|exists:profil_dosen,id',
        ];
    }
}
