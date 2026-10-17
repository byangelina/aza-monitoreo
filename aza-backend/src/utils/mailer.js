const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporterPromise = null;

// SMTP is configured explicitly; local demonstration never contacts external providers.
async function getTransporter(){
 if(!transporterPromise)transporterPromise=Promise.resolve({transporter:nodemailer.createTransport({host:env.smtp.host,port:env.smtp.port,secure:env.smtp.secure,auth:env.smtp.user?{user:env.smtp.user,pass:env.smtp.pass}:undefined,disableFileAccess:true,disableUrlAccess:true}),isTestAccount:false});
 return transporterPromise;
}

async function sendPasswordResetEmail(to, resetLink) {
  if(!env.smtp.host){
    if(env.nodeEnv==='production'||process.env.LOCAL_MAIL_PREVIEW!=='true')throw Object.assign(new Error('El correo de recuperación no está configurado. Contacta al administrador.'),{status:503});
    // Explicit local demonstration: no external mail is sent and no account is created.
    return {previewUrl:resetLink,isTestAccount:true};
  }
  const { transporter, isTestAccount } = await getTransporter();
  const info = await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Recuperación de contraseña — AZA Monitoreo y Trazabilidad',
    text: `Solicitaste restablecer tu contraseña.\n\nEnlace (válido por ${env.auth.resetExpiresIn}): ${resetLink}\n\nSi no fuiste tú, ignora este mensaje.`,
    html: `<p>Solicitaste restablecer tu contraseña.</p><p><a href="${resetLink}">Restablecer contraseña</a> (válido por ${env.auth.resetExpiresIn}).</p><p>Si no fuiste tú, ignora este mensaje.</p>`,
  });

  const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) {
    // eslint-disable-next-line no-console
    console.log(`[mailer] Correo de recuperación (cuenta de prueba Ethereal): ${previewUrl}`);
  }
  return { messageId: info.messageId, previewUrl, isTestAccount };
}

module.exports = { sendPasswordResetEmail };
