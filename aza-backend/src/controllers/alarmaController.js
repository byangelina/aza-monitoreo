const { Alarma, ReglaAlarma, Usuario } = require('../models');
const { registrarAuditoria } = require('../utils/auditLogger');

function serializar(alarma) {
  return {
    id: alarma.idAlarma,
    tipoEvento: alarma.tipoEvento,
    descripcion: alarma.descripcion,
    fechaGeneracion: alarma.fechaGeneracion,
    estado: alarma.estadoAlarma, // ciclo Activa -> Reconocida; no existe "Resuelta".
    fechaReconocimiento: alarma.fechaReconocimiento,
    inspeccionId: alarma.idInspeccion,
    regla: alarma.regla ? { id: alarma.regla.idRegla, nombre: alarma.regla.nombreRegla } : null,
    reconocidaPor: alarma.reconocidaPor ? { id: alarma.reconocidaPor.idUsuario, nombre: alarma.reconocidaPor.nombreCompleto } : null,
  };
}

// HU39: listar alarmas filtrando por estado/tipo (Operador o Supervisor autorizado).
async function listar(req, res) {
  const { estado, tipo } = req.query;
  const where = {};
  if (estado) where.estadoAlarma = estado;
  if (tipo) where.tipoEvento = tipo;
  const range=require('../utils/validation').dates(req.query);if(range)where.fechaGeneracion=range;

  const items = await Alarma.findAll({
    where,
    include: [
      { model: ReglaAlarma, as: 'regla' },
      { model: Usuario, as: 'reconocidaPor', attributes: ['idUsuario', 'nombreCompleto'] },
    ],
    order: [['fechaGeneracion', 'DESC']],
  });
  res.json({ items: items.map(serializar) });
}

// HU40: reconocer una alarma registra usuario y fecha; el resultado de la inspección no cambia.
async function reconocer(req, res) {
  const {sequelize,Auditoria}=require('../models');
  const alarma=await sequelize.transaction(async transaction=>{
    const item=await Alarma.findByPk(req.params.id,{transaction,lock:transaction.LOCK.UPDATE});
    if(!item)require('../utils/validation').fail('No se encontró la alarma.',404);
    if(item.estadoAlarma==='Activa'){
      await item.update({estadoAlarma:'Reconocida',idUsuario:req.usuario.idUsuario,fechaReconocimiento:new Date()},{transaction});
      await Auditoria.create({accionRealizada:`Alarma reconocida #${item.idAlarma}`,tablaAfectada:'alarma',idUsuario:req.usuario.idUsuario,ipOrigen:req.ip},{transaction});
    }return item;
  });
  // Se recarga con las asociaciones para devolver nombre de regla y de quién reconoció,
  // en vez de las instancias "vacías" que quedan tras un save() sin include.
  await alarma.reload({
    include: [
      { model: ReglaAlarma, as: 'regla' },
      { model: Usuario, as: 'reconocidaPor', attributes: ['idUsuario', 'nombreCompleto'] },
    ],
  });

  res.json({ item: serializar(alarma) });
}

module.exports = { listar, reconocer };
