import React, { useState } from 'react';
import Asistencia from './pages/Asistencia.jsx';
import Alumnos from './pages/Alumnos.jsx';
import AlumnoDetalle from './pages/AlumnoDetalle.jsx';
import Planes from './pages/Planes.jsx';
import Actividades from './pages/Actividades.jsx';
import Vencimientos from './pages/Vencimientos.jsx';
import Calendario from './pages/Calendario.jsx';
import Reportes from './pages/Reportes.jsx';
import Reloj from './components/Reloj.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import logoUrl from './assets/logo.png';

const NAV_ITEMS = [
  { key: 'asistencia', label: 'Asistencia', icon: '✓' },
  { key: 'alumnos', label: 'Alumnos', icon: '👤' },
  { key: 'calendario', label: 'Calendario', icon: '📅' },
  { key: 'vencimientos', label: 'Vencimientos', icon: '⏰' },
  { key: 'reportes', label: 'Ingresos', icon: '💰' },
  { key: 'planes', label: 'Planes', icon: '📋' },
  { key: 'actividades', label: 'Actividades', icon: '🏋️' },
];

export default function App() {
  const [view, setView] = useState('asistencia');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [origenDetalle, setOrigenDetalle] = useState('alumnos');

  function irADetalleAlumno(id) {
    setOrigenDetalle(view === 'alumnoDetalle' ? origenDetalle : view);
    setAlumnoSeleccionado(id);
    setView('alumnoDetalle');
  }

  function cambiarVista(key) {
    setAlumnoSeleccionado(null);
    setView(key);
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <img src={logoUrl} alt="El Perro Team Club Fitness" className="sidebar-logo-img" />
        </div>
        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={'nav-item' + (view === item.key || (item.key === origenDetalle && view === 'alumnoDetalle') ? ' active' : '')}
              onClick={() => cambiarVista(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <Reloj />
      </nav>
      <main className="main-area">
        <div className="watermark" aria-hidden="true">
          <img src={logoUrl} alt="" />
        </div>
        <div className="main-content">
          <ErrorBoundary key={view}>
            {view === 'asistencia' && <Asistencia onVerAlumno={irADetalleAlumno} />}
            {view === 'alumnos' && <Alumnos onVerAlumno={irADetalleAlumno} />}
            {view === 'calendario' && <Calendario onVerAlumno={irADetalleAlumno} />}
            {view === 'vencimientos' && <Vencimientos onVerAlumno={irADetalleAlumno} />}
            {view === 'reportes' && <Reportes />}
            {view === 'alumnoDetalle' && (
              <AlumnoDetalle alumnoId={alumnoSeleccionado} onVolver={() => cambiarVista(origenDetalle)} />
            )}
            {view === 'planes' && <Planes />}
            {view === 'actividades' && <Actividades />}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
