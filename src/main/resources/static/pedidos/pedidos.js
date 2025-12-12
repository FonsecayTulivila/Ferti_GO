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

  const BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://fertigo-production-0cf0.up.railway.app";
  
  const BASE = `${BASE_URL}/solicitudFertilizante`;
  const BASE_FERTILIZANTE = `${BASE_URL}/fertilizante`;
  const ID_ADMIN = 1;

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
          <td colspan="12" class="no-resultados">
            No se encontraron pedidos con los criterios seleccionados
          </td>
        </tr>
      `;
      return;
    }

    pedidos.forEach(p => {
      const fila = document.createElement("tr");
      fila.dataset.id = p.id_solicitud;

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

      // Formatear fecha de solicitud
      let fechaSolicitudFormateada = "-";
      if (p.fecha_solicitud) {
        const fecha = new Date(p.fecha_solicitud);
        fechaSolicitudFormateada = fecha.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      fila.innerHTML = `
        <td>${p.id_solicitud || '-'}</td>
        <td>${p.finca || '-'}</td>
        <td>${p.ubicacion || '-'}</td>
        <td>${p.tipo_fertilizante || 'NULL'}</td>
        <td>${p.cantidad || '-'}</td>
        <td>${p.fecha_requerida || '-'}</td>
        <td>${fechaSolicitudFormateada}</td>
        <td>${p.motivo || '-'}</td>
        <td>${p.notas || "-"}</td>
        <td>${p.prioridad || '-'}</td>
        <td ${estadoColor} class="${estadoClass}">${p.estado || '-'}</td>
        <td class="btn-acciones">
          ${
            p.estado === "PENDIENTE"
              ? `
                <button class="btn-aprobar" onclick="cambiarEstado(${p.id_solicitud}, 'APROBADA')">Aprobar</button>
                <button class="btn-rechazar" onclick="cambiarEstado(${p.id_solicitud}, 'RECHAZADA')">Rechazar</button>
              `
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
      
      if (!res.ok) {
        console.error('Error HTTP:', res.status);
        throw new Error("Error al obtener los pedidos");
      }
      
      const pedidos = await res.json();
      console.log('Pedidos recibidos:', pedidos.length);
      
      if (pedidos.length > 0) {
        console.log('Primer pedido:', pedidos[0]);
      }

      pedidosGlobal = pedidos;

      totalPedidos.textContent = pedidos.length;
      pendientes.textContent = pedidos.filter(p => p.estado === "PENDIENTE").length;
      aprobados.textContent = pedidos.filter(p => p.estado === "APROBADA").length;
      rechazados.textContent = pedidos.filter(p => p.estado === "RECHAZADA").length;

      renderizarPedidos(pedidos);
      actualizarContadorResultados(pedidos.length, pedidos.length);
    } catch (err) {
      console.error('Error completo:', err);
      tablaPedidos.innerHTML = `
        <tr>
          <td colspan="12" class="no-resultados">
            Error al cargar pedidos. Revisa la consola (F12).
          </td>
        </tr>
      `;
    }
  }

  function aplicarFiltros() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    const estadoSeleccionado = filtroEstado.value;
    const fechaMin = fechaDesde.value ? new Date(fechaDesde.value + "T00:00:00") : null;
    const fechaMax = fechaHasta.value ? new Date(fechaHasta.value + "T23:59:59") : null;

    const pedidosFiltrados = pedidosGlobal.filter(p => {
      const coincideTexto = textoBusqueda === "" || 
        (p.finca && p.finca.toLowerCase().includes(textoBusqueda)) ||
        (p.ubicacion && p.ubicacion.toLowerCase().includes(textoBusqueda)) ||
        (p.tipo_fertilizante && p.tipo_fertilizante.toLowerCase().includes(textoBusqueda));

      const coincideEstado = estadoSeleccionado === "TODOS" || p.estado === estadoSeleccionado;

      let coincideFecha = true;
      
      if ((fechaMin || fechaMax) && p.fecha_solicitud) {
        const fechaSolicitud = obtenerFechaSolo(p.fecha_solicitud);
        
        if (fechaMin && fechaMax) {
          const fechaMinSolo = obtenerFechaSolo(fechaMin);
          const fechaMaxSolo = obtenerFechaSolo(fechaMax);
          coincideFecha = fechaSolicitud >= fechaMinSolo && fechaSolicitud <= fechaMaxSolo;
        } else if (fechaMin) {
          const fechaMinSolo = obtenerFechaSolo(fechaMin);
          coincideFecha = fechaSolicitud >= fechaMinSolo;
        } else if (fechaMax) {
          const fechaMaxSolo = obtenerFechaSolo(fechaMax);
          coincideFecha = fechaSolicitud <= fechaMaxSolo;
        }
      } else if (fechaMin || fechaMax) {
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

  buscador.addEventListener("input", aplicarFiltros);
  filtroEstado.addEventListener("change", aplicarFiltros);
  fechaDesde.addEventListener("change", aplicarFiltros);
  fechaHasta.addEventListener("change", aplicarFiltros);
  btnLimpiarFiltros.addEventListener("click", limpiarFiltros);

  // Buscar fertilizante por tipo o nombre
  async function buscarFertilizantePorTipo(tipoFertilizante) {
    try {
      const res = await fetch(BASE_FERTILIZANTE);
      if (!res.ok) throw new Error("Error al obtener fertilizantes");
      
      const fertilizantes = await res.json();
      
      // Buscar el fertilizante que coincida con el tipo (nombre o tipo)
      const fertilizante = fertilizantes.find(f => 
        f.nombre.toLowerCase() === tipoFertilizante.toLowerCase() ||
        f.tipo.toLowerCase() === tipoFertilizante.toLowerCase()
      );
      
      return fertilizante;
    } catch (err) {
      console.error("Error buscando fertilizante:", err);
      return null;
    }
  }

  // Descontar cantidad del inventario de fertilizante
  async function descontarInventarioFertilizante(fertilizante, cantidadADescontar) {
    try {
      // Calcular nueva cantidad
      const nuevaCantidad = fertilizante.cantidad - cantidadADescontar;
      
      if (nuevaCantidad < 0) {
        throw new Error("La cantidad resultante no puede ser negativa");
      }
      
      // ⚠️ IMPORTANTE: El endpoint PUT espera el ID en la URL, NO en el body
      const resUpdate = await fetch(`${BASE_FERTILIZANTE}/${fertilizante.id}/${ID_ADMIN}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          nombre: fertilizante.nombre,
          tipo: fertilizante.tipo,
          cantidad: nuevaCantidad,
          unidad: fertilizante.unidad,
          descripcion: fertilizante.descripcion || ""
        })
      });
      
      if (!resUpdate.ok) {
        const errorText = await resUpdate.text();
        throw new Error(`Error al actualizar inventario: ${errorText}`);
      }
      
      console.log(`✅ Inventario actualizado: ${fertilizante.nombre} - Nueva cantidad: ${nuevaCantidad}`);
      return { success: true, nuevaCantidad };
    } catch (err) {
      console.error("Error descontando inventario:", err);
      return { success: false, error: err.message };
    }
  }

  // Función para cambiar el estado del pedido
  window.cambiarEstado = async (id, estado) => {
    try {
      // Obtener los detalles del pedido
      const pedido = pedidosGlobal.find(p => p.id_solicitud === id);
      
      if (!pedido) {
        alert("❌ No se encontró el pedido");
        return;
      }

      // Si se está APROBANDO, verificar y descontar inventario
      if (estado === "APROBADA") {
        console.log(`🔍 Buscando fertilizante: ${pedido.tipo_fertilizante}`);
        
        // Buscar el fertilizante correspondiente
        const fertilizante = await buscarFertilizantePorTipo(pedido.tipo_fertilizante);
        
        if (!fertilizante) {
          alert(`⚠️ No se encontró el fertilizante "${pedido.tipo_fertilizante}" en el inventario.\n\nNo se puede aprobar el pedido.`);
          return;
        }
        
        console.log(`📦 Fertilizante encontrado:`, fertilizante);
        
        // Verificar que haya suficiente cantidad
        if (fertilizante.cantidad < pedido.cantidad) {
          alert(
            `⚠️ INVENTARIO INSUFICIENTE\n\n` +
            `Fertilizante: ${fertilizante.nombre}\n` +
            `Disponible: ${fertilizante.cantidad} ${fertilizante.unidad}\n` +
            `Solicitado: ${pedido.cantidad} ${fertilizante.unidad}\n` +
            `Faltante: ${pedido.cantidad - fertilizante.cantidad} ${fertilizante.unidad}`
          );
          return;
        }
        
        // Confirmar la aprobación
        const confirmar = confirm(
          `✅ APROBAR PEDIDO #${pedido.id_solicitud}\n\n` +
          `📍 Finca: ${pedido.finca}\n` +
          `🌱 Fertilizante: ${pedido.tipo_fertilizante}\n` +
          `📦 Cantidad a descontar: ${pedido.cantidad} ${fertilizante.unidad}\n\n` +
          `Inventario actual: ${fertilizante.cantidad} ${fertilizante.unidad}\n` +
          `Inventario después: ${fertilizante.cantidad - pedido.cantidad} ${fertilizante.unidad}\n\n` +
          `¿Continuar?`
        );
        
        if (!confirmar) {
          console.log("❌ Aprobación cancelada por el usuario");
          return;
        }
        
        console.log(`⏳ Descontando ${pedido.cantidad} del inventario...`);
        
        // Descontar del inventario
        const resultado = await descontarInventarioFertilizante(fertilizante, pedido.cantidad);
        
        if (!resultado.success) {
          alert(`❌ ERROR AL ACTUALIZAR INVENTARIO\n\n${resultado.error}`);
          return;
        }
        
        console.log(`✅ Inventario actualizado exitosamente`);
      }

      // Si se está RECHAZANDO, solo confirmar
      if (estado === "RECHAZADA") {
        const confirmar = confirm(
          `⚠️ RECHAZAR PEDIDO #${pedido.id_solicitud}\n\n` +
          `Finca: ${pedido.finca}\n` +
          `Fertilizante: ${pedido.tipo_fertilizante}\n` +
          `Cantidad: ${pedido.cantidad}\n\n` +
          `¿Continuar?`
        );
        
        if (!confirmar) return;
      }

      // Cambiar el estado del pedido en el backend
      console.log(`⏳ Actualizando estado del pedido a: ${estado}...`);
      const res = await fetch(`${BASE}/${id}/estado?estado=${estado}`, { 
        method: "PUT" 
      });

      if (res.ok) {
        if (estado === "APROBADA") {
          alert(
            `✅ PEDIDO APROBADO EXITOSAMENTE\n\n` +
            `Pedido #${id}\n` +
            `📦 Inventario actualizado\n` +
            `🌱 ${pedido.tipo_fertilizante}: -${pedido.cantidad}`
          );
        } else if (estado === "RECHAZADA") {
          alert(`✅ Pedido #${id} rechazado correctamente`);
        }
        
        // Recargar la tabla de pedidos
        console.log("🔄 Recargando lista de pedidos...");
        setTimeout(async () => {
          await cargarPedidos();
          aplicarFiltros();
        }, 500);
      } else {
        const errorText = await res.text();
        alert(`❌ Error al actualizar estado del pedido:\n\n${errorText}`);
      }
    } catch (err) {
      console.error("❌ Error completo:", err);
      alert(`❌ ERROR DE CONEXIÓN\n\nNo se pudo conectar al servidor.\n\n${err.message}`);
    }
  };

  // Cargar pedidos al iniciar
  cargarPedidos();
});

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuario');
    localStorage.clear();
    window.location.href = '../login/login.html';
  }
}