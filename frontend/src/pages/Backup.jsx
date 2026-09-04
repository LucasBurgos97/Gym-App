import React, { useState } from 'react';
import Alert from '../components/Alert.jsx';

export default function Backup() {
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState(null); // { ok: true, ruta } | { ok: false, error } | null

  async function hacerBackup() {
    setGuardando(true);
    setResultado(null);
    const res = await window.api.respaldo.crear();
    setGuardando(false);
    if (!res.ok) {
      setResultado({ ok: false, error: res.error });
      return;
    }
    if (res.data.cancelado) return;
    setResultado({ ok: true, ruta: res.data.ruta });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Copia de seguridad</h1>
        <p>Toda la información del gimnasio vive en un solo archivo en esta computadora. Hacé una copia con frecuencia — a un pendrive, Google Drive, etc. — para no perderla si algo le pasa a la PC.</p>
      </div>

      <div className="card">
        <button className="btn btn-lg" onClick={hacerBackup} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar copia de seguridad ahora'}
        </button>

        {resultado?.ok && (
          <Alert type="success">Copia guardada correctamente en: {resultado.ruta}</Alert>
        )}
        {resultado && !resultado.ok && <Alert>{resultado.error}</Alert>}

        <p className="muted" style={{ marginTop: 16 }}>
          Se te va a pedir elegir dónde guardar el archivo. Si algún día necesitás restaurar una
          copia, reemplazá el archivo de datos de la app por ese archivo (pedime ayuda si llega
          ese momento).
        </p>
      </div>
    </div>
  );
}
