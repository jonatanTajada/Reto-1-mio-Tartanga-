/** Entrada de teclado real en Chrome: Tab/Enter y escritura; no enfoca ni pulsa controles por DOM. */
export function crearTeclado(enviar, evaluar) {
  let pasos = 0;
  async function tecla(key, code, numero, modifiers = 0) {
    await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: numero, modifiers, text: key === 'Enter' ? '\r' : '' });
    await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: numero, modifiers });
  }
  async function enfocar(selector) {
    for (let i = 0; i < 150; i++) {
      if (await evaluar(`document.activeElement===document.querySelector(${JSON.stringify(selector)})`)) return;
      await tecla('Tab', 'Tab', 9); pasos++;
      const visible = await evaluar(`(()=>{const e=document.activeElement;if(!e||e===document.body)return true;const r=e.getBoundingClientRect();const x=(Math.max(0,r.left)+Math.min(innerWidth,r.right))/2;const y=(Math.max(0,r.top)+Math.min(innerHeight,r.bottom))/2;const encima=document.elementFromPoint(x,y);return r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight&&(encima===e||e.contains(encima));})()`);
      if (!visible) throw new Error('Un control enfocado por Tab queda oculto.');
    }
    throw new Error('No se alcanza con Tab: ' + selector);
  }
  return {
    enfocar,
    pasos: () => pasos,
    async pulsar(selector) { await enfocar(selector); await tecla('Enter', 'Enter', 13); },
    async rellenar(selector, valor) {
      await enfocar(selector);
      const tipo = await evaluar(`document.querySelector(${JSON.stringify(selector)}).tagName`);
      if (tipo === 'SELECT') {
        const indice = await evaluar(`[...document.querySelector(${JSON.stringify(selector)}).options].findIndex(o=>o.value===${JSON.stringify(valor)})`);
        if (indice < 0) throw new Error('Opción inexistente.');
        await tecla('Home', 'Home', 36);
        for (let i = 0; i < indice; i++) await tecla('ArrowDown', 'ArrowDown', 40);
        await tecla('Enter', 'Enter', 13);
      } else {
        await tecla('a', 'KeyA', 65, 2);
        await enviar('Input.insertText', { text: valor });
      }
    },
  };
}
