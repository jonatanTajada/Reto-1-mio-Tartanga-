"""Regresión de ubicaciones con cuentas demo y cookies independientes; conserva I+D+I."""
from probar_http import Cliente
import uuid

base = 'http://127.0.0.1:8080'
admin = Cliente(base)
conserje = Cliente(base)
assert admin.login('admin_demo', 'DemoReto2026!')['usuario']['rol'] == 'ADMIN'
assert conserje.login('conserje_demo', 'DemoReto2026!')['usuario']['rol'] == 'USER'
assert admin.pedir('GET', '/api/sesion')['usuario']['nombre_usuario'] == 'admin_demo'
assert conserje.pedir('GET', '/api/sesion')['usuario']['nombre_usuario'] == 'conserje_demo'
originales = {recurso: admin.pedir('GET', '/api/' + recurso) for recurso in ('usuarios', 'ubicaciones', 'equipamientos', 'notificaciones')}
historicos = {e['id_equipamiento']: admin.pedir('GET', f"/api/equipamientos/{e['id_equipamiento']}/historial") for e in originales['equipamientos']}
nombre = 'http_test_roles_' + uuid.uuid4().hex[:12]
ubicacion = equipo = None
try:
    conserje.pedir('GET', '/api/ubicaciones')
    ubicacion = admin.pedir('POST', '/api/ubicaciones', {'nombre': nombre, 'descripcion': 'Destino aislado'}, 201)
    uid = ubicacion['id_ubicacion']
    admin.pedir('GET', f'/api/ubicaciones/{uid}')
    admin.pedir('PUT', f'/api/ubicaciones/{uid}', {'nombre': nombre, 'descripcion': 'Edición permitida ADMIN'})
    antes = admin.pedir('GET', '/api/ubicaciones')
    conserje.pedir('POST', '/api/ubicaciones', {'nombre': nombre + '_prohibido', 'descripcion': 'No debe crearse'}, 403)
    assert admin.pedir('GET', '/api/ubicaciones') == antes
    conserje.pedir('PUT', f'/api/ubicaciones/{uid}', {'nombre': nombre + '_prohibido', 'descripcion': 'No debe cambiar'}, 403)
    assert admin.pedir('GET', '/api/ubicaciones') == antes
    conserje.pedir('DELETE', f'/api/ubicaciones/{uid}', esperado=403)
    assert admin.pedir('GET', '/api/ubicaciones') == antes
    equipo = admin.pedir('POST', '/api/equipamientos', {'nombre': nombre, 'descripcion': 'Equipo aislado', 'marca': 'Demo', 'modelo': 'Roles', 'categoria': 'OTROS'}, 201)
    eid = equipo['id_equipamiento']
    conserje.pedir('PATCH', f'/api/equipamientos/{eid}/ubicacion', {'id_ubicacion': uid})
    historial = conserje.pedir('GET', f'/api/equipamientos/{eid}/historial')
    assert len(historial) == 2 and historial[-1]['id_ubicacion'] == uid and historial[-1]['actual']
    assert historial[0]['fecha_fin'] == historial[1]['fecha_inicio']
    assert admin.pedir('GET', '/api/sesion')['usuario']['rol'] == 'ADMIN'
    assert conserje.pedir('GET', '/api/sesion')['usuario']['rol'] == 'USER'
finally:
    if equipo:
        admin.pedir('DELETE', f"/api/equipamientos/{equipo['id_equipamiento']}")
    if ubicacion:
        admin.pedir('DELETE', f"/api/ubicaciones/{ubicacion['id_ubicacion']}")
for recurso, antes in originales.items():
    assert admin.pedir('GET', '/api/' + recurso) == antes, f'Cambios en datos existentes: {recurso}'
for eid, antes in historicos.items():
    assert admin.pedir('GET', f'/api/equipamientos/{eid}/historial') == antes
print(f'PASS: {admin.contador + conserje.contador} respuestas HTTP; sesiones independientes, tres rechazos sin cambios, CRUD ADMIN y traslado USER con historial.')
print('PASS: datos originales, históricos e I+D+I conservados.')
