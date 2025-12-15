<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
require "db.php";

$sql = "SELECT size_id, size_code, use_m FROM sizes ORDER BY size_id";
$result = $conn->query($sql);

$sizes = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $sizes[] = [
            "id"          => (int)$row["size_id"],
            "size"        => $row["size_code"],
            "usePerPiece" => (float)$row["use_m"],
        ];
    }
}

echo json_encode($sizes);