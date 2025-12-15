<?php
// backend/stocks_get.php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/db.php";  // ใช้ไฟล์ db.php ที่เธอมีอยู่

try {
    // ใช้ฟังก์ชันจาก db.php (ให้แน่ใจว่ามี get_db() อยู่ใน db.php แล้ว)
    $conn = get_db();

    // ดึงข้อมูลจากตาราง Stock ให้ตรงกับโครงสร้างใน phpMyAdmin
    $sql = "SELECT idStock, stock_name, stock_category, quantity, location, status FROM Stock";
    $result = $conn->query($sql);

    $stocks = [];

    while ($row = $result->fetch_assoc()) {
        $stocks[] = [
            "id"       => (int)$row["idStock"],        // ใช้เป็นรหัสสต็อก
            "name"     => $row["stock_name"],          // <<<<<< เอาชื่อจาก stock_name
            "category" => $row["stock_category"],      // ประเภทจาก stock_category
            "quantity" => (int)$row["quantity"],
            "location" => $row["location"],
            "status"   => $row["status"],
        ];
    }

    echo json_encode($stocks, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "error"   => true,
        "message" => "ไม่สามารถโหลดข้อมูล Stock ได้",
        "detail"  => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}