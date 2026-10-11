"""Revisión estática reproducible; no conecta a MySQL ni valida sintaxis SQL."""
from pathlib import Path
import hashlib
import json
import re
import sys
from urllib.parse import unquote

root = Path(__file__).resolve().parents[2]
database = root / 'database'
errors = []
manifest = json.loads((database / 'docs/ORIGINALES_SHA256.json').read_text(encoding='utf-8'))
for name, expected in manifest.items():
    source = root / name
    if not source.is_file() or hashlib.sha256(source.read_bytes()).hexdigest() != expected:
        errors.append(f'Original cambiado: {name}')

for sql in sorted(database.glob('*.sql')):
    text = sql.read_text(encoding='utf-8')
    if re.search(r'\b(?:DROP\s+DATABASE|TRUNCATE|DROP\s+TABLE)\b', text, re.I):
        errors.append(f'Operación destructiva inesperada: {sql.name}')
    if re.search(r'\breto_2daw\b', text, re.I):
        errors.append(f'Nombre de base ajena: {sql.name}')
    executable = re.sub(r'/\*.*?\*/|--[^\n]*', '', text, flags=re.S)
    databases = re.findall(r'\b(?:USE|CREATE\s+DATABASE)\s+(\w+)', executable, re.I)
    if any(name != 'reto_1_mio' for name in databases):
        errors.append(f'Base fuera del alcance: {sql.name}')

schema = (database / '01_crear_esquema.sql').read_text(encoding='utf-8')
tables = re.findall(r'CREATE TABLE (\w+)', schema)
trigger_sql = (database / '01b_crear_triggers.sql').read_text(encoding='utf-8')
triggers = re.findall(r'CREATE TRIGGER (\w+)', trigger_sql)
if len(tables) != 5 or len(triggers) != 7:
    errors.append('Recuento inesperado de tablas o triggers')

documents = [root / 'README.md', *(root / 'docs').rglob('*.md'), *(database / 'docs').glob('*.md')]
for document in documents:
    for target in re.findall(r'\]\(([^)]+)\)', document.read_text(encoding='utf-8')):
        if target.startswith(('https://', 'http://', '#')):
            continue
        path = (document.parent / unquote(target.split('#')[0])).resolve()
        if not path.is_relative_to(root) or not path.exists():
            errors.append(f'Enlace roto o fuera de alcance: {document.name}: {target}')

print(f'Originales conservados: {len(manifest)}')
print(f'Esquema de trabajo: {len(tables)} tablas, {len(triggers)} triggers')
print(f'Documentos con enlaces revisados: {len(documents)}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('PASS: revisión estática de archivos. Instalación de los archivos separados no ejecutada por el agente.')
