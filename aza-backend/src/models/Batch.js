const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: BATCH — palanquilla procesada dentro de un lote. FK_BATCH_LOTE usa ON DELETE RESTRICT.
const Batch = sequelize.define(
  'Batch',
  {
    idBatch: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_batch' },
    numeroBatch: { type: DataTypes.STRING(50), allowNull: false, field: 'numero_batch' },
    fechaProcesamiento: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'fecha_procesamiento' },
    observacion: { type: DataTypes.TEXT, allowNull: true },
    idLote: { type: DataTypes.INTEGER, allowNull: false, field: 'id_lote' },
  },
  {
    tableName: 'batch',
    timestamps: false,
    indexes: [
      { fields: ['id_lote'] },
      { fields: ['fecha_procesamiento'] },
      { unique: true, fields: ['id_lote', 'numero_batch'] },
    ],
  }
);

module.exports = Batch;
