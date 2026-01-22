<?php
require __DIR__ . "/../backend/push.php";

// Obtener todas las suscripciones
$subs = $db->query("SELECT subscription FROM subscriptions")->fetchAll(PDO::FETCH_COLUMN);

foreach ($subs as $subJson) {
    sendPush($subJson, "👀 Te echamos de menos", "Llevas 4 días sin abrir Habit Hero");
}
