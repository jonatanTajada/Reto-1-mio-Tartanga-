/** Avisos propios del Conserje; el Administrador consulta todos y cambia el estado. */
import { boton, elemento, fecha, tabla, identificarAcciones } from './dom.js';
import { confirmar, formulario } from './formularios.js';
import { estados, opciones } from './catalogos.js';

export function editarAviso(contexto, fila = null) {
  formulario(fila ? 'Editar aviso' : 'Crear aviso', [
    { nombre: 'titulo', etiqueta: 'Título', maximo: 150, valor: fila?.titulo },
    { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', maximo: 65535, valor: fila?.descripcion },
  ], datos => contexto.guardar(`/notificaciones${fila ? '/' + fila.id_notificacion : ''}`, fila ? 'PUT' : 'POST', datos, 'Aviso guardado.'), contexto.error,
  'Explica qué ha ocurrido o qué necesita atención. El Administrador actualizará el estado.', fila ? 'Guardar cambios' : 'Crear aviso');
}

function cambiarEstado(contexto, fila) {
  formulario('Cambiar estado de la notificación', [{ nombre: 'estado', etiqueta: 'Estado', opciones: opciones(estados), valor: fila.estado }],
    datos => contexto.guardar(`/notificaciones/${fila.id_notificacion}/estado`, 'PATCH', datos, 'Estado actualizado.'), contexto.error, fila.titulo);
}

export function listadoAvisos(filas, contexto) {
  return tabla(['Aviso', 'Creación / autor', 'Estado', 'Acciones'], filas.map(fila => {
    const titulo = elemento('div', fila.titulo, 'nombre-equipo');
    titulo.append(elemento('span', fila.descripcion, 'celda-secundaria'));
    const creador = elemento('div', fecha(fila.fecha_creacion)); creador.append(elemento('span', fila.creador, 'celda-secundaria'));
    const clases = { PENDIENTE: 'estado-pendiente', EN_PROCESO: 'estado-proceso', REALIZADA: 'estado-realizada' };
    const estado = elemento('span', estados[fila.estado], `etiqueta ${clases[fila.estado]}`);
    const acciones = elemento('div', undefined, 'acciones');
    if (contexto.usuario.rol === 'ADMIN') acciones.append(boton('Cambiar estado', () => cambiarEstado(contexto, fila)));
    else {
      acciones.append(boton('Editar aviso', () => editarAviso(contexto, fila)));
      if (fila.estado !== 'REALIZADA') acciones.append(boton('Eliminar aviso', () => confirmar('Eliminar aviso', `¿Eliminar «${fila.titulo}»? Esta acción no se puede deshacer.`, () => contexto.guardar(`/notificaciones/${fila.id_notificacion}`, 'DELETE', undefined, 'Aviso eliminado.'), contexto.error), 'peligro'));
      else acciones.append(elemento('span', 'No se puede eliminar', 'etiqueta'));
    }
    identificarAcciones(acciones, `aviso-${fila.id_notificacion}`, fila.titulo);
    return [titulo, creador, estado, acciones];
  }), contexto.usuario.rol === 'ADMIN' ? 'Avisos del centro y su estado.' : 'Avisos creados por tu cuenta.');
}
