export const ROLE_HOME = { Operador: '/operador', Supervisor: '/supervisor', Administrador: '/admin', 'Área de Calidad': '/calidad' };
export const ROLES = Object.keys(ROLE_HOME);
export const TIME_ZONE = 'America/Santiago';
export const dateKey = value => new Intl.DateTimeFormat('en-CA', {timeZone: TIME_ZONE, year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date(value));
export const formatTime = value => new Intl.DateTimeFormat('es-CL', {timeZone: TIME_ZONE, hour:'2-digit', minute:'2-digit', hour12:false}).format(new Date(value));
export const formatDate = value => new Intl.DateTimeFormat('es-CL', {timeZone: TIME_ZONE, day:'2-digit', month:'short', year:'numeric'}).format(new Date(value));
export const formatNumber = value => new Intl.NumberFormat('es-CL').format(value);
export function filterInspections(records, filters = {}) {
  return records.filter(item => {
    const day = dateKey(item.date);
    return (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to) && (!filters.recipe || item.recipeId === filters.recipe) && (!filters.lot || item.lotId === filters.lot);
  }).sort((a,b) => new Date(b.date) - new Date(a.date));
}
export function metrics(records) {
  const unique = [...new Map(records.map(item => [item.id, item])).values()];
  const count = state => unique.filter(item => item.status === state).length;
  return { total: unique.length, approved: count('Aprobado'), rejected: count('Rechazado'), noRecipe: count('Sin receta'), rate: unique.length ? count('Aprobado') / unique.length * 100 : null };
}
export function recentInspections(records) {
  // Ventana operativa académica: ocho horas respecto del último registro disponible.
  const latest = Math.max(...records.map(item => +new Date(item.date)));
  return records.filter(item => +new Date(item.date) >= latest - 8*60*60*1000).sort((a,b) => new Date(b.date)-new Date(a.date));
}
// La validación de "distinta de la contraseña anterior" queda a cargo del backend,
// que es el único que conoce (mediante el hash) la contraseña actual real del usuario.
export function passwordError(value, confirm) {
  if (value.length < 8 || !/[A-Z]/.test(value) || !/\d/.test(value)) return 'Usa al menos 8 caracteres, una mayúscula y un número.';
  if (value !== confirm) return 'Las contraseñas no coinciden.';
  return '';
}
