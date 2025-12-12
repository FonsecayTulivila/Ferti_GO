// usuarios.js → VERSIÓN FINAL: SOLO MUESTRA CAPATACES
document.addEventListener("DOMContentLoaded", () => {
  const BASE = window.location.hostname === "localhost"
    ? "http://localhost:8080/usuario"
    : "https://fertigo-production-0cf0.up.railway.app/usuario";

  // DOM
  const tablaUsuarios = document.getElementById("tablaUsuarios");
  const totalUsuarios = document.getElementById("totalUsuarios");
  const totalCapataces = document.getElementById("totalCapataces");
  const btnNuevoUsuario = document.getElementById("btnNuevoUsuario");
  const modalUsuario = document.getElementById("modalUsuario");
  const cerrarModal = document.getElementById("cerrarModal");
  const formUsuario = document.getElementById("formUsuario");
  
  // BUSCADOR
  const buscadorUsuarios = document.getElementById("buscadorUsuarios");
  const resultadosBusqueda = document.getElementById("resultadosBusqueda");

  // inputs del modal
  const inpNombre = document.getElementById("nombre");
  const inpEmail = document.getElementById("email");
  const inpContrasena = document.getElementById("contraseña");
  const inpFincaNombre = document.getElementById("fincaNombre");
  const inpFincaUbicacion = document.getElementById("fincaUbicacion");
  const selFincaEstado = document.getElementById("fincaEstado");

  let editingId = null;
  let usuariosGlobal = []; // ← Todos los usuarios del servidor
  let capatacesGlobal = []; // ← Solo los CAPATACES (filtrados una vez)

  // Mostrar / ocultar modal
  function showModal() {
    modalUsuario.style.display = "flex";
  }
  function hideModal() {
    modalUsuario.style.display = "none";
    editingId = null;
    formUsuario.reset();
  }

  // Renderizar SOLO capataces
  function renderizarUsuarios(capataces) {
    tablaUsuarios.innerHTML = "";
    
    if (capataces.length === 0) {
      tablaUsuarios.innerHTML = `
        <tr>
          <td colspan="7" class="no-resultados">
            No hay capataces registrados aún
          </td>
        </tr>
      `;
      return;
    }

    capataces.forEach(u => {
      const finca = u.finca || {};
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id ?? "-"}</td>
        <td>${u.nombre ?? "-"}</td>
        <td>${u.email ?? "-"}</td>
        <td>${finca.nombre ?? "-"}</td>
        <td>${finca.ubicacion ?? "-"}</td>
        <td>${finca.estado ?? "-"}</td>
        <td>
          <button class="btn-editar" data-id="${u.id}">Editar</button>
          <button class="btn-eliminar" data-id="${u.id}">Eliminar</button>
        </td>
      `;
      tablaUsuarios.appendChild(tr);
    });
  }

  // Cargar usuarios del backend y filtrar solo CAPATACES
  async function cargarUsuarios() {
    try {
      const res = await fetch(BASE);
      if (!res.ok) throw new Error("Status: " + res.status);

      const todosLosUsuarios = await res.json();

      // FILTRAR: guardamos todos y solo capataces
      usuariosGlobal = todosLosUsuarios;
      capatacesGlobal = todosLosUsuarios.filter(u => u.rol === "CAPATAZ");

      // Actualizamos contadores
      if (totalUsuarios) totalUsuarios.textContent = usuariosGlobal.length; // total general (opcional)
      if (totalCapataces) totalCapataces.textContent = capatacesGlobal.length;

      renderizarUsuarios(capatacesGlobal);
      actualizarContadorResultados(capatacesGlobal.length, capatacesGlobal.length);
    } catch (err) {
      console.error("cargarUsuarios error:", err);
      tablaUsuarios.innerHTML = `<tr><td colspan="7" style="color:red;">Error al conectar con el servidor</td></tr>`;
    }
  }

  // Búsqueda solo entre capataces
  function filtrarUsuarios(terminoBusqueda) {
    const termino = terminoBusqueda.toLowerCase().trim();
    
    if (termino === "") {
      renderizarUsuarios(capatacesGlobal);
      actualizarContadorResultados(capatacesGlobal.length, capatacesGlobal.length);
      return;
    }

    const encontrados = capatacesGlobal.filter(usuario => {
      const nombre = (usuario.nombre || "").toLowerCase();
      const email = (usuario.email || "").toLowerCase();
      const fincaNombre = (usuario.finca?.nombre || "").toLowerCase();
      const fincaUbicacion = (usuario.finca?.ubicacion || "").toLowerCase();
      
      return nombre.includes(termino) || 
             email.includes(termino) || 
             fincaNombre.includes(termino) || 
             fincaUbicacion.includes(termino);
    });

    renderizarUsuarios(encontrados);
    actualizarContadorResultados(encontrados.length, capatacesGlobal.length);
  }

  function actualizarContadorResultados(encontrados, total) {
    if (buscadorUsuarios.value.trim() === "") {
      resultadosBusqueda.textContent = "";
    } else {
      resultadosBusqueda.textContent = `${encontrados} de ${total} capataces`;
    }
  }

  // Eventos
  buscadorUsuarios && buscadorUsuarios.addEventListener("input", (e) => {
    filtrarUsuarios(e.target.value);
  });

  btnNuevoUsuario && btnNuevoUsuario.addEventListener("click", () => {
    editingId = null;
    formUsuario.reset();
    showModal();
  });

  cerrarModal && cerrarModal.addEventListener("click", hideModal);
  window.addEventListener("click", (e) => { if (e.target === modalUsuario) hideModal(); });

  // Crear / Editar (siempre con rol CAPATAZ)
  formUsuario && formUsuario.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const nombre = inpNombre.value.trim();
    const email = inpEmail.value.trim();
    const contraseña = inpContrasena.value;
    const fincaNombre = inpFincaNombre.value.trim();
    const fincaUbicacion = inpFincaUbicacion.value.trim();
    const fincaEstado = selFincaEstado.value;

    if (!nombre || !email || !contraseña || !fincaNombre || !fincaUbicacion) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    const payload = {
      nombre,
      email,
      contraseña,
      contrasena: contraseña,
      rol: "CAPATAZ", // ← Forzamos siempre CAPATAZ
      finca: {
        nombre: fincaNombre,
        ubicacion: fincaUbicacion,
        estado: fincaEstado
      }
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`${BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(editingId ? "Capataz actualizado" : "Capataz creado");
        hideModal();
        await cargarUsuarios();
        buscadorUsuarios.value = "";
      } else {
        const txt = await res.text();
        alert("Error: " + (txt || res.status));
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  });

  // Eliminar y Editar (igual que antes)
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
      const id = e.target.dataset.id;
      if (!id || !confirm("¿Eliminar este capataz?")) return;
      await fetch(`${BASE}/${id}`, { method: "DELETE" });
      await cargarUsuarios();
      buscadorUsuarios.value = "";
    }

    if (e.target.classList.contains("btn-editar")) {
      const id = e.target.dataset.id;
      const usuario = usuariosGlobal.find(u => u.id == id);
      if (!usuario) return;

      editingId = id;
      inpNombre.value = usuario.nombre || "";
      inpEmail.value = usuario.email || "";
      inpContrasena.value = ""; // no mostramos contraseña
      inpFincaNombre.value = usuario.finca?.nombre || "";
      inpFincaUbicacion.value = usuario.finca?.ubicacion || "";
      selFincaEstado.value = usuario.finca?.estado || "ACTIVA";
      showModal();
    }
  });

  // Carga inicial
  cargarUsuarios();
});

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.clear();
    window.location.href = '../login/login.html';
  }
}