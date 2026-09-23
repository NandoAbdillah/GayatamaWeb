<?php

$apiKey = 'aip_live_Kpft1RibVLVlokZ8gWbKMVd1YXM49vPO';
$totalPages = 47;
$allItems = [];
$missingPages = [];

// Fetch in batches of 8
$batchSize = 8;
for ($start = 1; $start <= $totalPages; $start += $batchSize) {
    $end = min($start + $batchSize - 1, $totalPages);
    $mh = curl_multi_init();
    $curlArray = [];

    for ($p = $start; $p <= $end; $p++) {
        $ch = curl_init("https://use.apiindonesia.id/api/v1/kampus?page={$p}&per_page=100");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "x-api-key: {$apiKey}",
            "Accept: application/json",
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_multi_add_handle($mh, $ch);
        $curlArray[$p] = $ch;
    }

    $running = null;
    do {
        curl_multi_exec($mh, $running);
        curl_multi_select($mh, 0.5);
    } while ($running > 0);

    foreach ($curlArray as $p => $ch) {
        $content = curl_multi_getcontent($ch);
        $json = json_decode($content, true);
        if (!empty($json['data']) && is_array($json['data'])) {
            foreach ($json['data'] as $item) {
                $allItems[] = $item;
            }
        } else {
            $missingPages[] = $p;
        }
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }
    curl_multi_close($mh);
    echo "Progress: page {$start} to {$end} done. Current total: " . count($allItems) . "\n";
    usleep(200000); // 0.2s pause between batches
}

// Retry missing pages if any
if (!empty($missingPages)) {
    echo "Retrying missing pages: " . implode(', ', $missingPages) . "\n";
    foreach ($missingPages as $p) {
        $ch = curl_init("https://use.apiindonesia.id/api/v1/kampus?page={$p}&per_page=100");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "x-api-key: {$apiKey}",
            "Accept: application/json",
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 25);
        $res = curl_exec($ch);
        $json = json_decode($res, true);
        if (!empty($json['data']) && is_array($json['data'])) {
            foreach ($json['data'] as $item) {
                $allItems[] = $item;
            }
        }
        curl_close($ch);
        usleep(300000);
    }
}

file_put_contents(__DIR__ . '/raw_kampus_all.json', json_encode($allItems, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "TOTAL FINAL: " . count($allItems) . " items saved!\n";
