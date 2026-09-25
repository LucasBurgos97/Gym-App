// Filtros de teclado para los campos de texto: se aplican con .replace() a medida
// que se escribe, así lo que no corresponde nunca llega a quedar en el campo.

export const SOLO_DIGITOS = /[^0-9]/g;

// Letras con tildes y ñ (À-ÿ menos × y ÷, que están en ese rango pero no son letras),
// espacios, apóstrofe y guion: alcanza para apellidos como "O'Higgins" o "Pérez-Gómez".
export const SOLO_LETRAS = /[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g;

// Lo mismo pero también con números: nombres como "3 veces por semana" o "Funcional 2".
export const SOLO_LETRAS_Y_NUMEROS = /[^A-Za-z0-9À-ÖØ-öø-ÿ\s'-]/g;
