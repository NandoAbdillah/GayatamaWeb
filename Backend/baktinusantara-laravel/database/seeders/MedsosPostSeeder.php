<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedsosPost;
use App\Models\PosKebutuhan;
use App\Models\ProfilDesa;

class MedsosPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pos = PosKebutuhan::first();
        $posId = $pos ? $pos->id : null;
        $desaId = $pos ? $pos->profil_desa_id : (ProfilDesa::first()?->id ?? null);

        $posts = [
            [
                'pos_kebutuhan_id' => $posId,
                'profil_desa_id' => $desaId,
                'platform' => 'instagram',
                'post_url' => 'https://www.instagram.com/p/DFstudentkkn_sukamaju_01',
                'embed_url' => 'https://www.instagram.com/p/DFstudentkkn_sukamaju_01/embed',
                'author_name' => 'Tim KKN Tematik Sukamaju 2026',
                'author_username' => '@kkn.sukamaju2026',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Hari ke-14 di Desa Sukamaju! 🌾 Bersama warga dan kelompok tani lokal, tim mahasiswa berhasil menyelesaikan instalasi sensor kelembaban tanah berbasis IoT untuk greenhouse cabai desa. Semangat kolaborasi nyata! #BaktiNusantara #KKNTematik #DigitalisasiDesa',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 342,
                'comments_count' => 48,
                'is_verified' => true,
                'posted_at' => now()->subHours(3),
            ],
            [
                'pos_kebutuhan_id' => $posId,
                'profil_desa_id' => $desaId,
                'platform' => 'facebook',
                'post_url' => 'https://www.facebook.com/kkn.nusantara.official/posts/1092837482',
                'embed_url' => null,
                'author_name' => 'Pemerintah Desa Sukamaju',
                'author_username' => 'Pemdes Sukamaju Terpadu',
                'author_avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Apresiasi setinggi-tingginya kepada adik-adik mahasiswa KKN BaktiNusantara atas pendampingan pendaftaran NIB dan sertifikasi PIRT untuk 24 pelaku UMKM olahan keripik pisang dan kopi desa kami. Semoga berkelanjutan!',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 189,
                'comments_count' => 26,
                'is_verified' => true,
                'posted_at' => now()->subHours(9),
            ],
            [
                'pos_kebutuhan_id' => $posId,
                'profil_desa_id' => $desaId,
                'platform' => 'tiktok',
                'post_url' => 'https://www.tiktok.com/@kkn_vibes_id/video/73918293847291',
                'embed_url' => 'https://www.tiktok.com/embed/v2/73918293847291',
                'author_name' => 'Naufal Rizky (Koordinator KKN)',
                'author_username' => '@naufal_kknlife',
                'author_avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
                'caption' => 'A day in my life sebagai mahasiswa KKN di kaki gunung: Pagi sosialisasi stunting di Posyandu Melati, siang ngoding portal desa, sore main voli bareng karang taruna! 🏔️✨ #KKNJawabarat #DesaBinaan #BaktiNusantara',
                'media_type' => 'video',
                'media_url' => 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 1250,
                'comments_count' => 140,
                'is_verified' => true,
                'posted_at' => now()->subDays(1),
            ],
            [
                'pos_kebutuhan_id' => $posId,
                'profil_desa_id' => $desaId,
                'platform' => 'youtube',
                'post_url' => 'https://www.youtube.com/watch?v=kkn_sukamaju_documentary_2026',
                'embed_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'author_name' => 'BaktiNusantara Channel',
                'author_username' => '@BaktiNusantaraOfficial',
                'author_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                'caption' => 'DOKUMENTER RESMI: Transformasi Digital Desa Wisata Berkelanjutan melalui Program Kolaborasi KKN BaktiNusantara Periode Genap 2026.',
                'media_type' => 'video',
                'media_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 580,
                'comments_count' => 64,
                'is_verified' => true,
                'posted_at' => now()->subDays(2),
            ],
            [
                'pos_kebutuhan_id' => $posId,
                'profil_desa_id' => $desaId,
                'platform' => 'instagram',
                'post_url' => 'https://www.instagram.com/p/DFstudentkkn_sukamaju_02',
                'embed_url' => 'https://www.instagram.com/p/DFstudentkkn_sukamaju_02/embed',
                'author_name' => 'Dinas Pemberdayaan Masyarakat Desa',
                'author_username' => '@dpmd_jawabarat',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Kunjungan monitoring evaluasi lapangan Pos KKN Tematik Desa Binaan. Integrasi data logbook dan verifikasi luaran desa kini 100% tercatat di platform terpadu BaktiNusantara.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 415,
                'comments_count' => 31,
                'is_verified' => true,
                'posted_at' => now()->subDays(3),
            ],
        ];

        foreach ($posts as $postData) {
            MedsosPost::create($postData);
        }
    }
}
