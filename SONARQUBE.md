# Verificación SonarQube de AZA

Correcciones iniciadas el 22 y verificadas el 23 de octubre de 2026 sobre la versión 83f5b2f. El informe Word no se modifica. Resultado final: cero incidencias abiertas, Quality Gate aprobado, cobertura nueva 83,3% y global 67,3%.

## Cambios

- Se sustituyeron los valores literales de contraseñas de la prueba integral por credenciales aleatorias de ejecución. La contraseña de las cuentas demo locales se recibe por `AZA_QA_DEMO_PASSWORD`.
- La recuperación valida el formato del correo con recorridos acotados a 254 caracteres, evitando el retroceso superlineal de la expresión anterior.
- La inicialización de sesión y el cierre por inactividad indican explícitamente el tratamiento de sus promesas; conservan el manejo interno de fallos. El guardado de gestión espera a que termine la persistencia.
- El fondo que cierra el menú móvil es un botón nativo, accesible mediante Enter y Espacio, oculto cuando el menú está cerrado.
- Las navegaciones de acceso, cambio de contraseña y perfil esperan su promesa.
- Se incorporó medición V8 de las pruebas de navegador, transformada a los archivos originales mediante mapas de fuentes y exportada a LCOV.

## Reproducción

Instalar las dependencias de ambos paquetes con `npm ci`. Ejecutar `npm test` en cada paquete. Para las pruebas de navegador, ejecutar en `aza-frontend`:

```powershell
npx playwright test --config playwright.sonar.config.js
npm run build
```

La configuración usa Microsoft Edge instalado, el puerto local 5175 y respuestas de API controladas para probar errores y sesiones. Estas pruebas no sustituyen las pruebas de integración con PostgreSQL.

Para integración, iniciar la API en 4000 con PostgreSQL local `aza_pruebas`, sin DATABASE_URL externa ni SMTP externo. Definir `AZA_QA_DEMO_PASSWORD` en el entorno con la contraseña de las cuentas demo y ejecutar `npm run test:integration`. La prueba crea registros QA; no utilizar una base de producción. No guardar contraseñas en archivos versionados.

Para cobertura, ejecutar en backend:

```powershell
node --test --experimental-test-coverage '--test-coverage-include=src/**' '--test-coverage-include=scripts/**' --test-reporter=lcov --test-reporter-destination=../backend.lcov tests/*.test.js scripts/verify-complete.cjs
```

En frontend:

```powershell
node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=../frontend.lcov tests/domain.test.js
$env:AZA_COVERAGE='1'
npx playwright test --config playwright.sonar.config.js
node scripts/coverage-report.cjs
Remove-Item Env:AZA_COVERAGE
```

El comando backend requiere la API y PostgreSQL de pruebas iniciados y AZA_QA_DEMO_PASSWORD definida. Ejecuta 15 pruebas unitarias y una prueba integral con 13 grupos. El script integral se mide porque pertenece al alcance de fuentes original. Esto no instrumenta automáticamente el proceso separado del servidor API.

En los LCOV, normalizar las entradas SF a rutas relativas a la raíz: `aza-backend/...` y `aza-frontend/...`, respectivamente. Copiar `aza-frontend/coverage/browser/lcov.info` como `browser.lcov` en la raíz, normalizando sus entradas SF a `aza-frontend/...`. Los separadores deben ser `/`. Con SonarQube local iniciado y SONAR_TOKEN definido únicamente en el entorno, ejecutar en la raíz:

```powershell
sonar-scanner -Dsonar.javascript.lcov.reportPaths=backend.lcov,frontend.lcov,browser.lcov
```

El archivo de propiedades mantiene el alcance original: fuentes backend, scripts backend y fuentes frontend. Las pruebas se clasifican por separado. No se desactivaron reglas ni se excluyeron los archivos que tenían hallazgos.

## Interpretación

El scanner debe completar su envío y la tarea del servidor debe terminar con estado SUCCESS. Un mensaje EXECUTION SUCCESS del scanner no demuestra que el servidor haya procesado el análisis.

El Quality Gate Sonar way exige, sobre código nuevo, cero incidencias, cobertura de al menos 80%, duplicación máxima de 3% y revisión del 100% de hotspots aplicables. Un estado OK sin condiciones evaluadas no demuestra cumplimiento global. Revisar las condiciones efectivamente evaluadas y la cobertura del código completo.

Las credenciales de demostración incluidas en la siembra existente son para uso académico. Cero hallazgos, si se confirma en un análisis, no equivale a una auditoría de seguridad exhaustiva ni a certificar la configuración de producción.

La cobertura final combina mediciones de pruebas distintas. El aumento no debe atribuirse únicamente a correcciones de código: también se incorporó medición de pruebas que antes no aportaban LCOV. La cobertura global sigue por debajo del 80%; el gate aprobado exige ese umbral sobre el código nuevo, no sobre todo el proyecto.
