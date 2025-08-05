<?php
session_start();
require('routeros_api.class.php');

$ip = $_SESSION['ip'];
$username = $_SESSION['username'];
$password = $_SESSION['password'];

$API = new RouterosAPI();

if ($API->connect($ip, $username, $password)) {
    $users = $API->comm("/ip/hotspot/user/print");
    $result = [];

    foreach ($users as $user) {
        $name = $user['name'];
        $limit = isset($user['limit-bytes-total']) ? (int)$user['limit-bytes-total'] : 0;
        $bytes_in = isset($user['bytes-in']) ? (int)$user['bytes-in'] : 0;
        $bytes_out = isset($user['bytes-out']) ? (int)$user['bytes-out'] : 0;
        $used = $bytes_in + $bytes_out;
        $remain = $limit > 0 ? max(0, $limit - $used) : 0;
        $disabled = isset($user['disabled']) && $user['disabled'] == "true";

        if ($disabled) {
            $status = "❌ معطل";
        } elseif ($used == 0) {
            $status = "🔵 غير مستخدم";
        } elseif ($limit > 0 && $used >= $limit) {
            $status = "🟡 منتهي";
        } else {
            $status = "✅ مفعل";
        }

        $result[] = [
            'name'       => $name,
            'limit_gb'   => number_format($limit / 1073741824, 2),
            'used_gb'    => number_format($used / 1073741824, 2),
            'remain_gb'  => number_format($remain / 1073741824, 2),
            'status'     => $status
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    http_response_code(401);
    echo json_encode(["error" => "فشل الاتصال بالميكروتك"]);
}
?>