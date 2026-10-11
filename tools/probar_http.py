"""Pruebas HTTP sin dependencias: modo público y modo completo con datos temporales.

Uso: python tools/probar_http.py [--completo]
El modo completo utiliza admin_demo (o RETO_TEST_ADMIN) y su contraseña de demostración
(o RETO_TEST_PASSWORD local). Nunca modifica los registros existentes.
"""
import argparse
import http.cookiejar
import json
import os
import sys
import urllib.error
import urllib.request
import uuid


class Cliente:
    def __init__(self, base):
        self.base = base
        self.cookies = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))
        self.csrf = None
        self.contador = 0

    def pedir(self, metodo, ruta, datos=None, esperado=200, csrf=True, bruto=None):
        headers = {}
        cuerpo = None
        if datos is not None or bruto is not None:
            cuerpo = bruto if bruto is not None else json.dumps(datos).encode()
            headers['Content-Type'] = 'application/json'
        if csrf and self.csrf:
            headers['X-CSRF-Token'] = self.csrf
        peticion = urllib.request.Request(self.base + ruta, data=cuerpo, headers=headers, method=metodo)
        try:
            respuesta = self.opener.open(peticion, timeout=10)
        except urllib.error.HTTPError as error:
            respuesta = error
        with respuesta:
            estado = respuesta.code
            self.cabeceras = respuesta.headers
            contenido = json.loads(respuesta.read())
        if estado != esperado:
            raise AssertionError(f'{metodo} {ruta}: esperado {esperado}, obtenido {estado}: {contenido}')
        self.contador += 1
        print(f'PASS HTTP {estado}: {metodo} {ruta}')
        datos = contenido.get('datos')
        if isinstance(datos, dict) and 'csrf_token' in datos:
            self.csrf = datos['csrf_token']
        return datos

    def login(self, usuario, password):
        self.pedir('GET', '/api/sesion')
        token_anterior = self.csrf
        resultado = self.pedir('POST', '/api/login', {'nombre_usuario': usuario, 'password': password})
        assert self.csrf != token_anterior, 'El login debe renovar el token CSRF'
        return resultado


def publicas(base):
    cliente = Cliente(base)
    sesion = cliente.pedir('GET', '/api/sesion')
    assert sesion['usuario'] is None and len(sesion['csrf_token']) == 64
    cookie = cliente.cabeceras.get('Set-Cookie', '')
    assert 'HttpOnly' in cookie and 'SameSite=Strict' in cookie
    assert cliente.cabeceras.get('Cache-Control') == 'no-store'
    assert cliente.cabeceras.get('X-Content-Type-Options') == 'nosniff'
    cliente.pedir('GET', '/api/equipamientos', esperado=401)
    cliente.pedir('GET', '/api/usuarios', esperado=401)
    cliente.pedir('GET', '/api/no-existe', esperado=404)
    cliente.pedir('PUT', '/api/login', esperado=405)
    cliente.pedir('POST', '/api/login', {}, esperado=403, csrf=False)
    cliente.pedir('PATCH', '/api/ubicaciones/1/estado', {}, esperado=404)
    cliente.pedir('POST', '/api/logout', {})
    cliente.pedir('GET', '/api/notificaciones', esperado=401)
    return cliente.contador


def completas(base):
    admin = Cliente(base)
    usuario = Cliente(base)
    otro = Cliente(base)
    anonimo = Cliente(base)
    admin.login(os.environ.get('RETO_TEST_ADMIN', 'admin_demo'), os.environ.get('RETO_TEST_PASSWORD', 'DemoReto2026!'))
    originales = {ruta: admin.pedir('GET', '/api/' + ruta) for ruta in ('usuarios', 'ubicaciones', 'equipamientos', 'notificaciones')}
    historicos_originales = {fila['id_equipamiento']: admin.pedir('GET', f"/api/equipamientos/{fila['id_equipamiento']}/historial") for fila in originales['equipamientos']}
    sufijo = 'http_test_' + uuid.uuid4().hex[:12]
    password = 'PruebaTemporal2026!'
    usuarios = []
    ubicacion = equipo = aviso = None
    try:
        for numero in (1, 2):
            usuarios.append(admin.pedir('POST', '/api/usuarios', {'nombre': 'Prueba', 'apellidos': 'Temporal', 'nombre_usuario': sufijo + str(numero), 'rol': 'USER', 'password': password}, 201))
        usuario.login(usuarios[0]['nombre_usuario'], password)
        otro.login(usuarios[1]['nombre_usuario'], password)
        anonimo.pedir('GET', '/api/sesion')
        anonimo.pedir('POST', '/api/login', {'nombre_usuario': "' OR 1=1 --", 'password': password}, 401)
        usuario.pedir('GET', '/api/catalogos')
        for fila in usuarios:
            assert 'password_hash' not in admin.pedir('GET', f"/api/usuarios/{fila['id_usuario']}")
        admin.pedir('PUT', f"/api/usuarios/{usuarios[1]['id_usuario']}", {'nombre': 'Editado', 'apellidos': 'Temporal', 'nombre_usuario': usuarios[1]['nombre_usuario'], 'rol': 'USER'})
        usuario.pedir('GET', '/api/usuarios', esperado=403)
        uid = usuarios[0]['id_usuario']
        usuario.pedir('GET', f'/api/usuarios/{uid}', esperado=403)
        usuario.pedir('POST', '/api/usuarios', {}, 403)
        usuario.pedir('PUT', f'/api/usuarios/{uid}', {}, 403)
        usuario.pedir('DELETE', f'/api/usuarios/{uid}', esperado=403)
        usuario.pedir('POST', '/api/ubicaciones', {'nombre': sufijo, 'descripcion': 'Temporal'}, 403)
        usuario.pedir('POST', '/api/equipamientos', {}, 403)
        ubicacion = admin.pedir('POST', '/api/ubicaciones', {'nombre': sufijo, 'descripcion': 'Destino temporal'}, 201)
        admin.pedir('PUT', f"/api/ubicaciones/{ubicacion['id_ubicacion']}", {'nombre': sufijo, 'descripcion': 'Destino editado'})
        usuario.pedir('GET', f"/api/ubicaciones/{ubicacion['id_ubicacion']}")
        usuario.pedir('PUT', f"/api/ubicaciones/{ubicacion['id_ubicacion']}", {}, 403)
        usuario.pedir('DELETE', f"/api/ubicaciones/{ubicacion['id_ubicacion']}", esperado=403)
        admin.pedir('POST', '/api/ubicaciones', {'nombre': sufijo, 'descripcion': 'Duplicada'}, 409)
        admin.pedir('POST', '/api/ubicaciones', {'nombre': ' ', 'descripcion': 'Temporal'}, 422)
        admin.pedir('POST', '/api/ubicaciones', bruto=b'{', esperado=400)
        admin.pedir('POST', '/api/ubicaciones', esperado=415)
        admin.pedir('POST', '/api/ubicaciones', bruto=b'[]', esperado=400)
        admin.pedir('POST', '/api/ubicaciones', bruto=b'x' * 65537, esperado=413)
        datos_equipo = {'nombre': sufijo, 'descripcion': 'Temporal', 'marca': 'Demo', 'modelo': 'Demo', 'categoria': 'OTROS'}
        equipo = admin.pedir('POST', '/api/equipamientos', datos_equipo, 201)
        eid = equipo['id_equipamiento']
        usuario.pedir('GET', f'/api/equipamientos/{eid}')
        historial = admin.pedir('GET', f'/api/equipamientos/{eid}/historial')
        assert len(historial) == 1 and historial[0]['ubicacion'] == 'Almacén' and historial[0]['actual']
        admin.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': ubicacion['id_ubicacion']}, 403)
        usuario.pedir('PUT', f'/api/equipamientos/{eid}', datos_equipo, 403)
        usuario.pedir('DELETE', f'/api/equipamientos/{eid}', esperado=403)
        admin.pedir('PUT', f'/api/equipamientos/{eid}', datos_equipo | {'id_ubicacion_actual': 1}, 422)
        usuario.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': ubicacion['id_ubicacion']}, 403, csrf=False)
        usuario.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': '1 OR 1=1'}, 422)
        usuario.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': 4294967295}, 404)
        usuario.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': ubicacion['id_ubicacion']})
        historial = usuario.pedir('GET', f'/api/equipamientos/{eid}/historial')
        assert len(historial) == 2 and historial[0]['fecha_fin'] == historial[1]['fecha_inicio']
        usuario.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': ubicacion['id_ubicacion']})
        admin.pedir('PUT', f'/api/equipamientos/{eid}', datos_equipo | {'nombre': sufijo + '_editado'})
        assert len(admin.pedir('GET', f'/api/equipamientos/{eid}/historial')) == 2
        admin.pedir('GET', '/api/equipamientos?categoria=OTROS')
        admin.pedir('GET', '/api/equipamientos?categoria=INVALIDA', esperado=422)
        admin.pedir('DELETE', f"/api/ubicaciones/{ubicacion['id_ubicacion']}", esperado=409)
        almacen = next(u for u in originales['ubicaciones'] if u['nombre'] == 'Almacén')
        admin.pedir('DELETE', f"/api/ubicaciones/{almacen['id_ubicacion']}", esperado=409)
        admin.pedir('PUT', f"/api/ubicaciones/{almacen['id_ubicacion']}", {'nombre': 'Almacen cambiado', 'descripcion': 'No debe guardarse'}, 409)
        usuario.pedir('POST', '/api/notificaciones', {'titulo': sufijo, 'descripcion': 'Temporal', 'id_usuario': usuarios[1]['id_usuario']}, 422)
        usuario.pedir('POST', '/api/notificaciones', {'titulo': sufijo, 'descripcion': 'Temporal', 'estado': 'REALIZADA'}, 422)
        aviso = usuario.pedir('POST', '/api/notificaciones', {'titulo': sufijo, 'descripcion': 'Temporal'}, 201)
        nid = aviso['id_notificacion']
        assert aviso['estado'] == 'PENDIENTE' and aviso['id_usuario'] == usuarios[0]['id_usuario']
        otro.pedir('GET', f'/api/notificaciones/{nid}', esperado=404)
        otro.pedir('PUT', f'/api/notificaciones/{nid}', {'titulo': 'Otro', 'descripcion': 'Ajeno'}, 404)
        otro.pedir('DELETE', f'/api/notificaciones/{nid}', esperado=404)
        assert all(fila['id_notificacion'] != nid for fila in otro.pedir('GET', '/api/notificaciones'))
        assert any(fila['id_notificacion'] == nid for fila in usuario.pedir('GET', '/api/notificaciones'))
        admin.pedir('GET', f'/api/notificaciones/{nid}')
        admin.pedir('POST', '/api/notificaciones', {'titulo': sufijo, 'descripcion': 'Temporal'}, 403)
        admin.pedir('PUT', f'/api/notificaciones/{nid}', {'titulo': sufijo, 'descripcion': 'Temporal'}, 403)
        admin.pedir('DELETE', f'/api/notificaciones/{nid}', esperado=403)
        usuario.pedir('PATCH', f'/api/notificaciones/{nid}/estado', {'estado': 'REALIZADA'}, 403)
        usuario.pedir('PUT', f'/api/notificaciones/{nid}', {'titulo': sufijo, 'descripcion': 'Editada'})
        admin.pedir('PATCH', f'/api/notificaciones/{nid}/estado', {'estado': 'INVALIDO'}, 422)
        admin.pedir('PATCH', f'/api/notificaciones/{nid}/estado', {'estado': 'REALIZADA'})
        usuario.pedir('PUT', f'/api/notificaciones/{nid}', {'titulo': sufijo, 'descripcion': 'Edición permitida tras realización'})
        usuario.pedir('DELETE', f'/api/notificaciones/{nid}', esperado=409)
        admin.pedir('PATCH', f'/api/notificaciones/{nid}/estado', {'estado': 'EN_PROCESO'})
        usuario.pedir('DELETE', f'/api/notificaciones/{nid}')
        aviso = None
        # Cambiar el rol debe afectar a una sesión ya abierta, sin volver a hacer login.
        datos_otro = {'nombre': 'Editado', 'apellidos': 'Temporal', 'nombre_usuario': usuarios[1]['nombre_usuario'], 'rol': 'ADMIN'}
        admin.pedir('PUT', f"/api/usuarios/{usuarios[1]['id_usuario']}", datos_otro)
        otro.pedir('GET', '/api/usuarios')
        otro.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': ubicacion['id_ubicacion']}, 403)
        admin.pedir('PUT', f"/api/usuarios/{usuarios[1]['id_usuario']}", datos_otro | {'rol': 'USER'})
        otro.pedir('GET', '/api/usuarios', esperado=403)
        admin.pedir('DELETE', f"/api/usuarios/{admin.pedir('GET', '/api/sesion')['usuario']['id_usuario']}", esperado=409)
        usuario.pedir('POST', '/api/logout', {})
        usuario.pedir('GET', '/api/equipamientos', esperado=401)
        # El cambio de contraseña debe revocar la sesión abierta del segundo USER.
        admin.pedir('PUT', f"/api/usuarios/{usuarios[1]['id_usuario']}", {'nombre': 'Editado', 'apellidos': 'Temporal', 'nombre_usuario': usuarios[1]['nombre_usuario'], 'rol': 'USER', 'password': 'NuevaTemporal2026!'})
        otro.pedir('GET', '/api/equipamientos', esperado=401)
    finally:
        # Limpieza únicamente de IDs creados por esta ejecución. No se resetean tablas ni secuencias.
        if aviso is not None:
            admin.pedir('PATCH', f"/api/notificaciones/{aviso['id_notificacion']}/estado", {'estado': 'PENDIENTE'})
            usuario.login(usuarios[0]['nombre_usuario'], password)
            usuario.pedir('DELETE', f"/api/notificaciones/{aviso['id_notificacion']}")
        if equipo is not None:
            admin.pedir('DELETE', f"/api/equipamientos/{equipo['id_equipamiento']}")
            admin.pedir('GET', f"/api/equipamientos/{equipo['id_equipamiento']}/historial", esperado=404)
        if ubicacion is not None:
            admin.pedir('DELETE', f"/api/ubicaciones/{ubicacion['id_ubicacion']}")
        for fila in usuarios:
            admin.pedir('DELETE', f"/api/usuarios/{fila['id_usuario']}")
    for ruta, antes in originales.items():
        assert admin.pedir('GET', '/api/' + ruta) == antes, f'Los registros existentes de {ruta} han cambiado'
    for eid, antes in historicos_originales.items():
        assert admin.pedir('GET', f'/api/equipamientos/{eid}/historial') == antes, 'El histórico existente ha cambiado'
    print('PASS: datos e históricos existentes conservados y filas temporales eliminadas.')
    return admin.contador + usuario.contador + otro.contador + anonimo.contador


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='http://127.0.0.1:8080')
    parser.add_argument('--completo', action='store_true')
    args = parser.parse_args()
    try:
        total = publicas(args.base)
        if args.completo:
            total += completas(args.base)
        print(f'{total} respuestas HTTP comprobadas. Modo completo: {args.completo}.')
    except (AssertionError, urllib.error.URLError, ValueError) as error:
        print(f'FAIL: {error}', file=sys.stderr)
        sys.exit(1)
