import React, { useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';

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

  async function toggleActivo(plan) {
    await window.api.planes.actualizar(plan.id, { ...plan, activo: plan.activo ? 0 : 1 });
    cargar();
  }

  async function actualizarCampo(plan, campo, valor) {
    const actualizado = { ...plan, [campo]: valor };
    await window.api.planes.actualizar(plan.id, actualizado);
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
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Clases incluidas</th>
              <th>Precio</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {planes.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    defaultValue={p.nombre}
                    onBlur={(e) => e.target.value !== p.nombre && actualizarCampo(p, 'nombre', e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    defaultValue={p.clases_incluidas ?? ''}
                    placeholder="Ilimitado"
                    onBlur={(e) =>
                      Number(e.target.value || '') !== (p.clases_incluidas ?? '') &&
                      actualizarCampo(p, 'clases_incluidas', e.target.value === '' ? null : Number(e.target.value))
                    }
                    style={{ border: 'none', background: 'transparent', width: 90 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={p.precio}
                    onBlur={(e) => Number(e.target.value) !== p.precio && actualizarCampo(p, 'precio', Number(e.target.value))}
                    style={{ border: 'none', background: 'transparent', width: 100 }}
                  />
                </td>
                <td>
                  <button className="btn btn-secondary" onClick={() => toggleActivo(p)}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: 10 }}>
          Dejá "Clases incluidas" vacío para un plan libre / ilimitado. Los cambios se guardan al salir del campo.
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
              onChange={(e) => setNuevo({ ...nuevo, clases_incluidas: e.target.value })}
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
