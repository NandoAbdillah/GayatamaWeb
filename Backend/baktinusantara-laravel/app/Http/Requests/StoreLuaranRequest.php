<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLuaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proposal_id' => 'required|exists:proposal,id',
            'file_deliverable' => 'required|file|mimes:pdf,zip,docx,rar,png,jpg,jpeg|max:20480',
            'deskripsi' => 'required|string|max:5000',
        ];
    }
}
