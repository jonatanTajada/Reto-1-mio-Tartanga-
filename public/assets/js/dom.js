/** Construcción segura del DOM: los datos del servidor se insertan como texto. */
export const porId = id => document.getElementById(id);

export function elemento(tipo, texto, clase) {
  const nodo = document.createElement(tipo);
  if (texto !== undefined) nodo.textContent = String(texto);
  if (clase) nodo.className = clase;
  return nodo;
}

export function boton(texto, accion, clase = 'secundario') {
  const nodo = elemento('button', texto, `boton ${clase}`);
  nodo.type = 'button';
  nodo.addEventListener('click', accion);
  return nodo;
}

export function mensaje(texto, error = false) {
  const nodo = porId('mensajes');
  nodo.classList.toggle('error', error);
  nodo.setAttribute('role', error ? 'alert' : 'status');
  nodo.textContent = texto;
}

let guardando = false;
porId('cerrar-dialogo').addEventListener('click', () => porId('dialogo').close());
porId('dialogo').addEventListener('cancel', evento => {
  // No interrumpir una escritura pendiente: podría haberse guardado aunque el cliente cierre.
  if (guardando) evento.preventDefault();
});

export function bloquearDialogo(valor) {
  guardando = valor;
  porId('cerrar-dialogo').disabled = valor;
}

export function abrirDialogo(titulo) {
  const cuerpo = porId('cuerpo-dialogo');
  cuerpo.replaceChildren();
  porId('titulo-dialogo').textContent = titulo;
  bloquearDialogo(false);
  if (!porId('dialogo').open) porId('dialogo').showModal();
  return cuerpo;
}

export function tabla(titulos, filas, descripcion) {
  const nodo = elemento('table');
  nodo.append(elemento('caption', descripcion));
  const cabecera = elemento('thead');
  const fila = elemento('tr');
  for (const titulo of titulos) { const celda = elemento('th', titulo); celda.scope = 'col'; fila.append(celda); }
  cabecera.append(fila);
  const cuerpo = elemento('tbody');
  for (const valores of filas) {
    const fila = elemento('tr');
    for (const valor of valores) {
      const celda = elemento('td');
      if (valor instanceof Node) celda.append(valor); else celda.textContent = String(valor ?? '—');
      fila.append(celda);
    }
    cuerpo.append(fila);
  }
  nodo.append(cabecera, cuerpo);
  return nodo;
}

export function vacio(titulo, descripcion) {
  const nodo = elemento('div', undefined, 'vacio');
  nodo.append(elemento('h3', titulo), elemento('p', descripcion));
  return nodo;
}

export function fecha(valor) {
  // DATETIME no incluye zona: mostrar la hora de la BD, sin convertirla a otra zona del navegador.
  if (!valor) return 'Actualidad';
  const [dia, hora] = valor.split(' ');
  return `${dia.split('-').reverse().join('/')} · ${hora?.slice(0, 8) || ''}`;
}
