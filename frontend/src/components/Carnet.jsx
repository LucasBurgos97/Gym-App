import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Modal from './Modal.jsx';
import logoUrl from '../assets/logo.png';

export default function Carnet({ alumno, onClose }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(alumno.dni, { width: 320, margin: 2 })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [alumno.dni]);

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

      <div className="form-actions">
        <button className="btn" onClick={() => window.print()}>Imprimir carnet</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}
