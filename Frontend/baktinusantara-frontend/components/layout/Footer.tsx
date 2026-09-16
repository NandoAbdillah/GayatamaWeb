'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Mail, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const Footer: React.FC = () => {
  const t = useTranslations('footer');
  return (
    <footer className="w-full bg-navy-950 text-white border-t border-slate-800 rounded-tl-3xl rounded-tr-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
                <Image
                  src="/logo.svg"
                  alt="BaktiNusantara Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-contain drop-shadow-sm"
                />
              </div>
              <span className="font-epilogue font-bold text-lg text-white">BaktiNusantara</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-jakarta">
              {t('description')}
            </p>
          </div>

          {/* Col 2: Navigasi Portal */}
          <div className="space-y-3">
            <h4 className="font-epilogue font-bold text-xs text-white uppercase tracking-wider">
              {t('portalUsers')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-jakarta">
              <li>
                <Link href="/mahasiswa/dashboard" className="hover:text-white transition-colors">
                  {t('links.portalMahasiswa')}
                </Link>
              </li>
              <li>
                <Link href="/perangkat-desa/dashboard" className="hover:text-white transition-colors">
                  {t('links.portalMitraDesa')}
                </Link>
              </li>
              <li>
                <Link href="/dosen/dashboard" className="hover:text-white transition-colors">
                  {t('links.portalDpl')}
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  {t('links.portalLppm')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Fitur Publik */}
          <div className="space-y-3">
            <h4 className="font-epilogue font-bold text-xs text-white uppercase tracking-wider">
              {t('openServices')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-jakarta">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  {t('links.katalog')}
                </Link>
              </li>
              <li>
                <Link href="/maps" className="hover:text-white transition-colors">
                  {t('links.maps')}
                </Link>
              </li>
              <li>
                <Link href="/aspirasi" className="hover:text-white transition-colors">
                  {t('links.aspirasiForm')}
                </Link>
              </li>
              <li>
                <Link href="/portofolio" className="hover:text-white transition-colors">
                  {t('links.gallery')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Bantuan */}
          <div className="space-y-3">
            <h4 className="font-epilogue font-bold text-xs text-white uppercase tracking-wider">
              {t('secretariat')}
            </h4>
            <div className="space-y-2 text-xs text-slate-400 font-jakarta">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('contact.address')}</span>
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

        <div className="h-px bg-slate-800 my-7" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-jakarta gap-4">
          <p>{t('bottom.copyright')}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>{t('bottom.tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
