import React, { useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';

export default function Actividades() {
  const [actividades, setActividades] = useState([]);
  const [error, setError] = useState('');
  const [nueva, setNueva] = useState({ nombre: '', dias: '', horarios: '' });

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
    const res = await window.api.actividades.crear(nueva);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNueva({ nombre: '', dias: '', horarios: '' });
    cargar();
  }

  async function toggleActivo(act) {
    await window.api.actividades.actualizar(act.id, {
      nombre: act.nombre,
      dias: act.dias,
      horarios: act.horarios,
      activo: act.activo ? 0 : 1,
    });
    cargar();
  }

  async function actualizarCampo(act, campo, valorTexto) {
    const valor = campo === 'dias' || campo === 'horarios'
      ? valorTexto.split(',').map((s) => s.trim()).filter(Boolean)
      : valorTexto;
    await window.api.actividades.actualizar(act.id, {
      nombre: act.nombre,
      dias: act.dias,
      horarios: act.horarios,
      activo: act.activo,
      [campo]: valor,
    });
    cargar();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Actividades</h1>
        <p>Cronograma de clases: qué actividad se dicta, qué días y a qué horario. Se usa al registrar asistencia.</p>
      </div>

      <div className="card">
        <h3>Actividades existentes</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Días</th>
              <th>Horarios</th>
              <th>Activa</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((a) => (
              <tr key={a.id}>
                <td>
                  <input
                    defaultValue={a.nombre}
                    onBlur={(e) => e.target.value !== a.nombre && actualizarCampo(a, 'nombre', e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    defaultValue={a.dias.join(', ')}
                    placeholder="lunes, miercoles, viernes"
                    onBlur={(e) => actualizarCampo(a, 'dias', e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: 200 }}
                  />
                </td>
                <td>
                  <input
                    defaultValue={a.horarios.join(', ')}
                    placeholder="10:00, 18:00"
                    onBlur={(e) => actualizarCampo(a, 'horarios', e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: 220 }}
                  />
                </td>
                <td>
                  <button className="btn btn-secondary" onClick={() => toggleActivo(a)}>
                    {a.activo ? 'Activa' : 'Inactiva'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: 10 }}>
          Días y horarios separados por coma. Los cambios se guardan al salir del campo.
        </p>
      </div>

      <div className="card">
        <h3>Nueva actividad</h3>
        <Alert>{error}</Alert>
        <form onSubmit={crear} className="form-grid">
          <div className="field">
            <label>Nombre</label>
            <input value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} />
          </div>
          <div className="field">
            <label>Días (separados por coma)</label>
            <input
              placeholder="lunes, miercoles, viernes"
              value={nueva.dias}
              onChange={(e) => setNueva({ ...nueva, dias: e.target.value })}
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Horarios (separados por coma)</label>
            <input
              placeholder="10:00, 18:00, 19:00"
              value={nueva.horarios}
              onChange={(e) => setNueva({ ...nueva, horarios: e.target.value })}
            />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" type="submit">Crear actividad</button>
          </div>
        </form>
      </div>
    </div>
  );
}
