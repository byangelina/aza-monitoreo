const sequelize = require('../config/database');
const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Receta = require('./Receta');
const Lote = require('./Lote');
const Batch = require('./Batch');
const Inspeccion = require('./Inspeccion');
const Alarma = require('./Alarma');
const ReglaAlarma = require('./ReglaAlarma');
const Auditoria = require('./Auditoria');

// ROL 1—N USUARIO
Rol.hasMany(Usuario, { foreignKey: 'idRol', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'idRol', as: 'rol' });

// USUARIO 1—N RECETA (administrador que la creó)
Usuario.hasMany(Receta, { foreignKey: 'idUsuario', as: 'recetasCreadas' });
Receta.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'creador' });

// RECETA 1—N LOTE
Receta.hasMany(Lote, { foreignKey: 'idReceta', as: 'lotes' });
Lote.belongsTo(Receta, { foreignKey: 'idReceta', as: 'receta' });

// LOTE 1—N BATCH — RESTRICT: no se puede eliminar un lote con batches asociados.
Lote.hasMany(Batch, { foreignKey: 'idLote', as: 'batches', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Batch.belongsTo(Lote, { foreignKey: 'idLote', as: 'lote', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// BATCH 1—N INSPECCION — RESTRICT: no se puede eliminar un batch con inspecciones asociadas.
Batch.hasMany(Inspeccion, { foreignKey: 'idBatch', as: 'inspecciones', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Inspeccion.belongsTo(Batch, { foreignKey: 'idBatch', as: 'batch', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// RECETA 1—N INSPECCION (opcional: nula cuando el estado es "Sin receta")
Receta.hasMany(Inspeccion, { foreignKey: 'idReceta', as: 'inspecciones' });
Inspeccion.belongsTo(Receta, { foreignKey: 'idReceta', as: 'receta' });

// USUARIO 1—N INSPECCION (operador asociado, opcional)
Usuario.hasMany(Inspeccion, { foreignKey: 'idUsuario', as: 'inspecciones' });
Inspeccion.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'operador' });

// INSPECCION 1—N ALARMA
Inspeccion.hasMany(Alarma, { foreignKey: 'idInspeccion', as: 'alarmas' });
Alarma.belongsTo(Inspeccion, { foreignKey: 'idInspeccion', as: 'inspeccion' });

// USUARIO 1—N ALARMA (quien la reconoce)
Usuario.hasMany(Alarma, { foreignKey: 'idUsuario', as: 'alarmasReconocidas' });
Alarma.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'reconocidaPor' });

// REGLA_ALARMA 1—N ALARMA
ReglaAlarma.hasMany(Alarma, { foreignKey: 'idRegla', as: 'alarmas' });
Alarma.belongsTo(ReglaAlarma, { foreignKey: 'idRegla', as: 'regla' });

// USUARIO 1—N REGLA_ALARMA (administrador que la configura)
Usuario.hasMany(ReglaAlarma, { foreignKey: 'idUsuario', as: 'reglasConfiguradas' });
ReglaAlarma.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'configuradaPor' });

// USUARIO 1—N AUDITORIA
Usuario.hasMany(Auditoria, { foreignKey: 'idUsuario', as: 'auditorias' });
Auditoria.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

module.exports = {
  sequelize,
  Rol,
  Usuario,
  Receta,
  Lote,
  Batch,
  Inspeccion,
  Alarma,
  ReglaAlarma,
  Auditoria,
};
