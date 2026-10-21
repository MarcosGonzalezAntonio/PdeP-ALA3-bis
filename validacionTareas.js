const traductor = require("./traductor");
const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

function esFechaValida(valor) {
  if (typeof valor !== "string") {
    return false;
  }
  const partes = FORMATO_FECHA.exec(valor);
  if (partes === null) {
    return false;
  }
  const [anio, mes, dia, hora, minuto, segundo] = partes.slice(1).map(Number);
  const fecha = new Date(anio, mes - 1, dia, hora, minuto, segundo);

  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia &&
    fecha.getHours() === hora &&
    fecha.getMinutes() === minuto &&
    fecha.getSeconds() === segundo
  );
}

// Devuelve un array con los motivos por los que la tarea es inválida.
// Array vacío = tarea válida.
function validarTareaArchivo(objeto) {
  const motivos = [];

  // Si ni siquiera es un objeto, no tiene sentido seguir revisando campos.
  if (objeto === null || typeof objeto !== "object" || Array.isArray(objeto)) {
    return ["no es un objeto"];
  }

  // Campos obligatorios: titulo y creacion.
  if (typeof objeto.titulo !== "string" || objeto.titulo.trim() === "") {
    motivos.push("falta el título (obligatorio)");
  }
  if (objeto.creacion === undefined || objeto.creacion === null) {
    motivos.push("falta la fecha de creación (obligatoria)");
  } else if (!esFechaValida(objeto.creacion)) {
    motivos.push("fecha de creación inválida");
  }

  // Campos opcionales: pueden ser null, pero si vienen deben ser válidos.
  if (objeto.descripcion !== null && typeof objeto.descripcion !== "string") {
    motivos.push("descripción inválida (debe ser texto o null)");
  }
  if (objeto.ultimaEdicion !== null && !esFechaValida(objeto.ultimaEdicion)) {
    motivos.push("fecha de última edición inválida");
  }
  if (objeto.vencimiento !== null && !esFechaValida(objeto.vencimiento)) {
    motivos.push("fecha de vencimiento inválida");
  }

  // Estado: uno de los cuatro valores del archivo.
  // hasOwnProperty evita que "constructor" o "toString" pasen como estados.
  if (
    !Object.prototype.hasOwnProperty.call(
      traductor.ESTADO_ARCHIVO_A_INTERNO,
      objeto.estado
    )
  ) {
    motivos.push(`estado inválido (${JSON.stringify(objeto.estado)})`);
  }

  // Dificultad: el número 1, 2 o 3 (no el texto "1").
  if (![1, 2, 3].includes(objeto.dificultad)) {
    motivos.push(`dificultad inválida (${JSON.stringify(objeto.dificultad)})`);
  }

  return motivos;
}

module.exports = {
  validarTareaArchivo,
};
