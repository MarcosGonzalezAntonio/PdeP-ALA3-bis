const prompt = require("prompt-sync")();


function leerOpcion(mensaje, opcionesValidas, valorPorDefecto) {
  while (true) {
    const entrada = prompt(mensaje);

    if (entrada.trim() === "" && valorPorDefecto !== undefined) {
      return valorPorDefecto;
    }

    const numero = parseInt(entrada, 10);

    if (!isNaN(numero) && opcionesValidas.includes(numero)) {
      return numero;
    }

    console.log("Opción inválida. Intentá de nuevo.");
  }
}


function leerTexto(mensaje, maxLength, obligatorio, valorAnterior) {
  while (true) {
    const entrada = prompt(mensaje);

    // Modo edición y no se tocó nada: se mantiene el valor que ya tenía.
    if (entrada === "" && valorAnterior !== undefined) {
      return valorAnterior;
    }

    if (entrada.trim() === "") {
      if (obligatorio) {
        console.log("Este dato es obligatorio, no puede quedar vacío.");
        continue;
      }
      return "";
    }

    if (entrada.length > maxLength) {
      console.log(`El texto no puede superar los ${maxLength} caracteres.`);
      continue;
    }

    return entrada.trim();
  }
}

function parsearFecha(texto) {
  const partes = texto.split("/");
  if (partes.length !== 3) {
    return null;
  }

  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const anio = parseInt(partes[2], 10);

  if (isNaN(dia) || isNaN(mes) || isNaN(anio)) {
    return null;
  }
  if (mes < 1 || mes > 12) {
    return null;
  }

  const fecha = new Date(anio, mes - 1, dia);

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  return fecha;
}

function leerFecha(mensaje, valorAnterior) {
  while (true) {
    const entrada = prompt(mensaje);

    if (entrada === "") {
      return valorAnterior !== undefined ? valorAnterior : null;
    }

    if (entrada.trim() === "") {
      return null;
    }

    const fecha = parsearFecha(entrada.trim());

    if (fecha === null) {
      console.log("Fecha inválida. Usá el formato dd/mm/aaaa.");
      continue;
    }

    return fecha;
  }
}

function leerLinea(mensaje) {
  return prompt(mensaje).trim();
}

module.exports = {
  leerOpcion,
  leerTexto,
  leerFecha,
  leerLinea,
};
