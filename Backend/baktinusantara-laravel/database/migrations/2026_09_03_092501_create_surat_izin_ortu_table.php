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
        Schema::create('surat_izin_ortu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposal')->cascadeOnDelete();
            $table->string('file_url')->nullable();
            $table->boolean('required')->default(false);
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_izin_ortu');
    }
};
