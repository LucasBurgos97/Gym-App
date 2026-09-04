// Cada horario se guarda como solo la hora de inicio del bloque de 1 hora
// (sin minutos): "16" = clase de 16 a 17hs.
export function formatBloque(hora) {
  if (!hora) return '-';
  const soloHora = hora.split(':')[0]; // por si quedó algún registro viejo con "HH:MM"
  return `${soloHora} a ${Number(soloHora) + 1}hs`;
}
