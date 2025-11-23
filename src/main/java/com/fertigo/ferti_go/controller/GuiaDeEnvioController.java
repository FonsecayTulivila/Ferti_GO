package com.fertigo.ferti_go.controller;
import com.fertigo.ferti_go.model.GuiaDeEnvio;
import com.fertigo.ferti_go.service.GuiaDeEnvioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/guiaDeEnvio")  // Base: http://localhost:8080/GuiaDeEnvio
public class GuiaDeEnvioController {

    @Autowired
    private GuiaDeEnvioService guiaService;

    // Generar guía (solo si la solicitud está APROBADA)
    // POST http://localhost:8080/GuiaDeEnvio/generar/{idSolicitud}
    @PostMapping("/generar/{idSolicitud}")
    public ResponseEntity<?> generarGuia(@PathVariable Long idSolicitud,@RequestBody GuiaDeEnvio guiaRequest) {
        try {
            GuiaDeEnvio guia = guiaService.generarGuia(idSolicitud,guiaRequest.getDescripcion());
            return ResponseEntity.status(201).body(guia);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("ERROR: " + e.getMessage());
        }
    }

    //  Listar todas las guías
    // GET http://localhost:8080/GuiaDeEnvio
    @GetMapping
    public ResponseEntity<?> listarGuias() {
        try {
            List<GuiaDeEnvio> guias = guiaService.listarGuias();
            return ResponseEntity.ok(guias);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: al listar guías");
        }
    }

    //  Obtener guía por id
    // GET http://localhost:8080/GuiaDeEnvio/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerGuia(@PathVariable Long id) {
        try {
            GuiaDeEnvio guia = guiaService.obtenerGuia(id);
            return ResponseEntity.ok(guia);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: " + e.getMessage());
        }
    }

    //  Cambiar estado de la guía
    // PUT http://localhost:8080/GuiaDeEnvio/{id}/estado
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id,@RequestBody String nuevoEstado) {
        try {
            String estadoTxt = nuevoEstado.replace("\"", "").trim().toUpperCase();
            GuiaDeEnvio.EstadoEnvio estado = GuiaDeEnvio.EstadoEnvio.valueOf(estadoTxt);

            GuiaDeEnvio guia = guiaService.cambiarEstado(id, estado);
            return ResponseEntity.ok(guia);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Estado inválido. Usa: PENDIENTE, EN_RUTA o ENTREGADO");
        } catch (Exception e) {
            return ResponseEntity.status(404).body("ERROR: " + e.getMessage());
        }
    }
}

