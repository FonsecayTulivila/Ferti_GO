package com.fertigo.ferti_go.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fertigo.ferti_go.model.SolicitudFertilizante;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.service.SolicitudFertilizanteService;
import com.fertigo.ferti_go.service.UsuarioService;

@RestController
@RequestMapping("/solicitudFertilizante")
@CrossOrigin(origins = "*")
public class SolicitudFertilizanteController {

    @Autowired
    private SolicitudFertilizanteService solicitudService;

    @Autowired
    private UsuarioService usuarioService;

    // Crear solicitud
    @PostMapping("/{idUsuario}")
    public ResponseEntity<?> crearSolicitud(
            @RequestBody SolicitudFertilizante solicitud,
            @PathVariable Long idUsuario) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            return ResponseEntity.status(201).body(solicitudService.crearSolicitud(solicitud, usuario));
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: " + e.getMessage());
        }
    }

    // Ver todas
    @GetMapping
    public ResponseEntity<?> listarSolicitudes() {
        try {
            return ResponseEntity.ok(solicitudService.listarTodos());
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: no se pudieron listar las solicitudes");
        }
    }

    // Ver por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(solicitudService.obtenerSolicitud(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: solicitud no encontrada");
        }
    }

    // Actualizar solicitud
    @PutMapping("/{id}/{idUsuario}")
    public ResponseEntity<?> actualizarSolicitud(
            @PathVariable Long id,
            @RequestBody SolicitudFertilizante nueva,
            @PathVariable Long idUsuario) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            return ResponseEntity.ok(solicitudService.actualizarSolicitud(id, nueva, usuario));
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: " + e.getMessage());
        }
    }

    // Cambiar estado (solo el estado)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {
        try {
            return ResponseEntity.ok(solicitudService.cambiarEstado(id, estado));
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: " + e.getMessage());
        }
    }

    // Eliminar solicitud
    @DeleteMapping("/{id}/{idUsuario}")
    public ResponseEntity<?> eliminarSolicitud(
            @PathVariable Long id,
            @PathVariable Long idUsuario) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            solicitudService.eliminarSolicitud(id, usuario);
            return ResponseEntity.ok("Solicitud eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: " + e.getMessage());
        }
    }
}
        