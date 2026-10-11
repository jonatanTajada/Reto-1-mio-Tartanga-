<?php
declare(strict_types=1);
/** Ajustes sin secretos. HTTPS es obligatorio al desplegar fuera del equipo local. */
return [
    'session_path' => dirname(__DIR__) . '/var/sessions',
    'session_name' => 'RETO1MIO',
    'session_timeout' => 1800,
    'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
];
