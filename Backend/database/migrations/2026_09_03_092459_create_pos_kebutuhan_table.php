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
        Schema::create('pos_kebutuhan', function (Blueprint $table) {
        $table->id();
        $table->foreignId('desa_id')->constrained('profil_desa')->cascadeOnDelete();
        $table->foreignId('aspirasi_id')->nullable()->constrained('aspirasi');
        $table->string('judul');
        $table->text('deskripsi');
        $table->string('kategori');
        $table->json('sdg_codes')->nullable();
        $table->unsignedInteger('kuota_kelompok')->default(1);
        $table->date('deadline')->nullable();
        $table->json('jurusan_dibutuhkan')->nullable();
        $table->enum('status', ['open','in_progress','completed'])->default('open');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_kebutuhan');
    }
};
