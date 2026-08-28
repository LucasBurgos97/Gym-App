import React, { useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';

function FilaPlan({ plan, onGuardado, onEliminado }) {
  const [nombre, setNombre] = useState(plan.nombre);
  const [clasesIncluidas, setClasesIncluidas] = useState(plan.clases_incluidas ?? '');
  const [precio, setPrecio] = useState(plan.precio);
  const [activo, setActivo] = useState(!!plan.activo);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setError('');
    setGuardando(true);
    const res = await window.api.planes.actualizar(plan.id, {
      nombre,
      clases_incluidas: clasesIncluidas === '' ? null : Number(clasesIncluidas),
      precio: Number(precio) || 0,
      activo,
    });
    setGuardando(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onGuardado();
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return;
    const res = await window.api.planes.eliminar(plan.id);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onEliminado();
  }

  return (
    <tr>
      <td>
        <input className="table-input" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: 170 }} />
      </td>
      <td>
        <input
          className="table-input"
          value={clasesIncluidas}
          placeholder="Ilimitado"
          onChange={(e) => setClasesIncluidas(e.target.value.replace(/[^0-9]/g, ''))}
          style={{ width: 80 }}
        />
      </td>
      <td>
        <input
          className="table-input"
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          style={{ width: 90 }}
        />
      </td>
      <td>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          {activo ? 'Activo' : 'Inactivo'}
        </label>
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

export default function Planes() {
  const [planes, setPlanes] = useState([]);
  const [error, setError] = useState('');
  const [nuevo, setNuevo] = useState({ nombre: '', clases_incluidas: '', precio: '' });

  async function cargar() {
    const res = await window.api.planes.listar(false);
    if (res.ok) setPlanes(res.data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e) {
    e.preventDefault();
    setError('');
    if (!nuevo.nombre.trim()) {
      setError('El nombre del plan es obligatorio.');
      return;
    }
    const res = await window.api.planes.crear(nuevo);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNuevo({ nombre: '', clases_incluidas: '', precio: '' });
    cargar();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Planes</h1>
        <p>Definí los planes de entrenamiento y la cantidad de clases que incluyen.</p>
      </div>

      <div className="card">
        <h3>Planes existentes</h3>
        {planes.length > 0 && planes.every((p) => !p.activo) && (
          <div className="alert alert-warning">
            No hay ningún plan activo — no vas a poder registrar pagos hasta activar al menos uno.
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Clases</th>
                <th>Precio</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => (
                <FilaPlan key={p.id} plan={p} onGuardado={cargar} onEliminado={cargar} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          Dejá "Clases incluidas" vacío para un plan libre / ilimitado. Tocá "Guardar" en la fila para aplicar los cambios.
        </p>
      </div>

      <div className="card">
        <h3>Nuevo plan</h3>
        <Alert>{error}</Alert>
        <form onSubmit={crear} className="form-grid">
          <div className="field">
            <label>Nombre</label>
            <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          </div>
          <div className="field">
            <label>Clases incluidas (vacío = ilimitado)</label>
            <input
              value={nuevo.clases_incluidas}
              onChange={(e) => setNuevo({ ...nuevo, clases_incluidas: e.target.value.replace(/[^0-9]/g, '') })}
            />
          </div>
          <div className="field">
            <label>Precio</label>
            <input
              type="number"
              value={nuevo.precio}
              onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
            />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" type="submit">Crear plan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
