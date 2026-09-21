const { Op } = require('sequelize');
const { Inspeccion, Batch, Lote, Receta, Usuario, Alarma } = require('../models');
const { registrarAuditoria } = require('../utils/auditLogger');

const INCLUDE_CONTEXTO = [
  { model: Batch, as: 'batch', include: [{ model: Lote, as: 'lote' }] },
  { model: Receta, as: 'receta' },
  { model: Usuario, as: 'operador', attributes: ['idUsuario', 'nombreCompleto'] },
];

function serializar(inspeccion) {
  return {
    id: inspeccion.idInspeccion,
    fechaHora: inspeccion.fechaHora,
    angulo: Number(inspeccion.anguloMedido),
    estado: inspeccion.estadoResultado, // dato de origen: nunca se recalcula desde el ángulo.
    limiteMin: inspeccion.limiteMinSnapshot === null ? null : Number(inspeccion.limiteMinSnapshot),
    limiteMax: inspeccion.limiteMaxSnapshot === null ? null : Number(inspeccion.limiteMaxSnapshot),
    observacion: inspeccion.observacion,
    receta: inspeccion.receta ? { id: inspeccion.receta.idReceta, nombre: inspeccion.receta.nombreReceta } : null,
    lote: inspeccion.batch?.lote ? { id: inspeccion.batch.lote.idLote, codigo: inspeccion.batch.lote.codigoLote } : null,
    batch: inspeccion.batch ? { id: inspeccion.batch.idBatch, numero: inspeccion.batch.numeroBatch } : null,
    operador: inspeccion.operador ? { id: inspeccion.operador.idUsuario, nombre: inspeccion.operador.nombreCompleto } : null,
  };
}

// RF013 / ventana operativa del Operador: últimas horas relativas al registro más reciente.
async function listarRecientes(req, res) {
  const ventanaHoras = Number(req.query.horas || 8);
  const ultima = await Inspeccion.findOne({ order: [['fechaHora', 'DESC']] });
  if (!ultima) return res.json({ items: [] });

  const desde = new Date(ultima.fechaHora.getTime() - ventanaHoras * 60 * 60 * 1000);
  const items = await Inspeccion.findAll({
    where: { fechaHora: { [Op.gte]: desde } },
    include: INCLUDE_CONTEXTO,
    order: [['fechaHora', 'DESC']],
  });
  res.json({ items: items.map(serializar) });
}

// RF015 / RNF021: histórico filtrado y paginado (Supervisor, Área de Calidad, Administrador).
async function listarHistorico(req, res) {
  const { desde, hasta, idReceta, idLote, idBatch, estado } = req.query;
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize || 50)));

  const where = {};
  if (desde || hasta) {
    where.fechaHora = {};
    if (desde) where.fechaHora[Op.gte] = new Date(desde);
    if (hasta) where.fechaHora[Op.lte] = new Date(hasta);
  }
  if (idReceta) where.idReceta = idReceta;
  if (idBatch) where.idBatch = idBatch;
  if (estado) where.estadoResultado = estado;

  const include = [...INCLUDE_CONTEXTO];
  if (idLote) {
    include[0] = { ...include[0], where: { idLote }, required: true };
  }

  const { rows, count } = await Inspeccion.findAndCountAll({
    where,
    include,
    order: [['fechaHora', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    distinct: true,
  });

  res.json({ items: rows.map(serializar), page, pageSize, total: count });
}

async function obtenerDetalle(req, res) {
  const inspeccion = await Inspeccion.findByPk(req.params.id, {
    include: [...INCLUDE_CONTEXTO, { model: Alarma, as: 'alarmas' }],
  });
  if (!inspeccion) return res.status(404).json({ error: 'La inspección no está disponible.' });
  res.json({ item: { ...serializar(inspeccion), alarmas: inspeccion.alarmas.map((a) => a.idAlarma) } });
}

// RF012: agregar observación. El diccionario define una única columna `observacion`
// (TEXT) por inspección; para admitir varias notas sin ampliar el modelo aprobado,
// se conserva como un registro de texto con formato "[usuario · fecha] texto" por línea.
async function agregarObservacion(req, res) {
  const { texto } = req.body;
  if (!texto || !texto.trim() || texto.trim().length > 500) {
    return res.status(400).json({ error: 'Escribe una observación de entre 1 y 500 caracteres.' });
  }

  const inspeccion = await Inspeccion.findByPk(req.params.id);
  if (!inspeccion) return res.status(404).json({ error: 'La inspección no está disponible.' });

  const linea = `[${req.usuario.nombreCompleto} · ${new Date().toISOString()}] ${texto.trim()}`;
  inspeccion.observacion = inspeccion.observacion ? `${inspeccion.observacion}\n${linea}` : linea;
  await inspeccion.save();

  await registrarAuditoria({ accion: 'Observación agregada a inspección', tabla: 'inspeccion', idUsuario: req.usuario.idUsuario, ip: req.ip });
  res.json({ item: serializar(inspeccion) });
}

module.exports = { listarRecientes, listarHistorico, obtenerDetalle, agregarObservacion, serializar, INCLUDE_CONTEXTO };
