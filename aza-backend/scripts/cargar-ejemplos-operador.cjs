// Envía dos inspecciones de ejemplo (con sus imágenes) a /api/ingesta/inspecciones.
// Uso (PowerShell):
//   $env:API_URL="https://<backend>.onrender.com/api"; $env:FRONTEND_URL="https://<frontend>.onrender.com";
//   $env:INGESTA_API_KEY="<clave>"; $env:RECETA="Alambrón SAE 1020"; $env:LOTE="<codigo de lote abierto>";
//   node scripts/cargar-ejemplos-operador.cjs
const {API_URL, FRONTEND_URL, INGESTA_API_KEY, RECETA, LOTE} = process.env;
for (const [k, v] of Object.entries({API_URL, FRONTEND_URL, INGESTA_API_KEY, RECETA, LOTE})) if (!v) throw new Error(`Falta la variable ${k}.`);
const img = (trigger, tipo) => `${FRONTEND_URL.replace(/\/$/, '')}/ejemplos/${trigger}-${tipo}.png`;
const casos = [
  {trigger: 'trigger-0231', angulo: 313.7, estado: 'RECHAZADO', fecha: '2026-07-14T13:44:12-04:00'},
  {trigger: 'trigger-0241', angulo: 8.9, estado: 'APROBADO', fecha: '2026-07-14T13:56:48-04:00'},
];
(async () => {
  for (const c of casos) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/ingesta/inspecciones`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'x-api-key': INGESTA_API_KEY, 'x-idempotency-key': `ejemplo-${c.trigger}`},
      body: JSON.stringify({angulo: c.angulo, estado: c.estado, fecha: c.fecha, receta: RECETA, lote: LOTE, carpeta: 'EJEMPLOS-OPERADOR', operador: 'Ejemplo de validación visual', imagenAnalisisUrl: img(c.trigger, 'analisis'), imagenCapturaUrl: img(c.trigger, 'captura')}),
    });
    console.log(c.trigger, res.status, (await res.text()).slice(0, 200));
  }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
