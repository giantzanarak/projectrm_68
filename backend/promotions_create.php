<?php
// backend/promotions_create.php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "db.php";   // ตรงนี้ใช้ไฟล์เชื่อม DB เดิมของเธอ

// อ่าน JSON จาก body
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

// ดึงค่าจาก JSON
$details  = trim($data["details"] ?? "");
$code     = trim($data["code"] ?? "");
$perItem  = intval($data["per_item"] ?? 0);
$start    = $data["start"] ?? null;   // ตอนนี้ยังไม่ได้เก็บใน DB ก็ได้
$end      = $data["end"] ?? null;
$status   = $data["status"] ?? "เปิดใช้งาน";

// validation ง่าย ๆ
if ($details === "" || $code === "") {
    http_response_code(400);
    echo json_encode(["error" => "กรุณากรอก details และ code"]);
    exit;
}

// สมมติใช้ตัวแปร $conn หรือ $mysqli จาก db.php
// เช็คชื่อให้ตรงกับใน db.php ของเธอ (ถ้าใช้ $mysqli อยู่ก็เปลี่ยนให้ตรง)
$mysqli = $conn ?? $mysqli;

// เตรียม insert ลงตาราง Promotion
$sql = "INSERT INTO Promotion (Promotion_details, promo_code, PER_ITEM, created_at)
        VALUES (?, ?, ?, NOW())";

$stmt = $mysqli->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "เตรียมคำสั่งไม่สำเร็จ"]);
    exit;
}

$stmt->bind_param("ssi", $details, $code, $perItem);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "บันทึกข้อมูลไม่สำเร็จ"]);
    $stmt->close();
    exit;
}

$newId = $stmt->insert_id;
$stmt->close();

echo json_encode([
    "id"        => $newId,
    "details"   => $details,
    "code"      => $code,
    "per_item"  => $perItem,
    "start"     => $start,
    "end"       => $end,
    "status"    => $status,
]);