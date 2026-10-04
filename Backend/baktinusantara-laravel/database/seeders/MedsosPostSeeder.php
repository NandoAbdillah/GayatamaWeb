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
        $allPos = PosKebutuhan::all()->keyBy('judul');
        $allDesa = ProfilDesa::all()->keyBy('nama_desa');

        $posts = [
            [
                'pos_kebutuhan_id' => $allPos->get('Digitalisasi Branding dan E-Commerce UMKM Kripik Singkong')?->id ?? PosKebutuhan::first()?->id,
                'profil_desa_id' => $allDesa->get('Desa Sukamaju')?->id ?? ProfilDesa::first()?->id,
                'platform' => 'instagram',
                'post_url' => 'https://www.instagram.com/p/DFstudentkkn_sukamaju_01',
                'embed_url' => 'https://www.instagram.com/p/DFstudentkkn_sukamaju_01/embed',
                'author_name' => 'Tim KKN Tematik Sukamaju UNESA',
                'author_username' => '@kkn.sukamaju2026',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Hari ke-14 di Desa Sukamaju, Jombang! 🌾 Bersama warga pengrajin kripik, tim mahasiswa berhasil menyelesaikan desain 15 label kemasan standing pouch modern dan membuka official store online. Semangat UMKM naik kelas! #BaktiNusantara #KKNTematik #DigitalisasiDesa #UNESA',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 342,
                'comments_count' => 48,
                'is_verified' => true,
                'posted_at' => now()->subHours(3),
            ],
            [
                'pos_kebutuhan_id' => $allPos->get('Modernisasi Rantai Pasok Susu Sapi Perah & Diversifikasi Olahan Keju Organik')?->id,
                'profil_desa_id' => $allDesa->get('Desa Wisata Pujon Kidul')?->id,
                'platform' => 'instagram',
                'post_url' => 'https://www.instagram.com/p/DFkkn_ub_pujon_01',
                'embed_url' => 'https://www.instagram.com/p/DFkkn_ub_pujon_01/embed',
                'author_name' => 'KKN Tematik Agro UB 2026',
                'author_username' => '@kkn.ub.pujonkidul',
                'author_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Dari peternak lokal untuk Indonesia! 🧀🥛 Mahasiswa UB bersama kelompok wanita tani Pujon Kidul sukses memproduksi batch pertama Mozarella Organik Desa. Siap dipasok ke hotel-hotel Kota Batu! #BrawijayaMengabdi #BaktiNusantara #SDGsDesa',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 520,
                'comments_count' => 67,
                'is_verified' => true,
                'posted_at' => now()->subHours(6),
            ],
            [
                'pos_kebutuhan_id' => $allPos->get('Implementasi Smart Greenhouse IoT dan Panel Surya Kebun Sayur Hidroponik')?->id,
                'profil_desa_id' => $allDesa->get('Desa Cibodas')?->id,
                'platform' => 'tiktok',
                'post_url' => 'https://www.tiktok.com/@itb_mengabdi/video/73918293847291',
                'embed_url' => 'https://www.tiktok.com/embed/v2/73918293847291',
                'author_name' => 'Fathur (ITB Smart Village Team)',
                'author_username' => '@itb_smartvillage',
                'author_avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Ngoding IoT di kaki Gunung Tangkuban Parahu! ☀️🌱 Otomasi irigasi sayur hidroponik pakai tenaga surya akhirnya live 100%. Petani milenial Cibodas gak perlu siram manual lagi! #KKNITB #IoTpertanian #BaktiNusantara #TeknologiTepatGuna',
                'media_type' => 'video',
                'media_url' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 2450,
                'comments_count' => 210,
                'is_verified' => true,
                'posted_at' => now()->subDays(1),
            ],
            [
                'pos_kebutuhan_id' => $allPos->get('Sistem Reservasi Wisata Perahu Karst Terpadu & Pengelolaan Sanitasi Ramah Sungai')?->id,
                'profil_desa_id' => $allDesa->get('Desa Salenrang (Rammang-Rammang)')?->id,
                'platform' => 'youtube',
                'post_url' => 'https://www.youtube.com/watch?v=unhas_rammang_karst_2026',
                'embed_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'author_name' => 'UNHAS Mengabdi Maros',
                'author_username' => '@UnhasPeduliKarst',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                'caption' => 'DOKUMENTER: Harmonisasi Konservasi Karst dan Digitalisasi Wisata Perahu di Kampung Rammang-Rammang Maros bersama Mahasiswa Universitas Hasanuddin.',
                'media_type' => 'video',
                'media_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 890,
                'comments_count' => 105,
                'is_verified' => true,
                'posted_at' => now()->subDays(2),
            ],
            [
                'pos_kebutuhan_id' => $allPos->get('Digitalisasi Warisan Tenun Tradisional Minangkabau & E-Katalog Nagari Pariangan')?->id,
                'profil_desa_id' => $allDesa->get('Nagari Pariangan')?->id,
                'platform' => 'facebook',
                'post_url' => 'https://www.facebook.com/kkn.unand.pariangan/posts/1092837482',
                'embed_url' => null,
                'author_name' => 'Kerapatan Adat Nagari Pariangan',
                'author_username' => 'KAN Nagari Pariangan',
                'author_avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Apresiasi yang tulus kepada anak-anak kami mahasiswa KKN Universitas Andalas atas karya pencatatan digital 20 motif tenun songket nagari tertua di Minangkabau. Warisan leluhur kami kini terjaga untuk dunia.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 310,
                'comments_count' => 42,
                'is_verified' => true,
                'posted_at' => now()->subDays(3),
            ],
            [
                'pos_kebutuhan_id' => $allPos->get('Pelestarian Arsitektur Bambu Tradisional & Inovasi Suvenir Daur Ulang Rebung')?->id,
                'profil_desa_id' => $allDesa->get('Desa Adat Penglipuran')?->id,
                'platform' => 'instagram',
                'post_url' => 'https://www.instagram.com/p/DFkkn_unud_penglipuran_01',
                'embed_url' => 'https://www.instagram.com/p/DFkkn_unud_penglipuran_01/embed',
                'author_name' => 'KKN PPM UNUD Penglipuran',
                'author_username' => '@kkn.unud.penglipuran',
                'author_avatar' => 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=120&auto=format&fit=crop&q=80',
                'caption' => 'Rahajeng! 🎋 Menjaga harmoni Tri Hita Karana di Desa Adat Terbersih Dunia. Tim mahasiswa Arsitektur UNUD mendokumentasikan konstruksi angkul-angkul bambu tahan gempa khas Penglipuran Bangli. #UNUDMengabdi #BaktiNusantara #PenglipuranBali',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
                'likes_count' => 640,
                'comments_count' => 52,
                'is_verified' => true,
                'posted_at' => now()->subDays(4),
            ],
        ];

        foreach ($posts as $postData) {
            MedsosPost::create($postData);
        }
    }
}
