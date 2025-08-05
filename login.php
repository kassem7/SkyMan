<?php
session_start();
require('routeros_api.class.php');

$ip = $_POST['ip'] ?? '';
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$API = new RouterosAPI();

if ($API->connect($ip, $username, $password)) {
    $_SESSION['ip'] = $ip;
    $_SESSION['username'] = $username;
    $_SESSION['password'] = $password;
    echo "نجاح";
} else {
    echo "فشل الاتصال بالميكروتك";
}
?>


//يدخل dashboard مباشره 
/*<?php
require('routeros_api.class.php');

$ip = $_POST['ip'];
$username = $_POST['username'];
$password = $_POST['password'];

$API = new RouterosAPI();

if ($API->connect($ip, $username, $password)) {
    session_start();
    $_SESSION['ip'] = $ip;
    $_SESSION['username'] = $username;
    $_SESSION['password'] = $password;
    header("Location: dashboard.html");
} else {
    echo "فشل الاتصال بالميكروتك. تحقق من البيانات.";
}
?>*/