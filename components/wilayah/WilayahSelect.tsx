'use client';

import React, { useState, useEffect } from 'react';
import { Province, Regency, District, Village, SelectedWilayahHierarchy } from '@/lib/wilayah-types';
import { WilayahService } from '@/lib/wilayah-api';
import { MapPin, Building2, Landmark, Compass, Loader2 } from 'lucide-react';

interface WilayahSelectProps {
  initialProvinceId?: string;
  initialRegencyId?: string;
  initialDistrictId?: string;
  initialVillageId?: string;
  onChange?: (selected: SelectedWilayahHierarchy) => void;
  required?: boolean;
  showCoordinates?: boolean;
  className?: string;
}

export function WilayahSelect({
  initialProvinceId = '',
  initialRegencyId = '',
  initialDistrictId = '',
  initialVillageId = '',
  onChange,
  required = true,
  showCoordinates = true,
  className = '',
}: WilayahSelectProps) {
  // State data lists
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // State selections
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialProvinceId);
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>(initialRegencyId);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId);
  const [selectedVillageId, setSelectedVillageId] = useState<string>(initialVillageId);

  // Loading indicators
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Load Provinces on mount
  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true);
      try {
        const data = await WilayahService.getProvinces();
        setProvinces(data);
      } catch (err) {
        console.error('Failed to load provinces:', err);
      } finally {
        setLoadingProvinces(false);
      }
    }
    loadProvinces();
  }, []);

  // Load Regencies when Province changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setRegencies([]);
      setSelectedRegencyId('');
      setDistricts([]);
      setSelectedDistrictId('');
      setVillages([]);
      setSelectedVillageId('');
      return;
    }

    async function loadRegencies() {
      setLoadingRegencies(true);
      try {
        const data = await WilayahService.getRegencies(selectedProvinceId);
        setRegencies(data);
      } catch (err) {
        console.error('Failed to load regencies:', err);
      } finally {
        setLoadingRegencies(false);
      }
    }
    loadRegencies();
  }, [selectedProvinceId]);

  // Load Districts when Regency changes
  useEffect(() => {
    if (!selectedRegencyId) {
      setDistricts([]);
      setSelectedDistrictId('');
      setVillages([]);
      setSelectedVillageId('');
      return;
    }

    async function loadDistricts() {
      setLoadingDistricts(true);
      try {
        const data = await WilayahService.getDistricts(selectedRegencyId);
        setDistricts(data);
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    }
    loadDistricts();
  }, [selectedRegencyId]);

  // Load Villages when District changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setVillages([]);
      setSelectedVillageId('');
      return;
    }

    async function loadVillages() {
      setLoadingVillages(true);
      try {
        const data = await WilayahService.getVillages(selectedDistrictId);
        setVillages(data);
      } catch (err) {
        console.error('Failed to load villages:', err);
      } finally {
        setLoadingVillages(false);
      }
    }
    loadVillages();
  }, [selectedDistrictId]);

  // Emit change callback whenever hierarchy updates
  useEffect(() => {
    const prov = provinces.find((p) => p.id === selectedProvinceId);
    const reg = regencies.find((r) => r.id === selectedRegencyId);
    const dist = districts.find((d) => d.id === selectedDistrictId);
    const vill = villages.find((v) => v.id === selectedVillageId);

    if (onChange) {
      const activeLat = vill?.lat || dist?.lat || reg?.lat || prov?.lat;
      const activeLng = vill?.lng || dist?.lng || reg?.lng || prov?.lng;

      onChange({
        provinceId: selectedProvinceId,
        provinceName: prov?.name || '',
        regencyId: selectedRegencyId,
        regencyName: reg?.name || '',
        districtId: selectedDistrictId,
        districtName: dist?.name || '',
        villageId: selectedVillageId,
        villageName: vill?.name || '',
        postalCode: vill?.postal_code || '',
        latitude: activeLat,
        longitude: activeLng,
      });
    }
  }, [
    selectedProvinceId,
    selectedRegencyId,
    selectedDistrictId,
    selectedVillageId,
    provinces,
    regencies,
    districts,
    villages,
  ]);

  const currentVillage = villages.find((v) => v.id === selectedVillageId);
  const currentRegency = regencies.find((r) => r.id === selectedRegencyId);
  const currentProvince = provinces.find((p) => p.id === selectedProvinceId);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Pilih Provinsi */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-primary" />
              Provinsi {required && <span className="text-rose-500">*</span>}
            </span>
            {loadingProvinces && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
          </label>
          <select
            value={selectedProvinceId}
            onChange={(e) => {
              setSelectedProvinceId(e.target.value);
              setSelectedRegencyId('');
              setSelectedDistrictId('');
              setSelectedVillageId('');
            }}
            required={required}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
          >
            <option value="">-- Pilih Provinsi (38 Provinsi) --</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name} {prov.capital ? `(Ibukota: ${prov.capital})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Pilih Kabupaten / Kota */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Kabupaten / Kota {required && <span className="text-rose-500">*</span>}
            </span>
            {loadingRegencies && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
          </label>
          <select
            value={selectedRegencyId}
            disabled={!selectedProvinceId || loadingRegencies}
            onChange={(e) => {
              setSelectedRegencyId(e.target.value);
              setSelectedDistrictId('');
              setSelectedVillageId('');
            }}
            required={required}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <option value="">
              {!selectedProvinceId
                ? 'Pilih provinsi terlebih dahulu'
                : '-- Pilih Kabupaten / Kota --'}
            </option>
            {regencies.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Pilih Kecamatan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              Kecamatan {required && <span className="text-rose-500">*</span>}
            </span>
            {loadingDistricts && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />}
          </label>
          <select
            value={selectedDistrictId}
            disabled={!selectedRegencyId || loadingDistricts}
            onChange={(e) => {
              setSelectedDistrictId(e.target.value);
              setSelectedVillageId('');
            }}
            required={required}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <option value="">
              {!selectedRegencyId
                ? 'Pilih kab/kota terlebih dahulu'
                : '-- Pilih Kecamatan --'}
            </option>
            {districts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Pilih Desa / Kelurahan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Desa / Kelurahan {required && <span className="text-rose-500">*</span>}
            </span>
            {loadingVillages && <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />}
          </label>
          <select
            value={selectedVillageId}
            disabled={!selectedDistrictId || loadingVillages}
            onChange={(e) => setSelectedVillageId(e.target.value)}
            required={required}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <option value="">
              {!selectedDistrictId
                ? 'Pilih kecamatan terlebih dahulu'
                : '-- Pilih Desa / Kelurahan --'}
            </option>
            {villages.map((vill) => (
              <option key={vill.id} value={vill.id}>
                {vill.name} {vill.postal_code ? `(Kode Pos: ${vill.postal_code})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Badge & Auto-filled Geo Metadata */}
      {showCoordinates && (selectedVillageId || selectedDistrictId || selectedRegencyId) && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600 dark:text-slate-300 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[11px]">
              ID Kemendagri: {selectedVillageId || selectedDistrictId || selectedRegencyId || selectedProvinceId}
            </span>
            {currentVillage?.postal_code && (
              <span className="px-2 py-0.5 rounded-md bg-primary-100/70 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 font-mono font-bold text-[11px]">
                Kodepos: {currentVillage.postal_code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>
              GPS:{' '}
              <strong className="text-slate-700 dark:text-slate-200 font-mono">
                {currentVillage?.lat ?? currentRegency?.lat ?? currentProvince?.lat ?? '-'},{' '}
                {currentVillage?.lng ?? currentRegency?.lng ?? currentProvince?.lng ?? '-'}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
