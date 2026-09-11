<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLaporanDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dosen_id' => 'required|exists:profil_dosen,id',
            'proposal_id' => 'nullable|exists:proposal,id',
            'isi' => 'required|string|max:5000',
        ];
    }
}
