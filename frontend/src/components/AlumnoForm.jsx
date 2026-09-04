import React, { useState } from 'react';
import Alert from './Alert.jsx';

const SOLO_DIGITOS = /[^0-9]/g;
const SOLO_LETRAS = /[^A-Za-zÀ-ÿ\s]/g;

export default function AlumnoForm({ initial, dniInicial, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    dni: initial?.dni ?? dniInicial ?? '',
    nombre: initial?.nombre ?? '',
    apellido: initial?.apellido ?? '',
    telefono: initial?.telefono ?? '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      const res = initial
        ? await window.api.alumnos.actualizar(initial.id, form)
        : await window.api.alumnos.crear(form);
      if (!res.ok) throw new Error(res.error);
      onGuardado(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar}>
      <Alert>{error}</Alert>
      <div className="form-grid">
        <div className="field">
          <label>DNI</label>
          <input
            value={form.dni}
            disabled={!!initial}
            onChange={(e) => set('dni', e.target.value.replace(SOLO_DIGITOS, '').slice(0, 8))}
            inputMode="numeric"
            required
          />
        </div>
        <div className="field" />
        <div className="field">
          <label>Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value.replace(SOLO_LETRAS, ''))}
            required
          />
        </div>
        <div className="field">
          <label>Apellido</label>
          <input
            value={form.apellido}
            onChange={(e) => set('apellido', e.target.value.replace(SOLO_LETRAS, ''))}
            required
          />
        </div>
        <div className="field">
          <label>Teléfono (opcional)</label>
          <input
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value.replace(SOLO_DIGITOS, '').slice(0, 15))}
            inputMode="numeric"
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn" disabled={guardando}>
          {initial ? 'Guardar cambios' : 'Registrar alumno'}
        </button>
        {onCancelar && (
          <button type="button" className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
