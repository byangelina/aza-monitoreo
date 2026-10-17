# AZA — entorno PostgreSQL local de pruebas

Configurado y verificado el 17 de octubre de 2026.

- Interfaz: http://127.0.0.1:5173
- API: http://127.0.0.1:4000/api
- PostgreSQL: 127.0.0.1:55432, base `aza_pruebas`.
- Datos del clúster: `C:\Users\Angur\Documents\Codex\2026-09-13\so\work\aza-pgdata`. Conservar esa carpeta: contiene la base local.
- Instancia independiente del servicio PostgreSQL existente del equipo. Solo escucha en loopback.
- Las configuraciones anteriores están conservadas en `.env.before-local` dentro de frontend/backend, excluidas de Git. Las nuevas credenciales aleatorias están en el `.env` del backend. No compartir estos archivos.

## Abrir nuevamente después de reiniciar el PC

Desde esta carpeta AZA:

```powershell
node iniciar-local.cjs
```

El iniciador levanta PostgreSQL, API y frontend en segundo plano. Usa las dependencias ya instaladas y la instalación PostgreSQL 18 de este PC; no es un paquete portable. Los procesos actuales ya están funcionando. No se instaló un servicio de inicio automático.

## Acceso de prueba

Elegir Operador o Supervisor en la pantalla de acceso, luego Iniciar sesión.

- Operador: `operador@demo.example`
- Supervisor: `supervisor@demo.example`
- Contraseña de las cuentas académicas: `Demo2026!`

Datos académicos, sin conexión a cámara. El modo sala está en `/operador/sala`. Las imágenes permanecen ausentes hasta recibir sus URL mediante la ingesta. No se sustituyeron por imágenes falsas.

## Verificación realizada

Se crearon las nueve tablas, se aplicó la migración de imágenes y se cargaron 168 inspecciones de ejemplo. Las verificaciones agregaron inspecciones marcadas QA y observaciones, y reconocieron las alarmas de esas inspecciones.

Prueba contra API real y consultas directas a PostgreSQL: login de Operador/Supervisor, sesión, restricción de histórico por rol, ingesta, observación persistida, generación/reconocimiento de alarma persistidos, histórico y logout/revocación. Resultado: OK.

Prueba de navegador real sin interceptar la API: login, modo sala, agregar observación y verificarla después de recargar, consultar alarmas reconocidas y capturar pantalla 1080p. Resultado: 1 prueba aprobada.

Repetición de pruebas (modifican únicamente la base local de pruebas):

```powershell
# Desde aza-backend:
node scripts/verify-local.cjs
# Desde aza-frontend:
$env:AZA_LOCAL_INTEGRATION='1'
npm.cmd run test:e2e -- local.spec.js --project=desktop
```

La verificación local resuelve el bloqueo de Supabase para este PC. No repara Supabase, no publica la página y no verifica cámara/SMTP reales. Los módulos posteriores ya están integrados; consultar MATRIZ_IMPLEMENTACION.md y VERIFICACION.md.
