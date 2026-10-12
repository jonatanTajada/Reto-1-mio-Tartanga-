/** Dos perfiles Chrome realmente independientes: verifica identidad efectiva y controles de ubicaciones. */
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.RETO_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));
const navegadores = [];
let pruebas = 0;

async function abrir(puerto) {
  const proceso = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${puerto}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${path.join(raiz, 'var', 'browser', `roles-${puerto}-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  const navegador = { proceso }; navegadores.push(navegador);
  let pagina;
  for (let i = 0; i < 50; i++) {
    try { pagina = await (await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: 'PUT' })).json(); break; }
    catch { await pausa(200); }
  }
  if (!pagina) throw new Error('Chrome no se pudo iniciar.');
  const socket = new WebSocket(pagina.webSocketDebuggerUrl); navegador.socket = socket;
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  const pendientes = new Map(); let id = 0;
  socket.addEventListener('message', evento => {
    const dato = JSON.parse(evento.data); const pendiente = pendientes.get(dato.id);
    if (!pendiente) return;
    pendientes.delete(dato.id); clearTimeout(pendiente.timer);
    if (dato.error) pendiente.reject(new Error(dato.error.message)); else pendiente.resolve(dato.result);
  });
  navegador.enviar = (method, params = {}) => new Promise((resolve, reject) => {
    const actual = ++id;
    const timer = setTimeout(() => { pendientes.delete(actual); reject(new Error('Tiempo agotado en Chrome.')); }, 10000);
    pendientes.set(actual, { resolve, reject, timer }); socket.send(JSON.stringify({ id: actual, method, params }));
  });
  navegador.evaluar = async expression => {
    const resultado = await navegador.enviar('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (resultado.exceptionDetails) throw new Error(resultado.exceptionDetails.text);
    return resultado.result.value;
  };
  navegador.esperar = async expression => {
    for (let i = 0; i < 80; i++) { if (await navegador.evaluar(expression)) return; await pausa(100); }
    throw new Error('No se completó la carga de la interfaz.');
  };
  navegador.api = ruta => navegador.evaluar(`(async()=>{const {pedir}=await import('/assets/js/api.js');return await pedir(${JSON.stringify(ruta)});})()`);
  navegador.ubicaciones = async () => {
    await navegador.evaluar("document.querySelector('[data-seccion=ubicaciones]').click()");
    await navegador.esperar("location.hash==='#ubicaciones' && document.getElementById('lista').getAttribute('aria-busy')==='false'");
  };
  await navegador.enviar('Page.navigate', { url: 'http://127.0.0.1:8080/' });
  await navegador.esperar("document.getElementById('entrar') && !document.getElementById('entrar').disabled");
  return navegador;
}

async function comprobar(navegador, expresion, texto) {
  if (!await navegador.evaluar(expresion)) throw new Error('FAIL: ' + texto);
  pruebas++; console.log('PASS navegador independiente: ' + texto);
}

async function login(navegador, nombre) {
  await navegador.evaluar(`{ document.getElementById('login-usuario').value=${JSON.stringify(nombre)}; document.getElementById('login-password').value='DemoReto2026!'; document.getElementById('form-login').requestSubmit(); }`);
  await navegador.esperar("!document.getElementById('aplicacion').hidden && document.getElementById('lista').getAttribute('aria-busy')==='false'");
}

try {
  const admin = await abrir(9332); const user = await abrir(9333);
  await login(admin, 'admin_demo'); await login(user, 'conserje_demo');
  const sesionAdmin = await admin.api('/sesion'); const sesionUser = await user.api('/sesion');
  if (sesionAdmin.usuario.rol !== 'ADMIN' || sesionUser.usuario.rol !== 'USER' || sesionAdmin.usuario.id_usuario === sesionUser.usuario.id_usuario) throw new Error('Identidades de sesión incorrectas.');
  pruebas++; console.log('PASS: dos cookies/perfiles independientes con identidades ADMIN y USER verificadas en PHP.');
  await admin.ubicaciones(); await user.ubicaciones();
  await comprobar(admin, "document.getElementById('cuenta-nombre').textContent==='admin_demo' && document.getElementById('cuenta-rol').textContent==='Administrador'", 'Perfil ADMIN coincide con PHP');
  await comprobar(user, "document.getElementById('cuenta-nombre').textContent==='conserje_demo' && document.getElementById('cuenta-rol').textContent==='Conserje'", 'Perfil USER coincide con PHP');
  await comprobar(admin, "!document.getElementById('nuevo').hidden && document.getElementById('nuevo').textContent==='Nueva ubicación'", 'ADMIN tiene Nueva ubicación');
  await comprobar(admin, "[...document.querySelectorAll('#lista button')].some(b=>b.textContent==='Editar') && [...document.querySelectorAll('#lista button')].some(b=>b.textContent==='Eliminar')", 'ADMIN tiene edición y eliminación');
  await comprobar(user, "document.getElementById('nuevo').hidden && ![...document.querySelectorAll('#lista button')].some(b=>['Editar','Eliminar'].includes(b.textContent))", 'USER solo consulta ubicaciones');
  await comprobar(user, "document.getElementById('lista').textContent.includes('I+D+I')", 'I+D+I sigue disponible para consulta');
  await user.evaluar("document.querySelector('[data-seccion=equipamientos]').click()");
  await user.esperar("location.hash==='#equipamientos' && document.getElementById('lista').getAttribute('aria-busy')==='false'");
  await comprobar(user, "[...document.querySelectorAll('#lista button')].some(b=>b.textContent==='Trasladar')", 'USER conserva Trasladar equipamientos');
  await admin.evaluar("document.getElementById('actualizar').click()");
  await admin.esperar("document.getElementById('lista').getAttribute('aria-busy')==='false'");
  await comprobar(admin, "document.getElementById('cuenta-rol').textContent==='Administrador' && !document.getElementById('nuevo').hidden", 'Login de USER no cambia la sesión ADMIN independiente');
  // Cuenta aislada para provocar un 403 real con una interfaz que aún recuerda ADMIN.
  const pedirAdmin = (ruta, metodo, datos) => admin.evaluar(`(async()=>{const {pedir}=await import('/assets/js/api.js');return await pedir(${JSON.stringify(ruta)},${JSON.stringify(metodo)},${JSON.stringify(datos)});})()`);
  const antesUsuarios = await admin.api('/usuarios'); const antesUbicaciones = await admin.api('/ubicaciones');
  const nombre = 'ui_test_rol_' + Date.now();
  const campos = { nombre: 'Prueba', apellidos: 'Temporal', nombre_usuario: nombre, rol: 'ADMIN' };
  let temporal;
  try {
    temporal = await pedirAdmin('/usuarios', 'POST', { ...campos, password: 'DemoReto2026!' });
    await user.evaluar("(async()=>{const {pedir}=await import('/assets/js/api.js');await pedir('/logout','POST');})()");
    await user.enviar('Page.navigate', { url: 'http://127.0.0.1:8080/' });
    await user.esperar("document.getElementById('entrar') && !document.getElementById('entrar').disabled");
    await login(user, nombre); await user.ubicaciones();
    await user.evaluar("document.getElementById('nuevo').click()");
    await pedirAdmin(`/usuarios/${temporal.id_usuario}`, 'PUT', { ...campos, rol: 'USER' });
    await user.evaluar(`{document.getElementById('campo-nombre').value=${JSON.stringify(nombre)};document.getElementById('campo-descripcion').value='No debe crearse';document.querySelector('#cuerpo-dialogo form').requestSubmit();}`);
    await user.esperar("document.getElementById('cuenta-rol').textContent==='Conserje' && document.getElementById('nuevo').hidden && document.getElementById('lista').getAttribute('aria-busy')==='false'");
    await comprobar(user, "!document.getElementById('dialogo').open", '403 tras cambio de rol cierra formulario con permisos antiguos');
    await comprobar(user, "document.getElementById('mensajes').textContent.includes('Tu rol no permite')", '403 comunica el rechazo sin repetir la escritura');
    if (JSON.stringify(await admin.api('/ubicaciones')) !== JSON.stringify(antesUbicaciones)) throw new Error('La escritura rechazada alteró ubicaciones.');
    pruebas++; console.log('PASS: 403 tras cambio de rol no crea ubicación.');
  } finally {
    if (temporal) await pedirAdmin(`/usuarios/${temporal.id_usuario}`, 'DELETE');
  }
  if (JSON.stringify(await admin.api('/usuarios')) !== JSON.stringify(antesUsuarios)) throw new Error('No se conservó el conjunto original de usuarios.');
  console.log(`${pruebas} comprobaciones correctas. Cuenta temporal eliminada; ubicaciones y usuarios originales conservados.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally {
  for (const navegador of navegadores) {
    navegador.socket?.close();
    if (navegador.proceso.pid) spawnSync('taskkill', ['/PID', String(navegador.proceso.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  }
}
