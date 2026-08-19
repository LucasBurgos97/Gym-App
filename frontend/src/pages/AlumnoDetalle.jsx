import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import Alert from '../components/Alert.jsx';
import AlumnoForm from '../components/AlumnoForm.jsx';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AlumnoDetalle({ alumnoId, onVolver }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);

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
              DNI {alumno.dni} {alumno.telefono ? `· ${alumno.telefono}` : ''} {alumno.email ? `· ${alumno.email}` : ''}
            </p>
            {membresiaActual ? (
              <span className="badge badge-activa">Membresía activa · {membresiaActual.plan_nombre}</span>
            ) : (
              <span className="badge badge-vencida">Sin membresía vigente</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={() => setMostrarPago(true)}>Registrar pago</button>
            <button className="btn btn-secondary" onClick={() => setMostrarEditar(true)}>Editar datos</button>
          </div>
        </div>
      </div>

      <div className="section-title">Membresías</div>
      <div className="card">
        {membresias.length === 0 ? (
          <div className="empty-state">Este alumno todavía no tiene membresías. Registrá un pago para crear la primera.</div>
        ) : (
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
        )}
      </div>

      <div className="section-title">Clases recuperadas</div>
      <div className="card">
        <div className="toolbar">
          <p className="muted" style={{ margin: 0 }}>Recuperaciones otorgadas por situaciones excepcionales.</p>
          <button
            className="btn btn-secondary"
            disabled={!membresiaActual}
            onClick={() => setMostrarRecuperacion(true)}
          >
            + Registrar recuperación
          </button>
        </div>
        {recuperaciones.length === 0 ? (
          <div className="empty-state">Sin recuperaciones registradas.</div>
        ) : (
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
        )}
      </div>

      <div className="section-title">Historial de asistencias</div>
      <div className="card">
        {asistencias.length === 0 ? (
          <div className="empty-state">Sin asistencias registradas.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Fecha</th></tr>
            </thead>
            <tbody>
              {asistencias.slice(0, 15).map((a) => (
                <tr key={a.id}><td>{a.fecha}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-title">Pagos</div>
      <div className="card">
        {pagos.length === 0 ? (
          <div className="empty-state">Sin pagos registrados.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Plan</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.fecha}</td>
                  <td>{p.plan_nombre}</td>
                  <td>${p.importe}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

function FormularioPago({ alumnoId, onGuardado, onCancelar }) {
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({ plan_id: '', importe: '', fecha: hoyISO() });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    window.api.planes.listar(true).then((res) => {
      if (res.ok) {
        setPlanes(res.data);
        if (res.data.length) setForm((f) => ({ ...f, plan_id: res.data[0].id }));
      }
    });
  }, []);

  async function guardar(e) {
    e.preventDefault();
    setError('');
    if (!form.plan_id) {
      setError('Seleccioná un plan.');
      return;
    }
    setGuardando(true);
    const res = await window.api.pagos.registrar({
      alumno_id: alumnoId,
      plan_id: Number(form.plan_id),
      importe: Number(form.importe) || 0,
      fecha: form.fecha,
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
          <select value={form.plan_id} onChange={(e) => setForm({ ...form, plan_id: e.target.value })}>
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.clases_incluidas === null ? '(ilimitado)' : `(${p.clases_incluidas} clases)`}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Importe</label>
          <input
            type="number"
            value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Fecha de inicio</label>
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </div>
      </div>
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
