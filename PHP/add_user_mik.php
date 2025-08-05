<?php
session_start();
require("../routeros_api.class.php");

$ip = $_SESSION['ip'];
$username = $_SESSION['username'];
$password = $_SESSION['password'];

$API = new RouterosAPI();
if (!$API->connect($ip, $username, $password)) {
  exit("❌ فشل الاتصال بالميكروتك");
}

// استقبال البيانات من النموذج
$user     = $_POST['username'] ?? '';
$pass     = $_POST['password'] ?? '';
$validity = $_POST['validity'] ?? '';
$limit_gb = $_POST['limit'] ?? '';
$profile  = $_POST['profile'] ?? 'default';
$note     = $_POST['note'] ?? '';
$price    = $_POST['price'] ?? '';
$seller   = $_POST['seller'] ?? '';
$bind     = $_POST['bind'] === "yes";

// تأكد من أن اسم المستخدم موجود
if (empty($user)) {
  exit("❌ يجب إدخال اسم المستخدم");
}

// تحويل الحجم إلى بايت إذا وُجد
$limit_bytes = $limit_gb ? (int)$limit_gb * 1073741824 : null;

// حذف الكرت السابق إن وُجد
$existing = $API->comm("/ip/hotspot/user/print", ["?name" => $user]);
if (!empty($existing)) {
  $API->comm("/ip/hotspot/user/remove", [".id" => $existing[0][".id"]]);
}

// إعداد المعطيات
$params = [
  "name" => $user,
  "profile" => $profile,
  "comment" => "📆 {$validity} يوم - 💰 {$price} - 📝 {$note} - 📍 {$seller}"
];

// ✅ فقط إذا أُدخلت كلمة مرور يدويًا
if (!empty($pass)) {
  $params["password"] = $pass;
}

if ($limit_bytes) {
  $params["limit-bytes-total"] = $limit_bytes;
}

if ($bind) {
  $params["disabled"] = "true";
}

// تنفيذ إضافة الكرت
$API->comm("/ip/hotspot/user/add", $params);

echo "✅ تم إنشاء الكرت بنجاح باسم ($user)";