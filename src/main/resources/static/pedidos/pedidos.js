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
      tablaPedidos.innerHTML = `<tr><td colspan="12" class="no-resultados">No se encontraron pedidos</td></tr>`;
      return;
    }

    pedidos.forEach(p => {
      const fila = document.createElement("tr");

      // Colores de estado
      let colorEstado = "";
      if (p.estado === "APROBADA") colorEstado = "style='background:#d4edda;color:#155724;font-weight:bold;'";
      if (p.estado === "RECHAZADA") colorEstado = "style='background:#f8d7da;color:#721c24;font-weight:bold;'";
      if (p.estado === "PENDIENTE") colorEstado = "style='background:#fff3cd;color:#856404;font-weight:bold;'";

      fila.innerHTML = `
        <td>${p.id_solicitud}</td>
        <td>${p.finca || "Sin finca"}</td>
        <td>${p.ubicacion || "Sin ubicación"}</td>
        <td>${p.tipo_fertilizante || "-"}</td>
        <td>${p.cantidad}</td>
        <td>${p.fecha_requerida ? new Date(p.fecha_requerida).toLocaleDateString('es-ES') : "-"}</td>
        <td>${p.fecha_solicitud ? new Date(p.fecha_solicitud).toLocaleString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) : "-"}</td>
        <td>${p.motivo || "-"}</td>
        <td>${p.notas || "-"}</td>
        <td>${p.prioridad || "-"}</td>
        <td ${colorEstado}>${p.estado}</td>
        <td class="btn-acciones">
          ${p.estado === "PENDIENTE" 
            ? `<button class="btn-aprobar" onclick="cambiarEstado(${p.id_solicitud}, 'APROBADA')">Aprobar</button>
               <button class="btn-rechazar" onclick="cambiarEstado(${p.id_solicitud}, 'RECHAZADA')">Rechazar</button>`
            : "—"
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

      console.log("PEDIDOS CARGADOS CORRECTAMENTE:", pedidos);

      pedidosGlobal = pedidos;

      totalPedidos.textContent = pedidos.length;
      pendientes.textContent = pedidos.filter(p => p.estado === "PENDIENTE").length;
      aprobados.textContent = pedidos.filter(p => p.estado === "APROBADA").length;
      rechazados.textContent = pedidos.filter(p => p.estado === "RECHAZADA").length;

      renderizarPedidos(pedidos);
    } catch (err) {
      console.error("Error:", err);
      tablaPedidos.innerHTML = `<tr><td colspan="12" style="color:red;">Error de conexión</td></tr>`;
    }
  }

  function aplicarFiltros() {
    const texto = buscador.value.toLowerCase().trim();
    const estadoSel = filtroEstado.value;

    const filtrados = pedidosGlobal.filter(p => {
      const coincideTexto = texto === "" ||
        (p.finca?.toLowerCase().includes(texto)) ||
        (p.ubicacion?.toLowerCase().includes(texto)) ||
        (p.tipo_fertilizante?.toLowerCase().includes(texto));

      const coincideEstado = estadoSel === "TODOS" || p.estado === estadoSel;
      return coincideTexto && coincideEstado;
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

  window.cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${BASE}/${id}/estado?estado=${nuevoEstado}`, { method: "PUT" });
      if (res.ok) {
        alert(`Pedido ${nuevoEstado.toLowerCase()} correctamente`);
        cargarPedidos();
      } else {
        alert("Error al cambiar estado");
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