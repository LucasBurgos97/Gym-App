import React, { useState } from 'react';
import Asistencia from './pages/Asistencia.jsx';
import Alumnos from './pages/Alumnos.jsx';
import AlumnoDetalle from './pages/AlumnoDetalle.jsx';
import Planes from './pages/Planes.jsx';

const NAV_ITEMS = [
  { key: 'asistencia', label: 'Asistencia', icon: '✓' },
  { key: 'alumnos', label: 'Alumnos', icon: '👤' },
  { key: 'planes', label: 'Planes', icon: '📋' },
];

export default function App() {
  const [view, setView] = useState('asistencia');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  function irADetalleAlumno(id) {
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
            className={'nav-item' + (view === item.key || (item.key === 'alumnos' && view === 'alumnoDetalle') ? ' active' : '')}
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
        {view === 'alumnoDetalle' && (
          <AlumnoDetalle alumnoId={alumnoSeleccionado} onVolver={() => cambiarVista('alumnos')} />
        )}
        {view === 'planes' && <Planes />}
      </main>
    </div>
  );
}
