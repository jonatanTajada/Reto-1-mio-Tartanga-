/** Gestión ADMIN: contraseña nueva solo al crear o cuando se solicita cambiarla. */
import { boton, elemento, tabla } from './dom.js';
import { confirmar, formulario } from './formularios.js';
import { opciones, roles } from './catalogos.js';

export function editarUsuario(contexto, fila = null) {
  formulario(fila ? 'Editar usuario' : 'Nuevo usuario', [
    { nombre: 'nombre', etiqueta: 'Nombre', maximo: 80, valor: fila?.nombre },
    { nombre: 'apellidos', etiqueta: 'Apellidos', maximo: 120, valor: fila?.apellidos },
    { nombre: 'nombre_usuario', etiqueta: 'Nombre de usuario', maximo: 60, valor: fila?.nombre_usuario },
    { nombre: 'rol', etiqueta: 'Rol', opciones: opciones(roles), valor: fila?.rol ?? 'USER' },
    { nombre: 'password', etiqueta: fila ? 'Nueva contraseña (opcional)' : 'Contraseña', tipo: 'password', maximo: 72, opcional: Boolean(fila), ayuda: 'Entre 12 y 72 bytes. En edición, dejar vacío conserva la contraseña actual.' },
  ], datos => contexto.guardar(`/usuarios${fila ? '/' + fila.id_usuario : ''}`, fila ? 'PUT' : 'POST', datos, 'Usuario guardado.'), contexto.error,
  'No puedes eliminar tu cuenta ni quitarte el rol Administrador. Cambiar una contraseña cierra las sesiones anteriores de esa cuenta.');
}

export function listadoUsuarios(filas, contexto) {
  return tabla(['Persona', 'Nombre de usuario', 'Rol', 'Acciones'], filas.map(fila => {
    const acciones = elemento('div', undefined, 'acciones');
    acciones.append(boton('Editar', () => editarUsuario(contexto, fila)));
    if (fila.id_usuario !== contexto.usuario.id_usuario) acciones.append(boton('Eliminar', () => confirmar('Eliminar usuario', `¿Eliminar la cuenta «${fila.nombre_usuario}»? Si tiene notificaciones asociadas, el servidor impedirá eliminarla.`, () => contexto.guardar(`/usuarios/${fila.id_usuario}`, 'DELETE', undefined, 'Usuario eliminado.'), contexto.error), 'peligro'));
    else acciones.append(elemento('span', 'Tu cuenta', 'etiqueta'));
    return [`${fila.nombre} ${fila.apellidos}`, fila.nombre_usuario, roles[fila.rol], acciones];
  }), `${filas.length} usuarios. Las contraseñas y sus hashes nunca se muestran.`);
}
