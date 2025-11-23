package com.fertigo.ferti_go.controller;


import com.fertigo.ferti_go.model.Finca;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.service.FincaService;
import com.fertigo.ferti_go.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/finca") // http://localhost:8080/Finca
public class FincaController {

    @Autowired
    private FincaService fincaService;

    @Autowired
    private UsuarioService usuarioService;

    //  Crear finca (solo ADMIN)
    // POST http://localhost:8080/Finca/{idUsuario}
    @PostMapping("/{idUsuario}")
    public ResponseEntity<?> agregarFinca(@RequestBody Finca finca,@PathVariable Long idUsuario) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            Finca nueva = fincaService.agregarFinca(finca, usuario);
            return ResponseEntity.status(201).body(nueva);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("ERROR: " + e.getMessage());
        }
    }

    // Listar todas las fincas
    //  http://localhost:8080/Finca
    @GetMapping
    public ResponseEntity<?> listarFincas() {
        try {
            List<Finca> fincas = fincaService.listarTodos();
            return ResponseEntity.ok(fincas);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: al listar fincas");
        }
    }

    //  Obtener finca por ID
    // http://localhost:8080/Finca/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerFinca(@PathVariable Long id) {
        try {
            Finca finca = fincaService.obtenerFinca(id);
            return ResponseEntity.ok(finca);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: " + e.getMessage());
        }
    }

    //  Editar finca (solo ADMIN)
    // http://localhost:8080/Finca/{id}/{idUsuario}
    @PutMapping("/{id}/{idUsuario}")
    public ResponseEntity<?> editarFinca(@PathVariable Long id,@PathVariable Long idUsuario,@RequestBody Finca nuevaFinca) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            if (usuario.getRol() != UsuarioModel.Rol.ADMIN) {
                throw new IllegalArgumentException("Solo el ADMIN puede editar fincas.");
            }
            Finca finca = fincaService.EditarFinca(id, nuevaFinca);
            return ResponseEntity.ok(finca);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("ERROR: " + e.getMessage());
        }
    }

    //Eliminar finca (solo ADMIN)
    // http://localhost:8080/Finca/{id}/{idUsuario}
    @DeleteMapping("/{id}/{idUsuario}")
    public ResponseEntity<?> eliminarFinca(@PathVariable Long id,@PathVariable Long idUsuario) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            fincaService.eliminarFinca(id, usuario);
            return ResponseEntity.ok("Finca eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(403).body("ERROR: " + e.getMessage());
        }
    }

    //Cambiar estado de la finca (ej. ACTIVA / INACTIVA)
    // http://localhost:8080/Finca/{id}/estado/{idUsuario}
    @PutMapping("/{id}/estado/{idUsuario}")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @PathVariable Long idUsuario, @RequestBody String nuevoEstado) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            if (usuario.getRol() != UsuarioModel.Rol.ADMIN) {
                throw new IllegalArgumentException("Solo el ADMIN puede cambiar el estado de la finca.");
            }
            String estadoTxt = nuevoEstado.replace("\"", "").trim().toUpperCase();
            Finca.EstadoFinca estado = Finca.EstadoFinca.valueOf(estadoTxt);

            Finca finca = fincaService.cambiarEstadoFinca(id, estado);
            return ResponseEntity.ok(finca);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("ERROR: " + e.getMessage());
        }
    }
}

