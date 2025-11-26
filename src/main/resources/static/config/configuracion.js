const API_URL = 'https://fertigo-production.up.railway.app/usuario';
const API_CONFIG_URL = 'https://fertigo-production.up.railway.app/api/configuracion';
let usuarioActual = null;
let configuracionId = null; // Para guardar el ID de la configuración


document.addEventListener('DOMContentLoaded', function() {
  cargarUsuario();
  cargarConfiguracion();
});
function cargarUsuario() {
  const user = localStorage.getItem('usuario');
  if (user) {
    try {
      usuarioActual = JSON.parse(user);
      document.getElementById('nombreUsuario').textContent = usuarioActual.nombre || 'Admin';
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      document.getElementById('nombreUsuario').textContent = 'Admin';
    }
  } else {
    // Si no hay usuario en localStorage, usar datos de sesión por defecto
    console.warn('No se encontró usuario en localStorage');
    document.getElementById('nombreUsuario').textContent = 'Admin';
    // No redirigir, permitir continuar
  }
}

// CARGAR CONFIGURACIÓN ACTUAL
async function cargarConfiguracion() {
  try {
    // GET /api/configuracion (según tu controlador)
    const response = await fetch(`${API_CONFIG_URL}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar configuración');
    }
    
    const config = await response.json();
    
    if (config && config.id) {
      // Guardar el ID para futuras actualizaciones
      configuracionId = config.id;
      
      // Actualizar información en pantalla
      document.getElementById('empresaActual').textContent = config.nombreEmpresa || 'No configurado';
      document.getElementById('idiomaActual').textContent = obtenerNombreIdioma(config.idioma);
      
      if (config.ultimaActualizacion) {
        const fecha = new Date(config.ultimaActualizacion);
        document.getElementById('ultimaActualizacion').textContent = formatearFecha(fecha);
      } else {
        document.getElementById('ultimaActualizacion').textContent = 'Nunca';
      }
    } else {
      // No existe configuración, mostrar mensaje
      document.getElementById('empresaActual').textContent = 'No configurado';
      document.getElementById('idiomaActual').textContent = 'No configurado';
      document.getElementById('ultimaActualizacion').textContent = 'Nunca';
    }
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('empresaActual').textContent = 'Error al cargar';
    document.getElementById('idiomaActual').textContent = 'Error al cargar';
    document.getElementById('ultimaActualizacion').textContent = 'Error al cargar';
  }
}

// ==========================================
// MODAL CONTROLS
// ==========================================
function openModal(id) {
  const modal = document.getElementById(id);
  modal.style.display = "flex";
  
  // Si es el modal de empresa, cargar el nombre actual
  if (id === 'empresaModal') {
    const empresaActual = document.getElementById('empresaActual').textContent;
    if (empresaActual !== 'No configurado' && empresaActual !== 'Error al cargar') {
      document.getElementById('empresaInput').value = empresaActual;
    }
  }
  
  // Si es el modal de idioma, cargar el idioma actual
  if (id === 'idiomaModal') {
    cargarIdiomaActual();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.style.display = "none";
  
  // Limpiar formularios
  if (id === 'empresaModal') {
    document.getElementById('empresaInput').value = '';
  }
  if (id === 'contrasenaModal') {
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
}

// ==========================================
// GUARDAR NOMBRE DE EMPRESA
// ==========================================
async function guardarEmpresa() {
  const nombre = document.getElementById('empresaInput').value.trim();
  
  if (!nombre) {
    mostrarMensaje('Por favor ingrese un nombre válido', false);
    return;
  }
  
  try {
    let response;
    
    if (configuracionId) {
      // Si existe configuración, actualizar (PUT /api/configuracion/{id})
        response = await fetch(`${API_CONFIG_URL}/${configuracionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombreEmpresa: nombre,
          idioma: document.getElementById('idiomaActual').textContent === 'Español' ? 'es' : 
                  document.getElementById('idiomaActual').textContent === 'English' ? 'en' : 'pt'
        })
      });
    } else {
      // Si no existe, crear nueva (POST /api/configuracion)
        response = await fetch(`${API_CONFIG_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombreEmpresa: nombre,
          idioma: 'es'
        })
      });
    }
    
    if (!response.ok) {
      throw new Error('Error al actualizar');
    }
    
    const config = await response.json();
    configuracionId = config.id;
    
    mostrarMensaje('Nombre de empresa actualizado correctamente', true);
    document.getElementById('empresaActual').textContent = config.nombreEmpresa;
    closeModal('empresaModal');
    
    // Recargar configuración completa
    setTimeout(() => cargarConfiguracion(), 500);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error al actualizar el nombre de empresa', false);
  }
}

// ==========================================
// CARGAR IDIOMA ACTUAL
// ==========================================
async function cargarIdiomaActual() {
  try {
    const response = await fetch(`${API_URL}/configuracion`);
    
    if (response.ok) {
      const config = await response.json();
      if (config) {
        document.getElementById('idiomaSelect').value = config.idioma || 'es';
      }
    }
  } catch (error) {
    console.error('Error al cargar idioma:', error);
  }
}

// ==========================================
// GUARDAR IDIOMA
// ==========================================
async function guardarIdioma() {
  const idioma = document.getElementById('idiomaSelect').value;
  
  try {
    let response;
    
    if (configuracionId) {
      // Si existe configuración, actualizar (PUT /api/configuracion/{id})
      response = await fetch(`${API_URL}/configuracion/${configuracionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombreEmpresa: document.getElementById('empresaActual').textContent,
          idioma: idioma
        })
      });
    } else {
      // Si no existe, crear nueva (POST /api/configuracion)
      response = await fetch(`${API_URL}/configuracion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombreEmpresa: 'Fertigo',
          idioma: idioma
        })
      });
    }
    
    if (!response.ok) {
      throw new Error('Error al actualizar');
    }
    
    const config = await response.json();
    configuracionId = config.id;
    
    mostrarMensaje('Idioma actualizado correctamente', true);
    document.getElementById('idiomaActual').textContent = obtenerNombreIdioma(config.idioma);
    closeModal('idiomaModal');
    
    // Recargar configuración completa
    setTimeout(() => cargarConfiguracion(), 500);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error al actualizar el idioma', false);
  }
}
// ==========================================
// CAMBIAR CONTRASEÑA
// ==========================================
async function guardarContrasena() {
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validaciones
  if (!oldPassword || !newPassword || !confirmPassword) {
    mostrarMensaje('Por favor complete todos los campos', false);
    return;
  }
  
  if (newPassword.length < 6) {
    mostrarMensaje('La nueva contraseña debe tener al menos 6 caracteres', false);
    return;
  }
  
  if (newPassword !== confirmPassword) {
    mostrarMensaje('Las contraseñas no coinciden', false);
    return;
  }
  
  try {
    // Obtener ID del usuario actual (guardado en localStorage)
    let userId = usuarioActual?.id;
    if (!userId) {
      userId = 1; // ID por defecto si no hay usuario guardado
      console.warn('No se encontró usuario en localStorage, usando ID por defecto: 1');
    }

    // Enviar directamente el body con los nombres esperados por el backend
    const response = await fetch(`${API_URL}/${userId}/cambiar-contrasena`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al cambiar la contraseña');
    }

    mostrarMensaje('Contraseña actualizada correctamente', true);
    closeModal('contrasenaModal');
    
    // Limpiar campos después del éxito
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje(error.message || 'Error al cambiar la contraseña', false);
  }
}

// ==========================================
// UTILIDADES
// ==========================================
function obtenerNombreIdioma(codigo) {
  const idiomas = {
    'es': 'Español',
    'en': 'English',
    'pt': 'Português'
  };
  return idiomas[codigo] || codigo;
}

function formatearFecha(fecha) {
  const opciones = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return fecha.toLocaleDateString('es-ES', opciones);
}

function mostrarMensaje(texto, exito = true) {
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = texto;
  mensaje.className = 'mensaje-flotante ' + (exito ? 'exito' : 'error');
  mensaje.style.display = 'block';
  
  setTimeout(() => {
    mensaje.style.display = 'none';
  }, 3500);
}

// ==========================================
// CERRAR SESIÓN
// ==========================================
function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuario');
    localStorage.clear(); // Limpiar todo el localStorage
    window.location.href = '../login/login.html';
  }
}