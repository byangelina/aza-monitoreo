# aza-backend

API REST del Sistema Web de Monitoreo y Trazabilidad del Trefilado (Aceros AZA / Robotic Systems Chile).
Node.js + Express + Sequelize + PostgreSQL. Implementa los puntos 1-3 pendientes frente al informe:
backend real, base de datos relacional (9 entidades del diccionario de datos) y seguridad real
(hash de contraseñas, JWT, RBAC en backend, bloqueo de cuenta persistente, recuperación por correo).

## 1. Requisitos

- Node.js 18+ (probado con v24).
- PostgreSQL accesible (local o remoto).

## 2. Crear la base de datos

Conéctate como superusuario (`psql -U postgres`) y ejecuta:

```sql
CREATE ROLE aza_app WITH LOGIN PASSWORD 'elige-una-password-segura';
CREATE DATABASE aza OWNER aza_app;
```

## 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Completa al menos `DATABASE_URL` (o las variables `DB_*`), `JWT_SECRET` y `RESET_TOKEN_SECRET` con
valores propios. Si no configuras `SMTP_HOST`, la recuperación de contraseña usa una cuenta de
prueba Ethereal: el correo se envía de verdad, pero a una bandeja de demostración — la respuesta
de la API y el log del servidor incluyen un `previewUrl` para verlo.

## 4. Instalar dependencias, crear tablas y sembrar datos demo

```bash
npm install
npm run db:sync   # crea las 9 tablas a partir de los modelos Sequelize
npm run db:seed   # crea roles, las 4 cuentas demo y datos de ejemplo (idempotente)
```

Cuentas demo creadas por el seed (contraseña `Demo2026!` para todas):

| Rol | Correo |
| --- | --- |
| Operador | operador@demo.example |
| Supervisor | supervisor@demo.example |
| Administrador | admin@demo.example |
| Área de Calidad | calidad@demo.example |

## 5. Ejecutar

```bash
npm run dev     # con recarga automática (nodemon)
npm start        # modo producción
```

Por defecto queda escuchando en `http://127.0.0.1:4000`. Prueba `GET /api/health`.

## 6. Endpoints principales

| Método y ruta | Rol requerido | Descripción |
| --- | --- | --- |
| POST `/api/auth/login` | público | Login. Bloquea la cuenta tras 5 intentos fallidos (config. `ACCOUNT_LOCK_*`). |
| POST `/api/auth/recuperar` | público | Envía un correo con enlace de restablecimiento (respuesta genérica, no revela si la cuenta existe). |
| POST `/api/auth/restablecer` | público (con token) | Restablece la contraseña usando el enlace recibido por correo. |
| POST `/api/auth/cambiar-password` | autenticado | Cambia la contraseña (primer acceso o cambio voluntario). |
| GET `/api/auth/me` | autenticado | Datos de la sesión actual. |
| POST `/api/auth/logout` | autenticado | Revoca el token actual. |
| GET `/api/inspecciones/recientes` | Operador | Ventana operativa (últimas N horas). |
| GET `/api/inspecciones` | Supervisor, Área de Calidad, Administrador | Histórico paginado con filtros (`desde`, `hasta`, `idReceta`, `idLote`, `idBatch`, `estado`). |
| GET `/api/inspecciones/:id` | autenticado | Detalle de una inspección. |
| POST `/api/inspecciones/:id/observaciones` | Operador | Agrega una observación. |
| GET `/api/alarmas` | Operador, Supervisor | Listado de alarmas. |
| POST `/api/alarmas/:id/reconocer` | Operador, Supervisor | Reconoce una alarma (Activa → Reconocida). |
| GET `/api/catalogo/recetas` \| `/lotes` \| `/batches` | Operador, Supervisor, Área de Calidad, Administrador | Listas para poblar filtros y nombres. |
| POST `/api/ingesta/inspecciones` | API Key técnica (no JWT) | RF047/INT15: registra una inspección enviada por el sistema de captura o un simulador (ver §8). |

Todas las rutas protegidas exigen `Authorization: Bearer <token>`. El endpoint de ingesta usa en
cambio el header `X-API-Key` — es el actor externo (RNF004), no un usuario humano.

## 7. Decisiones y supuestos académicos relevantes

- **Modelo de datos**: las 9 tablas y columnas siguen literalmente `12_Diccionario_Datos_AZA_FINAL.xlsx`.
  `BATCH → LOTE` e `INSPECCION → BATCH` usan `ON DELETE RESTRICT` para impedir borrar físicamente
  registros con inspecciones asociadas (regla de negocio del contexto).
- **Observaciones de inspección**: el diccionario define una sola columna `observacion` (TEXT) por
  inspección, pero el frontend permite agregar varias notas. Se resolvió sin ampliar el modelo
  aprobado: cada nueva observación se anexa como una línea `[usuario · fecha] texto` dentro del
  mismo campo.
- **Recuperación de contraseña sin tabla nueva**: en vez de agregar columnas de token no
  contempladas en el diccionario, el enlace de recuperación es un JWT de corta duración firmado
  con `RESET_TOKEN_SECRET` (sin estado en base de datos). Limitación conocida: al no persistir el
  token, es válido para más de un uso mientras no expire (hasta `RESET_TOKEN_EXPIRES_IN`); una
  versión productiva debería invalidarlo tras el primer uso (por ejemplo, atando su firma a un
  campo que cambie con la contraseña).
- **Revocación de sesión (logout)**: al ser JWT sin estado, se mantiene una lista de revocación
  en memoria del proceso para invalidar el token antes de su expiración. Es una simplificación
  académica: en una implementación multi-instancia real correspondería usar Redis o una tabla
  dedicada.
- **Bloqueo de cuenta (RNF003)** y **expiración de sesión (RNF010)**: los valores por defecto
  (5 intentos, 15 minutos de bloqueo, sesión de 30 minutos) son supuestos académicos configurables
  vía `.env`, igual que en el informe.
- **Auditoría (RNF008)**: no existe ninguna ruta de edición/eliminación sobre `AUDITORIA`; es la
  forma en que este backend garantiza su inmutabilidad.
- **Módulos M04-M10 (gestión de recetas, lotes, usuarios, reglas de alarma, reportes)**: quedan
  fuera de este backend; solo se expusieron los endpoints de lectura que ya necesita el frontend
  M01-M03 (histórico, alarmas, catálogos para filtros).
- **Errores async no capturados no deben tumbar el servidor**: todas las rutas envuelven su
  controlador con `src/utils/asyncHandler.js`. Sin esto, una excepción dentro de un handler
  `async` (por ejemplo una violación de una restricción de Sequelize) escapa como
  `unhandledRejection` y Node mata el proceso completo — se encontró este caso real al construir
  el endpoint de ingesta (§8) y se corrigió de forma transversal, no solo en esa ruta.

## 8. Integración real con el sistema de captura (APP-AZA)

Se encontró el código fuente real del sistema de inspección de Robotic Systems Chile
(`APP-AZA`, app de escritorio PySide6 + visión por computador, corriendo en una Jetson en
planta). Su base de datos SQLite (`registros`, `configuracion_recetas`, `usuarios`) es mucho
más simple que el diccionario de datos académico, y **no expone ninguna API** — solo un monitor
de video de solo lectura por LAN. El endpoint `POST /api/ingesta/inspecciones` es el punto que
tendría que llamar (agregando un cliente HTTP dentro de `procesar_analisis_industrial()`) para
integrarse de verdad. Reconcilia estas diferencias reales:

- **Casing del estado**: APP-AZA escribe `"APROBADO"` / `"RECHAZADO"` / `"SIN RECETA"`
  (mayúsculas, `src/vision/industrial.py`). El modelo canónico de la plataforma (definido en
  `00_LEEME_PRIMERO_CONTEXTO_CODEX.md`) usa `"Aprobado"` / `"Rechazado"` / `"Sin receta"`. La
  normalización ocurre una sola vez, en `ingestaController.js`, para no romper el contrato ya
  documentado y probado del resto de la plataforma.
- **Receta**: `configuracion_recetas` en APP-AZA solo tiene `nombre`, `min_tol`, `max_tol` — sin
  `material` ni `espesor`. Por eso `Receta.material` y `Receta.espesorObjetivo` pasaron a ser
  opcionales (antes eran obligatorios por RF020, un requisito sin respaldo real). El endpoint
  resuelve la receta por nombre (case-insensitive); si no encuentra coincidencia, el resultado
  queda como "Sin receta" — el mismo comportamiento que ya tiene APP-AZA cuando no hay
  configuración cargada.
- **Lote y batch**: APP-AZA no tiene IDs normalizados, solo un campo de texto `lote` y una
  carpeta por disparo de cámara (`Trigger_0001_...`). El endpoint usa ese texto como
  `codigo_lote` y esa carpeta como `numero_batch`. Como `LOTE.id_receta` es obligatoria en el
  diccionario, crear un lote nuevo exige poder resolver una receta reconocida; si el lote ya
  existe, las inspecciones siguientes (incluso "Sin receta") se agregan sin problema.
- **Usuario/operador**: APP-AZA autentica con usuario + PIN (PBKDF2) y solo tiene 2 roles
  (admin/operador) — es la sesión del operador de planta para controlar la cámara, un sistema de
  identidad totalmente distinto de las 4 cuentas con correo/contraseña de la plataforma web. No
  se intenta mapear un `username` de APP-AZA a un `Usuario` de la plataforma: la inspección
  ingresada queda con `idUsuario = null` y el nombre recibido se guarda como observación de
  texto, solo para trazabilidad informativa.
- **Alarmas**: APP-AZA no persiste alarmas ni auditoría (su dashboard solo pinta una tabla con
  colores). Al ingresar un resultado "Rechazado", este endpoint sí genera automáticamente una
  `Alarma` si existe una `ReglaAlarma` activa de tipo "Resultado rechazado" (RF041) — es aporte
  íntegro de la plataforma web, sin contraparte en el sistema real.

## 9. Estado de la integración con el frontend

El frontend (`aza-frontend`) ya está conectado a esta API real (`src/services/dataService.js` +
`src/services/api.js`), no usa datos mock. Lo único que falta conectar es el propio `APP-AZA`
del lado de la cámara real, según el punto 8.
