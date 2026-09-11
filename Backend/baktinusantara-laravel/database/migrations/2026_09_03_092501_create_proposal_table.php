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
        Schema::create('proposal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->constrained('kelompok')->cascadeOnDelete();
            $table->foreignId('pos_kebutuhan_id')->constrained('pos_kebutuhan')->cascadeOnDelete();
            $table->text('draf_proker');
            $table->string('file_proposal_url');
            $table->string('surat_pengantar_url')->nullable();
            $table->enum('status', ['menunggu','diterima','ditolak'])->default('menunggu');
            $table->text('catatan_desa')->nullable();
            $table->decimal('matching_score', 5, 2)->nullable();
            $table->decimal('jarak_km', 8, 2)->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal');
    }
};
