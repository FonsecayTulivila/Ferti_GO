document.addEventListener("DOMContentLoaded", async () => {
  const tablaPedidos = document.getElementById("tablaPedidos");
  const totalPedidos = document.getElementById("totalPedidos");
  const pendientes = document.getElementById("pendientes");
  const aprobados = document.getElementById("aprobados");
  const rechazados = document.getElementById("rechazados");

  const buscador = document.getElementById("buscadorPedidos");
  const filtroEstado = document.getElementById("filtroEstado");
  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
  const resultadosFiltros = document.getElementById("resultadosFiltros");

  const BASE = "https://fertigo-production.up.railway.app/solicitudFertilizante";

  let pedidosGlobal = [];

  function renderizarPedidos(pedidos) {
    tablaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
      tablaPedidos.innerHTML = `<tr><td colspan="11" class="no-resultados">No hay pedidos</td></tr>`;
      return;
    }

    pedidos.forEach(p => {
      const fila = document.createElement("tr");

      // Colores
      let estadoColor = "";
      if (p.estado === "APROBADA") estadoColor = "style='background:#c8e6c9;color:#1b5e20;font-weight:bold;'";
      if (p.estado === "RECHAZADA") estadoColor = "style='background:#ffcdd2;color:#b71c1c;font-weight:bold;'";
      if (p.estado === "PENDIENTE") estadoColor = "style='background:#fff9c4;color:#f57f17;font-weight:bold;'";

      // ESTOS SON LOS NOMBRES REALES QUE DEVUELVE TU API
      const id = p.id_solicitud || p.idSolicitud || "-";
      const finca = p.finca || "Sin finca";
      const ubicacion = p.ubicacion || "Sin ubicación";
      const fertilizante = p.tipo_fertilizante || "-";
      const cantidad = p.cantidad || "-";
      const fechaReq = p.fecha_requerida ? new Date(p.fecha_requerida).toLocaleDateString('es-ES') : "-";
      const fechaSol = p.fecha_solicitud ? new Date(p.fecha_solicitud).toLocaleString('es-ES') : "-";

      fila.innerHTML = `
        <td>${id}</td>
        <td>${finca}</td>
        <td>${ubicacion}</td>
        <td>${fertilizante}</td>
        <td>${cantidad}</td>
        <td>${fechaReq}</td>
        <td>${fechaSol}</td>
        <td>${p.motivo || "-"}</td>
        <td>${p.notas || "-"}</td>
        <td>${p.prioridad || "-"}</td>
        <td ${estadoColor}>${p.estado || "-"}</td>
        <td class="btn-acciones">
          ${p.estado === "PENDIENTE" 
            ? `<button class="btn-aprobar" onclick="cambiarEstado(${id}, 'APROBADA')">Aprobar</button>
               <button class="btn-rechazar" onclick="cambiarEstado(${id}, 'RECHAZADA')">Rechazar</button>`
            : `<em>—</em>`
          }
        </td>
      `;
      tablaPedidos.appendChild(fila);
    });
  }

  async function cargarPedidos() {
    try {
      const res = await fetch(BASE);
      if (!res.ok) throw new Error("Error " + res.status);

      const pedidos = await res.json();
      console.log("PEDIDOS REALES:", pedidos); // AQUÍ VERÁS LOS NOMBRES EXACTOS

      pedidosGlobal = pedidos;

      totalPedidos.textContent = pedidos.length;
      pendientes.textContent = pedidos.filter(p => p.estado === "PENDIENTE").length;
      aprobados.textContent = pedidos.filter(p => p.estado === "APROBADA").length;
      rechazados.textContent = pedidos.filter(p => p.estado === "RECHAZADA").length;

      renderizarPedidos(pedidos);
    } catch (err) {
      console.error(err);
      tablaPedidos.innerHTML = `<tr><td colspan="11" style="color:red;">Error de conexión</td></tr>`;
    }
  }

  function aplicarFiltros() {
    const texto = buscador.value.toLowerCase().trim();
    const estadoSel = filtroEstado.value;

    const filtrados = pedidosGlobal.filter(p => {
      const busca = texto === "" || 
        (p.finca?.toLowerCase().includes(texto)) ||
        (p.ubicacion?.toLowerCase().includes(texto)) ||
        (p.tipo_fertilizante?.toLowerCase().includes(texto));

      const estadoOk = estadoSel === "TODOS" || p.estado === estadoSel;
      return busca && estadoOk;
    });

    renderizarPedidos(filtrados);
    resultadosFiltros.textContent = `${filtrados.length} de ${pedidosGlobal.length} pedidos`;
    resultadosFiltros.style.display = filtrados.length < pedidosGlobal.length ? "inline-block" : "none";
  }

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
        alert("Error al actualizar");
      }
    } catch {
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