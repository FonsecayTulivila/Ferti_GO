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

      // Colores de estado
      let estadoColor = "";
      let estadoClass = "";
      if (p.estado === "APROBADA") {
        estadoColor = "style='background:#c8e6c9;color:#1b5e20;font-weight:bold;'";
        estadoClass = "estado-aprobada";
      }
      if (p.estado === "RECHAZADA") {
        estadoColor = "style='background:#ffcdd2;color:#b71c1c;font-weight:bold;'";
        estadoClass = "estado-rechazada";
      }
      if (p.estado === "PENDIENTE") {
        estadoColor = "style='background:#fff9c4;color:#f57f17;font-weight:bold;'";
        estadoClass = "estado-pendiente";
      }

      // CORREGIDO PARA TU BASE DE DATOS ACTUAL (finca es string, no objeto)
      const nombreFinca = p.finca || "Sin finca";
      const ubicacionFinca = p.ubicacion || "Sin ubicación";
      const fertilizante = p.tipo_fertilizante || "-";
      const fechaRequerida = p.fecha_requerida 
        ? new Date(p.fecha_requerida).toLocaleDateString('es-ES') 
        : "-";
      const fechaSolicitud = p.fecha_solicitud 
        ? new Date(p.fecha_solicitud).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) 
        : "-";

      fila.innerHTML = `
        <td>${p.idSolicitud}</td>
        <td>${nombreFinca}</td>
        <td>${ubicacionFinca}</td>
        <td>${fertilizante}</td>
        <td>${p.cantidad}</td>
        <td>${fechaRequerida}</td>
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
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

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
      console.error('Error:', err);
      tablaPedidos.innerHTML = `<tr><td colspan="11" style="color:red;">Error al conectar</td></tr>`;
    }
  }

  function aplicarFiltros() {
    const texto = buscador.value.toLowerCase().trim();
    const estadoSel = filtroEstado.value;

    const filtrados = pedidosGlobal.filter(p => {
      const enFinca = (p.finca?.toLowerCase().includes(texto)) || false;
      const enUbicacion = (p.ubicacion?.toLowerCase().includes(texto)) || false;
      const enFertilizante = (p.tipo_fertilizante?.toLowerCase().includes(texto)) || false;
      const enMotivo = (p.motivo?.toLowerCase().includes(texto)) || false;

      const coincideTexto = texto === "" || enFinca || enUbicacion || enFertilizante || enMotivo;
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
    fechaDesde.value = "";
    fechaHasta.value = "";
    aplicarFiltros();
  });

  window.cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(`${BASE}/${id}/estado?estado=${estado}`, { method: "PUT" });

      if (res.ok) {
        alert(`Pedido ${estado.toLowerCase()} correctamente`);
        cargarPedidos();
      } else {
        const error = await res.text();
        alert("Error: " + error);
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  cargarPedidos();
});

function cerrarSesion() {
  if (confirm("¿Cerrar sesión?")) {
    localStorage.clear();
    window.location.href = "../login/login.html";
  }
}