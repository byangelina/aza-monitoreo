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
    imagenAnalisisUrl: inspeccion.imagenAnalisisUrl || null,
    imagenCapturaUrl: inspeccion.imagenCapturaUrl || null,
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
    order: [['fechaHora', 'DESC'], ['idInspeccion', 'DESC']],
  });
  res.json({ items: items.map(serializar) });
}

// RF015 / RNF021: histórico filtrado y paginado (Supervisor, Área de Calidad, Administrador).
async function listarHistorico(req, res) {
  const pg=require('../utils/validation').pagination(req.query);
  const {rows,count}=await Inspeccion.findAndCountAll({...require('../utils/historyQuery').historyQuery(req.query),limit:pg.limit,offset:pg.offset,distinct:true});
  res.json({items:rows.map(serializar),page:pg.page,pageSize:pg.pageSize,total:count});
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
  if (typeof texto !== 'string' || !texto.trim() || texto.trim().length > 500) {
    return res.status(400).json({ error: 'Escribe una observación de entre 1 y 500 caracteres.' });
  }

  const {sequelize,Auditoria}=require('../models');
  const item=await sequelize.transaction(async transaction=>{
    const inspeccion=await Inspeccion.findByPk(req.params.id,{transaction,lock:transaction.LOCK.UPDATE});
    if(!inspeccion)require('../utils/validation').fail('La inspección no está disponible.',404);
    const linea=`[${req.usuario.nombreCompleto} · ${new Date().toISOString()}] ${texto.trim().replace(/\r?\n/g,' ')}`;
    await inspeccion.update({observacion:[inspeccion.observacion,linea].filter(Boolean).join('\n')},{transaction});
    await Auditoria.create({accionRealizada:`Observación agregada #${inspeccion.idInspeccion}`,tablaAfectada:'inspeccion',idUsuario:req.usuario.idUsuario,ipOrigen:req.ip},{transaction});return inspeccion;
  });res.json({item:serializar(item)});
}

module.exports = { listarRecientes, listarHistorico, obtenerDetalle, agregarObservacion, serializar, INCLUDE_CONTEXTO };
