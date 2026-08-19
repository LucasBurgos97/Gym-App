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

CREATE TABLE IF NOT EXISTS asistencias (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id     INTEGER NOT NULL REFERENCES alumnos(id),
  membresia_id  INTEGER NOT NULL REFERENCES membresias(id),
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
