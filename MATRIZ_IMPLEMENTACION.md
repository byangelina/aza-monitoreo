# Trazabilidad de implementación AZA

Referencia: Informe_Proyecto_AZA.docx y 06_Matriz_Maestra_AZA_AJUSTADA.xlsx, carpeta Archivos_AZA/Proyecto Integrado AZA. Se consultaron sus requisitos y permisos; no se modificaron los documentos fuente.

La tabla relaciona funciones implementadas y evidencia disponible. No declara aprobados todos los criterios no funcionales ni todos los escenarios de cada historia de usuario.

| RF | Función requerida | Módulo / archivos | Evidencia relacionada |
|---|---|---|---|
| RF001 | El sistema debe permitir iniciar sesión mediante correo electrónico y contraseña. | Acceso y sesión: authController / Access | Integración API: acceso, recuperación, sesiones; unitarias de contraseña |
| RF002 | El sistema debe permitir cerrar sesión e invalidar la sesión activa. | Acceso y sesión: authController / Access | Integración API: acceso, recuperación, sesiones; unitarias de contraseña |
| RF003 | El sistema debe permitir solicitar un enlace temporal para restablecer la contraseña. | Acceso y sesión: authController / Access | Integración API: acceso, recuperación, sesiones; unitarias de contraseña |
| RF004 | El sistema debe permitir visualizar los KPIs de aprobación, rechazo, sin receta y total de inspecciones. | Indicadores y tendencias: Supervisor | Pruebas de filtros y totales |
| RF005 | El sistema debe permitir visualizar la cantidad de inspecciones registradas agrupadas por receta durante el período consultado. | Indicadores y tendencias: Supervisor | Pruebas de filtros y totales |
| RF006 | El sistema debe permitir visualizar la tendencia temporal del ángulo. | Indicadores y tendencias: Supervisor | Pruebas de filtros y totales |
| RF007 | El sistema debe permitir filtrar los indicadores del dashboard por rango de fechas, receta y lote. | Indicadores y tendencias: Supervisor | Pruebas de filtros y totales |
| RF008 | El sistema debe actualizar automáticamente el dashboard del operador cuando existan nuevos registros. | Operación y detalle: Operator / InspectionDetail | E2E Operador y observaciones persistentes |
| RF009 | El sistema debe permitir visualizar la última inspección con ángulo, estado, lote, batch, receta, fecha y hora. | Operación y detalle: Operator / InspectionDetail | E2E Operador y observaciones persistentes |
| RF010 | El sistema debe permitir representar el estado de una inspección mediante texto, iconografía y color. | Operación y detalle: Operator / InspectionDetail | E2E Operador y observaciones persistentes |
| RF011 | El sistema debe mostrar una notificación visible cuando se registre una inspección rechazada. | Operación y detalle: Operator / InspectionDetail | E2E Operador y observaciones persistentes |
| RF012 | El sistema debe permitir agregar una observación a una inspección existente. | Operación y detalle: Operator / InspectionDetail | E2E Operador y observaciones persistentes |
| RF013 | El sistema debe permitir consultar las inspecciones recientes asociadas a un turno o período operativo. | Operación y detalle: Operator / InspectionDetail | E2E Operador y observaciones persistentes |
| RF014 | El sistema debe permitir listar las inspecciones en una tabla paginada. | Histórico y trazabilidad: History / inspeccionController | Integración filtros/paginación y E2E Calidad |
| RF015 | El sistema debe permitir filtrar inspecciones por fecha, lote, receta, batch y estado. | Histórico y trazabilidad: History / inspeccionController | Integración filtros/paginación y E2E Calidad |
| RF016 | El sistema debe permitir ordenar las inspecciones por fecha y hora. | Histórico y trazabilidad: History / inspeccionController | Integración filtros/paginación y E2E Calidad |
| RF017 | El sistema debe permitir consultar el detalle completo de una inspección seleccionada. | Histórico y trazabilidad: History / inspeccionController | Integración filtros/paginación y E2E Calidad |
| RF018 | El sistema debe permitir exportar el histórico filtrado a CSV. | Histórico y trazabilidad: History / inspeccionController | Integración filtros/paginación y E2E Calidad |
| RF019 | El sistema debe permitir exportar el histórico filtrado a PDF. | Histórico y trazabilidad: History / inspeccionController | Integración filtros/paginación y E2E Calidad |
| RF020 | El sistema debe permitir crear una receta con nombre, material, espesor y límites de tolerancia angular. | Recetas: Management / managementController | Integración CRUD, límites y snapshots; E2E Admin |
| RF021 | El sistema debe permitir consultar el listado de recetas mediante búsqueda por nombre o material. | Recetas: Management / managementController | Integración CRUD, límites y snapshots; E2E Admin |
| RF022 | El sistema debe permitir consultar las recetas utilizadas dentro de un rango de fechas. | Recetas: Management / managementController | Integración CRUD, límites y snapshots; E2E Admin |
| RF023 | El sistema debe permitir modificar los datos de una receta preservando la trazabilidad histórica. | Recetas: Management / managementController | Integración CRUD, límites y snapshots; E2E Admin |
| RF024 | El sistema debe permitir desactivar una receta mediante baja lógica. | Recetas: Management / managementController | Integración CRUD, límites y snapshots; E2E Admin |
| RF025 | El sistema debe validar que el límite mínimo de una receta sea menor que el límite máximo. | Recetas: Management / managementController | Integración CRUD, límites y snapshots; E2E Admin |
| RF026 | El sistema debe permitir consultar el detalle y estado de una receta antes de editarla. | Recetas: Management / managementController | Integración CRUD, límites y snapshots; E2E Admin |
| RF027 | El sistema debe permitir crear lotes asociados a una receta activa. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF028 | El sistema debe permitir consultar el listado de lotes mediante filtros por receta, estado y fecha. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF029 | El sistema debe permitir modificar los datos permitidos de un lote mientras esté abierto. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF030 | El sistema debe permitir cerrar o reabrir un lote según los permisos establecidos. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF031 | El sistema debe permitir crear batches dentro de un lote abierto. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF032 | El sistema debe permitir consultar los batches pertenecientes a un lote. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF033 | El sistema debe permitir modificar la observación descriptiva de un batch. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF034 | El sistema debe impedir la eliminación física de lotes o batches que tengan inspecciones asociadas. | Lotes y batches: Management / managementController | Integración cierre/reapertura/integridad; E2E Admin |
| RF035 | El sistema debe permitir crear usuarios con nombre, correo, rol y contraseña temporal. | Usuarios y roles: Management / managementController | Integración usuarios/bloqueo/permisos; E2E Admin |
| RF036 | El sistema debe permitir consultar el listado de usuarios mediante filtros por rol y estado. | Usuarios y roles: Management / managementController | Integración usuarios/bloqueo/permisos; E2E Admin |
| RF037 | El sistema debe permitir modificar los datos permitidos y el rol de un usuario. | Usuarios y roles: Management / managementController | Integración usuarios/bloqueo/permisos; E2E Admin |
| RF038 | El sistema debe permitir desactivar usuarios mediante baja lógica. | Usuarios y roles: Management / managementController | Integración usuarios/bloqueo/permisos; E2E Admin |
| RF039 | El sistema debe permitir desbloquear una cuenta bloqueada. | Usuarios y roles: Management / managementController | Integración usuarios/bloqueo/permisos; E2E Admin |
| RF040 | El sistema debe solicitar el cambio de contraseña durante el primer inicio de sesión con contraseña temporal. | Acceso y sesión: authController / Access | Integración API: acceso, recuperación, sesiones; unitarias de contraseña |
| RF041 | El sistema debe generar alarmas cuando se cumplan las reglas configuradas. | Alarmas y reglas: Alarms / Management / ingestaController | Integración generación, consecutivas y reconocimiento |
| RF042 | El sistema debe permitir consultar el listado de alarmas mediante filtros por estado, tipo y fecha. | Alarmas y reglas: Alarms / Management / ingestaController | Integración generación, consecutivas y reconocimiento |
| RF043 | El sistema debe permitir reconocer una alarma registrando el usuario y la fecha. | Alarmas y reglas: Alarms / Management / ingestaController | Integración generación, consecutivas y reconocimiento |
| RF044 | El sistema debe permitir configurar reglas y umbrales de alarmas. | Alarmas y reglas: Alarms / Management / ingestaController | Integración generación, consecutivas y reconocimiento |
| RF045 | El sistema debe permitir consultar los registros de auditoría mediante filtros por usuario, acción y fecha. | Auditoría: Audit / managementController | Integración permisos y E2E consulta |
| RF046 | El sistema debe permitir consultar el detalle de un registro de auditoría. | Auditoría: Audit / managementController | Integración permisos y E2E consulta |
| RF047 | El sistema debe permitir registrar una inspección mediante la API del sistema de captura o simulador. | Captura y simulación: Simulator / ingestaController | Integración ingesta e idempotencia; cámara real no conectada |
| RF048 | El sistema debe permitir consultar todas las inspecciones asociadas a un batch. | Histórico y trazabilidad: History / inspeccionController | Integración filtros/paginación y E2E Calidad |
| RF049 | El sistema debe permitir generar reportes por período, receta o lote. | Reportes: History / reportController | Integración PDF/CSV y E2E descargas |
| RF050 | El sistema debe permitir descargar los reportes generados en formato PDF o CSV. | Reportes: History / reportController | Integración PDF/CSV y E2E descargas |

## Límites de la verificación

- Las verificaciones funcionales se ejecutan con datos académicos en PostgreSQL local y Edge. Los reportes PDF se generaron y revisaron visualmente.
- Las pruebas de API crean registros QA; los recorridos de navegador reales crean registros UI. Los tests con respuestas interceptadas se identifican por separado.
- RNF de despliegue público/HTTPS, SMTP real, captura industrial, 99% de disponibilidad, retención y respaldo diario programado, Chrome, 50 usuarios concurrentes y objetivos de rendimiento en volumen industrial no están certificados.
- El script de respaldo y el procedimiento de restauración están documentados; no se instaló una tarea de respaldo automático ni se ejecutó una restauración sobre la base activa.
- La base local es un entorno de desarrollo; el despliegue debe separar permisos de migración/ejecución y sustituir las cuentas de demostración.
- Los umbrales de reglas, ventana operativa y metas no informadas por la empresa se mantienen como supuestos académicos.
