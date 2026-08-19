import React, { useState } from 'react';
import Asistencia from './pages/Asistencia.jsx';
import Alumnos from './pages/Alumnos.jsx';
import AlumnoDetalle from './pages/AlumnoDetalle.jsx';
import Planes from './pages/Planes.jsx';
import Vencimientos from './pages/Vencimientos.jsx';

const NAV_ITEMS = [
  { key: 'asistencia', label: 'Asistencia', icon: '✓' },
  { key: 'alumnos', label: 'Alumnos', icon: '👤' },
  { key: 'vencimientos', label: 'Vencimientos', icon: '⏰' },
  { key: 'planes', label: 'Planes', icon: '📋' },
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
          Martin Gym Manager
          <small>Panel del entrenador</small>
        </div>
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
      </nav>
      <main className="main-area">
        {view === 'asistencia' && <Asistencia onVerAlumno={irADetalleAlumno} />}
        {view === 'alumnos' && <Alumnos onVerAlumno={irADetalleAlumno} />}
        {view === 'vencimientos' && <Vencimientos onVerAlumno={irADetalleAlumno} />}
        {view === 'alumnoDetalle' && (
          <AlumnoDetalle alumnoId={alumnoSeleccionado} onVolver={() => cambiarVista(origenDetalle)} />
        )}
        {view === 'planes' && <Planes />}
      </main>
    </div>
  );
}
