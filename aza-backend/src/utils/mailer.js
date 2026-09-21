const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporterPromise = null;

// Si hay credenciales SMTP reales en .env, se usan (correo real de producción).
// Si no, se crea una cuenta de prueba Ethereal para poder demostrar el envío real
// de un correo (llega a una bandeja de prueba, no a la bandeja del usuario) sin
// exigir credenciales propias del equipo. Se documenta explícitamente en la respuesta.
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  if (env.smtp.host) {
    transporterPromise = Promise.resolve({
      transporter: nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
      }),
      isTestAccount: false,
    });
  } else {
    transporterPromise = nodemailer.createTestAccount().then((account) => ({
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      }),
      isTestAccount: true,
    }));
  }
  return transporterPromise;
}

async function sendPasswordResetEmail(to, resetLink) {
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
