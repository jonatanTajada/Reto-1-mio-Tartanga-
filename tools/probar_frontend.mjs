/** Prueba Chrome real mediante CDP y Node nativo; sin bibliotecas, instalaciones ni datos simulados. */
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearTeclado } from './teclado_cdp.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const navegador = process.env.RETO_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = 'http://127.0.0.1:8080';
const puerto = 9331;
const teclado = process.argv.includes('--teclado');
const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));
await mkdir(path.join(raiz, 'var', 'browser'), { recursive: true });
await mkdir(path.join(raiz, 'docs', 'frontend', 'evidencias'), { recursive: true });
const proceso = spawn(navegador, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${puerto}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${path.join(raiz, 'var', 'browser', String(Date.now()))}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket;
let contador = 0;
const temporales = { usuarios: [], ubicaciones: [], equipamientos: [], notificaciones: [] };
let originales;
const fallosPagina = [];
const diagnosticoRed = [];
let diagnostico = async () => ({});

try {
  let pagina;
  for (let intento = 0; intento < 50; intento++) {
    try { pagina = await (await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: 'PUT' })).json(); break; }
    catch { await pausa(200); }
  }
  if (!pagina) throw new Error('No se pudo iniciar Chrome local.');
  socket = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let secuencia = 0;
  const pendientes = new Map();
  socket.addEventListener('message', evento => {
    const mensaje = JSON.parse(evento.data);
    if (mensaje.method === 'Runtime.exceptionThrown') fallosPagina.push(mensaje.params.exceptionDetails.text);
    if (mensaje.method === 'Network.requestWillBeSent' && mensaje.params.request.url.includes('/api/')) {
      diagnosticoRed.push({ ruta: new URL(mensaje.params.request.url).pathname, metodo: mensaje.params.request.method, csrf: Object.keys(mensaje.params.request.headers).some(k => k.toLowerCase() === 'x-csrf-token') });
    }
    if (mensaje.method === 'Network.requestWillBeSentExtraInfo') {
      diagnosticoRed.push({ cookies: mensaje.params.associatedCookies?.map(c => ({ nombre: c.cookie.name, bloqueos: c.blockedReasons })) });
    }
    if (mensaje.id && pendientes.has(mensaje.id)) {
      const { resolve, reject, timer } = pendientes.get(mensaje.id); pendientes.delete(mensaje.id); clearTimeout(timer);
      if (mensaje.error) reject(new Error(mensaje.error.message)); else resolve(mensaje.result);
    }
  });
  const enviar = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++secuencia;
    const timer = setTimeout(() => { pendientes.delete(id); reject(new Error(`Tiempo agotado: ${method}`)); }, 15000);
    pendientes.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluar = async expression => {
    const resultado = await enviar('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (resultado.exceptionDetails) throw new Error(resultado.exceptionDetails.exception?.description || resultado.exceptionDetails.text);
    return resultado.result.value;
  };
  diagnostico = () => evaluar("({acceso:document.getElementById('acceso')?.hidden,aplicacion:document.getElementById('aplicacion')?.hidden,error:document.getElementById('error-login')?.textContent,mensaje:document.getElementById('mensajes')?.textContent,estado:document.getElementById('estado-lista')?.textContent,usuarioLongitud:document.getElementById('login-usuario')?.value.length,passwordLongitud:document.getElementById('login-password')?.value.length,foco:document.activeElement?.id})");
  const esperar = async expression => {
    for (let intento = 0; intento < 80; intento++) { if (await evaluar(expression)) return; await pausa(100); }
    throw new Error(`No se cumplió la condición: ${expression}`);
  };
  const comprobar = async (expression, nombre) => {
    if (!await evaluar(expression)) throw new Error(`FAIL: ${nombre}`);
    contador++; console.log(`PASS UI: ${nombre}`);
  };
  const entrada = crearTeclado(enviar, evaluar);
  const pulsar = async selector => teclado ? entrada.pulsar(selector) : evaluar(`{ const control=document.querySelector(${JSON.stringify(selector)}); control.focus(); control.click(); }`);
  const rellenar = async (selector, valor) => teclado ? entrada.rellenar(selector, valor) : evaluar(`{ const campo=document.querySelector(${JSON.stringify(selector)}); campo.value=${JSON.stringify(valor)}; campo.dispatchEvent(new Event('input',{bubbles:true})); }`);
  const guardar = async () => {
    if (teclado) await pulsar('#cuerpo-dialogo button[type=submit]');
    else await evaluar("document.querySelector('#cuerpo-dialogo form').requestSubmit()");
    await esperar("!document.getElementById('dialogo').open && document.getElementById('lista').getAttribute('aria-busy')==='false'");
  };
  const navegar = async seccion => {
    await pulsar(`[data-seccion="${seccion}"]`);
    await esperar(`location.hash==='#${seccion}' && document.getElementById('lista').getAttribute('aria-busy')==='false'`);
  };
  const accionFila = async (nombre, texto) => {
    const clave = await evaluar(`(()=>{const fila=[...document.querySelectorAll('#lista tbody tr')].find(n=>n.textContent.includes(${JSON.stringify(nombre)}));return [...fila.querySelectorAll('button')].find(n=>n.textContent===${JSON.stringify(texto)}).dataset.foco;})()`);
    await pulsar(`[data-foco=${JSON.stringify(clave)}]`);
  };
  const api = async (ruta, metodo = 'GET', datos) => evaluar(`(async()=>{ const {pedir}=await import('/assets/js/api.js'); return await pedir(${JSON.stringify(ruta)},${JSON.stringify(metodo)},${datos === undefined ? 'undefined' : JSON.stringify(datos)}); })()`);
  const login = async (nombre, password) => {
    await esperar("!document.getElementById('entrar').disabled");
    await rellenar('#login-usuario', nombre); await rellenar('#login-password', password); await pulsar('#entrar');
    await esperar("!document.getElementById('aplicacion').hidden && document.getElementById('lista').getAttribute('aria-busy')==='false'");
  };
  const logout = async () => { await pulsar('#salir'); await esperar("!document.getElementById('acceso').hidden"); };
  const foto = async nombre => {
    const captura = await enviar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(path.join(raiz, 'docs', 'frontend', 'evidencias', nombre), Buffer.from(captura.data, 'base64'));
  };
  const viewport = async (width, height) => enviar('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
  await enviar('Runtime.enable'); await enviar('Page.enable'); await enviar('Network.enable');
  await viewport(1440, 1000); await enviar('Page.navigate', { url: base });
  await esperar("document.getElementById('entrar') && !document.getElementById('entrar').disabled");
  await comprobar("document.querySelector('html').lang==='es' && document.getElementById('login-usuario').labels.length===1", 'Acceso en español y etiquetas asociadas');
  await foto('acceso.png');
  await login('admin_demo', 'DemoReto2026!');
  await comprobar("document.getElementById('cuenta-rol').textContent==='Administrador' && !document.getElementById('nav-usuarios').hidden", 'Administrador: navegación y rol');
  await foto('escritorio.png');
  originales = {};
  for (const modulo of Object.keys(temporales)) originales[modulo] = await api('/' + modulo);
  const historialOriginal = {};
  for (const fila of originales.equipamientos) historialOriginal[fila.id_equipamiento] = await api(`/equipamientos/${fila.id_equipamiento}/historial`);
  const sufijo = 'ui_test_' + Date.now();
  try {
    await navegar('usuarios'); await pulsar('#nuevo');
    await rellenar('#campo-nombre', 'Prueba UI'); await rellenar('#campo-apellidos', 'Temporal');
    await rellenar('#campo-nombre_usuario', sufijo); await rellenar('#campo-password', 'PruebaInterfaz2026!'); await guardar();
    const cuenta = (await api('/usuarios')).find(u => u.nombre_usuario === sufijo); temporales.usuarios.push(cuenta);
    await comprobar(`document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Alta de usuario mediante formulario real');
    await navegar('ubicaciones'); await pulsar('#nuevo');
    await rellenar('#campo-nombre', sufijo); await rellenar('#campo-descripcion', 'Destino de prueba UI'); await guardar();
    const ubicacion = (await api('/ubicaciones')).find(u => u.nombre === sufijo); temporales.ubicaciones.push(ubicacion);
    await comprobar(`document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Alta de ubicación mediante formulario real');
    await navegar('equipamientos'); await pulsar('#nuevo');
    await pulsar('#cuerpo-dialogo button[type=submit]');
    await comprobar("document.activeElement.id==='campo-nombre' && document.getElementById('campo-nombre').getAttribute('aria-invalid')==='true' && document.getElementById('campo-nombre').getAttribute('aria-describedby').includes('campo-nombre-error') && document.getElementById('campo-nombre-error').textContent.length>0", 'Error visible asociado al campo y foco en primer error');
    await comprobar("document.getElementById('errores').textContent===''", 'Error de formulario sin anuncio global duplicado');
    await comprobar("!document.getElementById('campo-id_ubicacion') && document.getElementById('cuerpo-dialogo').textContent.includes('Almacén')", 'Alta sin elección de ubicación');
    await rellenar('#campo-nombre', sufijo); await rellenar('#campo-marca', 'Demo'); await rellenar('#campo-modelo', 'UI');
    await rellenar('#campo-descripcion', '<img src=x onerror=alert(1)>'); await rellenar('#campo-categoria', 'OTROS'); await guardar();
    const equipo = (await api('/equipamientos')).find(e => e.nombre === sufijo); temporales.equipamientos.push(equipo);
    await accionFila(sufijo, 'Ver detalles'); await esperar("document.querySelector('.historial')");
    await comprobar("document.getElementById('cuerpo-dialogo').textContent.includes('<img src=x onerror=alert(1)>') && !document.querySelector('#cuerpo-dialogo img')", 'Datos maliciosos se muestran como texto, sin HTML');
    await comprobar("document.querySelectorAll('.historial li').length===1", 'Historial inicial visible'); await pulsar('#cerrar-dialogo');
    await accionFila(sufijo, 'Editar equipo'); await rellenar('#campo-modelo', 'UI editado'); await guardar();
    await comprobar("document.getElementById('lista').textContent.includes('UI editado')", 'Edición de equipamiento');
    await rellenar('#categoria', 'PORTATIL'); await evaluar("document.getElementById('categoria').dispatchEvent(new Event('change',{bubbles:true}))");
    await esperar("document.getElementById('lista').getAttribute('aria-busy')==='false'");
    await comprobar(`!document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Filtro de categoría conectado a la API');
    await rellenar('#categoria', 'OTROS'); await evaluar("document.getElementById('categoria').dispatchEvent(new Event('change',{bubbles:true}))"); await esperar("document.getElementById('lista').getAttribute('aria-busy')==='false'");
    await accionFila(sufijo, 'Eliminar equipo'); await pulsar('#cuerpo-dialogo .secundario');
    await comprobar(`document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Cancelar eliminación conserva el equipo');
    await logout(); await login(sufijo, 'PruebaInterfaz2026!');
    await comprobar("document.getElementById('nav-usuarios').hidden && document.getElementById('nuevo').hidden && ![...document.querySelectorAll('#lista button')].some(b=>b.textContent.startsWith('Editar'))", 'Conserje sin gestión de usuarios ni edición de equipos');
    await comprobar("!document.getElementById('resumen') && !document.querySelector('.dato-resumen')", 'Conserje sin tarjetas ni contadores de resumen');
    await accionFila(sufijo, 'Trasladar equipo'); await esperar("document.getElementById('campo-id_ubicacion')");
    await rellenar('#campo-id_ubicacion', String(ubicacion.id_ubicacion)); await guardar();
    await accionFila(sufijo, 'Ver detalles'); await esperar("document.querySelector('.historial')");
    await comprobar("document.querySelectorAll('.historial li').length===2", 'Traslado real con nuevo intervalo de historial'); await pulsar('#cerrar-dialogo');
    await navegar('notificaciones');
    await comprobar("document.getElementById('lista').textContent.includes('No hay registros')", 'Estado vacío de avisos propios');
    await pulsar('#nuevo'); await rellenar('#campo-titulo', sufijo); await rellenar('#campo-descripcion', 'Aviso temporal UI'); await guardar();
    const aviso = (await api('/notificaciones')).find(n => n.titulo === sufijo); temporales.notificaciones.push(aviso);
    await accionFila(sufijo, 'Editar aviso'); await rellenar('#campo-descripcion', 'Aviso editado UI'); await guardar();
    await comprobar("document.getElementById('lista').textContent.includes('Aviso editado UI')", 'Conserje crea y edita avisos propios');
    await viewport(390, 844); await accionFila(sufijo, 'Editar aviso');
    await comprobar("document.getElementById('dialogo').scrollWidth<=document.getElementById('dialogo').clientWidth && [...document.querySelectorAll('#cuerpo-dialogo input,#cuerpo-dialogo textarea,#cuerpo-dialogo select')].every(n=>n.labels.length===1)", 'Formulario móvil sin desbordamiento y con etiquetas');
    await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await esperar("!document.getElementById('dialogo').open");
    await comprobar("!document.getElementById('dialogo').open && document.activeElement.tagName==='BUTTON'", 'Escape cierra el diálogo y devuelve el foco');
    await viewport(390, 844); await navegar('equipamientos'); await foto('movil.png');
    await comprobar("document.documentElement.scrollWidth<=window.innerWidth", 'Móvil 390px sin desbordamiento de página');
    await comprobar("getComputedStyle(document.querySelector('#navegacion')).flexDirection==='row'", 'Navegación móvil disponible');
    for (const ancho of [320, 768]) {
      await viewport(ancho, 900);
      await comprobar("document.documentElement.scrollWidth<=window.innerWidth", `Sin desbordamiento de página a ${ancho}px`);
    }
    await viewport(320, 225);
    await comprobar("document.documentElement.scrollWidth<=innerWidth && !document.getElementById('salir').hidden && !document.querySelector('[data-seccion=notificaciones]').hidden", 'Reflujo a 320px equivalente a 1280px con ampliación 400%, sin pérdida de navegación');
    await foto('reflujo-400-equivalente.png');
    await accionFila(sufijo, 'Trasladar equipo'); await esperar("document.getElementById('campo-id_ubicacion')");
    await comprobar("document.getElementById('dialogo').scrollWidth<=document.getElementById('dialogo').clientWidth", 'Diálogo a 320px sin desbordamiento horizontal');
    await pulsar('#cuerpo-dialogo .secundario');
    await viewport(390, 844);
    await evaluar("document.documentElement.style.fontSize='200%'");
    await comprobar("document.documentElement.scrollWidth<=innerWidth && parseFloat(getComputedStyle(document.body).fontSize)>=32", 'Texto ampliado 200% sin desbordamiento de página');
    await foto('texto-200.png');
    await evaluar("document.documentElement.style.fontSize=''");
    await viewport(1440, 1000);
    for (const tipo of ['protanopia', 'deuteranopia', 'tritanopia']) {
      await enviar('Emulation.setEmulatedVisionDeficiency', { type: tipo });
      await comprobar("[...document.querySelectorAll('#lista button')].some(b=>b.textContent==='Trasladar equipo') && !document.getElementById('resumen')", `Simulación ${tipo}: acciones textuales disponibles`);
      await foto(`conserje-${tipo}.png`);
    }
    await enviar('Emulation.setEmulatedVisionDeficiency', { type: 'none' });
    await comprobar("![...document.querySelectorAll('[tabindex]')].some(e=>Number(e.getAttribute('tabindex'))>0) && document.querySelectorAll('#lista tbody th[scope=row]').length===document.querySelectorAll('#lista tbody tr').length", 'Sin tabindex positivo y con encabezados de fila asociados');
    // Al final de un documento Tab puede salir a la barra del navegador: eso no es una trampa.
    // Verificar que se alcanza un control concreto, además de recorrer todos los flujos con Tab.
    await entrada.enfocar('#actualizar');
    await comprobar("document.activeElement.id==='actualizar' && document.activeElement.matches(':focus-visible')", 'Control alcanzable por Tab con foco visible');
    const accesibilidad = await enviar('Accessibility.getFullAXTree');
    if (!accesibilidad.nodes.some(n => n.role?.value === 'main') || !accesibilidad.nodes.some(n => n.role?.value === 'navigation')) throw new Error('Faltan regiones accesibles main/navigation.');
    contador++; console.log('PASS UI: Árbol de accesibilidad Chrome con regiones main y navegación');
    await enviar('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    for (const accion of ['Ver detalles', 'Trasladar equipo']) {
      await accionFila(sufijo, accion);
      await esperar("document.querySelector('#cuerpo-dialogo [role=alert]')?.textContent.includes('No se pudo conectar')");
      await comprobar("document.getElementById('errores').textContent==='' && document.getElementById('dialogo').open", `Error de conexión dentro de ${accion}, sin duplicar alertas`);
      await pulsar('#cerrar-dialogo');
    }
    await pulsar('#actualizar'); await esperar("document.getElementById('errores').textContent.includes('No se pudo conectar')");
    await comprobar("document.getElementById('lista').textContent.includes('No se pudieron cargar')", 'Error de conexión visible y recuperable');
    await enviar('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await pulsar('#actualizar'); await esperar("document.getElementById('lista').getAttribute('aria-busy')==='false' && document.querySelector('#lista table')");
    await logout(); await viewport(1440, 1000); await login('admin_demo', 'DemoReto2026!');
    await navegar('notificaciones'); await accionFila(sufijo, 'Cambiar estado'); await rellenar('#campo-estado', 'REALIZADA'); await guardar();
    await comprobar(`document.getElementById('lista').textContent.includes('Realizada') && document.getElementById('nuevo').hidden`, 'Administrador cambia estado y no crea avisos');
    await logout(); await login(sufijo, 'PruebaInterfaz2026!'); await navegar('notificaciones');
    await comprobar(`![...document.querySelectorAll('#lista tbody tr')].find(r=>r.textContent.includes(${JSON.stringify(sufijo)})).textContent.includes('Eliminar')`, 'Aviso realizado sin control de eliminación');
    await logout(); await login('admin_demo', 'DemoReto2026!'); await navegar('notificaciones');
    await accionFila(sufijo, 'Cambiar estado'); await rellenar('#campo-estado', 'EN_PROCESO'); await guardar();
    await logout(); await login(sufijo, 'PruebaInterfaz2026!'); await navegar('notificaciones');
    await accionFila(sufijo, 'Eliminar aviso'); await pulsar('#cuerpo-dialogo .peligro'); await esperar("!document.getElementById('dialogo').open && document.getElementById('lista').getAttribute('aria-busy')==='false'");
    temporales.notificaciones.length = 0;
    await comprobar(`!document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Eliminación real de aviso en proceso con confirmación');
    await logout(); await login('admin_demo', 'DemoReto2026!'); await navegar('equipamientos');
    await accionFila(sufijo, 'Eliminar equipo'); await pulsar('#cuerpo-dialogo .peligro'); await esperar("!document.getElementById('dialogo').open && document.getElementById('lista').getAttribute('aria-busy')==='false'");
    temporales.equipamientos.length = 0;
    await comprobar(`!document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Eliminación real de equipo con confirmación');
    await navegar('ubicaciones'); await accionFila(sufijo, 'Editar ubicación'); await rellenar('#campo-descripcion', 'Ubicación editada UI'); await guardar();
    await comprobar("document.getElementById('lista').textContent.includes('Ubicación editada UI')", 'Edición de ubicación');
    await accionFila(sufijo, 'Eliminar ubicación'); await pulsar('#cuerpo-dialogo .peligro'); await esperar("!document.getElementById('dialogo').open && document.getElementById('lista').getAttribute('aria-busy')==='false'");
    temporales.ubicaciones.length = 0;
    await comprobar(`!document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Eliminación real de ubicación sin referencias');
    await navegar('usuarios'); await accionFila(sufijo, 'Editar usuario'); await rellenar('#campo-nombre', 'Persona editada UI'); await guardar();
    await comprobar("document.getElementById('lista').textContent.includes('Persona editada UI')", 'Edición de usuario conservando contraseña');
    await accionFila(sufijo, 'Eliminar usuario'); await pulsar('#cuerpo-dialogo .peligro'); await esperar("!document.getElementById('dialogo').open && document.getElementById('lista').getAttribute('aria-busy')==='false'");
    temporales.usuarios.length = 0;
    await comprobar(`!document.getElementById('lista').textContent.includes(${JSON.stringify(sufijo)})`, 'Eliminación real de usuario sin avisos');
    // Revocar desde el servidor la sesión actual simula caducidad real, sin falsificar respuestas.
    await api('/logout', 'POST'); await pulsar('#actualizar');
    await esperar("!document.getElementById('acceso').hidden");
    await comprobar("document.getElementById('error-login').textContent.includes('sesión')", 'Sesión no válida vuelve al acceso con explicación');
  } finally {
    // Limpiar por IDs propios aunque falle un paso. Los registros existentes no se actualizan.
    await enviar('Page.navigate', { url: base }); await esperar("document.getElementById('entrar') && !document.getElementById('entrar').disabled");
    if (await evaluar("!document.getElementById('aplicacion').hidden")) await logout();
    await login('admin_demo', 'DemoReto2026!');
    for (const aviso of temporales.notificaciones) await api(`/notificaciones/${aviso.id_notificacion}/estado`, 'PATCH', { estado: 'PENDIENTE' });
    if (temporales.notificaciones.length) {
      await logout(); const cuenta = temporales.usuarios[0]; await login(cuenta.nombre_usuario, 'PruebaInterfaz2026!');
      for (const aviso of temporales.notificaciones) await api(`/notificaciones/${aviso.id_notificacion}`, 'DELETE');
      await logout(); await login('admin_demo', 'DemoReto2026!');
    }
    for (const equipo of temporales.equipamientos) await api(`/equipamientos/${equipo.id_equipamiento}`, 'DELETE');
    for (const ubicacion of temporales.ubicaciones) await api(`/ubicaciones/${ubicacion.id_ubicacion}`, 'DELETE');
    for (const cuenta of temporales.usuarios) await api(`/usuarios/${cuenta.id_usuario}`, 'DELETE');
  }
  for (const [modulo, antes] of Object.entries(originales)) {
    if (JSON.stringify(await api('/' + modulo)) !== JSON.stringify(antes)) throw new Error('Los datos existentes han cambiado.');
  }
  for (const [id, antes] of Object.entries(historialOriginal)) {
    if (JSON.stringify(await api(`/equipamientos/${id}/historial`)) !== JSON.stringify(antes)) throw new Error('El histórico existente ha cambiado.');
  }
  if (fallosPagina.length) throw new Error('Hay excepciones JavaScript no controladas: ' + fallosPagina.join(', '));
  console.log(`${contador} comprobaciones UI correctas; sin excepciones JavaScript. Datos e históricos anteriores conservados.`);
  if (teclado) console.log(`Modo teclado: ${entrada.pasos()} pasos Tab; activación con Enter y escritura nativa en ambos roles.`);
} catch (error) { console.error(error.message); console.error(await diagnostico().catch(() => ({}))); console.error(fallosPagina); console.error(JSON.stringify(diagnosticoRed.slice(-6))); process.exitCode = 1; }
finally {
  socket?.close();
  if (proceso.pid) spawnSync('taskkill', ['/PID', String(proceso.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
}
