<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pos_kebutuhan_id' => 'required|exists:pos_kebutuhan,id',
            'draf_proker' => 'required|string|max:5000',
            'file_proposal' => 'required|file|mimes:pdf|max:5120',
            'surat_pengantar' => 'nullable|file|mimes:pdf|max:5120',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ];
    }
}