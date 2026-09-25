import React from 'react';
import { formatBloque } from '../utils/horario.js';

const DIAS = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];
const DIAS_JS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

// Grilla de la semana: días en columnas (lunes a viernes; sábado y domingo solo si
// hay alguna clase esos días) y los horarios a la izquierda.
export default function CronogramaSemanal({ actividades }) {
  const diasConClases = new Set(actividades.flatMap((a) => a.dias));
  const dias = DIAS.filter((d, i) => i < 5 || diasConClases.has(d.value));
  const horas = [...new Set(actividades.flatMap((a) => a.horarios))].sort((a, b) => Number(a) - Number(b));
  const hoy = DIAS_JS[new Date().getDay()];
  const hayPersonalizadas = actividades.some((a) => a.personalizada);

  if (horas.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">Todavía no hay clases cargadas. Creá una actividad más abajo y va a aparecer acá.</div>
      </div>
    );
  }

  function clasesDe(dia, hora) {
    return actividades
      .filter((a) => a.dias.includes(dia) && a.horarios.includes(hora))
      .sort((a, b) => Number(a.personalizada) - Number(b.personalizada) || a.nombre.localeCompare(b.nombre));
  }

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="cronograma">
          <thead>
            <tr>
              <th className="cronograma-hora">Horario</th>
              {dias.map((d) => (
                <th key={d.value} className={d.value === hoy ? 'cronograma-hoy' : ''}>{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horas.map((hora) => (
              <tr key={hora}>
                <th scope="row" className="cronograma-hora">{formatBloque(hora)}</th>
                {dias.map((d) => (
                  <td key={d.value} className={d.value === hoy ? 'cronograma-hoy' : ''}>
                    {clasesDe(d.value, hora).map((a) => (
                      <div
                        key={a.id}
                        className={'cronograma-clase' + (a.personalizada ? ' cronograma-clase-personalizada' : '')}
                        title={a.nombre}
                      >
                        {a.nombre}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hayPersonalizadas && (
        <p className="muted" style={{ margin: '12px 0 0', fontSize: 13 }}>
          Las actividades en gris son personalizadas: pueden compartir día y horario con otras.
        </p>
      )}
    </div>
  );
}
