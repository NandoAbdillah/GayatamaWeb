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
            'email' => [
                'required',
                'email',
                'unique:users,email',
                'regex:/^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)*ac\.id$/i',
            ],
            'password' => 'required|string|min:8',
            'nama_universitas' => 'required|string|max:255',
            'kode_univ' => 'nullable|string|max:50',
            'phone_wa' => 'nullable|string|max:20',
            'nip_admin' => 'nullable|string|max:50',
            'akreditasi' => 'nullable|string|max:50',
            'alamat_kampus' => 'nullable|string|max:1000',
            'sk_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'mou_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'email.regex' => 'Pendaftaran institusi universitas wajib menggunakan email resmi berakhiran .ac.id (contoh: lppm@unesa.ac.id). Email publik (@gmail, @yahoo) ditolak demi keamanan institusi.',
            'email.unique' => 'Alamat email institusi ini telah terdaftar di sistem.',
            'sk_file.max' => 'Ukuran berkas SK tidak boleh melebihi 10 MB.',
            'sk_file.mimes' => 'Format berkas SK harus berupa PDF atau gambar (JPG, PNG).',
        ];
    }
}
