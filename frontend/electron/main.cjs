const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./db.cjs');

const isDev = !app.isPackaged;

function registerHandlers() {
  const wrap = (fn) => async (_evt, ...args) => {
    try {
      return { ok: true, data: await fn(...args) };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  };

  ipcMain.handle('alumnos:listar', wrap((filtro) => db.listarAlumnos(filtro)));
  ipcMain.handle('alumnos:buscarPorDni', wrap((dni) => db.buscarAlumnoPorDni(dni)));
  ipcMain.handle('alumnos:obtener', wrap((id) => db.obtenerAlumno(id)));
  ipcMain.handle('alumnos:crear', wrap((datos) => db.crearAlumno(datos)));
  ipcMain.handle('alumnos:actualizar', wrap((id, datos) => db.actualizarAlumno(id, datos)));
  ipcMain.handle('alumnos:eliminar', wrap((id) => db.eliminarAlumno(id)));

  ipcMain.handle('planes:listar', wrap((soloActivos) => db.listarPlanes(soloActivos)));
  ipcMain.handle('planes:crear', wrap((datos) => db.crearPlan(datos)));
  ipcMain.handle('planes:actualizar', wrap((id, datos) => db.actualizarPlan(id, datos)));
  ipcMain.handle('planes:eliminar', wrap((id) => db.eliminarPlan(id)));

  ipcMain.handle('actividades:listar', wrap((soloActivas) => db.listarActividades(soloActivas)));
  ipcMain.handle('actividades:crear', wrap((datos) => db.crearActividad(datos)));
  ipcMain.handle('actividades:actualizar', wrap((id, datos) => db.actualizarActividad(id, datos)));
  ipcMain.handle('actividades:eliminar', wrap((id) => db.eliminarActividad(id)));

  ipcMain.handle('pagos:registrar', wrap((datos) => db.registrarPago(datos)));
  ipcMain.handle('pagos:actualizarImporte', wrap((id, importe) => db.actualizarImportePago(id, importe)));
  ipcMain.handle('pagos:eliminar', wrap((id) => db.eliminarPago(id)));

  ipcMain.handle('asistencias:estado', wrap((dni) => db.estadoParaAsistencia(dni)));
  ipcMain.handle('asistencias:registrar', wrap((dni, actividad_id, horario) => db.registrarAsistencia(dni, actividad_id, horario)));
  ipcMain.handle('asistencias:eliminar', wrap((id) => db.eliminarAsistencia(id)));

  ipcMain.handle('recuperaciones:registrar', wrap((datos) => db.registrarRecuperacion(datos)));

  ipcMain.handle('historial:deAlumno', wrap((id) => db.historialAlumno(id)));

  ipcMain.handle('vencimientos:listar', wrap(() => db.vencimientos()));

  ipcMain.handle('calendario:asistenciasPorFecha', wrap((fecha) => db.asistenciasPorFecha(fecha)));
  ipcMain.handle('calendario:diasConAsistencias', wrap((anio, mes) => db.diasConAsistenciasEnMes(anio, mes)));

  ipcMain.handle('reportes:ingresos', wrap((tipo, referencia) => db.reporteIngresos(tipo, referencia)));

  // Abre una página HTML standalone (con el QR ya embebido) en el navegador
  // del sistema, para que el usuario use su propio diálogo de impresión —
  // con vista previa y control de escala/tamaño — en vez del que ofrece Electron.
  ipcMain.handle('carnet:abrirImpresion', wrap(async (html, nombreArchivo) => {
    const filePath = path.join(app.getPath('temp'), nombreArchivo);
    fs.writeFileSync(filePath, html, 'utf-8');
    await shell.openPath(filePath);
    return { ruta: filePath };
  }));

  ipcMain.handle('respaldo:crear', wrap(async () => {
    const win = BrowserWindow.getFocusedWindow();
    const fecha = new Date().toISOString().slice(0, 10);
    const result = await dialog.showSaveDialog(win, {
      title: 'Guardar copia de seguridad',
      defaultPath: `gym-backup-${fecha}.sqlite`,
      filters: [{ name: 'Base de datos', extensions: ['sqlite'] }],
    });
    if (result.canceled || !result.filePath) return { cancelado: true };
    const origen = db.guardarAhora();
    fs.copyFileSync(origen, result.filePath);
    return { cancelado: false, ruta: result.filePath };
  }));
}

async function createWindow() {
  await db.init(app.getPath('userData'));
  registerHandlers();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'src', 'assets', 'perroteam.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      console.log(`[renderer] ${message} (${sourceId}:${line})`);
    });
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
