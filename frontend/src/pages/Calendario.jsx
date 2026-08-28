import React, { useEffect, useState } from 'react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_SEMANA_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISODate(anio, mes, dia) {
  return `${anio}-${pad(mes)}-${pad(dia)}`;
}

function formatearFechaLarga(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  return `${DIAS_SEMANA_LARGO[fecha.getDay()]} ${d} de ${MESES[m - 1].toLowerCase()}`;
}

export default function Calendario({ onVerAlumno }) {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1); // 1-12
  const [diasConAsistencia, setDiasConAsistencia] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(toISODate(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate()));
  const [asistenciasDelDia, setAsistenciasDelDia] = useState([]);
  const [cargandoDia, setCargandoDia] = useState(false);

  useEffect(() => {
    window.api.calendario.diasConAsistencias(anio, mes).then((res) => {
      if (res.ok) setDiasConAsistencia(res.data);
    });
  }, [anio, mes]);

  useEffect(() => {
    if (!diaSeleccionado) return;
    setCargandoDia(true);
    window.api.calendario.asistenciasPorFecha(diaSeleccionado).then((res) => {
      if (res.ok) setAsistenciasDelDia(res.data);
      setCargandoDia(false);
    });
  }, [diaSeleccionado]);

  function cambiarMes(delta) {
    let m = mes + delta;
    let a = anio;
    if (m < 1) { m = 12; a -= 1; }
    if (m > 12) { m = 1; a += 1; }
    setMes(m);
    setAnio(a);
  }

  function irAHoy() {
    setMes(hoy.getMonth() + 1);
    setAnio(hoy.getFullYear());
    setDiaSeleccionado(toISODate(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate()));
  }

  const primerDiaSemana = (new Date(anio, mes - 1, 1).getDay() + 6) % 7; // 0=lunes
  const diasEnMes = new Date(anio, mes, 0).getDate();

  const celdas = [];
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const hoyISO = toISODate(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());

  return (
    <div>
      <div className="page-header">
        <h1>Calendario de asistencias</h1>
        <p>Seleccioná un día para ver qué alumnos asistieron.</p>
      </div>

      <div className="calendario-layout">
        <div className="card calendario-card">
          <div className="calendario-toolbar">
            <button className="calendar-nav-btn" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">‹</button>
            <h3>{MESES[mes - 1]} {anio}</h3>
            <button className="calendar-nav-btn" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">›</button>
            <button className="btn btn-secondary calendario-hoy-btn" onClick={irAHoy}>Hoy</button>
          </div>

          <div className="calendar-grid">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="calendar-weekday">{d}</div>
            ))}
            {celdas.map((d, i) => {
              if (d === null) return <div key={`empty-${i}`} className="calendar-cell calendar-cell-empty" />;
              const iso = toISODate(anio, mes, d);
              const tieneAsistencias = diasConAsistencia.includes(iso);
              const esHoy = iso === hoyISO;
              const seleccionado = iso === diaSeleccionado;
              return (
                <button
                  key={iso}
                  className={
                    'calendar-cell' +
                    (seleccionado ? ' calendar-cell-selected' : '') +
                    (esHoy && !seleccionado ? ' calendar-cell-today' : '')
                  }
                  onClick={() => setDiaSeleccionado(iso)}
                >
                  <span>{d}</span>
                  {tieneAsistencias && <span className="calendar-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card calendario-detalle">
          <h3 className="calendario-detalle-titulo">{formatearFechaLarga(diaSeleccionado)}</h3>
          {cargandoDia ? (
            <p className="muted">Cargando...</p>
          ) : asistenciasDelDia.length === 0 ? (
            <div className="empty-state">Ningún alumno asistió este día.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciasDelDia.map((a) => (
                    <tr key={a.id} className="clickable-row" onClick={() => onVerAlumno(a.alumno_id)}>
                      <td>{a.apellido}, {a.nombre}</td>
                      <td>{a.actividad_nombre || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
