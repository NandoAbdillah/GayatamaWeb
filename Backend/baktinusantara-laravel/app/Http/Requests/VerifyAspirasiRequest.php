<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
// app/Http/Requests/VerifyAspirasiRequest.php
class VerifyAspirasiRequest extends FormRequest
{
    public function authorize(): bool { return true; } // dicek via policy di controller

    public function rules(): array
    {
        return [
            'action' => 'required|in:approve,reject',
            'alasan_tolak' => 'required_if:action,reject|string|max:1000',
            'judul' => 'required_if:action,approve|string|max:255',
            'kuota_kelompok' => 'required_if:action,approve|integer|min:1',
            'deadline' => 'required_if:action,approve|date|after:today',
            'jurusan_dibutuhkan' => 'required_if:action,approve|array|min:1',
            'jurusan_dibutuhkan.*' => 'required_if:action,approve|integer|min:1|max:100',
            'sdg_codes' => 'nullable|array',
        ];
    }
}