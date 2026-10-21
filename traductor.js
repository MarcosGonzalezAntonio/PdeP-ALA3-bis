// traductor.js
// Traduce entre el formato del archivo tasks.json y el modelo interno de la app.
//
//   Archivo (tasks.json)            Modelo interno (app)
//   estado: "PENDING"            <-> "Pendiente"
//   dificultad: 1                <-> "Fácil"
//   fechas: "2025-10-01T09:00:00" <-> objeto Date
//   descripcion: null            <-> ""
//
// Son funciones PURAS: no leen ni escriben archivos, solo convierten datos.
// Así la lectura/escritura (persistencia.js) queda separada de la traducción.

// Tablas de equivalencia. Al ser objetos, se pueden usar en los dos sentidos.
const ESTADO_ARCHIVO_A_INTERNO = {
  PENDING: "Pendiente",
  "IN-PROGRESS": "En Curso",
  FINISHED: "Terminada",
  CANCELED: "Cancelada",
};

const DIFICULTAD_ARCHIVO_A_INTERNO = {
  1: "Fácil",
  2: "Medio",
  3: "Difícil",
};

// Armamos las tablas inversas recorriendo las originales (clave <-> valor).
const ESTADO_INTERNO_A_ARCHIVO = invertir(ESTADO_ARCHIVO_A_INTERNO);
const DIFICULTAD_INTERNO_A_ARCHIVO = invertir(DIFICULTAD_ARCHIVO_A_INTERNO);

function invertir(tabla) {
  const inversa = {};
  Object.keys(tabla).forEach((clave) => {
    inversa[tabla[clave]] = clave;
  });
  return inversa;
}

function pad(numero) {
  return numero.toString().padStart(2, "0");
}

// "2025-10-01T09:00:00" -> Date.
// Sin "Z" ni desfase, JavaScript interpreta esta forma como hora LOCAL,
// que es justo lo que usa el resto de la app (vista.js usa getHours(), etc.).
function textoADate(texto) {
  if (texto === null || texto === undefined) {
    return null;
  }
  return new Date(texto);
}

// Date -> "aaaa-mm-ddThh:mm:ss" en hora local, sin "Z".
// No usamos toISOString() porque convierte a UTC y agrega la "Z",
// y el archivo original no tiene zona horaria.
function dateATexto(fecha) {
  if (fecha === null || fecha === undefined) {
    return null;
  }
  return (
    `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}` +
    `T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`
  );
}

// Objeto del archivo (ya validado) -> tarea del modelo interno.
function deArchivo(objeto) {
  return {
    titulo: objeto.titulo,
    // La app trabaja con "" cuando no hay descripción; el archivo usa null.
    descripcion: objeto.descripcion === null ? "" : objeto.descripcion,
    estado: ESTADO_ARCHIVO_A_INTERNO[objeto.estado],
    dificultad: DIFICULTAD_ARCHIVO_A_INTERNO[objeto.dificultad],
    vencimiento: textoADate(objeto.vencimiento),
    creacion: textoADate(objeto.creacion),
    ultimaEdicion: textoADate(objeto.ultimaEdicion),
  };
}

// Tarea del modelo interno -> objeto con el formato exacto del archivo.
function aArchivo(tarea) {
  return {
    titulo: tarea.titulo,
    // OJO: solo la cadena VACÍA ("") vuelve a null. Esto NO es un descuido:
    // en el archivo original "sin descripción" se representa con null, y la
    // app usa "" para lo mismo. Para que el archivo quede idéntico al original
    // hay que deshacer esa conversión al guardar.
    // Se compara con === "" (y no con trim()) a propósito: un texto con solo
    // espacios es un dato que escribió el usuario y se conserva tal cual.
    descripcion: tarea.descripcion === "" ? null : tarea.descripcion,
    estado: ESTADO_INTERNO_A_ARCHIVO[tarea.estado],
    creacion: dateATexto(tarea.creacion),
    ultimaEdicion: dateATexto(tarea.ultimaEdicion),
    vencimiento: dateATexto(tarea.vencimiento),
    dificultad: Number(DIFICULTAD_INTERNO_A_ARCHIVO[tarea.dificultad]),
  };
}

module.exports = {
  ESTADO_ARCHIVO_A_INTERNO,
  DIFICULTAD_ARCHIVO_A_INTERNO,
  deArchivo,
  aArchivo,
};
