<?php
declare(strict_types=1);
/** Carga clases locales sin Composer ni frameworks; no abre la BD automáticamente. */
spl_autoload_register(function (string $clase): void {
    if (!str_starts_with($clase, 'App\\')) {
        return;
    }
    $partes = explode('\\', substr($clase, 4));
    $partes[0] = strtolower($partes[0]);
    $archivo = __DIR__ . '/' . implode('/', $partes) . '.php';
    if (is_file($archivo)) {
        require $archivo;
    }
});
date_default_timezone_set('UTC');
