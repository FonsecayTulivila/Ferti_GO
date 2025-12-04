const API_URL = 'https://fertigo-production-0cf0.up.railway.app/usuario';
const API_CONFIG_URL = 'https://fertigo-production-0cf0.up.railway.app/api/configuracion';
let usuarioActual = null;
let configuracionId = null;

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
    console.warn('No se encontró usuario en localStorage');
    document.getElementById('nombreUsuario').textContent = 'Admin';
  }
}

async function cargarConfiguracion() {
  try {
    const response = await fetch(`${API_CONFIG_URL}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar configuración');
    }
    
    const config = await response.json();
    
    if (config && config.id) {
      configuracionId = config.id;
      
      document.getElementById('empresaActual').textContent = config.nombre_empresa || config.nombreEmpresa || 'No configurado';
      document.getElementById('idiomaActual').textContent = obtenerNombreIdioma(config.idioma);
      
      if (config.ultima_actualizacion || config.ultimaActualizacion) {
        const fecha = new Date(config.ultima_actualizacion || config.ultimaActualizacion);
        document.getElementById('ultimaActualizacion').textContent = formatearFecha(fecha);
      } else {
        document.getElementById('ultimaActualizacion').textContent = 'Nunca';
      }
    } else {
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

function openModal(id) {
  const modal = document.getElementById(id);
  modal.style.display = "flex";
  
  if (id === 'empresaModal') {
    const empresaActual = document.getElementById('empresaActual').textContent;
    if (empresaActual !== 'No configurado' && empresaActual !== 'Error al cargar') {
      document.getElementById('empresaInput').value = empresaActual;
    }
  }
  
  if (id === 'idiomaModal') {
    cargarIdiomaActual();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.style.display = "none";
  
  if (id === 'empresaModal') {
    document.getElementById('empresaInput').value = '';
  }
  if (id === 'contrasenaModal') {
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
}

async function guardarEmpresa() {
  const nombre = document.getElementById('empresaInput').value.trim();
  
  if (!nombre) {
    mostrarMensaje('Por favor ingrese un nombre válido', false);
    return;
  }
  
  try {
    let response;
    const idiomaActual = document.getElementById('idiomaActual').textContent;
    const codigoIdioma = idiomaActual === 'Español' ? 'es' : 
                         idiomaActual === 'English' ? 'en' : 'pt';
    
    if (configuracionId) {
      response = await fetch(`${API_CONFIG_URL}/${configuracionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre_empresa: nombre,
          idioma: codigoIdioma
        })
      });
    } else {
      response = await fetch(`${API_CONFIG_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre_empresa: nombre,
          idioma: 'es'
        })
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al actualizar');
    }
    
    const config = await response.json();
    configuracionId = config.id;
    
    mostrarMensaje('Nombre de empresa actualizado correctamente', true);
    document.getElementById('empresaActual').textContent = config.nombre_empresa || config.nombreEmpresa;
    closeModal('empresaModal');
    
    setTimeout(() => cargarConfiguracion(), 500);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error al actualizar el nombre de empresa: ' + error.message, false);
  }
}

async function cargarIdiomaActual() {
  try {
    const response = await fetch(`${API_CONFIG_URL}`);
    
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

async function guardarIdioma() {
  const idioma = document.getElementById('idiomaSelect').value;
  
  try {
    let response;
    const empresaActual = document.getElementById('empresaActual').textContent;
    
    if (configuracionId) {
      response = await fetch(`${API_CONFIG_URL}/${configuracionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre_empresa: empresaActual,
          idioma: idioma
        })
      });
    } else {
      response = await fetch(`${API_CONFIG_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre_empresa: 'Fertigo',
          idioma: idioma
        })
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al actualizar');
    }
    
    const config = await response.json();
    configuracionId = config.id;
    
    mostrarMensaje('Idioma actualizado correctamente', true);
    document.getElementById('idiomaActual').textContent = obtenerNombreIdioma(config.idioma);
    closeModal('idiomaModal');
    
    setTimeout(() => cargarConfiguracion(), 500);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error al actualizar el idioma: ' + error.message, false);
  }
}

async function guardarContrasena() {
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
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
    let userId = usuarioActual?.id;
    if (!userId) {
      userId = 1;
      console.warn('No se encontró usuario en localStorage, usando ID por defecto: 1');
    }

    const response = await fetch(`${API_URL}/${userId}/cambiar-contrasena`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al cambiar la contraseña');
    }

    mostrarMensaje('Contraseña actualizada correctamente', true);
    closeModal('contrasenaModal');
    
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje(error.message || 'Error al cambiar la contraseña', false);
  }
}

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

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuario');
    localStorage.clear();
    window.location.href = '../login/login.html';
  }
}