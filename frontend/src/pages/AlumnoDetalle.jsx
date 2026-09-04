import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import Alert from '../components/Alert.jsx';
import AlumnoForm from '../components/AlumnoForm.jsx';
import Carnet from '../components/Carnet.jsx';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// El horario guardado es solo la hora de inicio del bloque de 1 hora (sin minutos).
function formatBloque(hora) {
  if (!hora) return '-';
  const soloHora = hora.split(':')[0]; // por si quedó algún registro viejo con "HH:MM"
  return `${soloHora} a ${Number(soloHora) + 1}hs`;
}

export default function AlumnoDetalle({ alumnoId, onVolver }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [mostrarHistorialRecuperaciones, setMostrarHistorialRecuperaciones] = useState(false);
  const [mostrarCarnet, setMostrarCarnet] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await window.api.historial.deAlumno(alumnoId);
    if (res.ok) setDatos(res.data);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, [alumnoId]);

  if (cargando || !datos) return <p className="muted">Cargando...</p>;

  const { alumno, membresias, pagos, asistencias, recuperaciones } = datos;
  const membresiaActual = membresias.find((m) => m.estado === 'activa');

  async function eliminarAsistencia(id) {
    if (!window.confirm('¿Deshacer esta asistencia? Le devuelve la clase a la membresía.')) return;
    const res = await window.api.asistencias.eliminar(id);
    if (!res.ok) {
      window.alert(res.error);
      return;
    }
    cargar();
  }

  async function eliminarAlumno() {
    const confirmado = window.confirm(
      `¿Eliminar a ${alumno.nombre} ${alumno.apellido}? Se borra junto con todo su historial de pagos, membresías y asistencias. Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;
    const res = await window.api.alumnos.eliminar(alumno.id);
    if (res.ok) onVolver();
  }

  return (
    <div>
      <button className="link-btn" onClick={onVolver} style={{ marginBottom: 14 }}>
        ← Volver
      </button>

      <div className="card">
        <div className="student-card">
          <div>
            <h2>{alumno.nombre} {alumno.apellido}</h2>
            <p className="muted">
              DNI {alumno.dni} {alumno.telefono ? `· ${alumno.telefono}` : ''}
            </p>
            {membresiaActual ? (
              <span className="badge badge-activa">Membresía activa · {membresiaActual.plan_nombre}</span>
            ) : (
              <span className="badge badge-vencida">Sin membresía vigente</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setMostrarPago(true)}>Registrar pago</button>
            <button className="btn btn-secondary" onClick={() => setMostrarCarnet(true)}>Carnet / QR</button>
            <button
              className="btn btn-secondary"
              disabled={!membresiaActual}
              onClick={() => setMostrarRecuperacion(true)}
            >
              + Recuperación
            </button>
            {recuperaciones.length > 0 && (
              <button className="link-btn" onClick={() => setMostrarHistorialRecuperaciones(true)}>
                Ver recuperaciones ({recuperaciones.length})
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setMostrarEditar(true)}>Editar datos</button>
            <button className="btn btn-danger" onClick={eliminarAlumno}>Eliminar alumno</button>
          </div>
        </div>
      </div>

      <div className="section-title">Membresías</div>
      <div className="card">
        {membresias.length === 0 ? (
          <div className="empty-state">Este alumno todavía no tiene membresías. Registrá un pago para crear la primera.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Inicio</th>
                  <th>Vencimiento</th>
                  <th>Clases</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {membresias.map((m) => (
                  <tr key={m.id}>
                    <td>{m.plan_nombre}</td>
                    <td>{m.fecha_inicio}</td>
                    <td>{m.fecha_vencimiento}</td>
                    <td>
                      {m.clases_incluidas === null
                        ? 'Ilimitadas'
                        : `${m.clases_usadas} / ${m.clases_incluidas}${m.clases_recuperadas ? ` (+${m.clases_recuperadas} recuperadas)` : ''}`}
                    </td>
                    <td>
                      <span className={`badge badge-${m.estado}`}>{m.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-title">Historial de asistencias</div>
      <div className="card">
        {asistencias.length === 0 ? (
          <div className="empty-state">Sin asistencias registradas.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Actividad</th>
                  <th>Horario</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {asistencias.slice(0, 15).map((a) => (
                  <tr key={a.id}>
                    <td>{a.fecha}</td>
                    <td>{a.actividad_nombre || '-'}</td>
                    <td>{formatBloque(a.horario)}</td>
                    <td>
                      <button className="link-btn" onClick={() => eliminarAsistencia(a.id)}>
                        Deshacer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-title">Pagos</div>
      <div className="card">
        {pagos.length === 0 ? (
          <div className="empty-state">Sin pagos registrados.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Plan</th>
                  <th>Importe</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <FilaPago key={p.id} pago={p} onCambio={cargar} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarEditar && (
        <Modal title="Editar alumno" onClose={() => setMostrarEditar(false)}>
          <AlumnoForm
            initial={alumno}
            onGuardado={() => {
              setMostrarEditar(false);
              cargar();
            }}
            onCancelar={() => setMostrarEditar(false)}
          />
        </Modal>
      )}

      {mostrarPago && (
        <Modal title="Registrar pago" onClose={() => setMostrarPago(false)}>
          <FormularioPago
            alumnoId={alumno.id}
            onGuardado={() => {
              setMostrarPago(false);
              cargar();
            }}
            onCancelar={() => setMostrarPago(false)}
          />
        </Modal>
      )}

      {mostrarCarnet && <Carnet alumno={alumno} onClose={() => setMostrarCarnet(false)} />}

      {mostrarHistorialRecuperaciones && (
        <Modal title="Clases recuperadas" onClose={() => setMostrarHistorialRecuperaciones(false)}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Clases</th>
                  <th>Motivo</th>
                  <th>Trasladada</th>
                </tr>
              </thead>
              <tbody>
                {recuperaciones.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fecha_registro?.slice(0, 10)}</td>
                    <td>{r.cantidad_clases}</td>
                    <td>{r.motivo}</td>
                    <td>{r.trasladada_a_membresia_id ? 'Sí' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {mostrarRecuperacion && membresiaActual && (
        <Modal title="Registrar clases recuperadas" onClose={() => setMostrarRecuperacion(false)}>
          <FormularioRecuperacion
            alumnoId={alumno.id}
            membresiaId={membresiaActual.id}
            onGuardado={() => {
              setMostrarRecuperacion(false);
              cargar();
            }}
            onCancelar={() => setMostrarRecuperacion(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function FilaPago({ pago, onCambio }) {
  const [importe, setImporte] = useState(pago.importe);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setError('');
    setGuardando(true);
    const res = await window.api.pagos.actualizarImporte(pago.id, Number(importe));
    setGuardando(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onCambio();
  }

  async function eliminar() {
    if (!window.confirm('¿Eliminar este pago y la membresía que generó? Solo se puede si todavía no tiene asistencias ni recuperaciones.')) return;
    const res = await window.api.pagos.eliminar(pago.id);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onCambio();
  }

  return (
    <tr>
      <td>{pago.fecha}</td>
      <td>{pago.plan_nombre}</td>
      <td>
        $<input
          className="table-input"
          type="number"
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
          onFocus={(e) => e.target.select()}
          style={{ width: 90 }}
        />
      </td>
      <td>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={guardar} disabled={guardando}>Guardar</button>
          <button className="btn btn-danger" onClick={eliminar}>Eliminar</button>
        </div>
        {error && <Alert>{error}</Alert>}
      </td>
    </tr>
  );
}

function FormularioPago({ alumnoId, onGuardado, onCancelar }) {
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({ plan_id: '', importe: '', fecha: hoyISO() });
  const [esExcepcion, setEsExcepcion] = useState(false);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [clasesUsadas, setClasesUsadas] = useState('0');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    window.api.planes.listar(true).then((res) => {
      if (res.ok) {
        setPlanes(res.data);
        if (res.data.length) setForm((f) => ({ ...f, plan_id: res.data[0].id, importe: res.data[0].precio }));
      }
    });
  }, []);

  function seleccionarPlan(planId) {
    const plan = planes.find((p) => String(p.id) === String(planId));
    setForm((f) => ({ ...f, plan_id: planId, importe: plan ? plan.precio : f.importe }));
  }

  function toggleExcepcion(activar) {
    setEsExcepcion(activar);
    if (activar && !fechaVencimiento) {
      // Solo un punto de partida sugerido (mismo día, un mes después) — el entrenador
      // lo puede pisar con el vencimiento real que traía el alumno.
      const [y, m, d] = form.fecha.split('-').map(Number);
      const targetMonthIndex = m; // 0-based next month (mismo truco que addCalendarMonth en db.cjs)
      const ultimoDia = new Date(y, targetMonthIndex + 1, 0).getDate();
      const sugerido = new Date(y, targetMonthIndex, Math.min(d, ultimoDia));
      setFechaVencimiento(sugerido.toISOString().slice(0, 10));
    }
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    if (!form.plan_id) {
      setError('Seleccioná un plan. Si no aparece ninguno, activalo primero en la pantalla Planes.');
      return;
    }
    if (!form.importe || Number(form.importe) <= 0) {
      setError('El plan seleccionado no tiene un precio configurado. Poné un precio para ese plan en la pantalla Planes antes de registrar el pago.');
      return;
    }
    if (esExcepcion && !fechaVencimiento) {
      setError('Ingresá la fecha de vencimiento real de este alumno.');
      return;
    }
    setGuardando(true);
    const res = await window.api.pagos.registrar({
      alumno_id: alumnoId,
      plan_id: Number(form.plan_id),
      importe: Number(form.importe) || 0,
      fecha: form.fecha,
      fecha_vencimiento: esExcepcion ? fechaVencimiento : undefined,
      clases_usadas: esExcepcion ? Number(clasesUsadas) || 0 : undefined,
    });
    setGuardando(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onGuardado();
  }

  return (
    <form onSubmit={guardar}>
      <Alert>{error}</Alert>
      <div className="form-grid single">
        <div className="field">
          <label>Plan</label>
          <select value={form.plan_id} onChange={(e) => seleccionarPlan(e.target.value)}>
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.clases_incluidas === null ? '(ilimitado)' : `(${p.clases_incluidas} clases)`}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Importe (fijado por el plan)</label>
          <input type="number" value={form.importe} disabled />
        </div>
        <div className="field">
          <label>Fecha de inicio {esExcepcion ? '(fecha real de pago)' : ''}</label>
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 14 }}>
        <input type="checkbox" checked={esExcepcion} onChange={(e) => toggleExcepcion(e.target.checked)} />
        Es un alumno que ya venía pagando antes de usar el sistema (cargar como excepción)
      </label>

      {esExcepcion && (
        <div className="form-grid single" style={{ marginTop: 10 }}>
          <div className="field">
            <label>Vencimiento real de esta membresía</label>
            <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
          </div>
          <div className="field">
            <label>Clases que ya usó en este período</label>
            <input
              type="number"
              min="0"
              value={clasesUsadas}
              onChange={(e) => setClasesUsadas(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>
        </div>
      )}

      <div className="form-actions">
        <button className="btn" type="submit" disabled={guardando}>Registrar pago y crear membresía</button>
        <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

function FormularioRecuperacion({ alumnoId, membresiaId, onGuardado, onCancelar }) {
  const [form, setForm] = useState({ cantidad_clases: 1, motivo: '' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    const res = await window.api.recuperaciones.registrar({
      alumno_id: alumnoId,
      membresia_id: membresiaId,
      cantidad_clases: Number(form.cantidad_clases),
      motivo: form.motivo,
    });
    setGuardando(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onGuardado();
  }

  return (
    <form onSubmit={guardar}>
      <Alert>{error}</Alert>
      <div className="form-grid single">
        <div className="field">
          <label>Cantidad de clases</label>
          <input
            type="number"
            min="1"
            value={form.cantidad_clases}
            onChange={(e) => setForm({ ...form, cantidad_clases: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Motivo</label>
          <input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} required />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={guardando}>Registrar</button>
        <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
