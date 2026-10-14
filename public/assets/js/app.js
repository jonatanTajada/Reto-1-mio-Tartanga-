/** Coordina sesión, navegación y carga; no sustituye la autorización del backend. */
import { pedir } from './api.js';
import { elemento, mensaje, porId, vacio } from './dom.js';
import { categorias, roles } from './catalogos.js';
import { editarEquipo, listadoEquipos } from './equipamientos.js';
import { editarUbicacion, listadoUbicaciones } from './ubicaciones.js';
import { editarAviso, listadoAvisos } from './notificaciones.js';
import { editarUsuario, listadoUsuarios } from './usuarios.js';

let usuario = null;
let version = 0;
let seccion = 'equipamientos';
const pantallas = {
  equipamientos: { titulo: 'Inventario', lista: 'Equipos disponibles', descripcion: 'Consulta los equipos y su ubicación.', nuevo: 'Crear equipo', editar: editarEquipo, listado: listadoEquipos },
  ubicaciones: { titulo: 'Ubicaciones', lista: 'Espacios del centro', descripcion: 'Consulta las aulas y los espacios donde se guarda el material.', nuevo: 'Crear ubicación', editar: editarUbicacion, listado: listadoUbicaciones },
  notificaciones: { titulo: 'Avisos', lista: 'Avisos del centro', descripcion: 'Comunica un problema o una necesidad de mantenimiento.', nuevo: 'Crear aviso', editar: editarAviso, listado: listadoAvisos },
  usuarios: { titulo: 'Usuarios', lista: 'Cuentas del centro', descripcion: 'Gestiona las cuentas y sus permisos de acceso.', nuevo: 'Crear usuario', editar: editarUsuario, listado: listadoUsuarios },
};

function mostrarAcceso(texto = '') {
  mensaje('');
  usuario = null; version++;
  if (porId('dialogo').open) porId('dialogo').close();
  porId('aplicacion').hidden = true; porId('acceso').hidden = false;
  document.querySelector('.saltar').href = '#contenido';
  porId('error-login').textContent = texto;
  porId('login-password').value = '';
  porId('login-usuario').focus();
}

function ajustarRol() {
  porId('acceso').hidden = true; porId('aplicacion').hidden = false;
  document.querySelector('.saltar').href = '#panel';
  porId('nav-usuarios').hidden = usuario.rol !== 'ADMIN';
  porId('cuenta-nombre').textContent = usuario.nombre_usuario;
  porId('cuenta-rol').textContent = roles[usuario.rol];
  porId('ayuda-rol').textContent = '';
}

async function manejarError(error, anunciar = true) {
  if (error.estado === 401) {
    mostrarAcceso('Tu sesión ha caducado o ya no es válida. Inicia sesión de nuevo.');
    // Obtener un CSRF nuevo sin repetir automáticamente ninguna operación de escritura.
    conectar(false);
    return; // El formulario de acceso anuncia este error; no duplicarlo en la región global.
  } else if (error.estado === 403) await actualizarIdentidad();
  if (anunciar) mensaje(error.message, true);
}

async function actualizarIdentidad() {
  try {
    const sesion = await pedir('/sesion');
    if (!sesion.usuario) { mostrarAcceso('Inicia sesión para continuar.'); return; }
    const cambio = usuario && (usuario.id_usuario !== sesion.usuario.id_usuario || usuario.rol !== sesion.usuario.rol);
    usuario = sesion.usuario; ajustarRol();
    // Si la cuenta o su rol cambió, no conservar un formulario abierto con permisos antiguos.
    if (cambio) {
      if (porId('dialogo').open) porId('dialogo').close();
      await cargar(false);
    }
  } catch (error) {
    if (error.estado === 401) mostrarAcceso('La sesión ya no es válida. Inicia sesión de nuevo.');
    else mensaje('No se pudo verificar el perfil actual. Pulsa Actualizar para reintentarlo.', true);
  }
}

const contexto = {
  get usuario() { return usuario; },
  error: manejarError,
  async guardar(ruta, metodo, datos, texto) {
    await pedir(ruta, metodo, datos);
    // La escritura ya terminó: un fallo posterior de lectura no debe invitar a duplicar el alta.
    await cargar(false);
    if (porId('dialogo').open) porId('dialogo').close();
    // El resto del documento deja de ser inert antes de anunciar el resultado del diálogo.
    await new Promise(requestAnimationFrame);
    mensaje(texto);
  },
};

function permisoAlta() {
  // El nombre de cuenta no concede permisos: manda el rol efectivo devuelto por PHP.
  const rolesAlta = { equipamientos: 'ADMIN', ubicaciones: 'ADMIN', notificaciones: 'USER', usuarios: 'ADMIN' };
  return Boolean(usuario && rolesAlta[seccion] === usuario.rol);
}

async function cargar(enfocar = true) {
  if (!usuario) return;
  const actual = ++version;
  seccion = location.hash.slice(1);
  if (!pantallas[seccion] || (seccion === 'usuarios' && usuario.rol !== 'ADMIN')) {
    seccion = 'equipamientos'; history.replaceState(null, '', '#equipamientos');
  }
  const pantalla = pantallas[seccion];
  document.title = `${pantalla.titulo} · Inventario del centro`;
  porId('titulo-panel').textContent = pantalla.titulo;
  porId('descripcion-panel').textContent = pantalla.descripcion;
  porId('titulo-lista').textContent = pantalla.lista;
  for (const item of document.querySelectorAll('[data-seccion]')) {
    if (item.dataset.seccion === seccion) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  }
  porId('nuevo').textContent = pantalla.nuevo; porId('nuevo').hidden = !permisoAlta();
  porId('filtro-categoria').hidden = seccion !== 'equipamientos';
  porId('lista').replaceChildren();
  porId('lista').setAttribute('aria-busy', 'true'); porId('estado-lista').classList.remove('solo-lector'); porId('estado-lista').textContent = 'Cargando datos…';
  if (enfocar) porId('panel').focus();
  try {
    const sesion = await pedir('/sesion');
    if (actual !== version) return;
    if (!sesion.usuario) { mostrarAcceso('Inicia sesión para continuar.'); return; }
    // Un cambio de rol externo también se refleja al actualizar la interfaz.
    if (sesion.usuario.rol !== usuario.rol) { usuario = sesion.usuario; ajustarRol(); await cargar(false); return; }
    usuario = sesion.usuario; ajustarRol();
    const filtro = seccion === 'equipamientos' && porId('categoria').value ? `?categoria=${encodeURIComponent(porId('categoria').value)}` : '';
    const filas = await pedir(`/${seccion}${filtro}`);
    if (actual !== version) return;
    porId('lista').replaceChildren(filas.length ? pantalla.listado(filas, contexto) : vacio('No hay registros para mostrar', seccion === 'equipamientos' && filtro ? 'Prueba con otra categoría o selecciona todas.' : 'Los registros aparecerán aquí cuando se creen.'));
    porId('estado-lista').textContent = 'Lista actualizada.';
    porId('estado-lista').classList.add('solo-lector');
  } catch (error) {
    if (actual !== version) return;
    porId('lista').replaceChildren(vacio('No se pudieron cargar los datos', 'Pulsa Actualizar para volver a intentarlo.'));
    porId('estado-lista').classList.remove('solo-lector'); porId('estado-lista').textContent = 'Error de carga.'; manejarError(error);
  } finally { if (actual === version) porId('lista').setAttribute('aria-busy', 'false'); }
}

async function conectar(enfocar = true) {
  porId('entrar').disabled = true; porId('entrar').textContent = 'Conectando…'; porId('reconectar').hidden = true;
  try {
    const sesion = await pedir('/sesion');
    if (sesion.usuario) { usuario = sesion.usuario; ajustarRol(); await cargar(enfocar); }
    else if (enfocar) mostrarAcceso();
    porId('entrar').disabled = false; porId('entrar').textContent = 'Iniciar sesión';
  } catch (error) {
    mostrarAcceso(error.message); porId('entrar').textContent = 'Conexión no disponible'; porId('reconectar').hidden = false;
  }
}

for (const [valor, texto] of Object.entries(categorias)) { const option = elemento('option', texto); option.value = valor; porId('categoria').append(option); }
porId('form-login').addEventListener('submit', async evento => {
  evento.preventDefault(); porId('error-login').textContent = ''; porId('entrar').disabled = true;
  porId('entrar').textContent = 'Iniciando sesión…';
  try {
    const sesion = await pedir('/login', 'POST', { nombre_usuario: porId('login-usuario').value.trim(), password: porId('login-password').value });
    usuario = sesion.usuario; porId('login-password').value = '';
    mensaje(`Sesión iniciada: ${usuario.nombre_usuario} · ${roles[usuario.rol]}.`);
    ajustarRol(); await cargar();
  } catch (error) { porId('error-login').textContent = error.message; porId('login-password').focus(); }
  finally { porId('entrar').disabled = false; porId('entrar').textContent = 'Iniciar sesión'; }
});
porId('navegacion').addEventListener('click', evento => {
  const item = evento.target.closest('[data-seccion]');
  if (!item) return;
  evento.preventDefault();
  mensaje('');
  if (location.hash === '#' + item.dataset.seccion) cargar(); else location.hash = item.dataset.seccion;
});
window.addEventListener('hashchange', () => cargar());
porId('categoria').addEventListener('change', () => cargar(false));
porId('actualizar').addEventListener('click', () => cargar(false));
porId('nuevo').addEventListener('click', () => { if (usuario && permisoAlta()) pantallas[seccion].editar(contexto); });
porId('reconectar').addEventListener('click', () => conectar());
porId('salir').addEventListener('click', async () => {
  porId('salir').disabled = true;
  try { await pedir('/logout', 'POST'); mostrarAcceso(); mensaje('Has cerrado sesión.'); }
  catch (error) { manejarError(error); }
  finally { porId('salir').disabled = false; }
});
document.querySelector('.saltar').addEventListener('click', evento => {
  evento.preventDefault();
  // El salto de accesibilidad mueve el foco, sin cambiar la sección del enrutamiento por hash.
  porId(usuario ? 'panel' : 'contenido').focus();
});
conectar();
