import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Modal from './Modal.jsx';
import logoUrl from '../assets/logo.png';

// Página HTML standalone con el QR ya embebido, del tamaño exacto para pegar
// en una tarjeta física (4,5 x 4,5 cm). Sin nombre ni DNI: una vez impreso y
// entregado, ya se sabe a quién le corresponde ese carnet.
function paginaImprimible(qrUrl) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>QR para imprimir</title>
<style>
  @page { margin: 0; }
  html, body {
    margin: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  img {
    width: 4.5cm;
    height: 4.5cm;
  }
</style>
</head>
<body>
  <img src="${qrUrl}" alt="Código QR">
</body>
</html>`;
}

export default function Carnet({ alumno, onClose }) {
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    QRCode.toDataURL(alumno.dni, { width: 320, margin: 2 })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [alumno.dni]);

  async function abrirParaImprimir() {
    setError('');
    const res = await window.api.carnet.abrirImpresion(paginaImprimible(qrUrl), `qr-${alumno.dni}.html`);
    if (!res.ok) setError(res.error);
  }

  return (
    <Modal title="Carnet con QR" onClose={onClose}>
      <div className="carnet-imprimible">
        <img src={logoUrl} alt="El Perro Team Club Fitness" className="carnet-logo" />
        <h3 className="carnet-nombre">{alumno.nombre} {alumno.apellido}</h3>
        {qrUrl ? (
          <img src={qrUrl} alt={`Código QR de ${alumno.dni}`} className="carnet-qr" />
        ) : (
          <p className="muted">Generando QR...</p>
        )}
        <p className="carnet-dni">DNI {alumno.dni}</p>
      </div>

      <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>
        Al escanear este QR con el lector, se ingresa el DNI automáticamente en "Registrar
        asistencia" — como si se tipeara a mano.
      </p>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

      <div className="form-actions">
        <button className="btn" onClick={abrirParaImprimir} disabled={!qrUrl}>
          Abrir QR para imprimir
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
      <p className="muted" style={{ marginTop: 8, fontSize: 12.5 }}>
        Se abre en tu navegador, ya del tamaño (4,5 x 4,5 cm) para pegar en una tarjeta. Desde ahí
        usá Ctrl+P para imprimir o guardar como PDF — el navegador te deja ver la vista previa y
        ajustar tamaño/escala vos mismo.
      </p>
    </Modal>
  );
}
