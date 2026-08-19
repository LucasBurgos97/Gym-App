import React, { useEffect, useState } from 'react';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function diasRestantes(fechaVencimiento) {
  const hoy = new Date(hoyISO());
  const venc = new Date(fechaVencimiento);
  return Math.round((venc - hoy) / (1000 * 60 * 60 * 24));
}

export default function Vencimientos({ onVerAlumno }) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const res = await window.api.vencimientos();
    if (res.ok) setItems(res.data);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  const vencidas = items.filter((m) => m.estado === 'vencida');
  const proximasAVencer = items.filter((m) => m.estado !== 'vencida');

  return (
    <div>
      <div className="page-header">
        <h1>Vencimientos</h1>
        <p>Membresías vencidas y próximas a vencer en los próximos 7 días.</p>
      </div>

      {cargando ? (
        <p className="muted">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="card">
          <div className="empty-state">No hay membresías vencidas ni próximas a vencer.</div>
        </div>
      ) : (
        <>
          <div className="section-title">Vencidas ({vencidas.length})</div>
          <div className="card">
            {vencidas.length === 0 ? (
              <div className="empty-state">Sin membresías vencidas.</div>
            ) : (
              <TablaVencimientos items={vencidas} onVerAlumno={onVerAlumno} />
            )}
          </div>

          <div className="section-title">Próximas a vencer ({proximasAVencer.length})</div>
          <div className="card">
            {proximasAVencer.length === 0 ? (
              <div className="empty-state">Sin membresías próximas a vencer.</div>
            ) : (
              <TablaVencimientos items={proximasAVencer} onVerAlumno={onVerAlumno} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TablaVencimientos({ items, onVerAlumno }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Alumno</th>
          <th>DNI</th>
          <th>Plan</th>
          <th>Vencimiento</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {items.map((m) => {
          const dias = diasRestantes(m.fecha_vencimiento);
          return (
            <tr key={m.id} className="clickable-row" onClick={() => onVerAlumno(m.alumno_id)}>
              <td>{m.nombre} {m.apellido}</td>
              <td>{m.dni}</td>
              <td>{m.plan_nombre}</td>
              <td>{m.fecha_vencimiento}</td>
              <td>
                {m.estado === 'vencida' ? (
                  <span className="badge badge-vencida">Vencida hace {Math.abs(dias)} día{Math.abs(dias) === 1 ? '' : 's'}</span>
                ) : (
                  <span className="badge badge-activa">Vence en {dias} día{dias === 1 ? '' : 's'}</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
