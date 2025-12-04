document.addEventListener("DOMContentLoaded", () => {
  const inputId = document.getElementById("inputId");
  const btnBuscar = document.getElementById("btnBuscar");
  const btnImprimir = document.getElementById("btnImprimir");
  const resultado = document.getElementById("resultado");

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://fertigo-production-0cf0.up.railway.app";

  const BASE = `${BASE_URL}/solicitudFertilizante`;

  let pedidoActual = null;

  btnBuscar.addEventListener("click", async () => {
    const id = inputId.value.trim();
    if (!id) return alert("Por favor ingresa un ID válido");

    try {
      const res = await fetch(`${BASE}/${id}`);
      if (!res.ok) throw new Error("No se encontró el pedido");

      const pedido = await res.json();

      // ✅ VALIDACIÓN: Verificar si el pedido está APROBADO
      if (pedido.estado !== "APROBADA") {
        resultado.innerHTML = `
          <div class="mensaje-error">
            <h2>⚠️ Solicitud No Aprobada</h2>
            <p>Esta solicitud tiene estado: <b>${pedido.estado}</b></p>
            <p>Solo se pueden generar guías para solicitudes con estado <b>APROBADA</b>.</p>
            <p>Por favor, aprueba primero la solicitud desde el módulo de pedidos.</p>
          </div>
        `;
        resultado.classList.add("mostrar");
        btnImprimir.disabled = true;
        pedidoActual = null;
        return;
      }

      // Si llega aquí, el pedido está APROBADO
      pedidoActual = pedido;

      resultado.innerHTML = `
        <div class="logo-pdf">🌱 <b>Ferti-Go</b></div>
        <h2>Guía de Envío #${pedido.idSolicitud}</h2>
        <p><b>Finca:</b> ${pedido.finca}</p>
        <p><b>Ubicación:</b> ${pedido.ubicacion}</p>
        <p><b>Fertilizante:</b> ${pedido.tipoFertilizante}</p>
        <p><b>Cantidad:</b> ${pedido.cantidad}</p>
        <p><b>Fecha requerida:</b> ${pedido.fechaRequerida}</p>
        <p><b>Prioridad:</b> ${pedido.prioridad}</p>
        <p><b>Estado:</b> <span class="estado-aprobado">${pedido.estado}</span></p>
        <hr>

        <label for="precio">Precio a cobrar:</label><br>
        <input type="number" id="precio" class="input-precio" placeholder="Ingresa el precio"><br>

        <label class="checkbox-label">
          <input type="checkbox" id="contraEntrega">
          <span>Pago contra entrega</span>
        </label>

        <hr>
        <p><b>Responsable del despacho:</b> _________________________</p>
        <p><b>Fecha de emisión:</b> ${new Date().toLocaleDateString()}</p>
      `;

      resultado.classList.add("mostrar");
      btnImprimir.disabled = false;

    } catch (err) {
      console.error(err);
      alert("No se encontró el pedido o hubo un error.");
      resultado.classList.remove("mostrar");
      btnImprimir.disabled = true;
      pedidoActual = null;
    }
  });

  btnImprimir.addEventListener("click", () => {
    if (!pedidoActual) return;

    const precio = document.getElementById("precio").value.trim() || "No especificado";
    const contraEntrega = document.getElementById("contraEntrega").checked;

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <title>Guía de Envío #${pedidoActual.idSolicitud}</title>
          <link rel="stylesheet" href="guiaenviopdf.css">
        </head>
        <body>
          <h1>🌱 Ferti-Go - Guía de Envío</h1>

          <div class="bloque">
            <p><b>ID Pedido:</b> ${pedidoActual.idSolicitud}</p>
            <p><b>Finca:</b> ${pedidoActual.finca}</p>
            <p><b>Ubicación:</b> ${pedidoActual.ubicacion}</p>
            <p><b>Fertilizante:</b> ${pedidoActual.tipoFertilizante}</p>
            <p><b>Cantidad:</b> ${pedidoActual.cantidad}</p>
            <p><b>Fecha requerida:</b> ${pedidoActual.fechaRequerida}</p>
            <p><b>Prioridad:</b> ${pedidoActual.prioridad}</p>
            <p class="precio"><b>Precio a cobrar:</b> $${precio}</p>
            ${contraEntrega ? `<p class="nota"><b>PAGO: CONTRA ENTREGA</b></p>` : ``}
          </div>

          <div class="firma">
            <p><b>Responsable del despacho:</b> ________________________</p>
            <p><b>Fecha:</b> ${new Date().toLocaleDateString()}</p>
          </div>

          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  });
});

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuario');
    localStorage.clear();
    window.location.href = '../login/login.html';
  }
}