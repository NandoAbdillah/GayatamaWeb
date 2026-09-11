import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Mail, Phone, Sprout } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-navy-950 text-white mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-epilogue font-bold text-lg text-white">BaktiNusantara</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-jakarta">
              Platform kolaborasi terpadu Kuliah Kerja Nyata (KKN) Tematik Indonesia. Menghubungkan
              aspirasi warga desa, inovasi mahasiswa, bimbingan dosen, dan pengabdian universitas.
            </p>
          </div>

          {/* Col 2: Navigasi Portal */}
          <div className="space-y-3">
            <h4 className="font-epilogue font-bold text-xs text-white uppercase tracking-wider">
              Portal Pengguna
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-jakarta">
              <li>
                <Link href="/mahasiswa/dashboard" className="hover:text-white transition-colors">
                  Portal Mahasiswa
                </Link>
              </li>
              <li>
                <Link href="/perangkat-desa/dashboard" className="hover:text-white transition-colors">
                  Portal Mitra Desa
                </Link>
              </li>
              <li>
                <Link href="/dosen/dashboard" className="hover:text-white transition-colors">
                  Portal Dosen Pembimbing (DPL)
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  Portal Monev LPPM Kampus
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Fitur Publik */}
          <div className="space-y-3">
            <h4 className="font-epilogue font-bold text-xs text-white uppercase tracking-wider">
              Layanan Terbuka
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-jakarta">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Katalog Pos Kebutuhan Desa
                </Link>
              </li>
              <li>
                <Link href="/maps" className="hover:text-white transition-colors">
                  Peta Sebaran & Radius KKN
                </Link>
              </li>
              <li>
                <Link href="/aspirasi" className="hover:text-white transition-colors">
                  Formulir Aspirasi Warga
                </Link>
              </li>
              <li>
                <Link href="/portofolio" className="hover:text-white transition-colors">
                  Galeri Karya & Luaran KKN
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Bantuan */}
          <div className="space-y-3">
            <h4 className="font-epilogue font-bold text-xs text-white uppercase tracking-wider">
              Sekretariat KKN
            </h4>
            <div className="space-y-2 text-xs text-slate-400 font-jakarta">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Gedung LPPM Lt. 3, Kampus Terpadu Nusantara</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span>lppm-kkn@gayatama.ac.id</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>(021) 7890-1234 / 0812-3456-7890</span>
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-jakarta gap-4">
          <p>© 2026 BaktiNusantara — Gayatama Web Platform. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Didedikasikan untuk kemajuan desa di Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
