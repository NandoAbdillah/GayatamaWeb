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
            $table->json('nilai_desa')->nullable()->after('jarak_km');
            $table->text('evaluasi_desa')->nullable()->after('nilai_desa');
            $table->timestamp('nilai_desa_submitted_at')->nullable()->after('evaluasi_desa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->dropColumn(['nilai_desa', 'evaluasi_desa', 'nilai_desa_submitted_at']);
        });
    }
};
