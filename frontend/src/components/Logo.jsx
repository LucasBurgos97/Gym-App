import React from 'react';

// Emblema simple inspirado en la identidad de marca (rojo sobre negro).
// No es un calco del isotipo original del cliente: es un placeholder liviano
// para el sidebar. Se puede reemplazar por el logo real en PNG/SVG cuando
// se disponga del archivo.
export default function Logo({ size = 34 }) {
  return (
    <svg
      className="sidebar-logo"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 8 L25 24 L9 27 Z" fill="#d81920" />
      <path d="M50 8 L55 27 L39 24 Z" fill="#d81920" />
      <rect x="11" y="19" width="42" height="35" rx="17" fill="#d81920" />
      <circle cx="24" cy="36" r="3.4" fill="#0d0d0d" />
      <circle cx="40" cy="36" r="3.4" fill="#0d0d0d" />
      <path
        d="M25 45 Q32 52 39 45"
        stroke="#0d0d0d"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
