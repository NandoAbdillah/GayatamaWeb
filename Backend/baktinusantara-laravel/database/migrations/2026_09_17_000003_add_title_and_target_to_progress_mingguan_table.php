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
        Schema::table('progress_mingguan', function (Blueprint $table) {
            $table->string('title')->nullable()->after('minggu_ke');
            $table->text('target')->nullable()->after('persentase');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('progress_mingguan', function (Blueprint $table) {
            $table->dropColumn(['title', 'target']);
        });
    }
};
