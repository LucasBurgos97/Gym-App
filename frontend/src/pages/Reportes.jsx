import React, { useEffect, useState } from 'react';

const PERIODOS = [
  { key: 'semanal', label: 'Semanal' },
  { key: 'mensual', label: 'Mensual' },
  { key: 'anual', label: 'Anual' },
];

function formatearMonto(n) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState('mensual');
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    window.api.reportes.ingresos(periodo).then((res) => {
      if (res.ok) setReporte(res.data);
      setCargando(false);
    });
  }, [periodo]);

  return (
    <div>
      <div className="page-header">
        <h1>Reportes de ingresos</h1>
        <p>Total recaudado por pagos registrados, según el período.</p>
      </div>

      <div className="toolbar">
        <div style={{ display: 'flex', gap: 8 }}>
          {PERIODOS.map((p) => (
            <button
              key={p.key}
              className={periodo === p.key ? 'btn' : 'btn btn-secondary'}
              onClick={() => setPeriodo(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {cargando || !reporte ? (
        <p className="muted">Cargando...</p>
      ) : (
        <>
          <div className="card">
            <div className="stat-row">
              <div className="stat">
                <div className="value">{formatearMonto(reporte.total)}</div>
                <div className="label">Total {periodo}</div>
              </div>
              <div className="stat">
                <div className="value">{reporte.pagos.length}</div>
                <div className="label">Pagos registrados</div>
              </div>
            </div>
            <p className="muted" style={{ marginTop: 14 }}>
              Período: {reporte.desde} a {reporte.hasta}
            </p>
          </div>

          <div className="section-title">Desglose</div>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>{periodo === 'anual' ? 'Mes' : periodo === 'semanal' ? 'Día' : 'Semana'}</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {reporte.desglose.map((d) => (
                  <tr key={d.etiqueta}>
                    <td>{d.etiqueta}</td>
                    <td>{formatearMonto(d.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-title">Pagos del período</div>
          <div className="card">
            {reporte.pagos.length === 0 ? (
              <div className="empty-state">Sin pagos en este período.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Alumno</th>
                    <th>Plan</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.pagos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.fecha}</td>
                      <td>{p.apellido}, {p.nombre}</td>
                      <td>{p.plan_nombre}</td>
                      <td>{formatearMonto(p.importe)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
