import React, { useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import useConfirm from '../components/useConfirm.jsx';
import { formatBloque } from '../utils/horario.js';

const DIAS = [
  { value: 'lunes', label: 'Lun' },
  { value: 'martes', label: 'Mar' },
  { value: 'miercoles', label: 'Mié' },
  { value: 'jueves', label: 'Jue' },
  { value: 'viernes', label: 'Vie' },
  { value: 'sabado', label: 'Sáb' },
  { value: 'domingo', label: 'Dom' },
];

// Cada horario es solo la hora de inicio del bloque de 1 hora (sin minutos): "16" = 16 a 17hs.
const HORAS_DISPONIBLES = Array.from({ length: 18 }, (_, i) => String(i + 6)); // 6 a 23hs

// Mapa "dia|horario" -> nombre de la actividad que ya lo ocupa.
// Las actividades personalizadas no bloquean ni son bloqueadas (pueden superponerse).
function construirOcupados(actividades, idAExcluir) {
  const mapa = new Map();
  for (const act of actividades) {
    if (act.id === idAExcluir) continue;
    if (act.personalizada) continue;
    for (const d of act.dias) {
      for (const h of act.horarios) {
        mapa.set(`${d}|${h}`, act.nombre);
      }
    }
  }
  return mapa;
}

function SelectorDias({ diasSeleccionados, horariosActuales, ocupados, exento, onCambiar }) {
  function conflictoDe(dia) {
    if (exento || diasSeleccionados.includes(dia)) return null;
    for (const h of horariosActuales) {
      const nombre = ocupados.get(`${dia}|${h}`);
      if (nombre) return nombre;
    }
    return null;
  }

  function toggle(dia) {
    if (conflictoDe(dia)) return;
    onCambiar(
      diasSeleccionados.includes(dia)
        ? diasSeleccionados.filter((d) => d !== dia)
        : [...diasSeleccionados, dia]
    );
  }

  return (
    <div className="dias-selector">
      {DIAS.map((d) => {
        const conflicto = conflictoDe(d.value);
        return (
          <button
            key={d.value}
            type="button"
            disabled={!!conflicto}
            title={conflicto ? `Ocupado por "${conflicto}" a ese horario` : undefined}
            className={
              'dia-chip' +
              (diasSeleccionados.includes(d.value) ? ' dia-chip-activo' : '') +
              (conflicto ? ' dia-chip-conflicto' : '')
            }
            onClick={() => toggle(d.value)}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectorHorarios({ horarios, diasActuales, ocupados, exento, onCambiar }) {
  const [horaNueva, setHoraNueva] = useState('');
  const [conflicto, setConflicto] = useState('');

  function agregar() {
    setConflicto('');
    if (!horaNueva) return;
    if (horarios.includes(horaNueva)) {
      setHoraNueva('');
      return;
    }
    if (!exento) {
      for (const d of diasActuales) {
        const nombre = ocupados.get(`${d}|${horaNueva}`);
        if (nombre) {
          setConflicto(`Ese horario ya lo usa "${nombre}" el día ${d}.`);
          return;
        }
      }
    }
    onCambiar([...horarios, horaNueva].sort((a, b) => Number(a) - Number(b)));
    setHoraNueva('');
  }

  function quitar(hora) {
    onCambiar(horarios.filter((h) => h !== hora));
  }

  return (
    <div>
      <div className="horarios-chips">
        {horarios.length === 0 && <span className="muted" style={{ fontSize: 13 }}>Sin horarios agregados.</span>}
        {horarios.map((h) => (
          <span key={h} className="horario-chip">
            {formatBloque(h)}
            <button type="button" onClick={() => quitar(h)} aria-label={`Quitar bloque ${formatBloque(h)}`}>×</button>
          </span>
        ))}
      </div>
      {conflicto && <p style={{ color: 'var(--danger)', fontSize: 13, margin: '0 0 8px' }}>{conflicto}</p>}
      <div className="horarios-add">
        <select value={horaNueva} onChange={(e) => setHoraNueva(e.target.value)}>
          <option value="">Elegí un horario...</option>
          {HORAS_DISPONIBLES.map((h) => (
            <option key={h} value={h}>{formatBloque(h)}</option>
          ))}
        </select>
        <button type="button" className="btn btn-secondary" onClick={agregar}>+ Agregar horario</button>
      </div>
    </div>
  );
}

function FilaActividad({ actividad, ocupados, onGuardado, onEliminado, confirmar }) {
  const [nombre, setNombre] = useState(actividad.nombre);
  const [dias, setDias] = useState(actividad.dias);
  const [horarios, setHorarios] = useState(actividad.horarios);
  const [personalizada, setPersonalizada] = useState(actividad.personalizada);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function guardar() {
    setError('');
    setGuardando(true);
    const res = await window.api.actividades.actualizar(actividad.id, { nombre, dias, horarios, activo: 1, personalizada });
    setGuardando(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onGuardado();
  }

  async function eliminar() {
    setError('');
    if (!(await confirmar(`¿Eliminar la actividad "${actividad.nombre}"? No afecta las asistencias ya registradas.`))) return;
    const res = await window.api.actividades.eliminar(actividad.id);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onEliminado();
  }

  return (
    <div className="card actividad-card">
      <Alert>{error}</Alert>
      <div className="field">
        <label>Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontWeight: 400 }}>
          <input type="checkbox" checked={personalizada} onChange={(e) => setPersonalizada(e.target.checked)} />
          Es personalizada (permite superponer día y horario con otras)
        </label>
      </div>
      <div className="field">
        <label>Días</label>
        <SelectorDias diasSeleccionados={dias} horariosActuales={horarios} ocupados={ocupados} exento={personalizada} onCambiar={setDias} />
      </div>
      <div className="field">
        <label>Horarios</label>
        <SelectorHorarios horarios={horarios} diasActuales={dias} ocupados={ocupados} exento={personalizada} onCambiar={setHorarios} />
      </div>
      <div className="form-actions">
        <button className="btn" onClick={guardar} disabled={guardando}>Guardar cambios</button>
        <button className="btn btn-danger" onClick={eliminar}>Eliminar actividad</button>
      </div>
    </div>
  );
}

export default function Actividades() {
  const [actividades, setActividades] = useState([]);
  const [error, setError] = useState('');
  const [nueva, setNueva] = useState({ nombre: '', dias: [], horarios: [], personalizada: false });
  const [confirmar, dialogoConfirmar] = useConfirm();

  async function cargar() {
    const res = await window.api.actividades.listar(false);
    if (res.ok) setActividades(res.data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e) {
    e.preventDefault();
    setError('');
    if (!nueva.nombre.trim()) {
      setError('El nombre de la actividad es obligatorio.');
      return;
    }
    if (nueva.dias.length === 0) {
      setError('Elegí al menos un día.');
      return;
    }
    if (nueva.horarios.length === 0) {
      setError('Agregá al menos un horario.');
      return;
    }
    const res = await window.api.actividades.crear(nueva);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNueva({ nombre: '', dias: [], horarios: [], personalizada: false });
    cargar();
  }

  const ocupadosNueva = construirOcupados(actividades, null);

  return (
    <div>
      <div className="page-header">
        <h1>Actividades</h1>
        <p>Cronograma de clases: qué actividad se dicta, qué días y a qué horario. Se usa al registrar asistencia.</p>
      </div>

      <div className="section-title">Actividades existentes</div>
      {actividades.length === 0 ? (
        <div className="card">
          <div className="empty-state">Todavía no hay actividades cargadas.</div>
        </div>
      ) : (
        actividades.map((a) => (
          <FilaActividad
            key={a.id}
            actividad={a}
            ocupados={construirOcupados(actividades, a.id)}
            onGuardado={cargar}
            onEliminado={cargar}
            confirmar={confirmar}
          />
        ))
      )}

      <div className="section-title">Nueva actividad</div>
      <div className="card">
        <Alert>{error}</Alert>
        <form onSubmit={crear}>
          <div className="field" style={{ maxWidth: 420, marginBottom: 14 }}>
            <label>Nombre</label>
            <input value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontWeight: 400 }}>
              <input
                type="checkbox"
                checked={nueva.personalizada}
                onChange={(e) => setNueva({ ...nueva, personalizada: e.target.checked })}
              />
              Es personalizada (permite superponer día y horario con otras)
            </label>
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Días</label>
            <SelectorDias
              diasSeleccionados={nueva.dias}
              horariosActuales={nueva.horarios}
              ocupados={ocupadosNueva}
              exento={nueva.personalizada}
              onCambiar={(dias) => setNueva({ ...nueva, dias })}
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Horarios</label>
            <SelectorHorarios
              horarios={nueva.horarios}
              diasActuales={nueva.dias}
              ocupados={ocupadosNueva}
              exento={nueva.personalizada}
              onCambiar={(horarios) => setNueva({ ...nueva, horarios })}
            />
          </div>
          <div className="form-actions">
            <button className="btn" type="submit">Crear actividad</button>
          </div>
        </form>
      </div>
      {dialogoConfirmar}
    </div>
  );
}
