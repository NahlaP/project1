



<?php
header('Content-Type: application/json; charset=utf-8');

$BACKEND_BASE = 'http://3.109.207.179'; // EC2

function starts_with($h,$n){ return substr($h,0,strlen($n))===$n; }

$path = isset($_GET['path']) ? $_GET['path'] : '';
if ($path===''){ http_response_code(400); echo json_encode(['error'=>'missing_path']); exit; }
if ($path[0] !== '/') $path = '/'.$path;
// allow-list for safety (add more when needed)
$allow = [
  '/',                 // health
  '/auth/login',
  '/upload',           // ðŸ”¸ needed for file-url
  '/sections',
  '/hero',
  '/about',
  '/services',
  '/contact-info',
  '/topbar',
  '/navbar',
  '/team',
  '/testimonial',
  '/appointment',
  '/whychoose',
];

$ok = false;
foreach ($allow as $p) {
  if ($p === '/') {            // root is special: allow only exact "/"
    if ($path === '/') { $ok = true; break; }
  } else if ($path === $p || substr($path, 0, strlen($p) + 1) === $p.'/') {
    $ok = true; break;
  }
}
if (!$ok) {
  http_response_code(400);
  echo json_encode(['error'=>'path_not_allowed','path'=>$path]);
  exit;
}

$ok=false; foreach($allow as $p){ if($path===$p || starts_with($path,$p.'/')){ $ok=true; break; } }
if(!$ok){ http_response_code(400); echo json_encode(['error'=>'path_not_allowed','path'=>$path]); exit; }

$params = $_GET; unset($params['path']);
$qs = http_build_query($params);
$target = rtrim($BACKEND_BASE,'/').'/api'.$path.($qs?('?'.$qs):'');

$method = $_SERVER['REQUEST_METHOD'];
$ch = curl_init($target);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_CONNECTTIMEOUT => 15,
  CURLOPT_TIMEOUT        => 30,
  CURLOPT_CUSTOMREQUEST  => $method,
  CURLOPT_HTTPHEADER     => ['Accept: application/json','Content-Type: application/json'],
  CURLOPT_ENCODING       => '',
]);

if (in_array($method, ['POST','PUT','PATCH','DELETE'], true)) {
  $raw = file_get_contents('php://input');
  curl_setopt($ch, CURLOPT_POSTFIELDS, $raw ?: '');
}

$response = curl_exec($ch);
$http     = curl_getinfo($ch, CURLINFO_HTTP_CODE) ?: 502;
$err      = curl_error($ch);
curl_close($ch);

http_response_code($http);
echo ($response !== false && $response !== '')
  ? $response
  : json_encode(['error'=>'proxy_failed','detail'=>$err,'target'=>$target,'http'=>$http]);
