const { contextBridge, ipcRenderer } = require('electron');

function invoke(channel) {
  return (...args) => ipcRenderer.invoke(channel, ...args);
}

contextBridge.exposeInMainWorld('api', {
  alumnos: {
    listar: invoke('alumnos:listar'),
    buscarPorDni: invoke('alumnos:buscarPorDni'),
    obtener: invoke('alumnos:obtener'),
    crear: invoke('alumnos:crear'),
    actualizar: invoke('alumnos:actualizar'),
    eliminar: invoke('alumnos:eliminar'),
  },
  planes: {
    listar: invoke('planes:listar'),
    crear: invoke('planes:crear'),
    actualizar: invoke('planes:actualizar'),
  },
  actividades: {
    listar: invoke('actividades:listar'),
    crear: invoke('actividades:crear'),
    actualizar: invoke('actividades:actualizar'),
  },
  pagos: {
    registrar: invoke('pagos:registrar'),
  },
  asistencias: {
    estadoParaAsistencia: invoke('asistencias:estado'),
    registrar: invoke('asistencias:registrar'),
  },
  recuperaciones: {
    registrar: invoke('recuperaciones:registrar'),
  },
  historial: {
    deAlumno: invoke('historial:deAlumno'),
  },
  vencimientos: invoke('vencimientos:listar'),
  calendario: {
    asistenciasPorFecha: invoke('calendario:asistenciasPorFecha'),
    diasConAsistencias: invoke('calendario:diasConAsistencias'),
  },
  reportes: {
    ingresos: invoke('reportes:ingresos'),
  },
});
