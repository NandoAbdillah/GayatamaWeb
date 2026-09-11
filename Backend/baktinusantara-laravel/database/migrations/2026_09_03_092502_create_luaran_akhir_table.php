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
        Schema::create('luaran_akhir', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->unique()->constrained('proposal')->cascadeOnDelete();
            $table->string('file_deliverable_url');
            $table->text('deskripsi')->nullable();
            $table->enum('status_verifikasi', ['menunggu','verified'])->default('menunggu');
            $table->foreignId('disahkan_oleh')->nullable()->constrained('users');
            $table->timestamp('disahkan_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('luaran_akhir');
    }
};
