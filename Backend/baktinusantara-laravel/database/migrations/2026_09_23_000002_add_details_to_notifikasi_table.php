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
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->string('title')->nullable()->after('user_id');
            $table->string('type')->default('info')->after('pesan');
            $table->string('action_url')->nullable()->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropColumn(['title', 'type', 'action_url']);
        });
    }
};
