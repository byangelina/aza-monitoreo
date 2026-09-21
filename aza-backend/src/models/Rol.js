const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: ROL — perfiles de acceso humano (Administrador, Supervisor, Operador, Área de Calidad).
const Rol = sequelize.define(
  'Rol',
  {
    idRol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_rol' },
    nombreRol: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'nombre_rol' },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
  },
  { tableName: 'rol', timestamps: false }
);

module.exports = Rol;
