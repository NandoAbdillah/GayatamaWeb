import type { Metadata } from 'next';
import { Epilogue, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
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
    <html lang="id" className={`${epilogue.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('gayatama_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-jakarta bg-surface-canvas text-navy-950 dark:bg-[#071629] dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
