import React, { useEffect, useState } from 'react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISODate(anio, mes, dia) {
  return `${anio}-${pad(mes)}-${pad(dia)}`;
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

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 380px' }}>
          <div className="toolbar">
            <button className="btn btn-secondary" onClick={() => cambiarMes(-1)}>‹</button>
            <h3 style={{ margin: 0 }}>{MESES[mes - 1]} {anio}</h3>
            <button className="btn btn-secondary" onClick={() => cambiarMes(1)}>›</button>
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
                    (esHoy ? ' calendar-cell-today' : '')
                  }
                  onClick={() => setDiaSeleccionado(iso)}
                >
                  {d}
                  {tieneAsistencias && <span className="calendar-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ flex: '1 1 320px' }}>
          <h3>{diaSeleccionado}</h3>
          {cargandoDia ? (
            <p className="muted">Cargando...</p>
          ) : asistenciasDelDia.length === 0 ? (
            <div className="empty-state">Ningún alumno asistió este día.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Actividad</th>
                  <th>Horario</th>
                </tr>
              </thead>
              <tbody>
                {asistenciasDelDia.map((a) => (
                  <tr key={a.id} className="clickable-row" onClick={() => onVerAlumno(a.alumno_id)}>
                    <td>{a.apellido}, {a.nombre}</td>
                    <td>{a.actividad_nombre || '-'}</td>
                    <td>{a.horario || a.fecha.slice(11, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
