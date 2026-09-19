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
            $table->string('sk_file_url')->nullable()->after('kode_univ');
            $table->string('nip_admin')->nullable()->after('sk_file_url');
            $table->string('akreditasi')->nullable()->after('nip_admin');
            $table->text('alamat_kampus')->nullable()->after('akreditasi');
            $table->decimal('latitude', 10, 7)->nullable()->after('alamat_kampus');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profil_universitas', function (Blueprint $table) {
            $table->dropColumn(['sk_file_url', 'nip_admin', 'akreditasi', 'alamat_kampus', 'latitude', 'longitude']);
        });
    }
};
