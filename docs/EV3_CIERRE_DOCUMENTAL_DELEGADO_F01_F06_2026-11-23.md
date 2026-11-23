# EV3 — Cierre documental delegado F01–F06 (23/11/2026)

**Proyecto:** Trefilados AZA, evaluación académica EV3.  
**Repositorio:** `byangelina/aza-monitoreo`.  
**Carácter:** revisión documental/técnica asistida por IA. Valeria Santi informó estar autorizada por Francisca Duque para coordinar y aceptar el paquete de entrega durante su ausencia. **Esta nota no representa una firma ni una revisión personal de Francisca.**

## Dictamen

**Apto para integrar al informe académico con observaciones pendientes**, sin modificar código ni atribuir ejecuciones a versiones posteriores. Los hallazgos abiertos se conservan hasta obtener nuevas pruebas de corrección.

| Bloque | Evidencia / limitación |
| --- | --- |
| F01 | Modelo de datos y catálogo documentados. En verificaciones SQL de Francisca constan 9 tablas, 9 PK, 12 FK y 33 índices en el esquema de referencia. |
| F02 | Nueve scripts separados. Registros del 21 y 22 de noviembre muestran creación, cotejo, reversión y ensayo de optimización en bases desechables. La propuesta `08` y su reversión `09` no acreditan adopción productiva. |
| F03 | **101 casos diseñados**, no 101 ejecutados. Corte original: 5 verificados, 43 parciales, 48 sin evidencia, 5 sin medición. Ejecuciones B01–B04 posteriores se registran por separado y no cambian automáticamente los estados globales. |
| F04 | CF01–CF05 cuentan con evidencia visual. El reconocimiento de ALM-001 fue registrado en QA el 23/11/2026. No equivale a certificar toda la matriz F03. |
| F05 | JMeter y navegador: resultados del 22/11/2026, QA local, máximo **50 hilos**, commit `097a314e3227dd187122b4f1959d163665ba0152`. Se mantienen dos defectos. |
| F06 | Comparación entre esperado y obtenido, incidencias, recomendaciones y aceptación académica con limitaciones. No afirmar aceptación industrial o disponibilidad productiva. |

## Revisión específica F05

Fuentes originales del Drive del equipo: `F05_Informe_de_rendimiento.docx`, `Comparacion/Cierre_RNF.csv`, `Comparacion/Defectos_F05.csv` y protocolo `Comparacion/Protocolo_previo.txt`.

| Requisito | Veredicto conservado |
| --- | --- |
| RNF015 | Cumple **por p95**: 9.128 POST, p95 JMeter 256,55 ms, cero errores. **36 solicitudes** duraron 500 ms o más. |
| RNF016 | **No cumple**: con 9.308 inspecciones, 0/10 recargas mostraron KPI antes de 3 s; rango 13,24–17,06 s. |
| RNF017 | Cumple en QA: 5.074 GET históricos ampliados; p95 de 26, 19 y 26 ms en tres series; cero errores. |
| RNF018 | Cumple **solo para los 50 hilos ensayados**: 10.077 solicitudes GET ampliadas, cero errores; sesión de Calidad compartida. |
| RNF019 | Cumple en catálogo local: ocho índices relevantes verificados. |
| RNF020 | **No cumple**: 9/10 actualizaciones del panel dentro de 5 s; una en 5.042,7 ms. |
| RNF030 | **No evaluable para producción**: 59/59 respuestas HTTP 200 en la ventana local no demuestran disponibilidad del servicio desplegado. |

### Hallazgos abiertos

- **DEF-F05-01 / RNF016:** perfilar consultas y renderizado. Solo cerrar tras 10/10 recargas del dashboard con KPI visible en menos de 3 s en un volumen equivalente.
- **DEF-F05-02 / RNF020:** revisar sondeo/actualización por eventos y revalidar 10/10 inspecciones visibles en no más de 5 s sin degradar el backend.

Los resultados anteriores fueron generados en el commit **`097a314e…`**, no en el SHA candidato de noviembre **`56dd962ede2e893740ecb2b0ec88def233e0d6ed`**. Las regresiones posteriores registradas en [PR #1](https://github.com/byangelina/aza-monitoreo/pull/1) son distintas. No reinterpretar la carga F05 como una repetición en ese SHA.

## Trazabilidad de entrega y publicación

- **Valeria** autoriza el cierre para fines de integración académica, según lo comunicado. La revisión técnica asistida no sustituye aprobación personal de Francisca.
- Mantener fuentes originales y los defectos **abiertos**. Esta nota no es un certificado de cumplimiento productivo ni de disponibilidad.
- No se hicieron cambios de código, migraciones, pruebas adicionales, correcciones de rendimiento ni despliegues como parte de esta documentación.
- [PR #2](https://github.com/byangelina/aza-monitoreo/pull/2) y [PR #3](https://github.com/byangelina/aza-monitoreo/pull/3) están fusionados en `ev3/plataforma`; [PR #1](https://github.com/byangelina/aza-monitoreo/pull/1) hacia `main` continúa abierto. **Este PR documental no autoriza su fusión.**
- Esta documentación es complementaria; no se cargan a GitHub los ZIP, CSV de sesiones, capturas, JTL/JMX, bases de datos, credenciales ni archivos `.env` del equipo.

**Archivos para la integración local del informe:** `AZA_EV3_F03_Conciliacion_Final_23Nov.docx`, `AZA_EV3_F04_Conciliacion_CF01_CF05_23Nov.docx`, `AZA_EV3_F05_Cierre_Rendimiento_para_Informe_23Nov.docx`, `AZA_EV3_F06_Analisis_Aceptacion_Actualizado_V02_V05_23Nov.docx`, más los originales F01/F02 y la nueva constancia delegada.

**Siguiente etapa:** integración del Word maestro y anexos, con revisión de los 15 criterios oficiales de la rúbrica, sin cambiar el sistema.
