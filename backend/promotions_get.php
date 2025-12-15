<?php
// backend/promotions_get.php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

$sql = "SELECT 
            idPromotion,
            Promotion_details,
            promo_code,
            PER_ITEM,
            created_at,
            updated_at
        FROM Promotion
        WHERE deleted_at IS NULL";

$result = $conn->query($sql);

$data = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "id"         => (int)$row["idPromotion"],
            "details"    => $row["Promotion_details"],
            "code"       => $row["promo_code"],
            "per_item"   => isset($row["PER_ITEM"]) ? (int)$row["PER_ITEM"] : null,
            "created_at" => $row["created_at"],
            "updated_at" => $row["updated_at"],
        ];
    }
}

echo json_encode($data, JSON_UNESCAPED_UNICODE);