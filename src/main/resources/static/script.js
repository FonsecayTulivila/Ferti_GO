document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const mensajeEstado = document.createElement("p");

  mensajeEstado.style.marginTop = "10px";
  mensajeEstado.style.fontWeight = "bold";
  form.parentNode.appendChild(mensajeEstado);

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita el envío por defecto

    // Obtener valores de los campos principales
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    // Validación de campos vacíos
    if (nombre === "" || email === "" || mensaje === "") {
      mostrarMensaje("❌ Por favor, completa todos los campos obligatorios.", "error");
      return;
    }

    // Validación de correo electrónico
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(email)) {
      mostrarMensaje("❌ Ingresa un correo electrónico válido.", "error");
      return;
    }

    // Si pasa todas las validaciones
    mostrarMensaje("✅ ¡Formulario enviado con éxito! Nos pondremos en contacto contigo pronto.", "exito");
    form.reset();
  });

  function mostrarMensaje(texto, tipo) {
    mensajeEstado.textContent = texto;
    if (tipo === "error") {
      mensajeEstado.style.color = "red";
    } else if (tipo === "exito") {
      mensajeEstado.style.color = "green";
    }
  }
});
