# Mejoras por retroalimentación del cliente — 17 octubre 2026

## Interfaz

- `/operador`: resultado y ángulo destacados, dos imágenes de la misma inspección, trazabilidad mínima, acceso a detalle/observaciones y alarmas.
- `/operador/sala`: sin navegación lateral; diseño de alto contraste para TV 55–65 pulgadas a 3–5 metros. Botón de pantalla completa (F11 como alternativa), escritorio y alarmas accesibles. Validar lectura en la instalación real según iluminación y resolución.
- La opción «Mostrar captura real» permite comparar captura/análisis durante validación y dejar solo análisis posteriormente. Se conserva en este navegador.
- No se reutiliza una foto fija como si correspondiera a todas las inspecciones. Ausencias y errores de imágenes se muestran explícitamente. Se puede ampliar cada imagen recibida.
- La conexión se consulta cada cinco segundos. Si falla, se conserva el último resultado y se advierte que no hay actualización confirmada. La antigüedad del resultado se muestra por separado: una API conectada no prueba que la cámara esté activa.
- El operador consulta las ocho horas anteriores al último registro, siguiendo el comportamiento existente del backend. La vista principal no contiene tablas ni análisis históricos.
- Supervisor: filtros sin fecha fija, fechas en Santiago, escala angular adaptable y carga de todas las páginas del histórico (antes solo las primeras 200 inspecciones).
- Detalle: consulta individual cuando el registro no está en la ventana cargada, observaciones sin fechas ficticias ni textos «demo».

## Base de datos e imágenes

Se agregaron dos campos opcionales a `inspeccion`: `imagen_analisis_url` e `imagen_captura_url`. Para una base existente, ejecutar desde `aza-backend` **antes de iniciar esta versión**:

```powershell
npm.cmd run db:migrate:images
npm.cmd start
```

La migración es aditiva, transaccional y repetible. No elimina registros. Para una base nueva, usar primero el flujo de creación existente `npm.cmd run db:sync`. No ejecutar semillas sobre una base de producción.

El endpoint de ingesta existente `/api/ingesta/inspecciones` admite `imagenAnalisisUrl` e `imagenCapturaUrl`, además de los campos actuales. Ambas URL deben ser HTTP/HTTPS absolutas, sin usuario ni contraseña, accesibles desde el navegador del operador; usar HTTPS en despliegues HTTPS. Los valores omitidos quedan nulos. No se reciben archivos locales ni se implementa procesamiento de visión: el sistema de captura debe servir las imágenes y enviar sus URL correspondientes a cada medición. No enviar secretos en las URL.

Ejemplo de los campos adicionales:

```json
{
  "imagenAnalisisUrl": "https://servidor-de-imagenes.example/inspeccion-42/analisis.jpg",
  "imagenCapturaUrl": "https://servidor-de-imagenes.example/inspeccion-42/captura.jpg"
}
```

El frontend conserva el resultado recibido aunque el ángulo parezca indicar otro estado. No sustituye la clasificación del sistema de captura.

## Verificación y limitaciones

Actualización: se configuró y verificó PostgreSQL local independiente; ver ENTORNO_LOCAL.md. El bloqueo remoto descrito a continuación ya no impide usar la aplicación en este PC. La conexión Supabase configurada respondió que el tenant/usuario no existe. No se modificó `.env`, no se ejecutó la migración remota ni se insertaron datos en esa base. Es necesario corregir la conexión PostgreSQL, aplicar la migración y verificar login, observaciones, reconocimiento e ingesta con persistencia real.

Las pruebas de navegador interceptan la API con datos controlados y no prueban la persistencia PostgreSQL ni la conexión con la cámara. Cubren escritorio, tablet y móvil; sala 1920×1080; preferencias, observaciones, permisos por rol, desconexión/recuperación, imágenes, reconocimiento y más de 200 registros. Actualización del 17 de octubre: los módulos administrativos, histórico, trazabilidad y reportes se implementaron posteriormente; consultar MATRIZ_IMPLEMENTACION.md y VERIFICACION.md para la cobertura actual y las pruebas con PostgreSQL real.

Comandos de verificación:

```powershell
# aza-frontend
npm.cmd run build
node --test --test-isolation=none tests/domain.test.js
npm.cmd run test:e2e
# aza-backend
node --test --test-isolation=none tests/password.test.js tests/inspectionInput.test.js
```

Las pruebas E2E requieren Edge instalado. Los fixtures de pruebas no se activan en la aplicación normal. La opción `--test-isolation=none` evita la restricción de creación de procesos del entorno de ejecución Windows usado para las pruebas unitarias.
