// persistencia.js
// Único módulo que toca el disco. Usa fs/promises con async/await.
//
// Por qué async/await acá y no en prompt-sync:
//   - Leer/escribir un archivo es una operación LENTA que no depende de nosotros.
//     Con fs/promises, `await` le dice a Node "esperá a que termine, y mientras
//     tanto podés atender otras cosas". La función queda "en pausa" sin bloquear.
//   - prompt-sync, en cambio, es SINCRÓNICO: frena todo el programa hasta que
//     el usuario aprieta Enter, y devuelve el texto directamente (sin promesa).
//     Por eso no se mezcla con la lectura del archivo: son dos mundos distintos.
//     Nunca hay una lectura de archivo "en vuelo" mientras se espera al usuario,
//     porque siempre usamos `await` para terminar de leer/escribir ANTES de volver
//     a pedir datos por consola. Conviven bien, pero no se combinan en una misma
//     operación.

const fs = require("fs/promises");
const path = require("path");
const traductor = require("./traductor");
const validacionTareas = require("./validacionTareas");

// Ruta del archivo de datos, siempre al lado de este módulo (en la raíz del
// proyecto), sin importar desde qué carpeta se ejecute `npm start`.
const RUTA_ARCHIVO = path.join(__dirname, "tasks.json");

// Lee el archivo y devuelve { tareas, descartadas, archivoNuevo }.
//   tareas:       tareas válidas, ya traducidas al modelo interno
//   descartadas:  [{ posicion, titulo, motivos }] de las inválidas
//   archivoNuevo: true si el archivo no existía (se arranca con lista vacía)
// Si el archivo está mal formateado, lanza un Error con un mensaje claro.
async function cargarTareas(ruta) {
  let texto;

  try {
    // await: esperamos a que Node termine de leer el archivo del disco.
    texto = await fs.readFile(ruta, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      // ENOENT = "no such file or directory": no es grave, arrancamos vacíos.
      return { tareas: [], descartadas: [], archivoNuevo: true };
    }
    throw new Error(`No se pudo leer "${ruta}": ${error.message}`);
  }

  // Si el archivo trae BOM (marca invisible al inicio), JSON.parse falla.
  texto = texto.replace(/^﻿/, "");

  let datos;
  try {
    datos = JSON.parse(texto);
  } catch (error) {
    throw new Error(
      `El archivo "${ruta}" no tiene un JSON válido (${error.message}).`
    );
  }

  if (!Array.isArray(datos)) {
    throw new Error(
      `El archivo "${ruta}" debe contener un array de tareas en su nivel principal.`
    );
  }

  const tareas = [];
  const descartadas = [];

  datos.forEach((objeto, indice) => {
    const motivos = validacionTareas.validarTareaArchivo(objeto);

    if (motivos.length === 0) {
      tareas.push(traductor.deArchivo(objeto));
    } else {
      // Una tarea inválida NO corta la carga: se descarta y se informa.
      descartadas.push({
        posicion: indice + 1,
        titulo: objeto && typeof objeto.titulo === "string" ? objeto.titulo : null,
        motivos: motivos,
      });
    }
  });

  return { tareas, descartadas, archivoNuevo: false };
}

// Guarda la lista completa (modelo interno) en el archivo, en formato original.
// Devuelve true si se guardó bien y false si falló (ya informó el error).
// No lanza el error hacia arriba para que un fallo de disco no cierre la app.
async function guardarTareas(ruta, listaDeTareas) {
  try {
    // Traducimos cada tarea al formato del archivo antes de serializar.
    const paraArchivo = listaDeTareas.map(traductor.aArchivo);
    // JSON.stringify con 2 espacios de indentación para que sea legible.
    const texto = JSON.stringify(paraArchivo, null, 2);

    // await: esperamos a que la escritura termine antes de seguir.
    await fs.writeFile(ruta, texto, "utf8");
    return true;
  } catch (error) {
    console.log(`\n❌ No se pudo guardar en "${ruta}": ${error.message}`);
    return false;
  }
}

module.exports = {
  RUTA_ARCHIVO,
  cargarTareas,
  guardarTareas,
};
