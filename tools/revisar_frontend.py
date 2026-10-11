"""Revisión estática de HTML/JS y contraste de los colores usados; no certifica WCAG."""
from html.parser import HTMLParser
from pathlib import Path
import re

raiz = Path(__file__).resolve().parents[1]


class RevisarHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.etiquetas = set()
        self.campos = []
        self.remotos = []

    def handle_starttag(self, tag, attrs):
        datos = dict(attrs)
        if 'id' in datos:
            self.ids.append(datos['id'])
        if tag == 'label':
            self.etiquetas.add(datos.get('for'))
        if tag in ('input', 'select', 'textarea'):
            self.campos.append(datos.get('id'))
        for clave in ('src', 'href'):
            if datos.get(clave, '').startswith(('https:', 'http:', '//')):
                self.remotos.append(datos[clave])


parser = RevisarHTML()
html = (raiz / 'public/index.html').read_text(encoding='utf-8')
parser.feed(html)
assert len(parser.ids) == len(set(parser.ids)), 'IDs repetidos'
assert all(campo in parser.etiquetas for campo in parser.campos), 'Campo estático sin etiqueta'
assert not parser.remotos, 'Recurso remoto en HTML'
for archivo in (raiz / 'public/assets/js').glob('*.js'):
    texto = archivo.read_text(encoding='utf-8')
    assert not re.search(r'\b(?:innerHTML|outerHTML|insertAdjacentHTML|eval)\b', texto), f'Inserción insegura en {archivo.name}'
    assert not re.search(r'https?://', texto), f'Dependencia remota en {archivo.name}'
print('PASS: IDs únicos, etiquetas estáticas, recursos locales y DOM sin inserción HTML.')


def luminancia(color):
    canales = [int(color[n:n + 2], 16) / 255 for n in (1, 3, 5)]
    valores = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in canales]
    return sum(c * peso for c, peso in zip(valores, (0.2126, 0.7152, 0.0722)))


pares = [
    ('Texto principal', '#172c42', '#ffffff'),
    ('Texto secundario', '#526275', '#ffffff'),
    ('Botón principal', '#ffffff', '#0b6b59'),
    ('Navegación', '#d4dfeb', '#172c42'),
    ('Aviso pendiente', '#735210', '#fff3d9'),
    ('Aviso en proceso', '#304e89', '#e9effb'),
    ('Aviso realizado', '#17543f', '#e7f5ee'),
    ('Error', '#a52332', '#fff0f1'),
]
css = '\n'.join(p.read_text(encoding='utf-8') for p in (raiz / 'public/assets/css').glob('*.css'))
colores = set(re.findall(r'#[0-9a-fA-F]{3,8}\b', css))
colores = {('#' + ''.join(c * 2 for c in color[1:])) if len(color) == 4 else color.lower() for color in colores}
for nombre, texto, fondo in pares:
    assert texto in colores and fondo in colores, f'El par ya no coincide con los colores del CSS: {nombre}'
    alto, bajo = sorted((luminancia(texto), luminancia(fondo)), reverse=True)
    ratio = (alto + 0.05) / (bajo + 0.05)
    assert ratio >= 4.5, f'Contraste insuficiente: {nombre}'
    print(f'PASS contraste: {nombre}, {ratio:.2f}:1')
print('Ocho pares de texto comprobados (mínimo 4.5:1). No es una auditoría completa de accesibilidad ni un validador HTML/CSS.')
