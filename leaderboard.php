<?php
$conn = new mysqli("127.0.0.1:3306", "root", "abhi2209@krish", "typing_game");
$result = $conn->query("SELECT * FROM scores ORDER BY score DESC");
?>
<!DOCTYPE html>
<html>
<head>
<title>Leaderboard</title>
<style>
body { background: black; color: #00ff00; font-family: Courier; }
table { width: 80%; margin: auto; border-collapse: collapse; margin-top: 40px; }
th, td { border: 1px solid #00ff00; padding: 10px; text-align: center; }
h1 { text-align: center; text-shadow: 0 0 10px #00ff00; }
</style>
</head>
<body>
<h1>LEADERBOARD</h1>
<table>
<tr><th>ID</th><th>Player</th><th>Score</th><th>Time</th></tr>
<?php while($row = $result->fetch_assoc()): ?>
<tr>
<td><?= $row['id'] ?></td>
<td><?= $row['player_name'] ?></td>
<td><?= $row['score'] ?></td>
<td><?= $row['played_at'] ?></td>
</tr>
<?php endwhile; ?>
</table>
</body>
</html>
