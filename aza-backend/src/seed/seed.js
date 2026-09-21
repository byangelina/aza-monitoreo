// Siembra de datos de demostración académica: mismos roles, cuentas, recetas y patrón de
// inspecciones que ya usaba el mock del frontend (src/mock/data.js), pero persistidos en
// PostgreSQL y con fechas relativas al momento real de ejecución del script.
const sequelize = require('../config/database');
const { Rol, Usuario, Receta, Lote, Batch, Inspeccion, Alarma, ReglaAlarma } = require('../models');
const { hashPassword } = require('../utils/password');

const DEMO_PASSWORD = 'Demo2026!';

const ROLES = [
  { nombreRol: 'Administrador', descripcion: 'Acceso total al sistema, gestión de usuarios y recetas.' },
  { nombreRol: 'Supervisor', descripcion: 'Visualización de dashboard, reconocimiento de alarmas.' },
  { nombreRol: 'Operador', descripcion: 'Visualización de panel de operación, consultas básicas.' },
  { nombreRol: 'Área de Calidad', descripcion: 'Consulta de históricos, trazabilidad, indicadores y reportes.' },
];

const USUARIOS = [
  { nombreCompleto: 'Camila Torres', correo: 'operador@demo.example', rol: 'Operador' },
  { nombreCompleto: 'Diego Morales', correo: 'supervisor@demo.example', rol: 'Supervisor' },
  { nombreCompleto: 'Alex Rojas', correo: 'admin@demo.example', rol: 'Administrador' },
  { nombreCompleto: 'Valentina Soto', correo: 'calidad@demo.example', rol: 'Área de Calidad' },
];

const RECETAS = [
  { nombreReceta: 'Alambrón SAE 1020', material: 'SAE 1020', espesorObjetivo: 5.5, anguloMin: 270, anguloMax: 285, estado: true },
  { nombreReceta: 'Alambrón SAE 1045', material: 'SAE 1045', espesorObjetivo: 8, anguloMin: 268, anguloMax: 283, estado: true },
  { nombreReceta: 'Alambrón SAE 1008', material: 'SAE 1008', espesorObjetivo: 6, anguloMin: 272, anguloMax: 287, estado: false },
];

const ESTADOS_EXPLICITOS = ['Aprobado', 'Aprobado', 'Rechazado', 'Aprobado', 'Sin receta', 'Aprobado', 'Aprobado', 'Rechazado', 'Aprobado', 'Aprobado', 'Aprobado', 'Aprobado'];

async function seed() {
  await sequelize.authenticate();

  const rolesPorNombre = {};
  for (const rol of ROLES) {
    const [instancia] = await Rol.findOrCreate({ where: { nombreRol: rol.nombreRol }, defaults: rol });
    rolesPorNombre[rol.nombreRol] = instancia;
  }
  console.log('Roles listos.');

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const usuariosPorCorreo = {};
  for (const usuario of USUARIOS) {
    const [instancia] = await Usuario.findOrCreate({
      where: { correo: usuario.correo },
      defaults: {
        nombreCompleto: usuario.nombreCompleto,
        correo: usuario.correo,
        passwordHash,
        idRol: rolesPorNombre[usuario.rol].idRol,
        debeCambiarPassword: false,
      },
    });
    usuariosPorCorreo[usuario.correo] = instancia;
  }
  console.log(`Usuarios demo listos. Contraseña de todas las cuentas: ${DEMO_PASSWORD}`);

  const administrador = usuariosPorCorreo['admin@demo.example'];
  const operador = usuariosPorCorreo['operador@demo.example'];
  const supervisor = usuariosPorCorreo['supervisor@demo.example'];

  const yaHayInspecciones = (await Inspeccion.count()) > 0;
  if (yaHayInspecciones) {
    console.log('Ya existen inspecciones: se omite la siembra de recetas/lotes/batches/inspecciones/alarmas.');
    await sequelize.close();
    return;
  }

  const recetas = [];
  for (const receta of RECETAS) {
    const instancia = await Receta.create({ ...receta, idUsuario: administrador.idUsuario });
    recetas.push(instancia);
  }
  console.log('Recetas creadas.');

  const ahora = new Date();
  const lotes = [];
  for (let i = 0; i < recetas.length; i += 1) {
    const lote = await Lote.create({
      codigoLote: `LOT-2026-${String(41 + i).padStart(3, '0')}`,
      fechaInicio: new Date(ahora.getTime() - (i + 1) * 6 * 60 * 60 * 1000),
      estado: i === 2 ? 'Cerrado' : 'Abierto',
      idReceta: recetas[i].idReceta,
    });
    lotes.push(lote);
  }
  console.log('Lotes creados.');

  const batches = [];
  for (let i = 0; i < lotes.length; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const batch = await Batch.create({
        numeroBatch: `BCH-${String(i * 3 + j + 124).padStart(4, '0')}`,
        fechaProcesamiento: new Date(ahora.getTime() - (i + 1) * 6 * 60 * 60 * 1000 + j * 60 * 60 * 1000),
        idLote: lotes[i].idLote,
      });
      batches.push(batch);
    }
  }
  console.log('Batches creados.');

  const TOTAL_INSPECCIONES = 168;
  const datosInspecciones = [];
  for (let i = 0; i < TOTAL_INSPECCIONES; i += 1) {
    const receta = recetas[Math.floor(i / 3) % 3];
    const batch = batches[(Math.floor(i / 3) % 3) * 3 + (i % 3)];
    const estado = ESTADOS_EXPLICITOS[i % ESTADOS_EXPLICITOS.length];
    const angulo = Number((276.2 + Math.sin(i * 1.7) * 6.8 + (i % 5) * 0.32).toFixed(2));
    const sinReceta = estado === 'Sin receta';

    datosInspecciones.push({
      fechaHora: new Date(ahora.getTime() - i * 30 * 60 * 1000),
      anguloMedido: angulo,
      estadoResultado: estado,
      limiteMinSnapshot: sinReceta ? null : receta.anguloMin,
      limiteMaxSnapshot: sinReceta ? null : receta.anguloMax,
      idBatch: batch.idBatch,
      idReceta: sinReceta ? null : receta.idReceta,
      idUsuario: i % 8 === 0 ? null : operador.idUsuario,
    });
  }

  const inspecciones = await Inspeccion.bulkCreate(datosInspecciones, { returning: true });
  console.log(`${inspecciones.length} inspecciones creadas (últimas ${(TOTAL_INSPECCIONES * 30) / 60} horas aprox.).`);

  const [regla] = await ReglaAlarma.findOrCreate({
    where: { nombreRegla: 'Rechazo recibido · ejemplo académico' },
    defaults: {
      nombreRegla: 'Rechazo recibido · ejemplo académico',
      tipoRegla: 'Resultado rechazado',
      cantidadEventos: 1,
      activo: true,
      idUsuario: administrador.idUsuario,
    },
  });

  const rechazadas = inspecciones.filter((i) => i.estadoResultado === 'Rechazado');
  const alarmasDemo = [
    { inspeccion: rechazadas[0], estado: 'Activa' },
    { inspeccion: rechazadas[1], estado: 'Activa' },
    { inspeccion: rechazadas[2], estado: 'Reconocida' },
  ].filter((a) => a.inspeccion);

  for (const { inspeccion, estado } of alarmasDemo) {
    await Alarma.create({
      tipoEvento: 'Resultado rechazado',
      descripcion: 'Evento de demostración asociado a una inspección rechazada.',
      fechaGeneracion: inspeccion.fechaHora,
      estadoAlarma: estado,
      fechaReconocimiento: estado === 'Reconocida' ? new Date() : null,
      idInspeccion: inspeccion.idInspeccion,
      idUsuario: estado === 'Reconocida' ? supervisor.idUsuario : null,
      idRegla: regla.idRegla,
    });
  }
  console.log(`${alarmasDemo.length} alarmas de demostración creadas.`);

  await sequelize.close();
  console.log('Siembra completa.');
}

seed().catch((err) => {
  console.error('Error al sembrar datos de demostración:', err.message);
  process.exit(1);
});
