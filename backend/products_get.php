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
$sql = "SELECT
          idProducts AS id,
          category,
          name,
          size,
          price,
          unit,
          description,
          stock,
          Fabric_idFabric AS fabric_id,
          created_at,
          updated_at
        FROM Products
        WHERE deleted_at IS NULL
        ORDER BY idProducts DESC";

$result = $conn->query($sql);

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products, JSON_UNESCAPED_UNICODE);  // <<< เพิ่ม FLAG นี้