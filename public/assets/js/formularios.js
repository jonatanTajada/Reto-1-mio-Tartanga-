/** Formularios y confirmación compartidos; cada módulo decide sus campos y operación. */
import { abrirDialogo, bloquearDialogo, boton, elemento, porId } from './dom.js';

export function formulario(titulo, campos, guardar, manejarError, nota = '') {
  const cuerpo = abrirDialogo(titulo);
  const form = elemento('form');
  if (nota) form.append(elemento('p', nota, 'aviso-regla'));
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
    if (campo.ayuda) {
      const ayuda = elemento('p', campo.ayuda, 'ayuda'); ayuda.id = `${id}-ayuda`;
      input.setAttribute('aria-describedby', ayuda.id); grupo.append(ayuda);
    }
    input.addEventListener('input', () => { input.setCustomValidity(''); input.removeAttribute('aria-invalid'); });
    rejilla.append(grupo);
  }
  const error = elemento('p', undefined, 'error-form'); error.setAttribute('role', 'alert');
  const pie = elemento('div', undefined, 'pie-form');
  const cancelar = boton('Cancelar', () => porId('dialogo').close());
  const enviar = elemento('button', 'Guardar cambios', 'boton primario'); enviar.type = 'submit';
  pie.append(cancelar, enviar); form.append(rejilla, error, pie); cuerpo.append(form);
  form.addEventListener('submit', async evento => {
    evento.preventDefault();
    const datos = {};
    for (const campo of campos) {
      const input = form.elements.namedItem(campo.nombre);
      const valor = campo.tipo === 'password' ? input.value : input.value.trim();
      input.setCustomValidity('');
      if (!campo.opcional && !valor) input.setCustomValidity('Completa este campo; no puede contener solo espacios.');
      if (campo.tipo === 'password' && valor) {
        const bytes = new TextEncoder().encode(valor).length;
        if (bytes < 12 || bytes > 72) input.setCustomValidity('La contraseña debe ocupar entre 12 y 72 bytes.');
      }
      if (campo.nombre === 'descripcion' && new TextEncoder().encode(valor).length > 65535) input.setCustomValidity('La descripción es demasiado larga.');
      if (!input.checkValidity()) { input.setAttribute('aria-invalid', 'true'); input.reportValidity(); return; }
      // Una contraseña vacía en edición conserva la existente; nunca se vuelve a enviar el hash.
      if (!campo.opcional || valor) datos[campo.nombre] = valor;
    }
    enviar.disabled = cancelar.disabled = true; bloquearDialogo(true); error.textContent = ''; enviar.textContent = 'Guardando…';
    try { await guardar(datos); porId('dialogo').close(); }
    catch (fallo) { error.textContent = fallo.message; manejarError(fallo); }
    finally { enviar.disabled = cancelar.disabled = false; bloquearDialogo(false); enviar.textContent = 'Guardar cambios'; }
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
    catch (fallo) { error.textContent = fallo.message; manejarError(fallo); }
    finally { aceptar.disabled = cancelar.disabled = false; bloquearDialogo(false); }
  }, 'peligro');
  pie.append(cancelar, aceptar); cuerpo.append(error, pie); cancelar.focus();
}
