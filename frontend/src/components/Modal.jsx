import React from 'react';

export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}
