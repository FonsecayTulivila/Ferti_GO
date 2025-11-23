const modal = document.getElementById("modalFertilizante");
const btnNuevo = document.getElementById("btnNuevoFertilizante");
const cerrar = document.getElementById("cerrarModal");
const form = document.getElementById("formFertilizante");
const tabla = document.getElementById("tablaFertilizantes");
const total = document.getElementById("totalFertilizantes");

// Elementos de filtros
const buscador = document.getElementById("buscadorFertilizantes");
const resultadosFiltros = document.getElementById("resultadosFiltros");

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://fertigo-production.up.railway.app";

const API_URL = `${BASE_URL}/fertilizante`;
const ID_ADMIN = 1;

let editandoId = null;
let fertilizantesGlobal = [];
// Abrir modal
btnNuevo.addEventListener("click", () => {
  editandoId = null;
  document.getElementById("modalTitulo").textContent = "Agregar Fertilizante";
  form.reset();
  modal.style.display = "flex";
});
cerrar.addEventListener("click", () => {
  modal.style.display = "none";
  form.reset();
});

// Renderizar fertilizantes en tabla
function renderizarFertilizantes(fertilizantes) {
  tabla.innerHTML = "";
  
  if (fertilizantes.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="8" class="no-resultados">
          No se encontraron fertilizantes con los criterios seleccionados
        </td>
      </tr>
    `;
    return;
  }

  fertilizantes.forEach(f => {
    const row = `<tr>
      <td>${f.id}</td>
      <td>${f.nombre}</td>
      <td>${f.tipo}</td>
      <td>${f.cantidad}</td>
      <td>${f.unidad}</td>
      <td>${f.descripcion || ""}</td>
      <td>
        <button class="btn-edit" onclick="editarFertilizante(${f.id})">✏️ Editar</button>
        <button class="btn-delete" onclick="eliminarFertilizante(${f.id})">🗑️ Eliminar</button>
      </td>
    </tr>`;
    tabla.innerHTML += row;
  });
}

// Cargar fertilizantes
async function cargarFertilizantes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    
    fertilizantesGlobal = data;
    
    renderizarFertilizantes(fertilizantesGlobal);
    total.textContent = fertilizantesGlobal.length;
    actualizarContadorResultados(fertilizantesGlobal.length, fertilizantesGlobal.length);
  } catch (error) {
    console.error("Error cargando fertilizantes:", error);
    alert("Error al cargar los fertilizantes.");
  }
}

// ===== FUNCIÓN DE FILTRADO =====
function aplicarFiltros() {
  const textoBusqueda = buscador.value.toLowerCase().trim();

  const fertilizantesFiltrados = fertilizantesGlobal.filter(f => {
    // Filtro por texto (nombre o tipo)
    return textoBusqueda === "" || 
      f.nombre.toLowerCase().includes(textoBusqueda) ||
      f.tipo.toLowerCase().includes(textoBusqueda);
  });

  renderizarFertilizantes(fertilizantesFiltrados);
  actualizarContadorResultados(fertilizantesFiltrados.length, fertilizantesGlobal.length);
}

function actualizarContadorResultados(encontrados, total) {
  const hayFiltros = buscador.value.trim() !== "";
  
  if (hayFiltros) {
    resultadosFiltros.textContent = `${encontrados} de ${total} fertilizantes`;
    resultadosFiltros.style.display = "inline-block";
  } else {
    resultadosFiltros.style.display = "none";
  }
}

// Event listener para filtro
buscador.addEventListener("input", aplicarFiltros);

// Guardar / Editar fertilizante
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevo = {
    nombre: document.getElementById("nombre").value,
    tipo: document.getElementById("tipo").value,
    cantidad: parseInt(document.getElementById("cantidad").value),
    unidad: document.getElementById("unidad").value,
    descripcion: document.getElementById("descripcion").value
  };

  try {
    if (editandoId) {
      // Editar
      await fetch(`${API_URL}/${ID_ADMIN}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(nuevo)
      });
      alert("✅ Fertilizante actualizado correctamente");
    } else {
      // Nuevo
      await fetch(`${API_URL}/${ID_ADMIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(nuevo)
      });
      alert("✅ Fertilizante creado correctamente");
    }

    modal.style.display = "none";
    form.reset();
    buscador.value = ""; // Limpiar búsqueda
    await cargarFertilizantes();
  } catch (error) {
    console.error("Error guardando fertilizante:", error);
    alert("Error al guardar el fertilizante. Verifica la conexión con el servidor.");
  }
});

// Editar fertilizante
async function editarFertilizante(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const f = await res.json();

    editandoId = id;
    document.getElementById("modalTitulo").textContent = "Editar Fertilizante";

    document.getElementById("nombre").value = f.nombre;
    document.getElementById("tipo").value = f.tipo;
    document.getElementById("cantidad").value = f.cantidad;
    document.getElementById("unidad").value = f.unidad;
    document.getElementById("descripcion").value = f.descripcion || "";

    modal.style.display = "flex";
  } catch (error) {
    console.error("Error cargando fertilizante:", error);
    alert("Error al cargar el fertilizante para edición.");
  }
}

// Eliminar fertilizante
async function eliminarFertilizante(id) {
  if (confirm("¿Seguro que deseas eliminar este fertilizante?")) {
    try {
      await fetch(`${API_URL}/${id}/${ID_ADMIN}`, {
        method: "DELETE"
      });
      alert("✅ Fertilizante eliminado correctamente");
      buscador.value = ""; // Limpiar búsqueda
      await cargarFertilizantes();
    } catch (error) {
      console.error("Error eliminando fertilizante:", error);
      alert("Error al eliminar el fertilizante.");
    }
  }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    form.reset();
  }
};

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuario');
    localStorage.clear();
    window.location.href = '../login/Login.html';
  }
}

// Cargar inicial
cargarFertilizantes();