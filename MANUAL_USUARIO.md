# Guía de uso de AZA

## Acceso

Abrir http://127.0.0.1:5173. Las cuatro tarjetas del acceso completan credenciales académicas; luego pulsar Iniciar sesión. Administrador: admin@demo.example; contraseña Demo2026!. Las cuentas nuevas usan una contraseña temporal y deben reemplazarla antes de entrar al sistema. Perfil permite cambiar contraseña; Cerrar sesión invalida las sesiones de la cuenta.

## Administración

1. **Recetas:** Crear receta; completar nombre, material, espesor y límites. El mínimo debe ser menor al máximo. Buscar por nombre/material o filtrar por estado y fechas de uso. Editar muestra valores actuales. Desmarcar Receta activa y confirmar desactiva sin borrar referencias históricas.
2. **Lotes:** Crear lote con código único y receta activa. El fin estimado es opcional. Editar permite cambiar receta solo si aún no hay batches y el lote está abierto; el código se conserva. Cerrar/Reabrir exige confirmación. Los lotes cerrados no admiten nuevas inspecciones ni batches.
3. **Batches:** Crear batch dentro de un lote abierto. El número es único dentro del lote. Una vez creado solo se modifica su observación. No se ofrecen eliminaciones físicas.
4. **Usuarios:** Crear usuario con nombre, correo, rol y contraseña temporal. Se valida el correo único y la política de contraseña. Editar permite cambiar datos, rol o desactivar. La cuenta propia no puede perder el acceso administrativo desde ese formulario. Desbloquear reinicia el control de intentos fallidos. No se muestran hashes ni contraseñas guardadas.
5. **Reglas:** Crear regla, elegir condición y completar su umbral o cantidad si corresponde. Confirmar modificaciones. Una regla inactiva no genera nuevas alarmas. Los cambios se aplican a eventos futuros y no borran alarmas antiguas.
6. **Auditoría:** Filtrar por usuario, acción, fecha y orden. Ver detalle muestra responsable, fecha, módulo y origen. Solo lectura.

## Operador

La portada prioriza ángulo, resultado y antigüedad del registro. Modo sala oculta el menú lateral y amplía la información para una TV de 55–65 pulgadas. Pantalla completa o F11 aprovecha la pantalla. Mostrar captura real activa/desactiva la comparación con el análisis; el ajuste se conserva en este navegador. Las imágenes solo aparecen si las envía el sistema de captura. Un aviso de desconexión conserva el último resultado sin presentarlo como actualizado.

Inspecciones recientes reúne ocho horas relativas al último registro, como ventana académica del proyecto. Detalle y observaciones permite agregar contexto sin cambiar los resultados técnicos. Alarmas permite filtrar y reconocer un evento con confirmación; reconocer no significa resolver la falla ni aprobar una inspección.

## Supervisor y Calidad

- **Histórico:** combinar fechas de Santiago, receta, lote, batch y estado; elegir orden y navegar páginas de 25 filas. Abrir detalle de cualquier resultado filtrado. Descargar CSV/PDF exporta el conjunto completo filtrado, no solo la página visible, hasta 10.000 filas; reducir el período para volúmenes mayores.
- **Trazabilidad:** seleccionar lote y batch para recorrer el contexto y sus inspecciones. Los límites del detalle son los aplicados al registrar el resultado.
- **Reportes:** seleccionar filtros, Generar reporte y descargar CSV o PDF. La vista previa muestra hasta 50 filas; la descarga incluye el conjunto generado. La tasa es aprobadas/total, incluyendo Sin receta. Las filas de la exportación indican fecha UTC.
- **Tendencias:** los indicadores representan el mismo conjunto de resultados del filtro. El gráfico no clasifica ni corrige inspecciones.
- **Consulta de producción:** los perfiles de consulta pueden abrir detalles, pero no editar. Calidad no reconoce alarmas ni modifica resultados.

## Simulación técnica

Abrir http://127.0.0.1:5173/simulador. Usar la API Key del entorno de pruebas (se consulta localmente en aza-backend/.env; no compartirla). Elegir receta y lote coherentes y un batch; completar ángulo y estado. Registrar inspección de prueba guarda datos y puede generar alarmas. Nueva referencia prepara otro evento; reenviar la misma referencia evita duplicación. Esta pantalla no convierte al simulador en un rol humano.

## Recuperación y errores

En Recuperar acceso, introducir el correo. El entorno local muestra un enlace temporal de prueba cuando corresponde y no envía mensajes. El enlace vence en diez minutos y se usa una sola vez. En producción debe configurarse SMTP para entregar el enlace al correo real.

Si la API no está disponible, ejecutar `node iniciar-local.cjs` desde la carpeta AZA y reintentar. No editar ni borrar la carpeta de datos PostgreSQL. Ante sesión vencida o cambio de permisos, volver a iniciar sesión. Las validaciones rechazadas conservan los datos anteriores.
