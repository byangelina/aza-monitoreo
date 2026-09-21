const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// HOJA: RECETA — tolerancia angular y materialidad del proceso de trefilado.
// `material` y `espesor_objetivo` son opcionales: el sistema real de captura (APP-AZA,
// tabla `configuracion_recetas`) solo registra nombre + min_tol + max_tol. Se conservan
// estas dos columnas por compatibilidad con el diccionario aprobado, pero no se exigen
// porque no tienen respaldo en el sistema externo real (ver aza-backend/README.md §7).
const Receta = sequelize.define(
  'Receta',
  {
    idReceta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_receta' },
    nombreReceta: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'nombre_receta' },
    material: { type: DataTypes.STRING(50), allowNull: true },
    espesorObjetivo: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'espesor_objetivo' },
    anguloMin: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'angulo_min' },
    anguloMax: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'angulo_max' },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    fechaCreacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'fecha_creacion' },
    fechaModificacion: { type: DataTypes.DATE, allowNull: true, field: 'fecha_modificacion' },
    idUsuario: { type: DataTypes.INTEGER, allowNull: false, field: 'id_usuario' },
  },
  {
    tableName: 'receta',
    timestamps: false,
    indexes: [{ fields: ['nombre_receta'] }, { fields: ['material'] }],
    validate: {
      limitesCoherentes() {
        if (this.anguloMin !== undefined && this.anguloMax !== undefined && Number(this.anguloMin) >= Number(this.anguloMax)) {
          throw new Error('angulo_min debe ser menor que angulo_max (CK_RECETA_ANGULO).');
        }
      },
    },
  }
);

module.exports = Receta;
