<?php
// backend/db.php

// ✅ ตั้งค่าการเชื่อมต่อให้ตรงกับ phpMyAdmin ของเธอ
$DB_HOST = "127.0.0.1";   // ใช้ 127.0.0.1 แทน localhost เพื่อบังคับใช้ TCP
$DB_USER = "root";
$DB_PASS = "";            // ถ้าใช้ MAMP ปกติจะเป็น "root"
$DB_NAME = "Project";     // ชื่อ database ตามที่เห็นใน phpMyAdmin
$DB_PORT = 3306;          // ❗ เปลี่ยนให้ตรงกับ port ของ MySQL (เช่น 8889)

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

/**
 * ฟังก์ชันคืนค่า mysqli connection
 * ไฟล์อื่น ๆ เรียกใช้ด้วย:  $conn = get_db();
 */
function get_db()
{
    global $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT;

    static $conn = null; // ใช้ connection เดิม ไม่สร้างใหม่ทุกครั้ง

    if ($conn === null) {
        try {
            $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
            $conn->set_charset("utf8mb4");
        } catch (mysqli_sql_exception $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                "error"   => true,
                "message" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ",
                "detail"  => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    return $conn;
}

// ✅ เผื่อไฟล์เก่า ๆ ที่ยังใช้ตัวแปร $conn โดยตรง
$conn = get_db();