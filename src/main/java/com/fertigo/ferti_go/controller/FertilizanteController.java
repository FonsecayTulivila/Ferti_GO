package com.fertigo.ferti_go.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fertigo.ferti_go.model.Fertilizante;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.service.FertilizanteService;
import com.fertigo.ferti_go.service.UsuarioService;

@CrossOrigin(origins = "*")
@RequestMapping("/fertilizante")
@RestController
public class FertilizanteController {
    @Autowired
    private FertilizanteService fertilizanteService;

    @Autowired
    private UsuarioService usuarioService;

    // Crear fertilizante (solo Admin)
    @PostMapping("/{idUsuario}")
    public ResponseEntity<?> agregarFertilizante(
            @RequestBody Fertilizante fertilizante, 
            @PathVariable Long idUsuario) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            Fertilizante nuevo = fertilizanteService.AgregarFertilizante(fertilizante, usuario);
            return ResponseEntity.status(201).body(nuevo);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("ERROR: " + e.getMessage());
        }
    }


    // Ver todos
    @GetMapping
    public ResponseEntity<?> verFertilizantes() {
        try {
            return ResponseEntity.ok(fertilizanteService.listarTodos());
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: al mostrar fertilizantes");
        }
    }

    // Ver por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(fertilizanteService.ObetenerFertilizante(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: al obtener fertilizante por ID");
        }
    }

    // Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarFertilizante(@PathVariable Long id, @RequestBody Fertilizante actualizarDatos){
        try {
            return ResponseEntity.ok(fertilizanteService.editarFertilizante(id, actualizarDatos));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: al actualizar fertilizante");
        }
    }

    // ✅ AGREGAR ESTE MÉTODO - Eliminar fertilizante (solo Admin)
    @DeleteMapping("/{id}/{idUsuario}")
    public ResponseEntity<?> eliminarFertilizante(@PathVariable Long id, @PathVariable Long idUsuario) {
        try {
            UsuarioModel usuario = usuarioService.obtenerUsuario(idUsuario);
            fertilizanteService.EliminarFertilizante(id, usuario);
            return ResponseEntity.ok("Fertilizante eliminado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.status(403).body("ERROR: " + e.getMessage());
        }
    }
}