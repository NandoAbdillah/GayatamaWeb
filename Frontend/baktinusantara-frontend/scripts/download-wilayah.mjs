/**
 * Script untuk mengunduh dataset lengkap Wilayah Indonesia dari API emsifa v2
 * dan menyimpannya sebagai file JSON / SQL Seed untuk integrasi Database lokal.
 *
 * Penggunaan:
 * node scripts/download-wilayah.mjs --provinces
 * node scripts/download-wilayah.mjs --all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/v2';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'wilayah');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchJson(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

async function downloadProvincesAndRegencies() {
  console.log(' Mengunduh 38 Provinsi Indonesia...');
  const provinces = await fetchJson('/provinces.json');
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'provinces.json'),
    JSON.stringify(provinces, null, 2)
  );
  console.log(` Berhasil menyimpan ${provinces.length} provinsi ke provinces.json`);

  console.log(' Mengunduh seluruh Kabupaten / Kota per provinsi...');
  const allRegencies = [];

  for (const prov of provinces) {
    process.stdout.write(`  - Mengunduh Kab/Kota untuk: ${prov.name}... `);
    const regencies = await fetchJson(`/regencies/${prov.id}.json`);
    allRegencies.push(...regencies);
    console.log(`${regencies.length} kab/kota`);
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'regencies.json'),
    JSON.stringify(allRegencies, null, 2)
  );
  console.log(` Berhasil menyimpan ${allRegencies.length} kabupaten/kota ke regencies.json`);

  // Generate SQL Seed File
  generateSqlSeed(provinces, allRegencies);
}

function generateSqlSeed(provinces, regencies) {
  let sql = `-- ========================================================\n`;
  sql += `-- DATABASE SEED: WILAYAH INDONESIA (Provinsi & Kab/Kota)\n`;
  sql += `-- Generated from emsifa/api-wilayah-indonesia v2\n`;
  sql += `-- ========================================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS provinces (\n`;
  sql += `  id VARCHAR(10) PRIMARY KEY,\n`;
  sql += `  name VARCHAR(100) NOT NULL,\n`;
  sql += `  capital VARCHAR(100),\n`;
  sql += `  lat DECIMAL(10, 7),\n`;
  sql += `  lng DECIMAL(10, 7),\n`;
  sql += `  population BIGINT,\n`;
  sql += `  total_area DECIMAL(12, 3)\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS regencies (\n`;
  sql += `  id VARCHAR(10) PRIMARY KEY,\n`;
  sql += `  province_id VARCHAR(10) REFERENCES provinces(id),\n`;
  sql += `  name VARCHAR(100) NOT NULL,\n`;
  sql += `  capital VARCHAR(100),\n`;
  sql += `  lat DECIMAL(10, 7),\n`;
  sql += `  lng DECIMAL(10, 7),\n`;
  sql += `  population BIGINT,\n`;
  sql += `  total_area DECIMAL(12, 3)\n`;
  sql += `);\n\n`;

  sql += `INSERT INTO provinces (id, name, capital, lat, lng, population, total_area) VALUES\n`;
  const provValues = provinces.map(p => {
    return `('${p.id}', '${p.name.replace(/'/g, "''")}', '${(p.capital || '').replace(/'/g, "''")}', ${p.lat || 'NULL'}, ${p.lng || 'NULL'}, ${p.population || 'NULL'}, ${p.total_area || 'NULL'})`;
  });
  sql += provValues.join(',\n') + ';\n\n';

  sql += `INSERT INTO regencies (id, province_id, name, capital, lat, lng, population, total_area) VALUES\n`;
  const regValues = regencies.map(r => {
    const provId = r.id.split('.')[0];
    return `('${r.id}', '${provId}', '${r.name.replace(/'/g, "''")}', '${(r.capital || '').replace(/'/g, "''")}', ${r.lat || 'NULL'}, ${r.lng || 'NULL'}, ${r.population || 'NULL'}, ${r.total_area || 'NULL'})`;
  });
  sql += regValues.join(',\n') + ';\n';

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wilayah_seed.sql'), sql);
  console.log(` File SQL seed berhasil digenerate di data/wilayah/wilayah_seed.sql!`);
}

async function main() {
  console.log('========================================================');
  console.log(' SINKRONISASI DATASET WILAYAH INDONESIA KE DATABASE LOKAL');
  console.log(' Sumber: https://www.emsifa.com/api-wilayah-indonesia/v2');
  console.log('========================================================\n');

  try {
    await downloadProvincesAndRegencies();
    console.log('\n Selesai! Data wilayah siap digunakan sebagai database.');
  } catch (err) {
    console.error(' Terjadi kesalahan:', err);
  }
}

main();
