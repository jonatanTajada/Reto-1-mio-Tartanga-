# Validación estática

Herramienta reproducible, sin dependencias ni conexión a MySQL:

```powershell
python -B database/tools/validar_archivos.py
```

Revisa las huellas de los 13 originales copiados, el aislamiento de los siete scripts, ausencia de instrucciones de eliminación de bases/tablas, recuento de cinco tablas y siete triggers y enlaces relativos Markdown dentro del proyecto.

No es un parser SQL ni prueba la creación del esquema, ejecución de triggers o permisos. Las pruebas reales están preparadas en los archivos 04 y 05 para Workbench.

Resultado ejecutado el 11/10/2026: **PASS**. 13 originales conservados, 5 tablas, 7 triggers y enlaces de 12 documentos revisados. Se comprobó también mediante `git check-ignore` que la documentación de clase, `.env` y `config/database.php` quedan excluidos.

La identidad de ejecución de Git difiere del propietario de la carpeta. Se utilizó `-c safe.directory` limitado a la ruta individual en cada comando, sin cambiar configuración global ni acceder al repositorio compartido.

Reorganización: comparación de sentencias antes/después PASS; cinco tablas en 01 y siete triggers en 01b. Se conservan los nombres 02 a 05 para evitar confundir las pruebas ya ejecutadas.
