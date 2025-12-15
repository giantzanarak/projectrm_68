<?php
// backend/promotions_delete.php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

require_once "db.php";   // แก้ชื่อ path ให้ตรงกับโปรเจกต์ถ้าใช้ชื่ออื่น

// ----- รับค่า id ได้ทั้ง JSON และ $_POST -----
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$id = null;

// กรณีส่ง JSON เช่น { "id": 3 }
if (is_array($data) && isset($data["id"])) {
    $id = (int) $data["id"];
}
// กรณีส่งแบบฟอร์มปกติ id=3
if (isset($_POST["id"])) {
    $id = (int) $_POST["id"];
}

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing id"]);
    exit;
}

// ----- ลบข้อมูล -----
$stmt = $conn->prepare("DELETE FROM Promotion WHERE idPromotion = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit;
}

$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => $stmt->error]);
}

$stmt->close();
$conn->close();