# El Perro Team Club Fitness — Gestión de Gimnasio

Aplicación de escritorio para que el entrenador administre alumnos, planes,
membresías, pagos, asistencias y clases recuperadas del gimnasio. Funciona
100% offline: no depende de internet ni de un servidor externo.

## Funcionalidades

- **Alumnos**: alta, edición, búsqueda por DNI/nombre, ficha con historial completo.
- **Planes**: cantidad de clases y precio, se pueden editar o eliminar.
- **Actividades**: cronograma de clases (día y horario), con control de que dos
  actividades no compartan el mismo bloque horario (salvo las personalizadas).
- **Asistencia**: se registra por DNI, a mano o con un lector USB de QR/código
  de barras. Valida membresía vigente y clases disponibles, y confirma contra
  la actividad que corresponde según el horario.
- **Membresías y pagos**: cada pago genera una nueva membresía con vencimiento
  automático a un mes calendario. Permite cargar alumnos que ya venían pagando
  antes de usar el sistema, con su fecha de vencimiento real.
- **Clases recuperadas**: registro y traslado a la siguiente membresía si no
  se llegan a usar.
- **Calendario**: qué alumnos asistieron cada día.
- **Vencimientos**: membresías vencidas o próximas a vencer.
- **Reportes de ingresos**: totales semanales, mensuales y anuales.
- **Carnet con QR**: genera e imprime un carnet por alumno para usar con el
  lector de código de barras/QR.
- **Copia de seguridad**: guarda una copia del archivo de datos donde se
  elija (pendrive, nube, etc.).

## Tecnologías

- [Electron](https://www.electronjs.org/) — aplicación de escritorio.
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — interfaz.
- [sql.js](https://sql.js.org/) (SQLite compilado a WebAssembly) — base de
  datos local, sin instalación ni compilación nativa.
- Git / GitHub.

## Cómo correrla en desarrollo

```bash
cd frontend
npm install
npm run dev
```

Levanta el servidor de Vite y abre la ventana de Electron.

## Estado

🚧 En desarrollo
