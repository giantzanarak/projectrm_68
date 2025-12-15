<?php
// backend/get_fabrics.php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/db.php";   // ใช้ $conn จาก db.php

try {
    // ✅ ดึงฟิลด์ให้ตรงกับตาราง Fabric ที่อยู่ใน phpMyAdmin
    $sql = "
        SELECT
            idFabric,
            name_f,
            width_cm,
            weight_gm,
            thickness_mm,
            status_f
        FROM Fabric
        WHERE deleted_at IS NULL
            OR deleted_at IS NULL
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];

    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            "id"           => (int)$row["idFabric"],
            "name"         => $row["name_f"],
            "width_cm"     => $row["width_cm"],
            "weight_gm"    => $row["weight_gm"],
            "thickness_mm" => $row["thickness_mm"],
            "status"       => $row["status_f"] ?? "พร้อมใช้",
        ];
    }

    echo json_encode($rows, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "error"   => true,
        "message" => "ไม่สามารถโหลดข้อมูล Fabric ได้",
        "detail"  => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}