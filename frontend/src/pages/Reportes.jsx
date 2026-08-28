import React, { useEffect, useState } from 'react';

const PERIODOS = [
  { key: 'semanal', label: 'Semanal' },
  { key: 'mensual', label: 'Mensual' },
  { key: 'anual', label: 'Anual' },
];

const PAGOS_POR_PAGINA = 5;

function formatearMonto(n) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState('mensual');
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    setCargando(true);
    setPagina(0);
    window.api.reportes.ingresos(periodo).then((res) => {
      if (res.ok) setReporte(res.data);
      setCargando(false);
    });
  }, [periodo]);

  const montoMax = reporte ? Math.max(1, ...reporte.desglose.map((d) => d.monto)) : 1;
  const totalPaginas = reporte ? Math.ceil(reporte.pagos.length / PAGOS_POR_PAGINA) : 0;
  const pagosPagina = reporte
    ? reporte.pagos.slice(pagina * PAGOS_POR_PAGINA, pagina * PAGOS_POR_PAGINA + PAGOS_POR_PAGINA)
    : [];

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
        <div className="reportes-layout">
          <div className="reportes-col-izq">
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
              <div className="desglose-grid">
                {reporte.desglose.map((d) => (
                  <div key={d.etiqueta} className="desglose-tile">
                    <div className="desglose-tile-label">{d.etiqueta}</div>
                    <div className="desglose-tile-monto">{formatearMonto(d.monto)}</div>
                    <div className="desglose-tile-barra">
                      <div
                        className="desglose-tile-barra-fill"
                        style={{ width: `${Math.max(3, (d.monto / montoMax) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reportes-col-der">
            <div className="section-title" style={{ marginTop: 0 }}>Pagos del período</div>
            <div className="card">
              {reporte.pagos.length === 0 ? (
                <div className="empty-state">Sin pagos en este período.</div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Alumno</th>
                          <th>Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosPagina.map((p) => (
                          <tr key={p.id}>
                            <td>{p.fecha}</td>
                            <td>{p.apellido}, {p.nombre}</td>
                            <td>{formatearMonto(p.importe)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPaginas > 1 && (
                    <div className="paginacion">
                      <button
                        className="btn btn-secondary"
                        disabled={pagina === 0}
                        onClick={() => setPagina((p) => p - 1)}
                      >
                        ‹
                      </button>
                      <span className="muted">
                        Página {pagina + 1} de {totalPaginas}
                      </span>
                      <button
                        className="btn btn-secondary"
                        disabled={pagina >= totalPaginas - 1}
                        onClick={() => setPagina((p) => p + 1)}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
