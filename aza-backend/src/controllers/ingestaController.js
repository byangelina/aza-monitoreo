const { Op } = require('sequelize');
const { Inspeccion, Receta, Lote, Batch, Alarma, ReglaAlarma } = require('../models');
const { serializar, INCLUDE_CONTEXTO } = require('./inspeccionController');

// APP-AZA (src/vision/industrial.py) escribe el estado en MAYÚSCULAS: "APROBADO",
// "RECHAZADO", "SIN RECETA". El modelo canónico de la plataforma (00_LEEME_PRIMERO,
// sección "Estados canónicos") usa "Aprobado" / "Rechazado" / "Sin receta". Esta tabla
// normaliza en el único punto donde el sistema externo real entra a la plataforma.
const ESTADOS_APP_AZA = {
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  'SIN RECETA': 'Sin receta',
};

function normalizarEstado(valor) {
  if (!valor) return null;
  const clave = String(valor).trim().toUpperCase();
  return ESTADOS_APP_AZA[clave] || null;
}

const LOTE_SIN_ASIGNAR = 'SIN-LOTE-APP-AZA';

// LOTE.id_receta es obligatoria en el diccionario (un lote de producción se define por la
// receta que se está corriendo). Si el lote ya existe se reutiliza tal cual; si hay que
// crearlo, se necesita una receta reconocida para satisfacer esa FK — si no se pudo resolver
// ninguna, es un dato realmente insuficiente para crear trazabilidad nueva y se rechaza.
async function resolverLote(codigoLote, receta) {
  const codigo = (codigoLote && String(codigoLote).trim()) || LOTE_SIN_ASIGNAR;
  const existente = await Lote.findOne({ where: { codigoLote: codigo } });
  if (existente) return existente;
  if (!receta) {
    const error = new Error(`No existe el lote "${codigo}" y no se pudo asociar una receta reconocida para crearlo.`);
    error.status = 422;
    throw error;
  }
  return Lote.create({ codigoLote: codigo, fechaInicio: new Date(), estado: 'Abierto', idReceta: receta.idReceta });
}

// APP-AZA no tiene un id de batch normalizado: cada disparo de cámara genera una carpeta
// (`Trigger_0001_...`). Esa ruta es lo más parecido a un identificador de batch real, así
// que se usa como numero_batch; si no llega, se genera uno para no romper la FK obligatoria.
async function resolverBatch(idLote, carpeta) {
  const numeroBatch = (carpeta && String(carpeta).trim()) || `AUTO-${Date.now()}`;
  const [batch] = await Batch.findOrCreate({
    where: { idLote, numeroBatch },
    defaults: { idLote, numeroBatch, fechaProcesamiento: new Date() },
  });
  return batch;
}

// RF047 / HU44 / INT15: el sistema de captura (APP-AZA) o un simulador equivalente
// registra un resultado ya clasificado. Este endpoint nunca recalcula Aprobado/Rechazado;
// solo normaliza el formato externo y resuelve las referencias de trazabilidad.
async function registrarInspeccion(req, res) {
  const { angulo, estado, receta: nombreReceta, lote: codigoLote, operador, carpeta, fecha } = req.body;

  const anguloNumerico = Number(angulo);
  if (!Number.isFinite(anguloNumerico)) return res.status(400).json({ error: 'El ángulo debe ser un número.' });

  const estadoNormalizado = normalizarEstado(estado);
  if (!estadoNormalizado) {
    return res.status(400).json({ error: 'Estado no reconocido. Usa APROBADO, RECHAZADO o SIN RECETA (formato APP-AZA).' });
  }

  let receta = null;
  if (nombreReceta) {
    receta = await Receta.findOne({ where: { nombreReceta: { [Op.iLike]: String(nombreReceta).trim() } } });
  }

  // Si la receta enviada no existe en la plataforma, no se puede asociar la FK: se
  // conserva "Sin receta" (igual que hace APP-AZA cuando no encuentra la configuración).
  const estadoFinal = receta ? estadoNormalizado : 'Sin receta';

  const lote = await resolverLote(codigoLote, receta);
  const batch = await resolverBatch(lote.idLote, carpeta);

  const inspeccion = await Inspeccion.create({
    fechaHora: fecha ? new Date(fecha) : new Date(),
    anguloMedido: anguloNumerico,
    estadoResultado: estadoFinal,
    limiteMinSnapshot: receta ? receta.anguloMin : null,
    limiteMaxSnapshot: receta ? receta.anguloMax : null,
    observacion: operador ? `Operador de planta (APP-AZA): ${operador}` : null,
    idBatch: batch.idBatch,
    idReceta: receta ? receta.idReceta : null,
    idUsuario: null, // el operador de APP-AZA (usuario/PIN) no corresponde a una cuenta de la plataforma web.
  });

  // RF041: genera automáticamente una alarma cuando el resultado llega rechazado,
  // según la primera regla activa configurada para ese tipo de evento.
  if (estadoFinal === 'Rechazado') {
    const regla = await ReglaAlarma.findOne({ where: { tipoRegla: 'Resultado rechazado', activo: true } });
    if (regla) {
      await Alarma.create({
        tipoEvento: regla.tipoRegla,
        descripcion: `Resultado rechazado recibido desde el sistema de captura (${batch.numeroBatch}).`,
        estadoAlarma: 'Activa',
        idInspeccion: inspeccion.idInspeccion,
        idRegla: regla.idRegla,
      });
    }
  }

  const completa = await Inspeccion.findByPk(inspeccion.idInspeccion, { include: INCLUDE_CONTEXTO });
  res.status(201).json({ item: serializar(completa) });
}

module.exports = { registrarInspeccion };
