<?php
session_start();
require('routeros_api.class.php');

if (!isset($_POST['username']) || !isset($_POST['option'])) {
  echo json_encode(["success" => false, "error" => "بيانات ناقصة"]);
  exit;
}

$username = $_POST['username'];
$option = $_POST['option']; // قد تكون "renew" أو رقم جيجا

$ip = $_SESSION['ip'];
$user = $_SESSION['username'];
$pass = $_SESSION['password'];

$API = new RouterosAPI();

if ($API->connect($ip, $user, $pass)) {
    $userData = $API->comm("/ip/hotspot/user/print", [
        "?name" => $username
    ]);

    if (count($userData) === 0) {
        echo json_encode(["success" => false, "error" => "المستخدم غير موجود"]);
        exit;
    }

    $userObj = $userData[0];
    $id = $userObj[".id"];

    $bytes_in = isset($userObj["bytes-in"]) ? (int)$userObj["bytes-in"] : 0;
    $bytes_out = isset($userObj["bytes-out"]) ? (int)$userObj["bytes-out"] : 0;
    $used = $bytes_in + $bytes_out;

    $currentLimit = isset($userObj["limit-bytes-total"]) ? (int)$userObj["limit-bytes-total"] : 0;

    $remain = $currentLimit - $used;
    if ($remain < 0) $remain = 0;

    // تحديد القيمة الجديدة
    if ($option === "renew") {
        $newLimit = $remain;
    } else {
        $addedBytes = (int)$option * 1024 * 1024 * 1024; // تحويل الجيجا إلى بايت
        $newLimit = $remain + $addedBytes;
    }

    // تحديث البيانات
    $API->comm("/ip/hotspot/user/set", [
        ".id" => $id,
        "limit-bytes-total" => $newLimit,
        "disabled" => "no"
    ]);

    // تصفير الاستهلاك
    $API->comm("/ip/hotspot/user/reset-counters", [
        ".id" => $id
    ]);

    echo json_encode([
        "success" => true,
        "name" => $username,
        "limit" => $newLimit,
        "used" => 0,
        "remain" => $newLimit,
        "status" => "✅ مفعل"
    ]);
} else {
    echo json_encode(["success" => false, "error" => "فشل الاتصال بالميكروتك"]);
}
?>