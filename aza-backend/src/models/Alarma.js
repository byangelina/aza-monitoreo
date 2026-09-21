const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: ALARMA — ciclo Activa -> Reconocida. No existe el estado "Resuelta".
const Alarma = sequelize.define(
  'Alarma',
  {
    idAlarma: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_alarma' },
    tipoEvento: { type: DataTypes.STRING(50), allowNull: false, field: 'tipo_evento' },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    fechaGeneracion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'fecha_generacion' },
    estadoAlarma: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Activa',
      field: 'estado_alarma',
      validate: { isIn: [['Activa', 'Reconocida']] },
    },
    fechaReconocimiento: { type: DataTypes.DATE, allowNull: true, field: 'fecha_reconocimiento' },
    idInspeccion: { type: DataTypes.INTEGER, allowNull: false, field: 'id_inspeccion' },
    idUsuario: { type: DataTypes.INTEGER, allowNull: true, field: 'id_usuario' },
    idRegla: { type: DataTypes.INTEGER, allowNull: false, field: 'id_regla' },
  },
  {
    tableName: 'alarma',
    timestamps: false,
    indexes: [{ fields: ['fecha_generacion'] }, { fields: ['estado_alarma'] }, { fields: ['id_regla'] }],
  }
);

module.exports = Alarma;
