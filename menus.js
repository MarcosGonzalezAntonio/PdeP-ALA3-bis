const tareas = require("./tareas");
const validaciones = require("./validaciones");
const vista = require("./vista");
const persistencia = require("./persistencia");

// Guarda toda la lista en tasks.json e informa el resultado.
// Es async porque la escritura del archivo es asincrónica: quien la llame
// tiene que usar await para no seguir antes de que termine de guardarse.
async function guardarYAvisar() {
  const seGuardo = await persistencia.guardarTareas(
    persistencia.RUTA_ARCHIVO,
    tareas.obtenerTareas()
  );

  if (seGuardo) {
    console.log("\n✅ Tarea guardada correctamente en tasks.json.");
  } else {
    console.log("⚠️  El cambio quedó en memoria pero NO se guardó en el archivo.");
  }
}

// ----- MENÚ PRINCIPAL -----
// async porque llama (con await) a menús que terminan guardando en el archivo.
async function menuPrincipal() {
  let salir = false;

  while (!salir) {
    console.log("\n===== MENÚ PRINCIPAL =====");
    console.log("1) Ver mis tareas");
    console.log("2) Buscar una tarea");
    console.log("3) Agregar una tarea");
    console.log("0) Salir");

    const opcion = validaciones.leerOpcion("Elegí una opción: ", [0, 1, 2, 3]);

    if (opcion === 1) {
      await menuVerMisTareas();
    } else if (opcion === 2) {
      await menuBuscar();
    } else if (opcion === 3) {
      await menuAgregar();
    } else {
      salir = true;
      console.log("\n¡Hasta luego!");
    }
  }
}

// ----- VER MIS TAREAS -----
async function menuVerMisTareas() {
  let volver = false;

  while (!volver) {
    console.log("\n----- VER MIS TAREAS -----");
    console.log("1) Ver todas");
    console.log("2) Ver solo Pendientes");
    console.log("3) Ver solo En Curso");
    console.log("4) Ver solo Terminadas");
    console.log("0) Volver al menú anterior");

    const opcion = validaciones.leerOpcion("Elegí una opción: ", [0, 1, 2, 3, 4]);

    if (opcion === 1) {
      await mostrarListado(tareas.obtenerTareas());
    } else if (opcion === 2) {
      await mostrarListado(tareas.filtrarPorEstado("Pendiente"));
    } else if (opcion === 3) {
      await mostrarListado(tareas.filtrarPorEstado("En Curso"));
    } else if (opcion === 4) {
      await mostrarListado(tareas.filtrarPorEstado("Terminada"));
    } else {
      volver = true;
    }
  }
}

// ----- LISTADO DE TAREAS -----
async function mostrarListado(listaOriginal) {
  if (listaOriginal.length === 0) {
    console.log("\nNo hay tareas para mostrar.");
    return;
  }

  let listaActual = listaOriginal;
  let volver = false;

  while (!volver) {
    console.log("\n----- LISTADO DE TAREAS -----");
    vista.imprimirListado(listaActual);
    console.log("\nElegí el número de una tarea para ver su detalle.");
    console.log("O) Ordenar el listado");
    console.log("0) Volver al menú anterior");

    const entrada = validaciones.leerLinea("Opción: ");

    if (entrada === "0") {
      volver = true;
    } else if (entrada.toUpperCase() === "O") {
      listaActual = elegirOrden(listaActual);
    } else {
      const numero = parseInt(entrada, 10);

      if (!isNaN(numero) && numero >= 1 && numero <= listaActual.length) {
        await menuDetalle(listaActual[numero - 1]);
      } else {
        console.log("Opción inválida.");
      }
    }
  }
}

function elegirOrden(lista) {
  console.log("\n¿Cómo querés ordenar el listado?");
  console.log("1) Alfabético (título)");
  console.log("2) Vencimiento");
  console.log("3) Fecha de creación");

  const opcion = validaciones.leerOpcion("Elegí una opción: ", [1, 2, 3]);

  if (opcion === 1) return tareas.ordenarTareas(lista, "alfabetico");
  if (opcion === 2) return tareas.ordenarTareas(lista, "vencimiento");
  return tareas.ordenarTareas(lista, "creacion");
}

// ----- DETALLE DE TAREA -----
async function menuDetalle(tarea) {
  let volver = false;

  while (!volver) {
    vista.mostrarDetalleTarea(tarea);
    console.log("\nE) Editar esta tarea");
    console.log("0) Volver al menú anterior");

    const entrada = validaciones.leerLinea("Opción: ");

    if (entrada === "0") {
      volver = true;
    } else if (entrada.toUpperCase() === "E") {
      await menuEdicion(tarea);
    } else {
      console.log("Opción inválida.");
    }
  }
}

// Imprime las opciones numeradas de Estado (1 a 4).
function mostrarOpcionesEstado() {
  tareas.ESTADOS.forEach((estado, indice) => {
    console.log(`${indice + 1}) ${estado}`);
  });
}

// Imprime las opciones numeradas de Dificultad (1 a 3).
function mostrarOpcionesDificultad() {
  tareas.DIFICULTADES.forEach((dificultad, indice) => {
    console.log(`${indice + 1}) ${dificultad}`);
  });
}

// ----- EDICIÓN DE UNA TAREA -----
async function menuEdicion(tarea) {
  console.log("\n----- EDITAR TAREA -----");
  console.log("Enter para mantener el valor actual. Un espacio borra el dato.");

  const nuevoTitulo = validaciones.leerTexto(
    `Título (actual: ${tarea.titulo}): `,
    100,
    true,
    tarea.titulo
  );

  const nuevaDescripcion = validaciones.leerTexto(
    `Descripción (actual: ${vista.formatearTexto(tarea.descripcion)}): `,
    500,
    false,
    tarea.descripcion
  );

  console.log("\nEstado:");
  mostrarOpcionesEstado();
  const indiceEstadoActual = tareas.ESTADOS.indexOf(tarea.estado) + 1;
  const opcionEstado = validaciones.leerOpcion(
    `Elegí un número (actual: ${tarea.estado}): `,
    [1, 2, 3, 4],
    indiceEstadoActual
  );

  console.log("\nDificultad:");
  mostrarOpcionesDificultad();
  const indiceDificultadActual = tareas.DIFICULTADES.indexOf(tarea.dificultad) + 1;
  const opcionDificultad = validaciones.leerOpcion(
    `Elegí un número (actual: ${tarea.dificultad}): `,
    [1, 2, 3],
    indiceDificultadActual
  );

  const nuevoVencimiento = validaciones.leerFecha(
    `Vencimiento (actual: ${vista.formatearFecha(tarea.vencimiento)}, dd/mm/aaaa): `,
    tarea.vencimiento
  );

  tareas.editarTarea(tarea, {
    titulo: nuevoTitulo,
    descripcion: nuevaDescripcion,
    estado: tareas.ESTADOS[opcionEstado - 1],
    dificultad: tareas.DIFICULTADES[opcionDificultad - 1],
    vencimiento: nuevoVencimiento,
  });

  // await: esperamos a que se escriba el archivo antes de volver al menú.
  await guardarYAvisar();
}

// ----- BUSCAR UNA TAREA -----
async function menuBuscar() {
  console.log("\n----- BUSCAR UNA TAREA -----");
  const clave = validaciones.leerLinea("Ingresá una palabra para buscar en el título: ");

  const resultados = tareas.buscarPorTitulo(clave);

  if (resultados.length === 0) {
    console.log("\nNo se encontraron tareas con esa palabra.");
    return;
  }

  await mostrarListado(resultados);
}

// ----- AGREGAR UNA TAREA -----
async function menuAgregar() {
  console.log("\n----- AGREGAR UNA TAREA -----");

  const titulo = validaciones.leerTexto(
    "Título (obligatorio, hasta 100 caracteres): ",
    100,
    true
  );

  const descripcion = validaciones.leerTexto(
    "Descripción (opcional, hasta 500 caracteres): ",
    500,
    false
  );

  console.log("\nEstado:");
  mostrarOpcionesEstado();
  const opcionEstado = validaciones.leerOpcion(
    "Elegí un número (Enter = Pendiente): ",
    [1, 2, 3, 4],
    1
  );

  console.log("\nDificultad:");
  mostrarOpcionesDificultad();
  const opcionDificultad = validaciones.leerOpcion(
    "Elegí un número (Enter = Fácil): ",
    [1, 2, 3],
    1
  );

  const vencimiento = validaciones.leerFecha(
    "Vencimiento (dd/mm/aaaa, opcional, Enter para no cargar): "
  );

  tareas.crearTarea({
    titulo: titulo,
    descripcion: descripcion,
    estado: tareas.ESTADOS[opcionEstado - 1],
    dificultad: tareas.DIFICULTADES[opcionDificultad - 1],
    vencimiento: vencimiento,
  });

  // await: esperamos a que se escriba el archivo antes de volver al menú.
  await guardarYAvisar();
}

module.exports = {
  menuPrincipal,
};
