/** Comunicación con el API del mismo origen; el token queda solo en memoria. */
let csrf = null;

export class ErrorApi extends Error {
  constructor(mensaje, estado) { super(mensaje); this.estado = estado; }
}

export async function pedir(ruta, metodo = 'GET', datos) {
  const opciones = { method: metodo, credentials: 'same-origin', headers: { Accept: 'application/json' } };
  if (metodo !== 'GET' && csrf) opciones.headers['X-CSRF-Token'] = csrf;
  if (datos !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(datos);
  }
  let respuesta;
  const limite = new AbortController();
  const temporizador = setTimeout(() => limite.abort(), 15000);
  opciones.signal = limite.signal;
  try { respuesta = await fetch(`/api${ruta}`, opciones); }
  catch (error) {
    clearTimeout(temporizador);
    if (error.name === 'AbortError') throw new ErrorApi('La respuesta tarda demasiado. Actualiza la lista antes de volver a guardar: la operación podría haberse completado.', 0);
    throw new ErrorApi('No se pudo conectar. Comprueba tu conexión y vuelve a intentarlo.', 0);
  }
  let contenido;
  try { contenido = await respuesta.json(); }
  catch (error) {
    if (error.name === 'AbortError') throw new ErrorApi('La respuesta tarda demasiado. Actualiza la lista antes de volver a guardar: la operación podría haberse completado.', 0);
    throw new ErrorApi('El servidor no devolvió una respuesta válida. Inténtalo de nuevo.', respuesta.status);
  }
  finally { clearTimeout(temporizador); }
  if (!respuesta.ok || !contenido.ok) throw new ErrorApi(contenido.error?.mensaje || 'No se pudo completar la operación.', respuesta.status);
  if (contenido.datos?.csrf_token) csrf = contenido.datos.csrf_token;
  return contenido.datos;
}
