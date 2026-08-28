-- Martin Gym Manager — esquema de base de datos (SQLite)
-- Ver docs/requisitos.md para las reglas de negocio (RN-xx) que este esquema soporta.

CREATE TABLE IF NOT EXISTS alumnos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  dni             TEXT NOT NULL UNIQUE,          -- RN-01: DNI único, identificador principal
  nombre          TEXT NOT NULL,
  apellido        TEXT NOT NULL,
  telefono        TEXT,
  email           TEXT,
  fecha_registro  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS planes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre            TEXT NOT NULL,
  clases_incluidas  INTEGER,                     -- NULL = plan libre / ilimitado (RN-04, RN-05)
  precio            REAL NOT NULL DEFAULT 0,
  activo            INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS pagos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id   INTEGER NOT NULL REFERENCES alumnos(id),
  plan_id     INTEGER NOT NULL REFERENCES planes(id),
  fecha       TEXT NOT NULL,
  importe     REAL NOT NULL
);

-- Cada pago de una mensualidad genera una membresía nueva (RN-02).
-- Las membresías anteriores se conservan como historial (nunca se borran ni se sobrescriben).
CREATE TABLE IF NOT EXISTS membresias (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id           INTEGER NOT NULL REFERENCES alumnos(id),
  plan_id             INTEGER NOT NULL REFERENCES planes(id),
  pago_id             INTEGER NOT NULL REFERENCES pagos(id),
  fecha_inicio        TEXT NOT NULL,
  fecha_vencimiento   TEXT NOT NULL,              -- RN-03: mismo día del mes siguiente
  clases_incluidas    INTEGER,                     -- copia del plan al momento de crear la membresía (NULL = ilimitado)
  clases_usadas       INTEGER NOT NULL DEFAULT 0,
  clases_recuperadas  INTEGER NOT NULL DEFAULT 0   -- clases extra otorgadas o trasladadas de una membresía anterior (RN-08/09/10)
);

-- Actividades del cronograma del gimnasio (Full Training, Funcional, etc.).
-- Es independiente de "planes": el plan define cuántas clases tiene el alumno,
-- la actividad describe qué clase concreta hizo en cada asistencia.
CREATE TABLE IF NOT EXISTS actividades (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL,
  dias           TEXT NOT NULL,   -- días separados por coma, ej: "lunes,miercoles,viernes"
  horarios       TEXT NOT NULL,   -- horas separadas por coma, ej: "10:00,18:00,19:00"
  activo         INTEGER NOT NULL DEFAULT 1,
  personalizada  INTEGER NOT NULL DEFAULT 0  -- si es 1, no aplica la exclusividad de día+horario con otras actividades
);

CREATE TABLE IF NOT EXISTS asistencias (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id     INTEGER NOT NULL REFERENCES alumnos(id),
  membresia_id  INTEGER NOT NULL REFERENCES membresias(id),
  actividad_id  INTEGER REFERENCES actividades(id),
  horario       TEXT,        -- horario concreto elegido dentro de la actividad, ej: "19:00"
  fecha         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recuperaciones (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id                   INTEGER NOT NULL REFERENCES alumnos(id),
  membresia_id                INTEGER NOT NULL REFERENCES membresias(id),
  cantidad_clases             INTEGER NOT NULL,
  motivo                      TEXT NOT NULL,
  fecha_registro              TEXT NOT NULL DEFAULT (datetime('now')),
  trasladada_a_membresia_id   INTEGER REFERENCES membresias(id)  -- RN-10: traslado al renovar
);
