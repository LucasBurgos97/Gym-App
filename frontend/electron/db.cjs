// Capa de datos y lógica de negocio de Martin Gym Manager.
// Usa sql.js (SQLite compilado a WASM) para no depender de compilación nativa.
// La base persiste en un archivo .sqlite dentro del userData de Electron.

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let SQL = null;
let db = null;
let dbFilePath = null;

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// RN-03: la fecha de vencimiento conserva el día del mes de inicio, un mes calendario después.
// Si el mes siguiente no tiene ese día (ej. 31 de enero -> febrero), se usa el último día de ese mes.
function addCalendarMonth(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetMonthIndex = m; // 0-based next month
  const lastDayOfTargetMonth = new Date(y, targetMonthIndex + 1, 0).getDate();
  const day = Math.min(d, lastDayOfTargetMonth);
  const result = new Date(y, targetMonthIndex, day);
  return result.toISOString().slice(0, 10);
}

function persist() {
  const data = db.export();
  fs.writeFileSync(dbFilePath, Buffer.from(data));
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  const id = get('SELECT last_insert_rowid() AS id').id;
  persist();
  return id;
}

async function init(userDataDir) {
  SQL = await initSqlJs();
  dbFilePath = path.join(userDataDir, 'gym.sqlite');

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  const schema = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf-8');
  db.run(schema);

  // Migración liviana: si la base ya existía de antes de agregar actividades,
  // el CREATE TABLE IF NOT EXISTS de arriba no toca la tabla asistencias existente.
  const columnasAsistencias = all('PRAGMA table_info(asistencias)').map((c) => c.name);
  if (!columnasAsistencias.includes('actividad_id')) {
    db.run('ALTER TABLE asistencias ADD COLUMN actividad_id INTEGER');
  }
  if (!columnasAsistencias.includes('horario')) {
    db.run('ALTER TABLE asistencias ADD COLUMN horario TEXT');
  }

  const planCount = get('SELECT COUNT(*) AS c FROM planes').c;
  if (planCount === 0) {
    run('INSERT INTO planes (nombre, clases_incluidas, precio, activo) VALUES (?, ?, ?, 1)', ['3 veces por semana', 12, 0]);
    run('INSERT INTO planes (nombre, clases_incluidas, precio, activo) VALUES (?, ?, ?, 1)', ['5 veces por semana', 20, 0]);
    run('INSERT INTO planes (nombre, clases_incluidas, precio, activo) VALUES (?, ?, ?, 1)', ['Plan libre', null, 0]);
  }

  const actividadCount = get('SELECT COUNT(*) AS c FROM actividades').c;
  if (actividadCount === 0) {
    run('INSERT INTO actividades (nombre, dias, horarios, activo) VALUES (?, ?, ?, 1)', [
      'Full Training', 'lunes,miercoles,viernes', '10:00,18:00,19:00,20:00,21:00',
    ]);
    run('INSERT INTO actividades (nombre, dias, horarios, activo) VALUES (?, ?, ?, 1)', [
      'Funcional para Adultos', 'martes,jueves', '18:00',
    ]);
    run('INSERT INTO actividades (nombre, dias, horarios, activo) VALUES (?, ?, ?, 1)', [
      'Entrenamiento Personalizado', 'lunes,miercoles,viernes', '08:00,09:00,16:00,17:00',
    ]);
    run('INSERT INTO actividades (nombre, dias, horarios, activo) VALUES (?, ?, ?, 1)', [
      'Full Training al Aire Libre', 'martes,jueves', '19:00,21:00',
    ]);
  }

  persist();
}

// ---------- Alumnos ----------

function crearAlumno({ dni, nombre, apellido, telefono, email }) {
  dni = String(dni).trim();
  if (!dni) throw new Error('El DNI es obligatorio.');
  if (!nombre || !apellido) throw new Error('Nombre y apellido son obligatorios.');
  const existente = get('SELECT id FROM alumnos WHERE dni = ?', [dni]);
  if (existente) throw new Error('Ya existe un alumno registrado con ese DNI.');
  const id = run(
    'INSERT INTO alumnos (dni, nombre, apellido, telefono, email) VALUES (?, ?, ?, ?, ?)',
    [dni, nombre, apellido, telefono || null, email || null]
  );
  return get('SELECT * FROM alumnos WHERE id = ?', [id]);
}

function actualizarAlumno(id, { nombre, apellido, telefono, email }) {
  run('UPDATE alumnos SET nombre = ?, apellido = ?, telefono = ?, email = ? WHERE id = ?', [
    nombre,
    apellido,
    telefono || null,
    email || null,
    id,
  ]);
  return get('SELECT * FROM alumnos WHERE id = ?', [id]);
}

function buscarAlumnoPorDni(dni) {
  return get('SELECT * FROM alumnos WHERE dni = ?', [String(dni).trim()]);
}

function listarAlumnos(filtro = '') {
  const base = `SELECT a.*,
      (SELECT MAX(m.fecha_vencimiento) FROM membresias m WHERE m.alumno_id = a.id) AS ultimo_vencimiento
    FROM alumnos a`;
  const orden = 'ORDER BY a.apellido, a.nombre';

  const rows = filtro
    ? all(`${base} WHERE a.dni LIKE ? OR a.nombre LIKE ? OR a.apellido LIKE ? ${orden}`, [
        `%${filtro}%`,
        `%${filtro}%`,
        `%${filtro}%`,
      ])
    : all(`${base} ${orden}`);

  return rows.map((a) => ({
    ...a,
    estado: a.ultimo_vencimiento && a.ultimo_vencimiento >= today() ? 'activo' : 'inactivo',
  }));
}

function obtenerAlumno(id) {
  return get('SELECT * FROM alumnos WHERE id = ?', [id]);
}

// ---------- Planes ----------

function listarPlanes(soloActivos = false) {
  return all(`SELECT * FROM planes ${soloActivos ? 'WHERE activo = 1' : ''} ORDER BY id`);
}

function crearPlan({ nombre, clases_incluidas, precio }) {
  if (!nombre) throw new Error('El nombre del plan es obligatorio.');
  const id = run('INSERT INTO planes (nombre, clases_incluidas, precio, activo) VALUES (?, ?, ?, 1)', [
    nombre,
    clases_incluidas === '' || clases_incluidas === null || clases_incluidas === undefined ? null : Number(clases_incluidas),
    Number(precio) || 0,
  ]);
  return get('SELECT * FROM planes WHERE id = ?', [id]);
}

function actualizarPlan(id, { nombre, clases_incluidas, precio, activo }) {
  run('UPDATE planes SET nombre = ?, clases_incluidas = ?, precio = ?, activo = ? WHERE id = ?', [
    nombre,
    clases_incluidas === '' || clases_incluidas === null || clases_incluidas === undefined ? null : Number(clases_incluidas),
    Number(precio) || 0,
    activo ? 1 : 0,
    id,
  ]);
  return get('SELECT * FROM planes WHERE id = ?', [id]);
}

// ---------- Actividades (cronograma de clases) ----------

function parseActividad(a) {
  return {
    ...a,
    dias: a.dias ? a.dias.split(',').map((s) => s.trim()).filter(Boolean) : [],
    horarios: a.horarios ? a.horarios.split(',').map((s) => s.trim()).filter(Boolean) : [],
  };
}

function listaATexto(valor) {
  return Array.isArray(valor) ? valor.join(',') : String(valor || '');
}

function listarActividades(soloActivas = false) {
  return all(`SELECT * FROM actividades ${soloActivas ? 'WHERE activo = 1' : ''} ORDER BY id`).map(parseActividad);
}

function crearActividad({ nombre, dias, horarios }) {
  if (!nombre) throw new Error('El nombre de la actividad es obligatorio.');
  const id = run('INSERT INTO actividades (nombre, dias, horarios, activo) VALUES (?, ?, ?, 1)', [
    nombre,
    listaATexto(dias),
    listaATexto(horarios),
  ]);
  return parseActividad(get('SELECT * FROM actividades WHERE id = ?', [id]));
}

function actualizarActividad(id, { nombre, dias, horarios, activo }) {
  run('UPDATE actividades SET nombre = ?, dias = ?, horarios = ?, activo = ? WHERE id = ?', [
    nombre,
    listaATexto(dias),
    listaATexto(horarios),
    activo ? 1 : 0,
    id,
  ]);
  return parseActividad(get('SELECT * FROM actividades WHERE id = ?', [id]));
}

// ---------- Membresías ----------

function membresiaVigente(alumnoId) {
  // La membresía vigente es la más reciente cuyo vencimiento no pasó (RN-06).
  return get(
    `SELECT * FROM membresias WHERE alumno_id = ? AND fecha_vencimiento >= ? ORDER BY fecha_inicio DESC LIMIT 1`,
    [alumnoId, today()]
  );
}

function clasesDisponibles(membresia) {
  if (membresia.clases_incluidas === null) return Infinity; // plan libre (RN-05)
  return membresia.clases_incluidas + membresia.clases_recuperadas - membresia.clases_usadas;
}

function estadoMembresia(membresia) {
  return membresia.fecha_vencimiento >= today() ? 'activa' : 'vencida';
}

function historialMembresias(alumnoId) {
  const rows = all(
    `SELECT m.*, p.nombre AS plan_nombre
     FROM membresias m JOIN planes p ON p.id = m.plan_id
     WHERE m.alumno_id = ? ORDER BY m.fecha_inicio DESC`,
    [alumnoId]
  );
  return rows.map((m) => ({
    ...m,
    estado: estadoMembresia(m),
    clases_disponibles: clasesDisponibles(m) === Infinity ? null : clasesDisponibles(m),
  }));
}

// ---------- Pagos y alta de membresía ----------

function registrarPago({ alumno_id, plan_id, importe, fecha }) {
  const alumno = obtenerAlumno(alumno_id);
  if (!alumno) throw new Error('Alumno no encontrado.');
  const plan = get('SELECT * FROM planes WHERE id = ?', [plan_id]);
  if (!plan) throw new Error('Plan no encontrado.');

  const fechaInicio = fecha || today();
  const fechaVencimiento = addCalendarMonth(fechaInicio);

  const pagoId = run('INSERT INTO pagos (alumno_id, plan_id, fecha, importe) VALUES (?, ?, ?, ?)', [
    alumno_id,
    plan_id,
    fechaInicio,
    Number(importe) || 0,
  ]);

  // RN-10: si la membresía anterior venció con clases recuperadas sin usar, se trasladan a la nueva.
  const anterior = get(
    `SELECT * FROM membresias WHERE alumno_id = ? ORDER BY fecha_inicio DESC LIMIT 1`,
    [alumno_id]
  );
  let clasesTrasladadas = 0;
  if (anterior && anterior.fecha_vencimiento < fechaInicio) {
    // Clases del pool combinado (incluidas + recuperadas) que quedaron sin usar,
    // acotadas a lo otorgado por recuperación (las clases base del plan no se trasladan).
    const poolSinUsar = Math.max(0, (anterior.clases_incluidas || 0) + anterior.clases_recuperadas - anterior.clases_usadas);
    clasesTrasladadas = Math.min(anterior.clases_recuperadas, poolSinUsar);
  }

  const membresiaId = run(
    `INSERT INTO membresias (alumno_id, plan_id, pago_id, fecha_inicio, fecha_vencimiento, clases_incluidas, clases_usadas, clases_recuperadas)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [alumno_id, plan_id, pagoId, fechaInicio, fechaVencimiento, plan.clases_incluidas, clasesTrasladadas]
  );

  if (clasesTrasladadas > 0) {
    run('UPDATE recuperaciones SET trasladada_a_membresia_id = ? WHERE membresia_id = ? AND trasladada_a_membresia_id IS NULL', [
      membresiaId,
      anterior.id,
    ]);
  }

  return get('SELECT * FROM membresias WHERE id = ?', [membresiaId]);
}

// ---------- Asistencias ----------

function registrarAsistencia(dni, actividad_id, horario) {
  const alumno = buscarAlumnoPorDni(dni);
  if (!alumno) {
    const err = new Error('No existe un alumno registrado con ese DNI.');
    err.code = 'ALUMNO_NO_ENCONTRADO';
    throw err;
  }

  const membresia = membresiaVigente(alumno.id);
  if (!membresia) {
    throw new Error(`${alumno.nombre} ${alumno.apellido} no tiene una membresía vigente.`);
  }

  const disponibles = clasesDisponibles(membresia);
  if (disponibles <= 0) {
    throw new Error(`${alumno.nombre} ${alumno.apellido} no tiene clases disponibles en su membresía actual.`);
  }

  run('INSERT INTO asistencias (alumno_id, membresia_id, actividad_id, horario) VALUES (?, ?, ?, ?)', [
    alumno.id,
    membresia.id,
    actividad_id || null,
    horario || null,
  ]);
  run('UPDATE membresias SET clases_usadas = clases_usadas + 1 WHERE id = ?', [membresia.id]);

  const membresiaActualizada = get('SELECT * FROM membresias WHERE id = ?', [membresia.id]);
  return {
    alumno,
    membresia: membresiaActualizada,
    clases_disponibles: clasesDisponibles(membresiaActualizada) === Infinity ? null : clasesDisponibles(membresiaActualizada),
  };
}

function estadoParaAsistencia(dni) {
  const alumno = buscarAlumnoPorDni(dni);
  if (!alumno) return { encontrado: false };

  const membresia = membresiaVigente(alumno.id);
  if (!membresia) {
    return { encontrado: true, alumno, membresiaVigente: false };
  }
  const plan = get('SELECT * FROM planes WHERE id = ?', [membresia.plan_id]);
  const disponibles = clasesDisponibles(membresia);
  return {
    encontrado: true,
    alumno,
    membresiaVigente: true,
    membresia,
    planNombre: plan ? plan.nombre : '',
    clasesDisponibles: disponibles === Infinity ? null : disponibles,
    puedeAsistir: disponibles > 0,
  };
}

function historialAsistencias(alumnoId) {
  return all(
    `SELECT asi.*, act.nombre AS actividad_nombre
     FROM asistencias asi
     LEFT JOIN actividades act ON act.id = asi.actividad_id
     WHERE asi.alumno_id = ? ORDER BY asi.fecha DESC`,
    [alumnoId]
  );
}

// ---------- Recuperaciones ----------

function registrarRecuperacion({ alumno_id, membresia_id, cantidad_clases, motivo }) {
  if (!motivo) throw new Error('El motivo de la recuperación es obligatorio.');
  const cantidad = Number(cantidad_clases);
  if (!cantidad || cantidad <= 0) throw new Error('La cantidad de clases debe ser mayor a cero.');

  const membresia = get('SELECT * FROM membresias WHERE id = ?', [membresia_id]);
  if (!membresia) throw new Error('Membresía no encontrada.');

  run('INSERT INTO recuperaciones (alumno_id, membresia_id, cantidad_clases, motivo) VALUES (?, ?, ?, ?)', [
    alumno_id,
    membresia_id,
    cantidad,
    motivo,
  ]);
  run('UPDATE membresias SET clases_recuperadas = clases_recuperadas + ? WHERE id = ?', [cantidad, membresia_id]);

  return get('SELECT * FROM membresias WHERE id = ?', [membresia_id]);
}

function historialRecuperaciones(alumnoId) {
  return all('SELECT * FROM recuperaciones WHERE alumno_id = ? ORDER BY fecha_registro DESC', [alumnoId]);
}

// ---------- Historial completo ----------

function historialAlumno(alumnoId) {
  return {
    alumno: obtenerAlumno(alumnoId),
    membresias: historialMembresias(alumnoId),
    pagos: all(
      `SELECT pa.*, pl.nombre AS plan_nombre FROM pagos pa JOIN planes pl ON pl.id = pa.plan_id WHERE pa.alumno_id = ? ORDER BY pa.fecha DESC`,
      [alumnoId]
    ),
    asistencias: historialAsistencias(alumnoId),
    recuperaciones: historialRecuperaciones(alumnoId),
  };
}

// ---------- Calendario ----------

function asistenciasPorFecha(fecha) {
  // fecha en formato YYYY-MM-DD
  return all(
    `SELECT asi.id, asi.fecha, asi.horario, al.id AS alumno_id, al.dni, al.nombre, al.apellido,
            p.nombre AS plan_nombre, act.nombre AS actividad_nombre
     FROM asistencias asi
     JOIN alumnos al ON al.id = asi.alumno_id
     JOIN membresias m ON m.id = asi.membresia_id
     JOIN planes p ON p.id = m.plan_id
     LEFT JOIN actividades act ON act.id = asi.actividad_id
     WHERE date(asi.fecha) = ?
     ORDER BY al.apellido, al.nombre`,
    [fecha]
  );
}

function diasConAsistenciasEnMes(anio, mes) {
  // mes: 1-12. Devuelve las fechas (YYYY-MM-DD) del mes que tienen al menos una asistencia.
  const desde = `${anio}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const hasta = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  const rows = all(
    `SELECT DISTINCT date(fecha) AS dia FROM asistencias WHERE date(fecha) BETWEEN ? AND ?`,
    [desde, hasta]
  );
  return rows.map((r) => r.dia);
}

// ---------- Reportes de ingresos ----------

function rangoPeriodo(tipo, referencia) {
  const ref = referencia ? new Date(referencia) : new Date();
  let inicio, fin;

  if (tipo === 'semanal') {
    const diaSemana = ref.getDay(); // 0=domingo
    const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    inicio = new Date(ref);
    inicio.setDate(ref.getDate() + diffLunes);
    fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
  } else if (tipo === 'anual') {
    inicio = new Date(ref.getFullYear(), 0, 1);
    fin = new Date(ref.getFullYear(), 11, 31);
  } else {
    // mensual (por defecto)
    inicio = new Date(ref.getFullYear(), ref.getMonth(), 1);
    fin = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  }
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { desde: fmt(inicio), hasta: fmt(fin) };
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function reporteIngresos(tipo = 'mensual', referencia) {
  const { desde, hasta } = rangoPeriodo(tipo, referencia);

  const pagos = all(
    `SELECT pa.*, a.nombre, a.apellido, pl.nombre AS plan_nombre
     FROM pagos pa
     JOIN alumnos a ON a.id = pa.alumno_id
     JOIN planes pl ON pl.id = pa.plan_id
     WHERE pa.fecha BETWEEN ? AND ?
     ORDER BY pa.fecha DESC`,
    [desde, hasta]
  );

  const total = pagos.reduce((acc, p) => acc + p.importe, 0);

  let desglose = [];
  if (tipo === 'semanal') {
    const inicio = new Date(desde);
    desglose = DIAS_SEMANA.map((label, i) => {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      const diaStr = dia.toISOString().slice(0, 10);
      const monto = pagos.filter((p) => p.fecha === diaStr).reduce((a, p) => a + p.importe, 0);
      return { etiqueta: `${label} ${diaStr.slice(8, 10)}/${diaStr.slice(5, 7)}`, monto };
    });
  } else if (tipo === 'anual') {
    desglose = MESES.map((label, i) => {
      const mesNum = String(i + 1).padStart(2, '0');
      const monto = pagos
        .filter((p) => p.fecha.slice(5, 7) === mesNum)
        .reduce((a, p) => a + p.importe, 0);
      return { etiqueta: label, monto };
    });
  } else {
    // mensual: por semana del mes
    const grupos = {};
    for (const p of pagos) {
      const dia = Number(p.fecha.slice(8, 10));
      const semana = Math.ceil(dia / 7);
      grupos[semana] = (grupos[semana] || 0) + p.importe;
    }
    desglose = Object.keys(grupos)
      .sort((a, b) => a - b)
      .map((semana) => ({ etiqueta: `Semana ${semana}`, monto: grupos[semana] }));
  }

  return { tipo, desde, hasta, total, desglose, pagos };
}

function vencimientos() {
  // Membresías vencidas o próximas a vencer en los próximos 7 días.
  const en7dias = new Date();
  en7dias.setDate(en7dias.getDate() + 7);
  const limite = en7dias.toISOString().slice(0, 10);

  const rows = all(
    `SELECT m.*, a.dni, a.nombre, a.apellido, p.nombre AS plan_nombre
     FROM membresias m
     JOIN alumnos a ON a.id = m.alumno_id
     JOIN planes p ON p.id = m.plan_id
     WHERE m.id IN (
       SELECT id FROM membresias m2 WHERE m2.alumno_id = m.alumno_id ORDER BY m2.fecha_inicio DESC LIMIT 1
     )
     AND m.fecha_vencimiento <= ?
     ORDER BY m.fecha_vencimiento ASC`,
    [limite]
  );
  return rows.map((m) => ({ ...m, estado: estadoMembresia(m) }));
}

module.exports = {
  init,
  crearAlumno,
  actualizarAlumno,
  buscarAlumnoPorDni,
  listarAlumnos,
  obtenerAlumno,
  listarPlanes,
  crearPlan,
  actualizarPlan,
  listarActividades,
  crearActividad,
  actualizarActividad,
  registrarPago,
  registrarAsistencia,
  estadoParaAsistencia,
  registrarRecuperacion,
  historialAlumno,
  vencimientos,
  membresiaVigente,
  clasesDisponibles,
  addCalendarMonth,
  asistenciasPorFecha,
  diasConAsistenciasEnMes,
  reporteIngresos,
};
