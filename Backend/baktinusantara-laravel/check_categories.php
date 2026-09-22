<?php
$data = json_decode(file_get_contents(__DIR__ . '/database/data/master_kampus_indonesia.json'), true);
echo "Total in master: " . count($data) . "\n";

$types = [];
$muh = 0;
$nu = 0;
$islam = 0;

foreach ($data as $c) {
    $name = strtolower($c['nama_universitas']);
    if (str_contains($name, 'muhammadiyah')) $muh++;
    if (str_contains($name, 'nahdlatul ulama') || str_contains($name, 'unusa') || str_contains($name, 'unu ')) $nu++;
    if (str_contains($name, 'islam')) $islam++;
    $jenis = $c['jenis'] ?? 'unknown';
    $types[$jenis] = ($types[$jenis] ?? 0) + 1;
}

echo "Muhammadiyah: {$muh}\n";
echo "Nahdlatul Ulama: {$nu}\n";
echo "Islam: {$islam}\n";
print_r($types);
