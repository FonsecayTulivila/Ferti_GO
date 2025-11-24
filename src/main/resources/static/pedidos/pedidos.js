document.addEventListener("DOMContentLoaded", async () => {
  const tablaPedidos = document.getElementById("tablaPedidos");
  const totalPedidos = document.getElementById("totalPedidos");
  const pendientes = document.getElementById("pendientes");
  const aprobados = document.getElementById("aprobados");
  const rechazados = document.getElementById("rechazados");

  // Elementos de filtros
  const buscador = document.getElementById("buscadorPedidos");
  const filtroEstado = document.getElementById("filtroEstado");
  const fechaDesde = document.getElementById("fechaDesde");
  const fechaHasta = document.getElementById("fechaHasta");
  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
  const resultadosFiltros = document.getElementById("resultadosFiltros");

  const BASE = "https://fertigo-production.up.railway.app/solicitudFertilizante";

  let pedidosGlobal = []; // Array global para filtrado

  // Función auxiliar para extraer fecha sin hora
  function obtenerFechaSolo(fechaString) {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  // Renderizar pedidos en tabla
  function renderizarPedidos(pedidos) {
    tablaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
      tablaPedidos.innerHTML = `
        <tr>
          <td colspan="11" class="no-resultados">
            No se encontraron pedidos con los criterios seleccionados
          </td>
        </tr>
      `;
      return;
    }

    pedidos.forEach(p => {
      const fila = document.createElement("tr");
      fila.dataset.id = p.idSolicitud;

      // Colores más intensos para los estados
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

      fila.innerHTML = `
        <td>${p.idSolicitud}</td>
        <td>${p.finca}</td>
        <td>${p.ubicacion}</td>
        <td>${p.tipoFertilizante}</td>
        <td>${p.cantidad}</td>
        <td>${p.fechaRequerida}</td>
        <td>${p.motivo}</td>
        <td>${p.notas || "-"}</td>
        <td>${p.prioridad}</td>
        <td ${estadoColor} class="${estadoClass}">${p.estado}</td>
        <td class="btn-acciones">
          ${
            p.estado === "PENDIENTE"
              ? `
                <button class="btn-aprobar" onclick="cambiarEstado(${p.idSolicitud}, 'APROBADA')">Aprobar</button>
                <button class="btn-rechazar" onclick="cambiarEstado(${p.idSolicitud}, 'RECHAZADA')">Rechazar</button>
              `
              : `<em>—</em>`
          }
        </td>
      `;
      tablaPedidos.appendChild(fila);
    });
  }

  // Cargar solicitudes
  async function cargarPedidos() {
    try {
      const res = await fetch(BASE);
      if (!res.ok) throw new Error("Error al obtener los pedidos");
      const pedidos = await res.json();

      pedidosGlobal = pedidos; // Guardar en variable global

      // Actualizar contadores totales (siempre con todos los pedidos)
      totalPedidos.textContent = pedidos.length;
      pendientes.textContent = pedidos.filter(p => p.estado === "PENDIENTE").length;
      aprobados.textContent = pedidos.filter(p => p.estado === "APROBADA").length;
      rechazados.textContent = pedidos.filter(p => p.estado === "RECHAZADA").length;

      renderizarPedidos(pedidos);
      actualizarContadorResultados(pedidos.length, pedidos.length);
    } catch (err) {
      console.error(err);
      alert("No se pudieron cargar los pedidos.");
    }
  }

  // ===== FUNCIONES DE FILTRADO =====
  function aplicarFiltros() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    const estadoSeleccionado = filtroEstado.value;
    const fechaMin = fechaDesde.value ? new Date(fechaDesde.value + "T00:00:00") : null;
    const fechaMax = fechaHasta.value ? new Date(fechaHasta.value + "T23:59:59") : null;

    const pedidosFiltrados = pedidosGlobal.filter(p => {
      // Filtro por texto (finca, ubicación o fertilizante)
      const coincideTexto = textoBusqueda === "" || 
        (p.finca && p.finca.toLowerCase().includes(textoBusqueda)) ||
        (p.ubicacion && p.ubicacion.toLowerCase().includes(textoBusqueda)) ||
        (p.tipoFertilizante && p.tipoFertilizante.toLowerCase().includes(textoBusqueda));

      // Filtro por estado
      const coincideEstado = estadoSeleccionado === "TODOS" || p.estado === estadoSeleccionado;

      // ✅ FILTRO POR FECHA DE CREACIÓN (no por fechaRequerida)
      let coincideFecha = true;
      
      // IMPORTANTE: Ajusta 'fechaCreacion' al nombre exacto del campo en tu API
      // Posibles nombres: fechaCreacion, fechaSolicitud, createdAt, fecha, fechaRegistro
      const campoFecha = p.fechaCreacion || p.fechaSolicitud || p.createdAt || p.fecha;
      
      if ((fechaMin || fechaMax) && campoFecha) {
        const fechaSolicitud = obtenerFechaSolo(campoFecha);
        
        if (fechaMin && fechaMax) {
          // Filtrar por rango: entre fechaMin y fechaMax (inclusive)
          const fechaMinSolo = obtenerFechaSolo(fechaMin);
          const fechaMaxSolo = obtenerFechaSolo(fechaMax);
          coincideFecha = fechaSolicitud >= fechaMinSolo && fechaSolicitud <= fechaMaxSolo;
        } else if (fechaMin) {
          // Solo desde una fecha
          const fechaMinSolo = obtenerFechaSolo(fechaMin);
          coincideFecha = fechaSolicitud >= fechaMinSolo;
        } else if (fechaMax) {
          // Solo hasta una fecha
          const fechaMaxSolo = obtenerFechaSolo(fechaMax);
          coincideFecha = fechaSolicitud <= fechaMaxSolo;
        }
      } else if (fechaMin || fechaMax) {
        // Si hay filtro de fecha pero el pedido no tiene fecha de creación, excluirlo
        coincideFecha = false;
      }

      return coincideTexto && coincideEstado && coincideFecha;
    });

    renderizarPedidos(pedidosFiltrados);
    actualizarContadorResultados(pedidosFiltrados.length, pedidosGlobal.length);
  }

  function actualizarContadorResultados(encontrados, total) {
    const hayFiltros = buscador.value.trim() !== "" || 
                       filtroEstado.value !== "TODOS" || 
                       fechaDesde.value !== "" || 
                       fechaHasta.value !== "";
    
    if (hayFiltros) {
      resultadosFiltros.textContent = `${encontrados} de ${total} pedidos`;
      resultadosFiltros.style.display = "inline-block";
    } else {
      resultadosFiltros.style.display = "none";
    }
  }

  function limpiarFiltros() {
    buscador.value = "";
    filtroEstado.value = "TODOS";
    fechaDesde.value = "";
    fechaHasta.value = "";
    aplicarFiltros();
  }

  // Event listeners para filtros
  buscador.addEventListener("input", aplicarFiltros);
  filtroEstado.addEventListener("change", aplicarFiltros);
  fechaDesde.addEventListener("change", aplicarFiltros);
  fechaHasta.addEventListener("change", aplicarFiltros);
  btnLimpiarFiltros.addEventListener("click", limpiarFiltros);

  // Cambiar estado
  window.cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(`${BASE}/${id}/estado?estado=${estado}`, { method: "PUT" });

      if (res.ok) {
        alert(`Pedido ${estado.toLowerCase()} correctamente`);
        setTimeout(async () => {
          await cargarPedidos();
          // Mantener los filtros activos después de actualizar
          aplicarFiltros();
        }, 800);
      } else {
        const errorText = await res.text();
        alert("Error al actualizar estado: " + errorText);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar al servidor.");
    }
  };

  cargarPedidos();
});

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuario');
    localStorage.clear();
    window.location.href = '../login/login.html';
  }
}