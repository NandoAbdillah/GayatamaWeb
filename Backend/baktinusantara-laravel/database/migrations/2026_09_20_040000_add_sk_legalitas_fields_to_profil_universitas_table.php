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
            $table->string('nomor_sk')->nullable()->after('sk_file_url');
            $table->string('judul_sk')->nullable()->after('nomor_sk');
            $table->string('pejabat_penandatangan')->nullable()->after('judul_sk');
            $table->string('berlaku_sampai')->nullable()->after('pejabat_penandatangan');
            $table->string('sptjm_file_url')->nullable()->after('berlaku_sampai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profil_universitas', function (Blueprint $table) {
            $table->dropColumn([
                'nomor_sk',
                'judul_sk',
                'pejabat_penandatangan',
                'berlaku_sampai',
                'sptjm_file_url',
            ]);
        });
    }
};
