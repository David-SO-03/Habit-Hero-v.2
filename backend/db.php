<?php
require __DIR__ . "/../vendor/autoload.php";

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/..");
$dotenv->load();

$host = $_ENV['DB_HOST'];
$dbname = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];
$sslmode = $_ENV['DB_SSLMODE'];

$dsn = "pgsql:host=$host;dbname=$dbname;sslmode=$sslmode";

try {
    $db = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    // echo "Conectado ✅";
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
