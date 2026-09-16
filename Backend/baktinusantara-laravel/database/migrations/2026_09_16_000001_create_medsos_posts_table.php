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
        Schema::create('medsos_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pos_kebutuhan_id')->nullable()->constrained('pos_kebutuhan')->nullOnDelete();
            $table->foreignId('profil_desa_id')->nullable()->constrained('profil_desa')->nullOnDelete();
            $table->string('platform'); // instagram, facebook, tiktok, youtube, twitter
            $table->string('post_url');
            $table->string('embed_url')->nullable();
            $table->string('author_name');
            $table->string('author_username')->nullable();
            $table->string('author_avatar')->nullable();
            $table->text('caption');
            $table->string('media_type')->default('image'); // image, video, carousel
            $table->string('media_url')->nullable();
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->boolean('is_verified')->default(true);
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medsos_posts');
    }
};
