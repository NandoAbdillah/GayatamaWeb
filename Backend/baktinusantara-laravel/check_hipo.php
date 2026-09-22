<?php
$content = file_get_contents('https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json');
$json = json_decode($content, true);
$idList = [];
foreach ($json as $u) {
    if (($u['country'] ?? '') === 'Indonesia') {
        $idList[] = $u;
    }
}
echo "Count Indonesia in Hipo: " . count($idList) . "\n";
foreach (array_slice($idList, 0, 5) as $item) {
    echo $item['name'] . " -> " . implode(', ', $item['domains']) . "\n";
}
