const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: LOTE — agrupa la producción bajo una receta asociada.
const Lote = sequelize.define(
  'Lote',
  {
    idLote: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_lote' },
    codigoLote: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'codigo_lote' },
    fechaInicio: { type: DataTypes.DATE, allowNull: false, field: 'fecha_inicio' },
    fechaFinEstimada: { type: DataTypes.DATE, allowNull: true, field: 'fecha_fin_estimada' },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'Abierto', validate: { isIn: [['Abierto', 'Cerrado']] } },
    idReceta: { type: DataTypes.INTEGER, allowNull: false, field: 'id_receta' },
  },
  {
    tableName: 'lote',
    timestamps: false,
    indexes: [{ fields: ['fecha_inicio'] }],
  }
);

module.exports = Lote;
