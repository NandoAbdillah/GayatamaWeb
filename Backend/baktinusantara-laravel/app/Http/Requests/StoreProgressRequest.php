<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proposal_id' => 'required|exists:proposal,id',
            'minggu_ke' => 'required|integer|min:1|max:52',
            'persentase' => 'required|integer|min:0|max:100',
            'deskripsi' => 'required|string|max:2000',
            'foto' => 'nullable|file|image|max:5120',
        ];
    }
}
