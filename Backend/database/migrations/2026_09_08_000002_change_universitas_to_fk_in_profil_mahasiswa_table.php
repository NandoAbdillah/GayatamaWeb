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
        Schema::table('profil_mahasiswa', function (Blueprint $table) {
            $table->dropColumn('universitas');
            $table->foreignId('universitas_id')->nullable()->after('user_id')->constrained('profil_universitas')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profil_mahasiswa', function (Blueprint $table) {
            $table->dropForeign(['universitas_id']);
            $table->dropColumn('universitas_id');
            $table->string('universitas')->nullable();
        });
    }
};
