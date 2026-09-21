import { api } from './api';

// Traduce las respuestas reales de la API (aza-backend) a la misma forma que ya
// consumían los componentes cuando los datos venían del mock local, para no tener
// que reescribir Operator/Supervisor/InspectionTable/InspectionDetail/AlarmPanel.

function toRecipeShape(r) {
  return { id: String(r.id), name: r.nombre, material: r.material, thickness: r.espesorObjetivo, min: r.anguloMin, max: r.anguloMax, active: r.activa };
}

function toLotShape(l) {
  return { id: l.codigo, recipeId: l.recetaId === null || l.recetaId === undefined ? null : String(l.recetaId), status: l.estado };
}

function toBatchShape(b, codigoPorIdLote) {
  return { id: b.numero, lotId: codigoPorIdLote[b.loteId] || null, observation: b.observacion || '' };
}

// El backend guarda varias observaciones concatenadas como líneas "[usuario · fecha] texto"
// dentro de una única columna TEXT (ver aza-backend/README.md, sección 7). Se reconstruye
// aquí la lista que InspectionDetail espera mostrar.
function parseObservaciones(texto) {
  if (!texto) return [];
  return texto.split('\n').filter(Boolean).map((linea, index) => {
    const match = linea.match(/^\[(.+?) · (.+?)\] ([\s\S]+)$/);
    if (!match) return { id: `obs-${index}`, text: linea, user: '', date: null };
    const [, user, date, text] = match;
    return { id: `obs-${index}`, user, date, text };
  });
}

const formatInspectionId = (id) => `INS-${String(id).padStart(6, '0')}`;
const parseInspectionId = (displayId) => Number(String(displayId).replace('INS-', ''));
const formatAlarmId = (id) => `ALM-${String(id).padStart(3, '0')}`;
const parseAlarmId = (displayId) => Number(String(displayId).replace('ALM-', ''));

function toInspectionShape(i) {
  return {
    id: formatInspectionId(i.id),
    date: i.fechaHora,
    angle: i.angulo,
    status: i.estado, // dato de origen: nunca se recalcula desde el ángulo en el frontend.
    recipeId: i.receta ? String(i.receta.id) : null,
    lotId: i.lote ? i.lote.codigo : null,
    batchId: i.batch ? i.batch.numero : null,
    min: i.limiteMin,
    max: i.limiteMax,
    observations: parseObservaciones(i.observacion),
    operatorName: i.operador ? i.operador.nombre : null,
  };
}

function toAlarmShape(a) {
  return {
    id: formatAlarmId(a.id),
    inspectionId: formatInspectionId(a.inspeccionId),
    ruleId: a.regla ? a.regla.id : null,
    title: a.tipoEvento,
    description: a.descripcion,
    status: a.estado,
    date: a.fechaGeneracion,
    userId: a.reconocidaPor ? a.reconocidaPor.id : null,
  };
}

async function cargarCatalogo() {
  const [recetasRes, lotesRes, batchesRes] = await Promise.all([
    api.get('/catalogo/recetas'),
    api.get('/catalogo/lotes'),
    api.get('/catalogo/batches'),
  ]);
  const codigoPorIdLote = Object.fromEntries(lotesRes.data.items.map((l) => [l.id, l.codigo]));
  return {
    recipes: recetasRes.data.items.map(toRecipeShape),
    lots: lotesRes.data.items.map(toLotShape),
    batches: batchesRes.data.items.map((b) => toBatchShape(b, codigoPorIdLote)),
  };
}

async function cargarInspeccionesYAlarmas(rol) {
  const inspeccionesReq = rol === 'Operador'
    ? api.get('/inspecciones/recientes', { params: { horas: 8 } }).then((r) => r.data.items)
    : api.get('/inspecciones', { params: { pageSize: 200 } }).then((r) => r.data.items);

  const alarmasReq = ['Operador', 'Supervisor'].includes(rol)
    ? api.get('/alarmas').then((r) => r.data.items)
    : Promise.resolve([]);

  const [inspecciones, alarmas] = await Promise.all([inspeccionesReq, alarmasReq]);
  return { inspections: inspecciones.map(toInspectionShape), alarms: alarmas.map(toAlarmShape) };
}

export const dataService = {
  async load(user) {
    const [{ recipes, lots, batches }, { inspections, alarms }] = await Promise.all([
      cargarCatalogo(),
      cargarInspeccionesYAlarmas(user?.role),
    ]);
    return { inspections, alarms, recipes, lots, batches };
  },

  async addObservation(inspectionId, texto, user) {
    await api.post(`/inspecciones/${parseInspectionId(inspectionId)}/observaciones`, { texto });
    return this.load(user);
  },

  async recognizeAlarm(alarmId, user) {
    await api.post(`/alarmas/${parseAlarmId(alarmId)}/reconocer`);
    return this.load(user);
  },
};
