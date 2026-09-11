<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidasiProposalDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'catatan_dosen' => 'required|string|max:2000',
            'status_kelayakan' => 'required|in:layak,perlu_revisi',
        ];
    }
}
