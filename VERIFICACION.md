# AZA — Verificación de entrega local

Fecha: 17 de octubre de 2026. Proyecto: C:\Users\Angur\OneDrive\Desktop\AZA.

## Resultado

Se integraron Administración (recetas, lotes, batches, usuarios, reglas y auditoría), histórico, trazabilidad y reportes CSV/PDF, con permisos en frontend y API. Se conserva el modo sala del Operador, diseñado tomando como referencia una TV de 55–65 pulgadas a 3–5 metros.

| Verificación | Resultado |
|---|---|
| Unitarias backend | 8 aprobadas |
| Unitarias frontend | 5 aprobadas |
| Integración HTTP y PostgreSQL local | 13 grupos aprobados |
| Navegador Edge, escritorio/tablet/móvil | 27 aprobadas: 15 con API interceptada y 12 con servicios reales |
| Compilación de distribución | Correcta |
| npm audit, frontend y backend | 0 vulnerabilidades reportadas en esta ejecución |
| Respaldo PostgreSQL con pg_dump | Generado correctamente |
| PDF exportado | Descarga comprobada y muestra renderizada revisada |

La integración comprueba los cuatro roles, rechazos por permisos, recetas, cierre/reapertura de lotes, batches, snapshots históricos, ingesta idempotente, reglas, observaciones concurrentes, reconocimiento de alarmas, filtros, exportaciones, usuarios temporales, bloqueo/desbloqueo, recuperación de un solo uso, revocación de sesiones y auditoría.

Las pruebas reales crean registros académicos QA/UI y comprueban persistencia. Los casos con API interceptada verifican comportamiento visual y estados controlados; no se presentan como evidencia de persistencia.

Evidencia técnica: `.local/verificacion-completa.json`, `aza-frontend/test-results/`, tests del repositorio y respaldo `.local/backups/aza-2026-10-17T22-15-53-950Z.dump`. Los comandos reproducibles están en README.md.

## Alcance y verificaciones pendientes de infraestructura

El sistema está disponible y probado localmente. No se ha publicado una URL externa, conectado una cámara ni enviado correo mediante SMTP real. La recuperación local muestra un enlace de prueba. El simulador recibe resultados académicos; no calcula ángulos ni controla maquinaria.

La lectura a distancia usa la referencia solicitada, pero requiere una comprobación física en la TV y condiciones de la sala. Tampoco se ha certificado carga de 50 usuarios, disponibilidad del 99%, Chrome, restauración completa del respaldo ni programación diaria/retención de respaldos. Estos puntos requieren validación en la infraestructura final; no equivalen a módulos de interfaz pendientes.

Consultar MANUAL_USUARIO.md, MATRIZ_IMPLEMENTACION.md y README.md para uso, requisitos y puesta en marcha.
