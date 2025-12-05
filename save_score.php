<?php

$servername = "127.0.0.1";
$username   = "root";
$password   = "abhi2209@krish";   // your password
$dbname     = "typing_game";
$port       = 3306;

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$player = $_POST['player'] ?? '';
$score  = $_POST['score'] ?? '';

$stmt = $conn->prepare("INSERT INTO scores (player_name, score) VALUES (?, ?)");
$stmt->bind_param("si", $player, $score);

$stmt->execute();

echo "Score saved successfully!";
$stmt->close();
$conn->close();

?>
