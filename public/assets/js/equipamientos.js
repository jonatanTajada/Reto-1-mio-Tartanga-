/** Inventario, detalle y formularios: edición ADMIN y traslado USER separados. */
import { pedir } from './api.js';
import { abrirDialogo, boton, elemento, fecha, tabla, identificarAcciones } from './dom.js';
import { confirmar, formulario } from './formularios.js';
import { categorias, opciones } from './catalogos.js';

export function editarEquipo(contexto, fila = null) {
  const campos = [
    { nombre: 'nombre', etiqueta: 'Nombre', maximo: 120 },
    { nombre: 'marca', etiqueta: 'Marca', maximo: 100 },
    { nombre: 'modelo', etiqueta: 'Modelo', maximo: 100 },
    { nombre: 'categoria', etiqueta: 'Categoría', opciones: opciones(categorias) },
    { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', maximo: 255 },
  ].map(campo => ({ ...campo, valor: fila?.[campo.nombre] }));
  formulario(fila ? 'Editar equipamiento' : 'Nuevo equipamiento', campos,
    datos => contexto.guardar(`/equipamientos${fila ? '/' + fila.id_equipamiento : ''}`, fila ? 'PUT' : 'POST', datos, fila ? 'Equipamiento actualizado.' : 'Equipamiento creado en Almacén.'),
    contexto.error, 'Los equipos nuevos se guardan en Almacén. El Conserje puede trasladarlos después.', fila ? 'Guardar cambios' : 'Crear equipo');
}

async function trasladar(contexto, fila) {
  const cuerpo = abrirDialogo('Trasladar equipamiento');
  const indicador = elemento('p', 'Cargando ubicaciones…', 'muted'); cuerpo.append(indicador);
  try {
    const ubicaciones = await pedir('/ubicaciones');
    if (indicador.parentElement !== cuerpo || !document.getElementById('dialogo').open) return;
    formulario(`Trasladar: ${fila.nombre}`, [{ nombre: 'id_ubicacion', etiqueta: 'Ubicación de destino', valor: fila.id_ubicacion_actual, opciones: ubicaciones.map(u => [u.id_ubicacion, u.nombre]) }],
      datos => contexto.guardar(`/equipamientos/${fila.id_equipamiento}/ubicacion`, 'PATCH', { id_ubicacion: Number(datos.id_ubicacion) }, 'Ubicación actualizada.'),
      contexto.error, 'Elige dónde vas a llevar este equipo. Su historial se guardará automáticamente.', 'Confirmar traslado');
  } catch (error) {
    if (indicador.parentElement === cuerpo && document.getElementById('dialogo').open) {
      const aviso = elemento('p', error.message, 'error-form'); aviso.setAttribute('role', 'alert');
      cuerpo.replaceChildren(aviso); contexto.error(error, false);
    } else if (error.estado === 401) contexto.error(error);
  }
}

async function detalle(contexto, fila) {
  const cuerpo = abrirDialogo('Detalle del equipamiento');
  const indicador = elemento('p', 'Cargando detalle e historial…', 'muted'); cuerpo.append(indicador);
  try {
    const [equipo, historial, ubicaciones] = await Promise.all([pedir(`/equipamientos/${fila.id_equipamiento}`), pedir(`/equipamientos/${fila.id_equipamiento}/historial`), pedir('/ubicaciones')]);
    if (indicador.parentElement !== cuerpo || !document.getElementById('dialogo').open) return;
    cuerpo.replaceChildren();
    const datos = elemento('dl', undefined, 'detalle');
    const campos = [['Identificador', equipo.id_equipamiento], ['Nombre', equipo.nombre], ['Descripción', equipo.descripcion], ['Marca', equipo.marca], ['Modelo', equipo.modelo], ['Categoría', categorias[equipo.categoria]], ['Ubicación actual', ubicaciones.find(u => u.id_ubicacion === equipo.id_ubicacion_actual)?.nombre || 'Sin ubicación disponible']];
    for (const [titulo, valor] of campos) datos.append(elemento('dt', titulo), elemento('dd', valor));
    cuerpo.append(datos, elemento('h3', 'Historial de ubicaciones'));
    const lista = elemento('ol', undefined, 'historial');
    for (const intervalo of historial) {
      const nodo = elemento('li');
      nodo.append(elemento('strong', intervalo.ubicacion), elemento('p', `${fecha(intervalo.fecha_inicio)} → ${fecha(intervalo.fecha_fin)}`));
      if (intervalo.actual) nodo.append(elemento('span', 'Ubicación actual', 'etiqueta estado-realizada'));
      lista.append(nodo);
    }
    cuerpo.append(lista);
    if (contexto.usuario.rol === 'USER') cuerpo.append(boton('Trasladar equipo', () => trasladar(contexto, equipo), 'primario'));
  } catch (error) {
    // Una respuesta tardía no debe sobrescribir un formulario abierto después del detalle.
    if (indicador.parentElement === cuerpo && document.getElementById('dialogo').open) {
      const aviso = elemento('p', error.message, 'error-form'); aviso.setAttribute('role', 'alert');
      cuerpo.replaceChildren(aviso); contexto.error(error, false);
    } else if (error.estado === 401) contexto.error(error);
  }
}

export function listadoEquipos(filas, contexto) {
  return tabla(['Equipamiento', 'Marca / modelo', 'Categoría', 'Ubicación', 'Acciones'], filas.map(fila => {
    const nombre = elemento('div', fila.nombre, 'nombre-equipo');
    nombre.append(elemento('span', `Referencia #${fila.id_equipamiento}`, 'celda-secundaria'));
    const modelo = elemento('div', fila.marca); modelo.append(elemento('span', fila.modelo, 'celda-secundaria'));
    const acciones = elemento('div', undefined, 'acciones');
    acciones.append(boton('Ver detalles', () => detalle(contexto, fila), 'enlace'));
    if (contexto.usuario.rol === 'ADMIN') {
      acciones.append(boton('Editar equipo', () => editarEquipo(contexto, fila)), boton('Eliminar equipo', () => confirmar('Eliminar equipamiento', `¿Eliminar «${fila.nombre}»? También se eliminará su historial de ubicaciones.`, () => contexto.guardar(`/equipamientos/${fila.id_equipamiento}`, 'DELETE', undefined, 'Equipamiento eliminado.'), contexto.error), 'peligro'));
    } else acciones.append(boton('Trasladar equipo', () => trasladar(contexto, fila)));
    identificarAcciones(acciones, `equipo-${fila.id_equipamiento}`, fila.nombre);
    return [nombre, modelo, categorias[fila.categoria], fila.ubicacion_actual, acciones];
  }), 'La ubicación indica dónde se encuentra cada equipo. Ver detalles incluye su historial.');
}
