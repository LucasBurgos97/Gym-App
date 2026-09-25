// Fecha LOCAL en formato YYYY-MM-DD. toISOString() devuelve UTC, y en Argentina
// (UTC-3) desde las 21:00 daría la fecha de "mañana".
export function fechaLocalISO(d = new Date()) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Mismo día un mes después; si ese mes no tiene el día (31/01), el último del mes.
// Misma regla que addCalendarMonth en electron/db.cjs.
export function sumarUnMes(fechaISO) {
  if (!fechaISO) return '';
  const [y, m, d] = fechaISO.split('-').map(Number);
  const ultimoDiaDelMesSiguiente = new Date(y, m + 1, 0).getDate();
  return fechaLocalISO(new Date(y, m, Math.min(d, ultimoDiaDelMesSiguiente)));
}
