<?php
// backend/get_fabric_types.php
require_once "db.php";

header("Content-Type: application/json; charset=utf-8");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // ใช้ชื่อคอลัมน์จริง แล้ว alias เป็น id, name
    $sql = "SELECT type_id AS id, type_name AS name FROM fabric_types ORDER BY type_id ASC";
    $result = $conn->query($sql);

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            "id"   => (int)$row["id"],
            "name" => $row["name"],
        ];
    }

    echo json_encode($rows, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "error"   => true,
        "message" => "ไม่สามารถโหลดประเภทผ้าได้",
        "detail"  => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}