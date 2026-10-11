/** Avisos propios del Conserje; el Administrador consulta todos y cambia el estado. */
import { boton, elemento, fecha, tabla } from './dom.js';
import { confirmar, formulario } from './formularios.js';
import { estados, opciones } from './catalogos.js';

export function editarAviso(contexto, fila = null) {
  formulario(fila ? 'Editar notificación' : 'Nueva notificación', [
    { nombre: 'titulo', etiqueta: 'Título', maximo: 150, valor: fila?.titulo },
    { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', maximo: 65535, valor: fila?.descripcion },
  ], datos => contexto.guardar(`/notificaciones${fila ? '/' + fila.id_notificacion : ''}`, fila ? 'PUT' : 'POST', datos, 'Notificación guardada.'), contexto.error,
  'El aviso se asocia a tu cuenta. Los nuevos avisos comienzan pendientes; el Administrador gestiona su estado.');
}

function cambiarEstado(contexto, fila) {
  formulario('Cambiar estado de la notificación', [{ nombre: 'estado', etiqueta: 'Estado', opciones: opciones(estados), valor: fila.estado }],
    datos => contexto.guardar(`/notificaciones/${fila.id_notificacion}/estado`, 'PATCH', datos, 'Estado actualizado.'), contexto.error, fila.titulo);
}

export function listadoAvisos(filas, contexto) {
  return tabla(['Notificación', 'Creación / autor', 'Estado', 'Acciones'], filas.map(fila => {
    const titulo = elemento('div', fila.titulo, 'nombre-equipo');
    titulo.append(elemento('span', fila.descripcion, 'celda-secundaria'));
    const creador = elemento('div', fecha(fila.fecha_creacion)); creador.append(elemento('span', fila.creador, 'celda-secundaria'));
    const clases = { PENDIENTE: 'estado-pendiente', EN_PROCESO: 'estado-proceso', REALIZADA: 'estado-realizada' };
    const estado = elemento('span', estados[fila.estado], `etiqueta ${clases[fila.estado]}`);
    const acciones = elemento('div', undefined, 'acciones');
    if (contexto.usuario.rol === 'ADMIN') acciones.append(boton('Cambiar estado', () => cambiarEstado(contexto, fila)));
    else {
      acciones.append(boton('Editar', () => editarAviso(contexto, fila)));
      if (fila.estado !== 'REALIZADA') acciones.append(boton('Eliminar', () => confirmar('Eliminar notificación', `¿Eliminar «${fila.titulo}»? Esta acción no se puede deshacer.`, () => contexto.guardar(`/notificaciones/${fila.id_notificacion}`, 'DELETE', undefined, 'Notificación eliminada.'), contexto.error), 'peligro'));
      else acciones.append(elemento('span', 'No se puede eliminar', 'etiqueta'));
    }
    return [titulo, creador, estado, acciones];
  }), `${filas.length} notificaciones ${contexto.usuario.rol === 'ADMIN' ? 'del centro' : 'de tu cuenta'}.`);
}
