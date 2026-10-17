# API AZA

API REST con Express, Sequelize y PostgreSQL. Incluye autenticación, permisos por rol, ingesta, inspecciones, observaciones, alarmas, gestión administrativa, auditoría y reportes CSV/PDF.

La guía vigente de instalación, variables, migraciones, pruebas, respaldo y despliegue está en [README del proyecto](../README.md). Las funciones y permisos se describen en [Manual de usuario](../MANUAL_USUARIO.md) y la cobertura en [Matriz de implementación](../MATRIZ_IMPLEMENTACION.md).

## Comandos

- `npm start`: iniciar API.
- `npm run db:sync`: crear estructura en una base nueva.
- `npm run db:migrate`: aplicar migraciones aditivas a una base existente, después de respaldarla.
- `npm run db:seed`: datos de demostración, solo en una base de pruebas.
- `npm run test:integration`: verificación con la base local aza_pruebas; crea registros QA.
- `npm run db:backup`: respaldo PostgreSQL en la carpeta .local/backups del proyecto.

El entorno local usa recuperación por enlace de prueba sin enviar correo. SMTP, captura real y despliegue público requieren configuración y validación en el entorno final.
