# AZA — Monitoreo y trazabilidad del trefilado

Sistema académico con React/Vite, Express/Sequelize y PostgreSQL. Recibe resultados ya clasificados de un sistema de captura; no procesa imágenes, calcula ángulos ni controla maquinaria.

## Ejecución en este PC

```powershell
node iniciar-local.cjs
```

Abrir http://127.0.0.1:5173. Elegir una cuenta de demostración y pulsar Iniciar sesión. Contraseña: `Demo2026!`.

| Rol | Correo de prueba | Inicio |
|---|---|---|
| Administrador | admin@demo.example | /admin |
| Operador | operador@demo.example | /operador |
| Supervisor | supervisor@demo.example | /supervisor |
| Área de Calidad | calidad@demo.example | /calidad |

Los datos son académicos y persistentes. Las pruebas dejan registros identificados con QA/UI. No usar las cuentas de demostración en producción.

## Instalación en otro entorno

Requisitos: Node.js 22 o posterior, npm y PostgreSQL. Crear una base y un usuario autorizado antes de iniciar. Las rutas de PostgreSQL del iniciador Windows son específicas de este PC; para otro equipo, usar los comandos siguientes y sus variables de entorno.

1. En `aza-backend`, ejecutar `npm ci` y copiar `.env.example` a `.env`. Completar DATABASE_URL **o** DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD; no dejar una DATABASE_URL de ejemplo que tenga precedencia sobre las variables individuales.
2. Configurar secretos aleatorios JWT_SECRET, RESET_TOKEN_SECRET e INGESTA_API_KEY, FRONTEND_URL y los datos SMTP si corresponde. Los archivos `.env*` con secretos se excluyen de Git.
3. En una base nueva: `npm run db:sync`. En una base existente: respaldar primero y ejecutar `npm run db:migrate`. Las migraciones agregan columnas sin eliminar registros. La cuenta de migración necesita permisos DDL; la cuenta de ejecución en producción debe restringirse a las operaciones requeridas.
4. Solo en una base de demostración: `npm run db:seed`.
5. Backend: `npm start`. API predeterminada: http://127.0.0.1:4000/api.
6. En `aza-frontend`, ejecutar `npm ci`, copiar `.env.example` a `.env` y fijar VITE_API_BASE_URL con la URL de la API. Ejecutar `npm run dev`; compilación para distribución: `npm run build`.

El script `iniciar-local.cjs` levanta servicios ocultos en segundo plano. La base local está en `C:\Users\Angur\Documents\Codex\2026-09-13\so\work\aza-pgdata`; conservar esta carpeta. Puerto PostgreSQL 55432, base `aza_pruebas`. Las configuraciones anteriores de Supabase se conservaron en `.env.before-local`; no se reparó ni modificó la base remota.

## Funciones y permisos

- **Operador:** última inspección, modo sala, imágenes recibidas, ventana reciente, observaciones y reconocimiento de alarmas.
- **Supervisor:** indicadores, tendencias, histórico paginado con filtros, trazabilidad, reportes CSV/PDF; consulta de recetas/lotes/batches y reconocimiento de alarmas.
- **Administrador:** creación/modificación de recetas, baja lógica, lotes y batches, cierre/reapertura, usuarios y roles, desbloqueo, reglas y consulta de auditoría. No recibe acceso al histórico analítico de otros roles.
- **Calidad:** histórico, detalle sin edición, tendencias, trazabilidad, consulta de lotes/batches y reportes.
- **Actor técnico:** `/simulador`, independiente de los roles humanos, o POST `/api/ingesta/inspecciones` con `X-API-Key`.

Consulta `MANUAL_USUARIO.md` y `MATRIZ_IMPLEMENTACION.md` para instrucciones y trazabilidad de requisitos.

## Integración de captura y reglas

Ejemplo de cuerpo JSON para POST `/api/ingesta/inspecciones`:

```json
{
  "referencia": "evento-unico-del-equipo-0001",
  "angulo": 276.54,
  "estado": "RECHAZADO",
  "receta": "Alambrón SAE 1020",
  "lote": "LOT-2026-041",
  "carpeta": "BATCH-PRUEBA-001",
  "operador": "SIMULACIÓN ACADÉMICA",
  "fecha": "2026-10-17T20:00:00Z",
  "imagenAnalisisUrl": "https://imagenes.example/0001/analisis.jpg",
  "imagenCapturaUrl": "https://imagenes.example/0001/captura.jpg"
}
```

Las URL son opcionales y deben ser accesibles desde el navegador. Nunca se muestran como reales fotografías fijas de ejemplo. La referencia opcional (o header X-Idempotency-Key) evita duplicar un evento reintentado; cada nuevo evento necesita otra referencia. Receta/lote/batch deben mantener coherencia. Se rechazan recetas inactivas y lotes cerrados. Sin receta conserva límites y receta nulos, pero siempre requiere un batch/lote válido. Código de lote y batch: máximo 50 caracteres.

Tipos de regla admitidos: Resultado rechazado, Sin receta, Rechazos consecutivos en el mismo lote, Ángulo superior e inferior. Las reglas no cambian el resultado recibido. Las consecutivas se evalúan por fecha de evento en el mismo lote; un registro tardío no recalcula alarmas ya emitidas. Los umbrales son supuestos académicos configurables.

## Sesión y recuperación

JWT con versión de sesión persistida en PostgreSQL; cierre, cambios de contraseña, cambios de rol y desactivación invalidan sesiones según la operación. Cierre de sesión invalida todas las sesiones de esa cuenta. Token de recuperación de 10 minutos y un único uso, con hash en base. Cuentas temporales deben cambiar contraseña al ingresar. Se mantiene bloqueo tras cinco fallos.

En el entorno local `LOCAL_MAIL_PREVIEW=true` ofrece un enlace de demostración sin enviar correo. Solo funciona fuera de producción. En producción se requiere SMTP; no se habilita automáticamente Ethereal ni se exponen enlaces de recuperación. La sesión del navegador tiene límite de inactividad configurable con VITE_IDLE_MINUTES (30 por defecto); la expiración JWT se configura por separado.

## Pruebas

```powershell
# Backend (tests unitarios)
node --test --test-isolation=none tests/password.test.js tests/inspectionInput.test.js tests/validation.test.js
# Backend, solo aza_pruebas local; crea datos QA
npm run test:integration
# Frontend
npm run build
node --test --test-isolation=none tests/domain.test.js
# Frontend con API y PostgreSQL encendidos; crea datos UI/QA
$env:AZA_LOCAL_INTEGRATION='1'
npm run test:e2e -- --workers=1
```

Playwright usa Edge instalado. Las pruebas `app.spec.js` interceptan la API; `local.spec.js` y `complete.spec.js` trabajan contra servicios reales. No confundir ambas evidencias.

## Respaldos y restauración

Desde backend: `npm run db:backup`. Genera un dump PostgreSQL en `.local/backups`, sin imprimir contraseñas. PG_DUMP_PATH permite configurar el ejecutable en otro equipo. La frecuencia diaria y retención de 30 días son propuestas académicas: deben programarse en la infraestructura de destino; no se instaló una tarea automática del sistema operativo.

Restaurar primero en una base vacía separada con `pg_restore --no-owner --dbname=<base_destino> <archivo.dump>`, usando credenciales del destino a través del entorno o el gestor de secretos. No restaurar encima de la base activa ni usar `--clean` sin un plan de recuperación. Verificar tablas, conteos, login y un recorrido funcional antes de sustituir un entorno. El respaldo previo a estos cambios se conserva en `.local/backups/antes-modulos-completos.dump`.

## Despliegue

`render.yaml` conserva el esquema de servicios frontend/backend; requiere configurar una conexión PostgreSQL vigente, URLs públicas, HTTPS y SMTP. Ejecutar creación inicial de tablas/migraciones antes de servir una base nueva. Revisar permisos del usuario de ejecución y separar credenciales de migración. La configuración Supabase anterior no es válida y no permite publicar esta instancia con esos valores.

No se ha publicado esta versión ni se ha certificado disponibilidad, carga de producción, compatibilidad con Chrome o integración de cámara/SMTP reales. Las pruebas realizadas corresponden a Edge y PostgreSQL local. Rendimiento, 50 usuarios simultáneos, disponibilidad 99%, respaldos diarios operativos y políticas de retención requieren su validación en la infraestructura final.
