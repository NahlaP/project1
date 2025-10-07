
<?php
// /home/USER/public_html/img-proxy.php
// Redirects a key to the presigned S3 URL via your existing API proxy.

header('Cache-Control: no-cache, no-store, must-revalidate');

$key = isset($_GET['key']) ? trim($_GET['key']) : '';
if ($key === '') {
  http_response_code(400);
  echo "missing key";
  exit;
}

// Ask your backend (through the same cPanel proxy) for a presigned URL
$api = sprintf('%s/api-proxy.php?path=/upload/file-url&key=%s',
  (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'],
  urlencode($key)
);

$ch = curl_init($api);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_CONNECTTIMEOUT => 10,
  CURLOPT_TIMEOUT        => 20,
  CURLOPT_HTTPHEADER     => ['Accept: application/json'],
]);
$body = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http !== 200 || !$body) {
  http_response_code(502);
  echo "could not fetch signed url";
  exit;
}

$j = json_decode($body, true);
$url = isset($j['url']) ? $j['url'] : (isset($j['signedUrl']) ? $j['signedUrl'] : '');
if (!$url) {
  http_response_code(502);
  echo "no url returned";
  exit;
}

// 302 redirect to S3. Browsers treat it as an image on your domain (no blocker hit).
header('Location: ' . $url, true, 302);
exit;
