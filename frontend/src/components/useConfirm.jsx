import React, { useCallback, useState } from 'react';
import Modal from './Modal.jsx';

// Reemplaza window.confirm/alert: en Electron/Windows, después de cerrar un
// diálogo nativo la ventana puede quedar sin foco de teclado hasta que el
// usuario hace clic de nuevo, y los campos parecen "no dejar escribir". Este
// diálogo es parte de la misma página, así que no tiene ese problema.
export default function useConfirm() {
  const [pedido, setPedido] = useState(null); // { mensaje, resolve } | null

  const confirmar = useCallback((mensaje) => {
    return new Promise((resolve) => setPedido({ mensaje, resolve }));
  }, []);

  function responder(valor) {
    pedido?.resolve(valor);
    setPedido(null);
  }

  const dialogo = pedido && (
    <Modal title="Confirmar" onClose={() => responder(false)}>
      <p style={{ marginTop: 0 }}>{pedido.mensaje}</p>
      <div className="form-actions">
        <button className="btn btn-danger" onClick={() => responder(true)}>Confirmar</button>
        <button type="button" className="btn btn-secondary" onClick={() => responder(false)}>Cancelar</button>
      </div>
    </Modal>
  );

  return [confirmar, dialogo];
}
