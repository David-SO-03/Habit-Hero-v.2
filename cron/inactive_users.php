<?php

require __DIR__ . "/../backend/push.php";

$users = $db->query("
  SELECT id, push_subscription
  FROM users
  WHERE
    last_open < NOW() - INTERVAL '4 days'
    AND inactive_notified = false
    AND push_subscription IS NOT NULL
");

foreach ($users as $user) {
  sendPush(
    $user["push_subscription"],
    "👀 Te echamos de menos",
    "Llevas 4 días sin entrar en Habit Hero"
  );

  $stmt = $db->prepare("
    UPDATE users
    SET inactive_notified = true
    WHERE id = ?
  ");
  $stmt->execute([$user["id"]]);
}
