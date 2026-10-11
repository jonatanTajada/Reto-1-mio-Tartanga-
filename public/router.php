<?php
declare(strict_types=1);
/** Router local: solo sirve los CSS/JS públicos previstos; el resto pasa por la entrada MVC. */
$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/assets/(css|js)/[a-z0-9_-]+\.(css|js)$#D', $ruta) && is_file(__DIR__ . $ruta)) {
    return false;
}
require __DIR__ . '/index.php';
