// Abrir modal con el video
function abrirVideo(url) {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");

  frame.src = url + "?autoplay=1"; // para que inicie automáticamente
  modal.style.display = "block";
}

// Cerrar modal y detener video
function cerrarVideo() {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");

  modal.style.display = "none";
  frame.src = ""; // detener video
}

// Cerrar si hace clic fuera del modal
window.onclick = function(event) {
  const modal = document.getElementById("videoModal");

  if (event.target === modal) {
    cerrarVideo();
  }
}

// Cerrar sesión
function cerrarSesion() {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    localStorage.clear();
    window.location.href = '../login/login.html';
  }
}
