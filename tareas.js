
const ESTADOS = ["Pendiente", "En Curso", "Terminada", "Cancelada"];
const DIFICULTADES = ["Fácil", "Medio", "Difícil"];

let listaDeTareas = [];

function crearTarea(datos) {
  const ahora = new Date();

  const tarea = {
    titulo: datos.titulo,
    descripcion: datos.descripcion || "",
    estado: datos.estado || "Pendiente",
    dificultad: datos.dificultad || "Fácil",
    vencimiento: datos.vencimiento || null, 
    creacion: ahora,
    ultimaEdicion: ahora,
  };

  listaDeTareas.push(tarea);
  return tarea;
}

// Reemplaza la lista en memoria por las tareas cargadas desde el archivo.
// Se usa una sola vez, al iniciar la app (después de leer tasks.json).
function reemplazarTareas(nuevasTareas) {
  listaDeTareas = nuevasTareas;
}

// Devuelve el array completo de tareas.
function obtenerTareas() {
  return listaDeTareas;
}


function filtrarPorEstado(estado) {
  if (!estado) {
    return listaDeTareas;
  }
  return listaDeTareas.filter((tarea) => tarea.estado === estado);
}


function buscarPorTitulo(clave) {
  const claveNormalizada = clave.toLowerCase();
  return listaDeTareas.filter((tarea) =>
    tarea.titulo.toLowerCase().includes(claveNormalizada)
  );
}


function editarTarea(tarea, cambios) {
  if (cambios.titulo !== undefined) tarea.titulo = cambios.titulo;
  if (cambios.descripcion !== undefined) tarea.descripcion = cambios.descripcion;
  if (cambios.estado !== undefined) tarea.estado = cambios.estado;
  if (cambios.dificultad !== undefined) tarea.dificultad = cambios.dificultad;
  if (cambios.vencimiento !== undefined) tarea.vencimiento = cambios.vencimiento;

  tarea.ultimaEdicion = new Date();
}


function ordenarTareas(tareas, criterio) {
  const copia = tareas.slice();

  if (criterio === "alfabetico") {
    copia.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else if (criterio === "vencimiento") {
    copia.sort((a, b) => {
      if (!a.vencimiento && !b.vencimiento) return 0;
      if (!a.vencimiento) return 1;
      if (!b.vencimiento) return -1;
      return a.vencimiento - b.vencimiento;
    });
  } else if (criterio === "creacion") {
    copia.sort((a, b) => a.creacion - b.creacion);
  }

  return copia;
}

function cargarTareasDeEjemplo() {
  crearTarea({
    titulo: "Comprar ingredientes para la torta",
    descripcion: "Harina, huevos, azúcar y manteca para el cumple del sábado.",
    estado: "Pendiente",
    dificultad: "Fácil",
    vencimiento: new Date(2026, 8, 12), 
  });

  crearTarea({
    titulo: "Terminar informe de la facultad",
    descripcion: "Falta la conclusión y revisar la bibliografía.",
    estado: "En Curso",
    dificultad: "Difícil",
    vencimiento: new Date(2026, 8, 15),
  });

  crearTarea({
    titulo: "Pagar la factura de luz",
    descripcion: "",
    estado: "Terminada",
    dificultad: "Fácil",
    vencimiento: null,
  });

  crearTarea({
    titulo: "Organizar el escritorio",
    descripcion: "Tirar papeles viejos y acomodar los cables.",
    estado: "Cancelada",
    dificultad: "Medio",
    vencimiento: null,
  });
}

module.exports = {
  ESTADOS,
  DIFICULTADES,
  crearTarea,
  reemplazarTareas,
  obtenerTareas,
  filtrarPorEstado,
  buscarPorTitulo,
  editarTarea,
  ordenarTareas,
  cargarTareasDeEjemplo,
};
