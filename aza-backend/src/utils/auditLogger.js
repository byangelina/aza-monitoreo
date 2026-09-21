const { Auditoria } = require('../models');

// Único punto de escritura hacia AUDITORIA. Ninguna ruta expone update/delete sobre
// esta tabla, lo que en la práctica implementa RNF008 (inmutabilidad de auditoría).
async function registrarAuditoria({ accion, tabla, idUsuario, ip }) {
  await Auditoria.create({
    accionRealizada: accion,
    tablaAfectada: tabla,
    idUsuario,
    ipOrigen: ip || null,
  });
}

module.exports = { registrarAuditoria };
