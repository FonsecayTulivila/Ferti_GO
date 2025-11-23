document.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tablaNovedades");
  const total = document.getElementById("totalNovedades");

  const fechaDesde = document.getElementById("fechaDesde");
  const fechaHasta = document.getElementById("fechaHasta");
  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
  const resultadosFiltros = document.getElementById("resultadosFiltros");

  // CAMBIO: URL fija de Railway
  const API_URL = "https://fertigo-production.up.railway.app/novedades";

  let novedadesGlobal = [];

  function renderNovedades(lista) {
    tabla.innerHTML = "";

    if (lista.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="7" class="no-resultados">
            No se encontraron novedades con los criterios seleccionados
          </td>
        </tr>`;
      return;
    }

    lista.forEach((nov) => {
      let fechaFormateada = "-";

      if (nov.fechaEnvio) {
        const fecha = new Date(nov.fechaEnvio);
        fechaFormateada = fecha.toLocaleDateString("es-ES");
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${nov.idNovedad}</td>
        <td>${nov.nombre}</td>
        <td>${nov.nombreDeFinca}</td>
        <td>${nov.correo}</td>
        <td>${nov.novedad}</td>
        <td>${fechaFormateada}</td>
        <td class="btn-acciones">
          <button class="btn-eliminar">Eliminar</button>
        </td>
      `;

      fila.querySelector(".btn-eliminar").addEventListener("click", async () => {
        if (confirm("¿Seguro que deseas eliminar esta novedad?")) {
          await eliminarNovedad(nov.idNovedad);
          await cargarNovedades();
          aplicarFiltros();
        }
      });

      tabla.appendChild(fila);
    });
  }

  async function cargarNovedades() {
    try {
      console.log('Cargando novedades desde:', API_URL); // DEBUG
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        console.error('Error HTTP:', response.status, response.statusText);
        throw new Error("Error al obtener novedades");
      }

      const novedades = await response.json();
      console.log('Novedades recibidas:', novedades); // DEBUG

      novedadesGlobal = novedades.map((n) => ({
        ...n,
        fechaEnvio: n.fechaEnvio || new Date().toISOString(),
      }));

      total.textContent = novedadesGlobal.length;
      renderNovedades(novedadesGlobal);
      actualizarContadorResultados(novedadesGlobal.length, novedadesGlobal.length);
    } catch (error) {
      console.error("Error completo:", error);
      tabla.innerHTML = `<tr><td colspan="7">No se pudieron cargar las novedades. Revisa la consola.</td></tr>`;
    }
  }

  function aplicarFiltros() {
    const fechaMin = fechaDesde.value ? new Date(fechaDesde.value) : null;
    const fechaMax = fechaHasta.value ? new Date(fechaHasta.value) : null;

    const filtradas = novedadesGlobal.filter((n) => {
      if (!n.fechaEnvio) return true;

      const fecha = new Date(n.fechaEnvio);
      let coincide = true;

      if (fechaMin && fechaMax) {
        coincide = fecha >= fechaMin && fecha <= fechaMax;
      } else if (fechaMin) {
        coincide = fecha >= fechaMin;
      } else if (fechaMax) {
        coincide = fecha <= fechaMax;
      }

      return coincide;
    });

    renderNovedades(filtradas);
    actualizarContadorResultados(filtradas.length, novedadesGlobal.length);
  }

  function actualizarContadorResultados(encontrados, total) {
    if (fechaDesde.value || fechaHasta.value) {
      resultadosFiltros.textContent = `${encontrados} de ${total} novedades`;
      resultadosFiltros.style.display = "inline-block";
    } else {
      resultadosFiltros.style.display = "none";
    }
  }

  btnLimpiarFiltros.addEventListener("click", () => {
    fechaDesde.value = "";
    fechaHasta.value = "";
    aplicarFiltros();
  });

  fechaDesde.addEventListener("change", aplicarFiltros);
  fechaHasta.addEventListener("change", aplicarFiltros);

  async function eliminarNovedad(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar novedad");

      alert("Novedad eliminada correctamente");
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo eliminar la novedad");
    }
  }

  cargarNovedades();
});

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.clear();
    window.location.href = "../login/login.html";
  }
}