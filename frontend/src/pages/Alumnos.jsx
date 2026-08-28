import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import AlumnoForm from '../components/AlumnoForm.jsx';

export default function Alumnos({ onVerAlumno }) {
  const [alumnos, setAlumnos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [cargando, setCargando] = useState(true);

  async function cargar(f = '') {
    setCargando(true);
    const res = await window.api.alumnos.listar(f);
    if (res.ok) setAlumnos(res.data);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => cargar(filtro), 250);
    return () => clearTimeout(t);
  }, [filtro]);

  return (
    <div>
      <div className="page-header">
        <h1>Alumnos</h1>
        <p>Buscá, consultá y registrá alumnos del gimnasio.</p>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por DNI, nombre o apellido..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button className="btn" onClick={() => setMostrarAlta(true)}>
          + Nuevo alumno
        </button>
      </div>

      <div className="card">
        {cargando ? (
          <p className="muted">Cargando...</p>
        ) : alumnos.length === 0 ? (
          <div className="empty-state">Todavía no hay alumnos registrados.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tel.</th>
                  <th>Estado</th>
                  <th>Plan</th>
                  <th>Recuperadas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a) => (
                  <tr key={a.id} className="clickable-row" onClick={() => onVerAlumno(a.id)}>
                    <td>{a.apellido}, {a.nombre}</td>
                    <td>{a.telefono || '-'}</td>
                    <td>
                      <span className={`badge badge-${a.estado === 'activo' ? 'activa' : 'vencida'}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td>{a.membresia_plan || '-'}</td>
                    <td>{a.clases_recuperadas ?? 0}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerAlumno(a.id);
                        }}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarAlta && (
        <Modal title="Registrar alumno nuevo" onClose={() => setMostrarAlta(false)}>
          <AlumnoForm
            onGuardado={(alumno) => {
              setMostrarAlta(false);
              onVerAlumno(alumno.id);
            }}
            onCancelar={() => setMostrarAlta(false)}
          />
        </Modal>
      )}
    </div>
  );
}
