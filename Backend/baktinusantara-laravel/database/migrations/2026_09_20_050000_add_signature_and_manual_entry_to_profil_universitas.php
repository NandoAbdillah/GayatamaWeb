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
            $table->string('tanda_tangan_url')->nullable()->after('sptjm_file_url');
            $table->boolean('is_manual_entry')->default(false)->after('tanda_tangan_url');
            $table->string('website_kampus')->nullable()->after('is_manual_entry');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profil_universitas', function (Blueprint $table) {
            $table->dropColumn(['tanda_tangan_url', 'is_manual_entry', 'website_kampus']);
        });
    }
};
