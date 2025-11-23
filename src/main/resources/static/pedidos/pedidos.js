document.addEventListener("DOMContentLoaded", async () => {
  const tablaPedidos = document.getElementById("tablaPedidos");
  const totalPedidos = document.getElementById("totalPedidos");
  const pendientes = document.getElementById("pendientes");
  const aprobados = document.getElementById("aprobados");
  const rechazados = document.getElementById("rechazados");

  const buscador = document.getElementById("buscadorPedidos");
  const filtroEstado = document.getElementById("filtroEstado");
  const fechaDesde = document.getElementById("fechaDesde");
  const fechaHasta = document.getElementById("fechaHasta");
  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
  const resultadosFiltros = document.getElementById("resultadosFiltros");

  const BASE = "https://fertigo-production.up.railway.app/solicitudFertilizante";

  let pedidosGlobal = [];

  function obtenerFechaSolo(fechaString) {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  function renderizarPedidos(pedidos) {
    tablaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
      tablaPedidos.innerHTML = `
        <tr>
          <td colspan="11" class="no-resultados">
            No se encontraron pedidos con los criterios seleccionados
          </td>
        </tr>`;
      return;
    }

    pedidos.forEach(p => {
      const fila = document.createElement("tr");
      fila.dataset.id = p.idSolicitud;

      let estadoColor = "";
      let estadoClass = "";
      if (p.estado === "APROBADA") {
        estadoColor = "style='background-color:#c8e6c9; color:#1b5e20; font-weight:bold;'";
        estadoClass = "estado-aprobada";
      }
      if (p.estado === "RECHAZADA") {
        estadoColor = "style='background-color:#ffcdd2; color:#b71c1c; font-weight:bold;'";
        estadoClass = "estado-rechazada";
      }
      if (p.estado === "PENDIENTE") {
        estadoColor = "style='background-color:#fff9c4; color:#f57f17; font-weight:bold;'";
        estadoClass = "estado-pendiente";
      }

      // AQUÍ ESTÁN LOS CAMBIOS CLAVE:
      const nombreFinca = p.finca?.nombre || "Sin finca";
      const ubicacionFinca = p.finca?.ubicacion || p.ubicacion || "Sin ubicación";

      const fechaSolicitud = p.fecha_solicitud 
        ? new Date(p.fecha_solicitud).toLocaleString('es-ES')
        : "-";

      fila.innerHTML = `
        <td>${p.idSolicitud}</td>
        <td>${nombreFinca}</td>
        <td>${ubicacionFinca}</td>
        <td>${p.tipoFertilizante || "-"}</td>
        <td>${p.cantidad}</td>
        <td>${p.fechaRequerida || "-"}</td>
        <td>${fechaSolicitud}</td>
        <td>${p.motivo || "-"}</td>
        <td>${p.notas || "-"}</td>
        <td>${p.prioridad || "-"}</td>
        <td ${estadoColor} class="${estadoClass}">${p.estado}</td>
        <td class="btn-acciones">
          ${p.estado === "PENDIENTE" 
            ? `<button class="btn-aprobar" onclick="cambiarEstado(${p.idSolicitud}, 'APROBADA')">Aprobar</button>
               <button class="btn-rechazar" onclick="cambiarEstado(${p.idSolicitud}, 'RECHAZADA')">Rechazar</button>`
            : `<em>—</em>`
          }
        </td>
      `;
      tablaPedidos.appendChild(fila);
    });
  }

  async function cargarPedidos() {
    try {
      console.log('Cargando pedidos desde:', BASE);
      const res = await fetch(BASE);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const pedidos = await res.json();
      console.log('Pedidos recibidos:', pedidos);

      pedidosGlobal = pedidos;

      totalPedidos.textContent = pedidos.length;
      pendientes.textContent = pedidos.filter(p => p.estado === "PENDIENTE").length;
      aprobados.textContent = pedidos.filter(p => p.estado === "APROBADA").length;
      rechazados.textContent = pedidos.filter(p => p.estado === "RECHAZADA").length;

      renderizarPedidos(pedidos);
      actualizarContadorResultados(pedidos.length, pedidos.length);

    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      tablaPedidos.innerHTML = `<tr><td colspan="11">Error al cargar pedidos. Revisa la consola.</td></tr>`;
    }
  }

  function aplicarFiltros() {
    const texto = buscador.value.toLowerCase().trim();
    const estadoSel = filtroEstado.value;

    const filtrados = pedidosGlobal.filter(p => {
      // CLAVE: ahora buscamos dentro del objeto finca
      const enFinca = p.finca?.nombre?.toLowerCase().includes(texto) || false;
      const enUbicacion = p.finca?.ubicacion?.toLowerCase().includes(texto) || 
                          p.ubicacion?.toLowerCase().includes(texto) || false;
      const enFertilizante = p.tipoFertilizante?.toLowerCase().includes(texto) || false;

      const coincideTexto = texto === "" || enFinca || enUbicacion || enFertilizante;
      const coincideEstado = estadoSel === "TODOS" || p.estado === estadoSel;

      return coincideTexto && coincideEstado;
    });

    renderizarPedidos(filtrados);
    actualizarContadorResultados(filtrados.length, pedidosGlobal.length);
  }

  function actualizarContadorResultados(encontrados, total) {
    if (buscador.value || filtroEstado.value !== "TODOS" || fechaDesde.value || fechaHasta.value) {
      resultadosFiltros.textContent = `${encontrados} de ${total} pedidos`;
      resultadosFiltros.style.display = "inline-block";
    } else {
      resultadosFiltros.style.display = "none";
    }
  }

  // Eventos
  buscador.addEventListener("input", aplicarFiltros);
  filtroEstado.addEventListener("change", aplicarFiltros);
  btnLimpiarFiltros.addEventListener("click", () => {
    buscador.value = "";
    filtroEstado.value = "TODOS";
    aplicarFiltros();
  });

  window.cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(`${BASE}/${id}/estado?estado=${estado}`, { method: "PUT" });
      if (res.ok) {
        alert(`Pedido ${estado.toLowerCase()} correctamente`);
        cargarPedidos();
      } else {
        alert("Error al cambiar estado");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  cargarPedidos();
});