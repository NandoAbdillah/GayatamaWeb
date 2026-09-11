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
        Schema::table('proposal', function (Blueprint $table) {
            $table->enum('status_kelayakan_dosen', ['belum_ditinjau', 'layak', 'perlu_revisi'])
                ->default('belum_ditinjau')
                ->after('status');
            $table->text('catatan_dosen')->nullable()->after('status_kelayakan_dosen');
            $table->timestamp('dosen_reviewed_at')->nullable()->after('catatan_dosen');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->dropColumn(['status_kelayakan_dosen', 'catatan_dosen', 'dosen_reviewed_at']);
        });
    }
};
