<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sertifikat_kkn', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_code')->unique()->index();
            $table->string('verification_hash', 64)->index();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('proposal_id')->constrained('proposal')->cascadeOnDelete();
            $table->foreignId('portofolio_id')->nullable()->constrained('portofolio_publik')->nullOnDelete();
            $table->foreignId('kelompok_id')->constrained('kelompok')->cascadeOnDelete();
            $table->foreignId('universitas_id')->nullable()->constrained('profil_universitas')->nullOnDelete();
            $table->foreignId('desa_id')->constrained('profil_desa')->cascadeOnDelete();
            $table->string('recipient_name');
            $table->string('recipient_nim')->nullable();
            $table->string('recipient_jurusan')->nullable();
            $table->string('nama_desa');
            $table->string('nama_universitas')->nullable();
            $table->string('nama_dosen')->nullable();
            $table->string('judul_program');
            $table->json('sdg_codes')->nullable();
            $table->integer('total_jam_pengabdian')->default(160);
            $table->text('qr_code_svg')->nullable();
            $table->string('pdf_download_url')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sertifikat_kkn');
    }
};
