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
        Schema::create('laporan_dosen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dosen_id')->constrained('profil_dosen')->cascadeOnDelete();
            $table->foreignId('desa_id')->constrained('profil_desa')->cascadeOnDelete();
            $table->foreignId('proposal_id')->nullable()->constrained('proposal');
            $table->enum('status', ['menunggu','ditinjau','selesai'])->default('menunggu');
            $table->text('isi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_dosen');
    }
};
