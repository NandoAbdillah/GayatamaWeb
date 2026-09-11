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
        Schema::create('aspirasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->constrained('profil_desa')->cascadeOnDelete();
            $table->string('pelapor_nama');
            $table->string('pelapor_wa');
            $table->enum('kategori', ['umkm','kesehatan','lingkungan','pendidikan','fasilitas']);
            $table->text('deskripsi');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('foto_url')->nullable();
            $table->enum('urgensi', ['rendah','sedang','mendesak'])->default('sedang');
            $table->enum('status', ['menunggu','terverifikasi','ditolak'])->default('menunggu');
            $table->text('alasan_tolak')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aspirasi');
    }
};
