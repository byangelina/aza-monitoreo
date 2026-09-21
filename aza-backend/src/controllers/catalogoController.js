const { Receta, Lote, Batch } = require('../models');

// Listados de solo lectura que alimentan los filtros de los dashboards (INT07/INT08).
// La gestión (crear/editar/desactivar) corresponde a los módulos M04-M10, aún no construidos.

async function listarRecetas(req, res) {
  const items = await Receta.findAll({ order: [['nombreReceta', 'ASC']] });
  res.json({
    items: items.map((r) => ({
      id: r.idReceta,
      nombre: r.nombreReceta,
      material: r.material, // opcional: APP-AZA (sistema real) no registra material ni espesor.
      espesorObjetivo: r.espesorObjetivo === null ? null : Number(r.espesorObjetivo),
      anguloMin: Number(r.anguloMin),
      anguloMax: Number(r.anguloMax),
      activa: r.estado,
    })),
  });
}

async function listarLotes(req, res) {
  const items = await Lote.findAll({ include: [{ model: Receta, as: 'receta' }], order: [['fechaInicio', 'DESC']] });
  res.json({
    items: items.map((l) => ({
      id: l.idLote,
      codigo: l.codigoLote,
      estado: l.estado,
      recetaId: l.idReceta,
      recetaNombre: l.receta?.nombreReceta || null,
    })),
  });
}

async function listarBatches(req, res) {
  const where = req.query.idLote ? { idLote: req.query.idLote } : {};
  const items = await Batch.findAll({ where, order: [['fechaProcesamiento', 'DESC']] });
  res.json({
    items: items.map((b) => ({ id: b.idBatch, numero: b.numeroBatch, loteId: b.idLote, observacion: b.observacion })),
  });
}

module.exports = { listarRecetas, listarLotes, listarBatches };
