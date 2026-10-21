const tareas = require("./tareas");
const menus = require("./menus");
const persistencia = require("./persistencia");

// Muestra cuántas tareas se cargaron y cuáles se descartaron (y por qué).
function mostrarResumenDeCarga(resultado) {
  console.log("\n----- RESUMEN DE CARGA -----");

  if (resultado.archivoNuevo) {
    console.log("⚠️  No se encontró el archivo tasks.json.");
    console.log("   Se arranca con la lista vacía; se creará al guardar la primera tarea.");
    return;
  }

  console.log(`Tareas cargadas: ${resultado.tareas.length}`);
  console.log(`Tareas descartadas: ${resultado.descartadas.length}`);

  resultado.descartadas.forEach((descartada) => {
    const nombre = descartada.titulo ? `"${descartada.titulo}"` : "(sin título)";
    console.log(`  - Tarea #${descartada.posicion} ${nombre}: ${descartada.motivos.join("; ")}`);
  });
}

// Punto de entrada de la app. Es async porque necesita esperar (await)
// a que termine de leerse el archivo antes de mostrar el menú.
async function main() {
  console.log("========================================");
  console.log("   TO-DO LIST - Gestor de tareas diarias");
  console.log("========================================");

  try {
    // await: pausamos main hasta tener las tareas leídas del archivo.
    const resultado = await persistencia.cargarTareas(persistencia.RUTA_ARCHIVO);
    tareas.reemplazarTareas(resultado.tareas);
    mostrarResumenDeCarga(resultado);
  } catch (error) {
    // Archivo con JSON roto u otro error de lectura: mensaje claro, sin stack trace.
    console.log(`\n❌ ${error.message}`);
    console.log("Corregí el archivo (o restaurá tasks.json.bak) y volvé a ejecutar la app.");
    return;
  }

  // await: menuPrincipal es async (los menús que guardan esperan la escritura).
  await menus.menuPrincipal();
}

// main() devuelve una promesa: el catch final evita un "unhandled rejection"
// si algo inesperado falla, mostrando un mensaje en lugar de un stack trace.
main().catch((error) => {
  console.log(`\n❌ Error inesperado: ${error.message}`);
  process.exitCode = 1;
});
