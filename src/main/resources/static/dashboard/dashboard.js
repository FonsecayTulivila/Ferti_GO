document.addEventListener("DOMContentLoaded", async () => {

  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://fertigo-production.up.railway.app";

  const API_USUARIOS = `${BASE_URL}/usuario`;
  const API_FERTILIZANTES = `${BASE_URL}/fertilizante`;
  const API_SOLICITUDES = `${BASE_URL}/solicitudFertilizante`;

  try {
    const [resUsuarios, resFertilizantes, resSolicitudes] = await Promise.all([
      fetch(API_USUARIOS),
      fetch(API_FERTILIZANTES),
      fetch(API_SOLICITUDES)
    ]);

    const usuarios = await resUsuarios.json();
    const fertilizantes = await resFertilizantes.json();
    const solicitudes = await resSolicitudes.json();

    const datosGenerales = {
      usuarios: usuarios.length,
      fertilizantes: fertilizantes.length,
      solicitudes: solicitudes.length,
      entregas: solicitudes.filter(s => s.estado === "APROBADA").length
    };

    const estados = {
      pendientes: solicitudes.filter(s => s.estado === "PENDIENTE").length,
      aprobadas: solicitudes.filter(s => s.estado === "APROBADA").length,
      rechazadas: solicitudes.filter(s => s.estado === "RECHAZADA").length
    };

    document.getElementById("usuariosActivos").textContent = datosGenerales.usuarios;
    document.getElementById("fertilizantes").textContent = datosGenerales.fertilizantes;
    document.getElementById("solicitudesPendientes").textContent = estados.pendientes;
    document.getElementById("entregas").textContent = datosGenerales.entregas;

    const ctxPie = document.getElementById("pieChart").getContext("2d");
    new Chart(ctxPie, {
      type: "pie",
      data: {
        labels: ["Pendientes", "Aprobadas", "Rechazadas"],
        datasets: [{
          data: [estados.pendientes, estados.aprobadas, estados.rechazadas],
          backgroundColor: ["#fbc02d", "#2e7d32", "#c62828"]
        }]
      }
    });

    const ctxBar = document.getElementById("barChart").getContext("2d");
    new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: ["Usuarios", "Fertilizantes", "Solicitudes", "Entregas"],
        datasets: [{
          label: "Cantidad",
          data: [
            datosGenerales.usuarios,
            datosGenerales.fertilizantes,
            datosGenerales.solicitudes,
            datosGenerales.entregas
          ],
          backgroundColor: ["#1b5e20", "#66bb6a", "#fbc02d", "#43a047"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    console.log("Dashboard conectado correctamente con el backend");

  } catch (err) {
    console.error("Error al conectar el Dashboard:", err);
    alert("Error al cargar datos del Dashboard.");
  }
});

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.clear();
    window.location.href = "../login/Login.html";
  }
}
