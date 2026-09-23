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
        Schema::table('profil_universitas', function (Blueprint $table) {
            $table->json('ai_audit_result')->nullable()->after('alamat_kampus');
            $table->integer('ai_trust_score')->nullable()->after('ai_audit_result');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profil_universitas', function (Blueprint $table) {
            $table->dropColumn(['ai_audit_result', 'ai_trust_score']);
        });
    }
};
