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
        Schema::create('portofolio_publik', function (Blueprint $table) {
            $table->id();
            $table->foreignId('luaran_id')->unique()->constrained('luaran_akhir')->cascadeOnDelete();
            $table->string('slug_public')->unique();
            $table->text('ringkasan_dampak')->nullable();
            $table->text('testimoni_desa')->nullable();
            $table->string('sertifikat_pdf_url')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portofolio_publik');
    }
};
