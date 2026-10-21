function pad(numero) {
  return numero.toString().padStart(2, "0");
}


function formatearFechaHora(fecha) {
  if (!fecha) {
    return "Sin Datos";
  }
  const dia = pad(fecha.getDate());
  const mes = pad(fecha.getMonth() + 1);
  const anio = fecha.getFullYear();
  const horas = pad(fecha.getHours());
  const minutos = pad(fecha.getMinutes());
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}


function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin Datos";
  }
  const dia = pad(fecha.getDate());
  const mes = pad(fecha.getMonth() + 1);
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}


function formatearTexto(texto) {
  return texto && texto.trim() !== "" ? texto : "Sin Datos";
}


function dificultadAEstrellas(dificultad) {
  const niveles = { "Fácil": 1, "Medio": 2, "Difícil": 3 };
  const nivel = niveles[dificultad] || 0;
  const totalEstrellas = 3;

  let estrellas = "";
  for (let i = 1; i <= totalEstrellas; i++) {
    estrellas += i <= nivel ? "⭐" : "☆";
  }

  return `${estrellas} (${dificultad})`;
}


function imprimirListado(listaTareas) {
  listaTareas.forEach((tarea, indice) => {
    console.log(`${indice + 1}) ${tarea.titulo} - ${tarea.estado}`);
  });
}


function mostrarDetalleTarea(tarea) {
  console.log("\n----- DETALLE DE LA TAREA -----");
  console.log(`Título: ${formatearTexto(tarea.titulo)}`);
  console.log(`Descripción: ${formatearTexto(tarea.descripcion)}`);
  console.log(`Estado: ${tarea.estado}`);
  console.log(`Dificultad: ${dificultadAEstrellas(tarea.dificultad)}`);
  console.log(`Vencimiento: ${formatearFecha(tarea.vencimiento)}`);
  console.log(`Creación: ${formatearFechaHora(tarea.creacion)}`);
  console.log(`Última Edición: ${formatearFechaHora(tarea.ultimaEdicion)}`);
}

module.exports = {
  formatearFecha,
  formatearFechaHora,
  formatearTexto,
  dificultadAEstrellas,
  imprimirListado,
  mostrarDetalleTarea,
};
