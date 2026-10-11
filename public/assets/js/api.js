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
  try { respuesta = await fetch(`/api${ruta}`, opciones); }
  catch { throw new ErrorApi('No se pudo conectar. Comprueba tu conexión y vuelve a intentarlo.', 0); }
  let contenido;
  try { contenido = await respuesta.json(); }
  catch { throw new ErrorApi('El servidor no devolvió una respuesta válida. Inténtalo de nuevo.', respuesta.status); }
  if (!respuesta.ok || !contenido.ok) throw new ErrorApi(contenido.error?.mensaje || 'No se pudo completar la operación.', respuesta.status);
  if (contenido.datos?.csrf_token) csrf = contenido.datos.csrf_token;
  return contenido.datos;
}
