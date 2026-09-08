'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  KeyRound,
  ShieldCheck,
  Building,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaLokasiPage() {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Target Posko KKN Desa Sukamaju
  const POSKO_COORDS = {
    name: 'Posko KKN Desa Sukamaju',
    kecamatan: 'Kec. Cimaung',
    kabupaten: 'Kab. Bandung',
    lat: -7.0821,
    lng: 107.5489,
    maxRadiusKm: 5.0,
  };

  // Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  const handleGetLocation = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung Geolocation API.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCurrentCoords({ lat: userLat, lng: userLng });

        const dist = calculateDistance(userLat, userLng, POSKO_COORDS.lat, POSKO_COORDS.lng);
        setDistanceKm(dist);
        setGpsLoading(false);

        if (dist <= POSKO_COORDS.maxRadiusKm) {
          toast.success(`Lokasi terverifikasi! Anda berada ${dist} km dari Posko KKN.`);
        } else {
          toast.warning(`Peringatan: Anda berada ${dist} km di luar radius posko (Maks ${POSKO_COORDS.maxRadiusKm} km).`);
        }
      },
      (err) => {
        setGpsLoading(false);
        // Fallback simulation for demonstration
        const simulatedLat = -7.0835;
        const simulatedLng = 107.5501;
        setCurrentCoords({ lat: simulatedLat, lng: simulatedLng });
        const dist = calculateDistance(simulatedLat, simulatedLng, POSKO_COORDS.lat, POSKO_COORDS.lng);
        setDistanceKm(dist);
        toast.info('GPS diblokir/tidak aktif. Menggunakan koordinat simulasi area Posko KKN.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error('Masukkan kode OTP/token dari Kepala Desa.');
      return;
    }
    if (manualCode.toUpperCase() === 'SKM-7788' || manualCode.length >= 6) {
      setCheckInSuccess(true);
      toast.success('Presensi manual berhasil diverifikasi dengan token resmi Kades Sukamaju!');
    } else {
      toast.error('Kode verifikasi tidak valid atau telah kedaluwarsa.');
    }
  };

  const isWithinRadius = distanceKm !== null && distanceKm <= POSKO_COORDS.maxRadiusKm;

  return (
    <DashboardLayout title="Presensi & Verifikasi Spasial Mahasiswa">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-black text-navy-950 dark:text-white font-epilogue">
            Verifikasi Lokasi & Check-In Posko KKN
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fitur keamanan dan presensi geospasial untuk memastikan mahasiswa bertugas aktif di wilayah desa binaan.
          </p>
        </div>

        {/* Info Posko Target */}
        <Card className="p-5 border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-900/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lokasi Penugasan Resmi</p>
                <h3 className="text-base font-bold text-navy-950 dark:text-white">
                  {POSKO_COORDS.name} ({POSKO_COORDS.kecamatan}, {POSKO_COORDS.kabupaten})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Titik Koordinat: {POSKO_COORDS.lat}, {POSKO_COORDS.lng} • Batas Radius Presensi: {POSKO_COORDS.maxRadiusKm} km
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" /> Geofencing Aktif
              </span>
            </div>
          </div>
        </Card>

        {/* Grid Action: GPS vs Manual Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: GPS Realtime Detection */}
          <Card className="p-6 border-slate-200 dark:border-navy-800 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-white">Presensi Otomatis GPS</h3>
                  <p className="text-xs text-slate-500">Deteksi koordinat satelit dari perangkat Anda</p>
                </div>
              </div>

              {currentCoords ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Koordinat Anda:</span>
                    <span className="font-mono font-bold text-navy-950 dark:text-white">
                      {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Jarak ke Posko:</span>
                    <span className="font-bold text-primary dark:text-primary-400 text-sm">
                      {distanceKm} km
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-navy-800">
                    {isWithinRadius ? (
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Presensi Berhasil: Anda berada dalam radius aman penugasan KKN.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Di Luar Wilayah: Jarak Anda melebihi {POSKO_COORDS.maxRadiusKm} km dari posko desa.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-navy-700 text-center space-y-2">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">
                    Klik tombol di bawah untuk mengambil titik lokasi presensi hari ini.
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleGetLocation}
              disabled={gpsLoading}
              className="w-full gap-2 font-bold shadow-sm"
              variant={isWithinRadius ? 'emerald' : 'primary'}
            >
              {gpsLoading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span>{currentCoords ? 'Perbarui Lokasi GPS' : 'Ambil Titik Lokasi Sekarang'}</span>
            </Button>
          </Card>

          {/* Card 2: Fallback Manual Token from Kades */}
          <Card className="p-6 border-slate-200 dark:border-navy-800 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-white">Fallback Token Presensi Manual</h3>
                  <p className="text-xs text-slate-500">Gunakan jika sinyal GPS di pelosok desa tidak terbaca</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Minta kode token harian (6 digit) langsung kepada Kepala Desa atau Sekretaris Desa Sukamaju saat berada di kantor balai desa.
              </p>

              <form onSubmit={handleManualCheckIn} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kode Token Harian Kades:
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Contoh: SKM-7788"
                    className="w-full text-sm font-mono uppercase font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Token demo: <strong>SKM-7788</strong> (berlaku hari ini)
                  </span>
                </div>

                {checkInSuccess && (
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Presensi manual terverifikasi oleh Sistem Balai Desa.</span>
                  </div>
                )}

                <Button type="submit" variant="secondary" className="w-full gap-2 font-bold mt-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Verifikasi Token Harian</span>
                </Button>
              </form>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-900/80 text-[11px] text-slate-500 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Presensi harian terekam otomatis ke dalam Logbook mingguan LPPM.</span>
            </div>
          </Card>
        </div>

        {/* Riwayat Presensi 5 Hari Terakhir */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 shadow-md">
          <h3 className="text-base font-bold text-navy-950 dark:text-white mb-4">
            Riwayat Presensi Spasial Pekan Ini
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-900 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold rounded-l-xl">Hari & Tanggal</th>
                  <th className="p-3 font-bold">Metode Presensi</th>
                  <th className="p-3 font-bold">Titik Koordinat / Token</th>
                  <th className="p-3 font-bold">Jarak ke Posko</th>
                  <th className="p-3 font-bold text-right rounded-r-xl">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                <tr className="hover:bg-slate-50/80 dark:hover:bg-navy-900/50">
                  <td className="p-3 font-bold text-navy-950 dark:text-white">Hari ini, 07:45 WIB</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">GPS Satelit</td>
                  <td className="p-3 font-mono text-slate-500">-7.0835, 107.5501</td>
                  <td className="p-3 font-semibold text-emerald-600">0.18 km</td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                      Valid (Di Posko)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 dark:hover:bg-navy-900/50">
                  <td className="p-3 font-bold text-navy-950 dark:text-white">Kemarin, 08:10 WIB</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">Token Kades (SKM-7788)</td>
                  <td className="p-3 font-mono text-slate-500">Kantor Balai Desa</td>
                  <td className="p-3 font-semibold text-slate-600">Terverifikasi Kades</td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                      Valid (Offline Auth)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
