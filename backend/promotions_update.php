<?php
// backend/promotions_update.php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

$body = json_decode(file_get_contents("php://input"), true);

$id       = $body["id"]       ?? null;
$details  = $body["details"]  ?? "";
$code     = $body["code"]     ?? "";
$perItem  = $body["per_item"] ?? 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "ต้องมี id ของโปรโมชั่น"], JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt = $conn->prepare(
    "UPDATE Promotion
     SET Promotion_details = ?, promo_code = ?, PER_ITEM = ?, updated_at = NOW()
     WHERE idPromotion = ?"
);
$stmt->bind_param("ssii", $details, $code, $perItem, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(["error" => $stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();