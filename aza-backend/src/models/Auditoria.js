const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: AUDITORIA — log de acciones críticas. No se expone ninguna ruta de update/delete
// sobre esta tabla: es la forma en que este backend cumple RNF008 (inmutabilidad).
const Auditoria = sequelize.define(
  'Auditoria',
  {
    idAuditoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_auditoria' },
    accionRealizada: { type: DataTypes.STRING(255), allowNull: false, field: 'accion_realizada' },
    tablaAfectada: { type: DataTypes.STRING(50), allowNull: false, field: 'tabla_afectada' },
    fechaHora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'fecha_hora' },
    ipOrigen: { type: DataTypes.STRING(45), allowNull: true, field: 'ip_origen' },
    idUsuario: { type: DataTypes.INTEGER, allowNull: false, field: 'id_usuario' },
  },
  {
    tableName: 'auditoria',
    timestamps: false,
    indexes: [{ fields: ['fecha_hora'] }, { fields: ['id_usuario'] }],
  }
);

module.exports = Auditoria;
