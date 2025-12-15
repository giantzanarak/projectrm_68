<?php
// ----- CORS / JSON HEADER -----
header("Content-Type: application/json; charset=utf-8");
// อนุญาตให้ frontend ที่รันด้วย Vite (port 5173) ยิงมาได้
header("Access-Control-Allow-Origin: http://localhost:5173");
// ถ้ามี POST/PUT/DELETE ต้องอนุญาต method เหล่านี้ด้วย
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// อนุญาต header ที่ใช้ใน fetch
header("Access-Control-Allow-Headers: Content-Type");

// สำหรับ preflight request (OPTIONS) ให้ตอบกลับเฉย ๆ
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require "db.php";
$data = json_decode(file_get_contents("php://input"), true);

$id          = $data["id"]          ?? 0;
$category    = $data["category"]    ?? "";
$name        = $data["name"]        ?? "";
$size        = $data["size"]        ?? "";
$price       = $data["price"]       ?? 0;
$unit        = $data["unit"]        ?? "";
$description = $data["description"] ?? "";

$sql = "UPDATE Products
        SET category    = ?,
            name        = ?,
            size        = ?,
            price       = ?,
            unit        = ?,
            description = ?,
            updated_at  = NOW()
        WHERE idProducts = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssissi", $category, $name, $size, $price, $unit, $description, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}