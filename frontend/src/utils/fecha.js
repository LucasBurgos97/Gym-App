// Fecha LOCAL en formato YYYY-MM-DD. toISOString() devuelve UTC, y en Argentina
// (UTC-3) desde las 21:00 daría la fecha de "mañana".
export function fechaLocalISO(d = new Date()) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}
