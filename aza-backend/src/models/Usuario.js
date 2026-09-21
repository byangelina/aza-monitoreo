const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: USUARIO — credenciales, rol y controles de acceso (RNF001-RNF003, RNF010).
const Usuario = sequelize.define(
  'Usuario',
  {
    idUsuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_usuario' },
    nombreCompleto: { type: DataTypes.STRING(100), allowNull: false, field: 'nombre_completo' },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue('correo', String(value).trim().toLowerCase());
      },
    },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    fechaCreacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'fecha_creacion' },
    idRol: { type: DataTypes.INTEGER, allowNull: false, field: 'id_rol' },
    intentosFallidos: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0, field: 'intentos_fallidos' },
    bloqueadoHasta: { type: DataTypes.DATE, allowNull: true, field: 'bloqueado_hasta' },
    debeCambiarPassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'debe_cambiar_password' },
  },
  {
    tableName: 'usuario',
    timestamps: false,
    indexes: [{ fields: ['id_rol'] }, { fields: ['estado'] }],
  }
);

module.exports = Usuario;
