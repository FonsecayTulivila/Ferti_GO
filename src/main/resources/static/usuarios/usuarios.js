// usuarios.js
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

  let editingId = null; // null => crear, id => editar
  let usuariosGlobal = []; // Array global para filtrado

  // Mostrar / ocultar modal
  function showModal() {
    modalUsuario.style.display = "flex";
  }
  function hideModal() {
    modalUsuario.style.display = "none";
    editingId = null;
    formUsuario.reset();
  }

  // Renderizar usuarios en la tabla
  function renderizarUsuarios(usuarios) {
    tablaUsuarios.innerHTML = "";
    
    if (usuarios.length === 0) {
      tablaUsuarios.innerHTML = `
        <tr>
          <td colspan="7" class="no-resultados">
            No se encontraron usuarios con ese criterio de búsqueda
          </td>
        </tr>
      `;
      return;
    }

    usuarios.forEach(u => {
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
          <button class="btn-editar" data-id="${u.id}">✏️</button>
          <button class="btn-eliminar" data-id="${u.id}">🗑</button>
        </td>
      `;
      tablaUsuarios.appendChild(tr);
    });
  }

  // Cargar y pintar usuarios
  async function cargarUsuarios() {
    try {
      const res = await fetch(BASE);
      if (!res.ok) throw new Error("Status: " + res.status);
      const usuarios = await res.json();

      usuariosGlobal = usuarios; // Guardar en variable global

      totalUsuarios && (totalUsuarios.textContent = usuarios.length);
      totalCapataces && (totalCapataces.textContent = usuarios.filter(u => u.rol === "CAPATAZ").length);

      renderizarUsuarios(usuarios);
      actualizarContadorResultados(usuarios.length, usuarios.length);
    } catch (err) {
      console.error("cargarUsuarios error:", err);
      alert("No se pudieron cargar los usuarios.");
    }
  }

  // ===== FUNCIONALIDAD DE BÚSQUEDA =====
  function filtrarUsuarios(terminoBusqueda) {
    const termino = terminoBusqueda.toLowerCase().trim();
    
    if (termino === "") {
      renderizarUsuarios(usuariosGlobal);
      actualizarContadorResultados(usuariosGlobal.length, usuariosGlobal.length);
      return;
    }

    const usuariosFiltrados = usuariosGlobal.filter(usuario => {
      const nombre = (usuario.nombre || "").toLowerCase();
      const email = (usuario.email || "").toLowerCase();
      const fincaNombre = (usuario.finca?.nombre || "").toLowerCase();
      const fincaUbicacion = (usuario.finca?.ubicacion || "").toLowerCase();
      
      return nombre.includes(termino) || 
             email.includes(termino) || 
             fincaNombre.includes(termino) || 
             fincaUbicacion.includes(termino);
    });

    renderizarUsuarios(usuariosFiltrados);
    actualizarContadorResultados(usuariosFiltrados.length, usuariosGlobal.length);
  }

  function actualizarContadorResultados(encontrados, total) {
    if (buscadorUsuarios.value.trim() === "") {
      resultadosBusqueda.textContent = "";
    } else {
      resultadosBusqueda.textContent = `${encontrados} de ${total} usuarios`;
    }
  }

  // Event listener para el buscador
  buscadorUsuarios && buscadorUsuarios.addEventListener("input", (e) => {
    filtrarUsuarios(e.target.value);
  });

  // Nuevo usuario (botón)
  btnNuevoUsuario && btnNuevoUsuario.addEventListener("click", () => {
    editingId = null;
    formUsuario.reset();
    showModal();
  });

  // Cerrar modal
  cerrarModal && cerrarModal.addEventListener("click", hideModal);
  window.addEventListener("click", (e) => { if (e.target === modalUsuario) hideModal(); });

  // Un único handler de submit para crear/editar
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

    // payload (enviamos ambas claves de contraseña por compatibilidad)
    const payload = {
      nombre,
      email,
      contraseña,
      contrasena: contraseña,
      rol: "CAPATAZ",
      finca: {
        nombre: fincaNombre,
        ubicacion: fincaUbicacion,
        estado: fincaEstado
      }
    };

    try {
      let res;
      if (editingId) {
        // editar
        res = await fetch(`${BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // crear
        res = await fetch(BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(editingId ? "✅ Usuario actualizado" : "✅ Usuario creado");
        hideModal();
        await cargarUsuarios();
        buscadorUsuarios.value = ""; // Limpiar búsqueda
      } else {
        const txt = await res.text();
        console.error("server error:", res.status, txt);
        alert("Error del servidor: " + (txt || res.status));
      }
    } catch (err) {
      console.error("fetch error:", err);
      alert("No se pudo conectar al servidor. Revisa que Spring Boot esté corriendo y CORS permita tu origen.");
    }
  });

  // Delegación: editar / eliminar desde la tabla
  document.addEventListener("click", async (e) => {
    // Eliminar
    if (e.target.classList.contains("btn-eliminar")) {
      const id = e.target.dataset.id;
      if (!id) return;
      const ok = confirm("⚠️ ¿Seguro que deseas eliminar este usuario?");
      if (!ok) return;
      try {
        const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("✅ Usuario eliminado");
          await cargarUsuarios();
          buscadorUsuarios.value = ""; // Limpiar búsqueda
        } else {
          const txt = await res.text();
          alert("Error eliminando: " + (txt || res.status));
        }
      } catch (err) {
        console.error(err);
        alert("No se pudo conectar al servidor.");
      }
    }

    // Editar
    if (e.target.classList.contains("btn-editar")) {
      const id = e.target.dataset.id;
      if (!id) return;
      try {
        const res = await fetch(`${BASE}/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el usuario: " + res.status);
        const usuario = await res.json();

        // Rellenar modal
        editingId = id;
        inpNombre.value = usuario.nombre || "";
        inpEmail.value = usuario.email || "";
        inpContrasena.value = usuario.contraseña || usuario.contrasena || "";
        inpFincaNombre.value = usuario.finca?.nombre || "";
        inpFincaUbicacion.value = usuario.finca?.ubicacion || "";
        selFincaEstado.value = usuario.finca?.estado || "ACTIVA";

        showModal();
      } catch (err) {
        console.error("editar error:", err);
        alert("No se pudo cargar los datos para edición.");
      }
    }
  });

  // Primera carga
  cargarUsuarios();
});

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuario');
    localStorage.clear(); // Limpiar todo el localStorage
    window.location.href = '../login/login.html';
  }
}