const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: INSPECCION — tabla central de resultados de medición angular. El estado_resultado
// llega desde el sistema de captura/simulador; este backend nunca lo recalcula desde el ángulo.
const Inspeccion = sequelize.define(
  'Inspeccion',
  {
    idInspeccion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_inspeccion' },
    fechaHora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'fecha_hora' },
    anguloMedido: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'angulo_medido' },
    limiteMinSnapshot: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'limite_min_snapshot' },
    limiteMaxSnapshot: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'limite_max_snapshot' },
    estadoResultado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'estado_resultado',
      validate: { isIn: [['Aprobado', 'Rechazado', 'Sin receta']] },
    },
    observacion: { type: DataTypes.TEXT, allowNull: true },
    idBatch: { type: DataTypes.INTEGER, allowNull: false, field: 'id_batch' },
    idReceta: { type: DataTypes.INTEGER, allowNull: true, field: 'id_receta' },
    idUsuario: { type: DataTypes.INTEGER, allowNull: true, field: 'id_usuario' },
  },
  {
    tableName: 'inspeccion',
    timestamps: false,
    indexes: [
      { fields: ['fecha_hora'] },
      { fields: ['id_batch'] },
      { fields: ['id_receta'] },
      { fields: ['estado_resultado'] },
    ],
  }
);

module.exports = Inspeccion;
