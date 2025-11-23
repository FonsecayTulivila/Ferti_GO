package com.fertigo.ferti_go.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.service.UsuarioService;

@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Crear usuario
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody UsuarioModel usuario) {
        try {
            if (usuario.getRol() == UsuarioModel.Rol.CAPATAZ) {
                if (usuario.getFinca() == null) {
                    return ResponseEntity.status(400).body("Se requiere una finca para el capataz");
                }
            } else {
                usuario.setFinca(null);
            }

            UsuarioModel nuevoUsuario = usuarioService.crearUsuario(usuario, usuario.getRol());
            return ResponseEntity.status(201).body(nuevoUsuario);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: al crear usuario");
        }
    }

    // Ver todos los usuarios
    @GetMapping
    public ResponseEntity<?> verUsuarios() {
        try {
            List<UsuarioModel> usuarios = usuarioService.mostrarTodosUsuarios();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: Mostrar usuarios");
        }
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(id);
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: al obtener usuario por ID");
        }
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody UsuarioModel actualizarDatos) {
        try {
            UsuarioModel usuario = usuarioService.actualizarUsuario(id, actualizarDatos);
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: al actualizar usuario");
        }
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok("Usuario eliminado");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: al eliminar usuario");
        }
    }

    // LOGIN (solo ADMIN)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuarioModel credenciales) {
        try {
            UsuarioModel usuario = usuarioService.validarLoginConRol(
                    credenciales.getEmail(),
                    credenciales.getContraseña(),
                    UsuarioModel.Rol.ADMIN
            );
            if (usuario != null) {
                return ResponseEntity.ok(usuario);
            } else {
                return ResponseEntity.status(401).body("Credenciales inválidas o no tienes permisos de ADMIN");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en login");
        }
    }

    // Cambiar contraseña
    @PutMapping("/{id}/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        UsuarioModel usuario = usuarioService.obtenerUsuario(id);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        // Validar contraseña actual
        if (!usuario.getContraseña().equals(oldPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Contraseña actual incorrecta");
        }

        usuario.setContraseña(newPassword);
        usuarioService.actualizarUsuario(id, usuario);

        return ResponseEntity.ok("Contraseña cambiada correctamente");
    }
}
