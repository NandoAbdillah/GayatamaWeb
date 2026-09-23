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
            $table->json('target_luaran')->nullable()->after('kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_kebutuhan', function (Blueprint $table) {
            $table->dropColumn('target_luaran');
        });
    }
};
