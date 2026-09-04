import React, { useEffect, useRef, useState } from 'react';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import AlumnoForm from '../components/AlumnoForm.jsx';

const DIAS_JS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function diaDeHoy() {
  return DIAS_JS[new Date().getDay()];
}

// Cada horario es solo la hora de inicio del bloque de 1 hora (sin minutos): "16" = clase de 16 a 17hs.
function horaActual() {
  return String(new Date().getHours());
}

function formatBloque(hora) {
  return `${hora} a ${Number(hora) + 1}hs`;
}

function construirOpciones(actividades) {
  const hoy = diaDeHoy();
  const deHoy = [];
  const otras = [];
  actividades.forEach((act) => {
    const esHoy = act.dias.includes(hoy);
    act.horarios.forEach((h) => {
      const opt = {
        value: `${act.id}|${h}`,
        actividad_id: act.id,
        actividad_nombre: act.nombre,
        horario: h,
        label: `${act.nombre} — ${formatBloque(h)}`,
      };
      (esHoy ? deHoy : otras).push(opt);
    });
  });
  deHoy.sort((a, b) => Number(a.horario) - Number(b.horario));
  otras.sort((a, b) => a.label.localeCompare(b.label));
  return { deHoy, otras };
}

// Actividad de hoy cuyo bloque horario incluye "ahora" — solo si hay una sola
// coincidencia sin ambigüedad (dos personalizadas pueden compartir horario).
function actividadDeAhora(deHoy) {
  const coincidencias = deHoy.filter((o) => o.horario === horaActual());
  return coincidencias.length === 1 ? coincidencias[0] : null;
}

export default function Asistencia({ onVerAlumno }) {
  const [dni, setDni] = useState('');
  const [estado, setEstado] = useState(null); // resultado de estadoParaAsistencia
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeOk, setMensajeOk] = useState('');
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [actividades, setActividades] = useState([]);
  const [seleccion, setSeleccion] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    window.api.actividades.listar(true).then((res) => {
      if (res.ok) setActividades(res.data);
    });
  }, []);

  const { deHoy, otras } = construirOpciones(actividades);
  const actividadActual = actividadDeAhora(deHoy);

  async function buscar(e) {
    e?.preventDefault();
    const dniLimpio = dni.trim();
    if (!dniLimpio) return;
    setBuscando(true);
    setError('');
    setMensajeOk('');
    const res = await window.api.asistencias.estadoParaAsistencia(dniLimpio);
    setBuscando(false);
    if (!res.ok) {
      setError(res.error);
      setEstado(null);
      return;
    }
    setEstado(res.data);
    // Si hay una única clase corriendo ahora mismo, la dejamos pre-seleccionada
    // para que el profesor solo tenga que confirmar — nunca se registra sola.
    setSeleccion(actividadActual ? actividadActual.value : '');
  }

  async function confirmarAsistencia() {
    setError('');
    const [actividadIdStr, horario] = seleccion.split('|');
    const res = await window.api.asistencias.registrar(dni.trim(), Number(actividadIdStr), horario);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const actividadElegida = actividades.find((a) => a.id === Number(actividadIdStr));
    setMensajeOk(
      `Asistencia registrada para ${res.data.alumno.nombre} ${res.data.alumno.apellido}` +
        (actividadElegida ? ` — ${actividadElegida.nombre} (${formatBloque(horario)})` : '') +
        '.'
    );
    setEstado(null);
    setDni('');
    setSeleccion('');
    inputRef.current?.focus();
  }

  function alumnoCreado(alumno) {
    setMostrarAlta(false);
    setMensajeOk(`Alumno ${alumno.nombre} ${alumno.apellido} registrado. Ahora registrá su primer pago para activar la membresía.`);
    onVerAlumno(alumno.id);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Registrar asistencia</h1>
        <p>Ingresá el DNI del alumno (a mano o con un lector USB de QR/código de barras) para marcar la asistencia de hoy.</p>
      </div>

      <div className="card">
        <form className="dni-search" onSubmit={buscar}>
          <input
            ref={inputRef}
            autoFocus
            placeholder="Número de DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          <button className="btn btn-lg" type="submit" disabled={buscando}>
            Buscar
          </button>
        </form>

        <Alert>{error}</Alert>
        <Alert type="success">{mensajeOk}</Alert>

        {estado && !estado.encontrado && (
          <div className="alert alert-warning" style={{ marginTop: 18 }}>
            No existe un alumno con DNI {dni}.{' '}
            <button className="link-btn" onClick={() => setMostrarAlta(true)}>
              Registrar alumno nuevo
            </button>
          </div>
        )}

        {estado && estado.encontrado && (
          <div className="student-card" style={{ marginTop: 20 }}>
            <div>
              <h2>
                {estado.alumno.nombre} {estado.alumno.apellido}
              </h2>
              <p className="muted">DNI {estado.alumno.dni}</p>

              {!estado.membresiaVigente && (
                <div className="alert alert-warning">No tiene una membresía vigente.</div>
              )}

              {estado.membresiaVigente && (
                <div className="stat-row">
                  <div className="stat">
                    <div className="value">{estado.planNombre}</div>
                    <div className="label">Plan</div>
                  </div>
                  <div className="stat">
                    <div className="value">
                      {estado.clasesDisponibles === null ? '∞' : estado.clasesDisponibles}
                    </div>
                    <div className="label">Clases disponibles</div>
                  </div>
                </div>
              )}

              {estado.membresiaVigente && !estado.puedeAsistir && (
                <div className="alert alert-warning" style={{ marginTop: 14 }}>
                  No tiene clases disponibles en su membresía actual.
                </div>
              )}

              {estado.membresiaVigente && estado.puedeAsistir && (
                <div className="field" style={{ maxWidth: 340, marginTop: 16 }}>
                  {actividadActual ? (
                    <p style={{ margin: '0 0 8px', fontWeight: 600 }}>
                      ¿Viene a {actividadActual.actividad_nombre} ({formatBloque(actividadActual.horario)})?
                    </p>
                  ) : (
                    <p className="muted" style={{ margin: '0 0 8px', fontSize: 13.5 }}>
                      No hay una clase corriendo justo ahora — elegí a cuál viene.
                    </p>
                  )}
                  <label>Actividad</label>
                  <select value={seleccion} onChange={(e) => setSeleccion(e.target.value)}>
                    <option value="">Seleccioná una actividad...</option>
                    {deHoy.length > 0 && (
                      <optgroup label="Programadas para hoy">
                        {deHoy.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </optgroup>
                    )}
                    {otras.length > 0 && (
                      <optgroup label="Otras actividades">
                        {otras.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 190 }}>
              <button
                className="btn btn-lg"
                disabled={!estado.puedeAsistir || !seleccion}
                onClick={confirmarAsistencia}
              >
                {actividadActual ? 'Sí, registrar asistencia' : 'Registrar asistencia'}
              </button>
              <button className="btn btn-secondary" onClick={() => onVerAlumno(estado.alumno.id)}>
                Ver ficha del alumno
              </button>
            </div>
          </div>
        )}
      </div>

      {mostrarAlta && (
        <Modal title="Registrar alumno nuevo" onClose={() => setMostrarAlta(false)}>
          <AlumnoForm dniInicial={dni} onGuardado={alumnoCreado} onCancelar={() => setMostrarAlta(false)} />
        </Modal>
      )}
    </div>
  );
}
