const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
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

  ipcMain.handle('planes:listar', wrap((soloActivos) => db.listarPlanes(soloActivos)));
  ipcMain.handle('planes:crear', wrap((datos) => db.crearPlan(datos)));
  ipcMain.handle('planes:actualizar', wrap((id, datos) => db.actualizarPlan(id, datos)));

  ipcMain.handle('pagos:registrar', wrap((datos) => db.registrarPago(datos)));

  ipcMain.handle('asistencias:estado', wrap((dni) => db.estadoParaAsistencia(dni)));
  ipcMain.handle('asistencias:registrar', wrap((dni) => db.registrarAsistencia(dni)));

  ipcMain.handle('recuperaciones:registrar', wrap((datos) => db.registrarRecuperacion(datos)));

  ipcMain.handle('historial:deAlumno', wrap((id) => db.historialAlumno(id)));

  ipcMain.handle('vencimientos:listar', wrap(() => db.vencimientos()));
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
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
