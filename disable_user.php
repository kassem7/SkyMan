<?php
session_start();
require('routeros_api.class.php');

$ip = $_SESSION['ip'];
$username = $_SESSION['username'];
$password = $_SESSION['password'];

$API = new RouterosAPI();

if (!$API->connect($ip, $username, $password)) {
    echo json_encode(["success" => false, "error" => "فشل الاتصال"]);
    exit;
}

if (!isset($_POST['username'])) {
    echo json_encode(["success" => false, "error" => "اسم المستخدم ناقص"]);
    exit;
}

$usernameToDisable = $_POST['username'];

$userData = $API->comm("/ip/hotspot/user/print", [
    "?name" => $usernameToDisable
]);

if (count($userData) === 0) {
    echo json_encode(["success" => false, "error" => "المستخدم غير موجود"]);
    exit;
}

$API->comm("/ip/hotspot/user/set", [
    ".id" => $userData[0][".id"],
    "disabled" => "true"
]);

echo json_encode(["success" => true]);
?>