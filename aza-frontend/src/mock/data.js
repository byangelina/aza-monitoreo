// Únicamente para prellenar los botones de "cuenta demo" en la pantalla de acceso.
// Los datos de negocio (inspecciones, alarmas, recetas, lotes, batches) ya no viven
// aquí: se obtienen del backend real a través de src/services/dataService.js.
export const demoPassword = 'Demo2026!';
export const users = [
  { id: 'USR-01', name: 'Camila Torres', role: 'Operador', email: 'operador@demo.example', initials: 'CT' },
  { id: 'USR-02', name: 'Diego Morales', role: 'Supervisor', email: 'supervisor@demo.example', initials: 'DM' },
  { id: 'USR-03', name: 'Alex Rojas', role: 'Administrador', email: 'admin@demo.example', initials: 'AR' },
  { id: 'USR-04', name: 'Valentina Soto', role: 'Área de Calidad', email: 'calidad@demo.example', initials: 'VS' },
];
