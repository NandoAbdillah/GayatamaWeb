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
        Schema::table('pos_kebutuhan', function (Blueprint $table) {
            $table->index(['status', 'kategori'], 'pos_kebutuhan_status_kategori_idx');
        });

        Schema::table('proposal', function (Blueprint $table) {
            $table->index('status', 'proposal_status_idx');
        });

        Schema::table('aspirasi', function (Blueprint $table) {
            $table->index('status', 'aspirasi_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_kebutuhan', function (Blueprint $table) {
            $table->dropIndex('pos_kebutuhan_status_kategori_idx');
        });

        Schema::table('proposal', function (Blueprint $table) {
            $table->dropIndex('proposal_status_idx');
        });

        Schema::table('aspirasi', function (Blueprint $table) {
            $table->dropIndex('aspirasi_status_idx');
        });
    }
};
