/** Consulta para ambos roles y CRUD de ubicaciones para Administrador. */
import { boton, elemento, tabla } from './dom.js';
import { confirmar, formulario } from './formularios.js';
import { ErrorApi } from './api.js';

export function editarUbicacion(contexto, fila = null) {
  // Guardar también la entrada al formulario; PHP vuelve a autorizar cada escritura.
  if (contexto.usuario?.rol !== 'ADMIN') {
    contexto.error(new ErrorApi('Solo el Administrador puede crear o editar ubicaciones.', 403));
    return;
  }
  formulario(fila ? 'Editar ubicación' : 'Nueva ubicación', [
    { nombre: 'nombre', etiqueta: 'Nombre', maximo: 100, valor: fila?.nombre, soloLectura: fila?.nombre === 'Almacén' },
    { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', maximo: 255, valor: fila?.descripcion },
  ], datos => contexto.guardar(`/ubicaciones${fila ? '/' + fila.id_ubicacion : ''}`, fila ? 'PUT' : 'POST', datos, 'Ubicación guardada.'), contexto.error,
  'Almacén no se puede renombrar ni eliminar. Tampoco pueden eliminarse ubicaciones usadas por equipos o por su historial.');
}

export function listadoUbicaciones(filas, contexto) {
  return tabla(['Ubicación', 'Descripción', 'Acciones'], filas.map(fila => {
    const acciones = elemento('div', undefined, 'acciones');
    if (contexto.usuario.rol === 'ADMIN') {
      acciones.append(boton('Editar', () => editarUbicacion(contexto, fila)));
      if (fila.nombre !== 'Almacén') acciones.append(boton('Eliminar', () => confirmar('Eliminar ubicación', `¿Eliminar «${fila.nombre}»? Si tiene equipos o historial asociado, el servidor conservará la ubicación.`, () => contexto.guardar(`/ubicaciones/${fila.id_ubicacion}`, 'DELETE', undefined, 'Ubicación eliminada.'), contexto.error), 'peligro'));
      else acciones.append(elemento('span', 'Ubicación protegida', 'etiqueta'));
    } else acciones.append(elemento('span', 'Solo consulta', 'etiqueta'));
    return [fila.nombre, fila.descripcion, acciones];
  }), `${filas.length} ubicaciones disponibles en el centro.`);
}
