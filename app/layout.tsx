import type { Metadata } from 'next';
import { Epilogue, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

const epilogue = Epilogue({
  subsets: ['latin'],
  variable: '--font-epilogue',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'BaktiNusantara — Platform Kolaborasi KKN & Desa Terpadu',
  description:
    'Sistem manajemen Kuliah Kerja Nyata (KKN) Tematik terintegrasi untuk Mahasiswa, Mitra Perangkat Desa, Dosen Pembimbing Lapangan (DPL), dan LPPM Universitas.',
  keywords: [
    'KKN',
    'Kuliah Kerja Nyata',
    'BaktiNusantara',
    'Gayatama',
    'Pemberdayaan Desa',
    'Logbook KKN',
    'BAST Desa',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${epilogue.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen flex flex-col font-jakarta bg-surface-canvas text-navy-950">
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
