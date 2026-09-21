const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: REGLA_ALARMA — reglas/umbrales configurables (valores = supuestos académicos).
const ReglaAlarma = sequelize.define(
  'ReglaAlarma',
  {
    idRegla: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_regla' },
    nombreRegla: { type: DataTypes.STRING(100), allowNull: false, field: 'nombre_regla' },
    tipoRegla: { type: DataTypes.STRING(50), allowNull: false, field: 'tipo_regla' },
    valorUmbral: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'valor_umbral' },
    cantidadEventos: { type: DataTypes.INTEGER, allowNull: true, field: 'cantidad_eventos' },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    idUsuario: { type: DataTypes.INTEGER, allowNull: false, field: 'id_usuario' },
  },
  {
    tableName: 'regla_alarma',
    timestamps: false,
    indexes: [{ fields: ['tipo_regla'] }, { fields: ['activo'] }],
  }
);

module.exports = ReglaAlarma;
