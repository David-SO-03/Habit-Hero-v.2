<?php

require __DIR__ . "/../backend/push.php";

$weekYear = date("o-W");

$check = $db->prepare("
  SELECT 1 FROM weekly_notifications WHERE week_year = ?
");
$check->execute([$weekYear]);

if ($check->fetch()) exit;

$users = $db->query("
  SELECT push_subscription
  FROM users
  WHERE push_subscription IS NOT NULL
");

foreach ($users as $user) {
  sendPush(
    $user["push_subscription"],
    "🔥 Nueva semana",
    "Empieza una nueva semana. ¡Vamos a por otra racha!"
  );
}

$stmt = $db->prepare("
  INSERT INTO weekly_notifications (week_year, sent_at)
  VALUES (?, NOW())
");
$stmt->execute([$weekYear]);
