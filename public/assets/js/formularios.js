/** Formularios y confirmación compartidos; cada módulo decide sus campos y operación. */
import { abrirDialogo, bloquearDialogo, boton, elemento, porId, mensaje } from './dom.js';

export function formulario(titulo, campos, guardar, manejarError, nota = '', textoBoton = 'Guardar cambios') {
  const cuerpo = abrirDialogo(titulo);
  const form = elemento('form');
  // Los errores se presentan como texto asociado al campo, no solo como burbujas del navegador.
  form.noValidate = true;
  if (nota) form.append(elemento('p', nota, 'aviso-regla'));
  form.append(elemento('p', 'Completa todos los campos, salvo los marcados como opcionales.', 'ayuda'));
  const rejilla = elemento('div', undefined, 'rejilla-form');
  for (const campo of campos) {
    const grupo = elemento('div', undefined, 'campo');
    const id = `campo-${campo.nombre}`;
    const label = elemento('label', campo.etiqueta);
    label.htmlFor = id;
    const input = elemento(campo.opciones ? 'select' : campo.tipo === 'textarea' ? 'textarea' : 'input');
    input.id = id; input.name = campo.nombre;
    if (input.tagName === 'INPUT') input.type = campo.tipo || 'text';
    if (campo.opciones) {
      for (const [valor, texto] of campo.opciones) { const option = elemento('option', texto); option.value = valor; input.append(option); }
    }
    input.value = campo.valor ?? '';
    input.required = !campo.opcional;
    if (campo.maximo) input.maxLength = campo.maximo;
    if (campo.tipo === 'password') input.autocomplete = 'new-password';
    if (campo.nombre === 'nombre_usuario') input.autocomplete = 'off';
    if (campo.soloLectura) input.readOnly = true;
    grupo.append(label, input);
    const descripciones = [];
    if (campo.ayuda) {
      const ayuda = elemento('p', campo.ayuda, 'ayuda'); ayuda.id = `${id}-ayuda`;
      descripciones.push(ayuda.id); grupo.append(ayuda);
    }
    const errorCampo = elemento('span', undefined, 'error-campo'); errorCampo.id = `${id}-error`;
    descripciones.push(errorCampo.id); grupo.append(errorCampo);
    input.setAttribute('aria-describedby', descripciones.join(' '));
    input.addEventListener('input', () => {
      input.setCustomValidity(''); input.removeAttribute('aria-invalid'); errorCampo.textContent = '';
      if (!form.querySelector('[aria-invalid=true]')) error.textContent = '';
    });
    rejilla.append(grupo);
  }
  const error = elemento('p', undefined, 'error-form'); error.setAttribute('role', 'alert');
  const pie = elemento('div', undefined, 'pie-form');
  const cancelar = boton('Cancelar', () => porId('dialogo').close());
  const enviar = elemento('button', textoBoton, 'boton primario'); enviar.type = 'submit';
  pie.append(cancelar, enviar); form.append(rejilla, error, pie); cuerpo.append(form);
  form.addEventListener('submit', async evento => {
    evento.preventDefault();
    const datos = {};
    let primerError = null;
    for (const campo of campos) {
      const input = form.elements.namedItem(campo.nombre);
      const valor = campo.tipo === 'password' ? input.value : input.value.trim();
      input.setCustomValidity('');
      if (!campo.opcional && !valor) input.setCustomValidity('Completa este campo; no puede contener solo espacios.');
      if (campo.tipo === 'password' && valor) {
        const bytes = new TextEncoder().encode(valor).length;
        if (bytes < 12 || bytes > 72) input.setCustomValidity('La contraseña es demasiado corta o larga. Prueba con una frase de entre 12 y 72 letras o números sencillos.');
      }
      if (campo.nombre === 'descripcion' && new TextEncoder().encode(valor).length > 65535) input.setCustomValidity('La descripción es demasiado larga.');
      const errorCampo = porId(`campo-${campo.nombre}-error`);
      if (!input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true'); errorCampo.textContent = input.validationMessage;
        primerError ??= input;
      } else { input.removeAttribute('aria-invalid'); errorCampo.textContent = ''; }
      // Una contraseña vacía en edición conserva la existente; nunca se vuelve a enviar el hash.
      if (!campo.opcional || valor) datos[campo.nombre] = valor;
    }
    if (primerError) {
      error.textContent = 'Revisa los campos indicados antes de guardar.';
      primerError.focus();
      return;
    }
    enviar.disabled = cancelar.disabled = true; bloquearDialogo(true); error.textContent = ''; enviar.textContent = 'Guardando…';
    try { await guardar(datos); porId('dialogo').close(); }
    catch (fallo) {
      // Un único anuncio: error local de formulario o aviso de sesión, sin duplicarlos.
      if (fallo.estado === 401) await manejarError(fallo);
      else if (fallo.estado === 403) {
        await manejarError(fallo, false);
        if (porId('dialogo').open) error.textContent = fallo.message;
        else mensaje(fallo.message, true);
      } else error.textContent = fallo.message;
    }
    finally { enviar.disabled = cancelar.disabled = false; bloquearDialogo(false); enviar.textContent = textoBoton; }
  });
  // showModal enfoca antes de construir los campos; trasladar el foco al primer control del formulario.
  form.querySelector('input,select,textarea')?.focus();
}

export function confirmar(titulo, explicacion, eliminar, manejarError) {
  const cuerpo = abrirDialogo(titulo);
  cuerpo.append(elemento('p', explicacion));
  const error = elemento('p', undefined, 'error-form'); error.setAttribute('role', 'alert');
  const pie = elemento('div', undefined, 'pie-form');
  const cancelar = boton('Cancelar', () => porId('dialogo').close());
  const aceptar = boton('Sí, eliminar', async () => {
    aceptar.disabled = cancelar.disabled = true; bloquearDialogo(true); error.textContent = '';
    try { await eliminar(); porId('dialogo').close(); }
    catch (fallo) {
      if (fallo.estado === 401) await manejarError(fallo);
      else if (fallo.estado === 403) {
        await manejarError(fallo, false);
        if (porId('dialogo').open) error.textContent = fallo.message;
        else mensaje(fallo.message, true);
      } else error.textContent = fallo.message;
    }
    finally { aceptar.disabled = cancelar.disabled = false; bloquearDialogo(false); }
  }, 'peligro');
  pie.append(cancelar, aceptar); cuerpo.append(error, pie); cancelar.focus();
}
