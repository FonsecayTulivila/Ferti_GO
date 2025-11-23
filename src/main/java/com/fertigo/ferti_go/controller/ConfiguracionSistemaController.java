package com.fertigo.ferti_go.controller;

import org.springframework.web.bind.annotation.*;

import com.fertigo.ferti_go.model.ConfiguracionSistema;
import com.fertigo.ferti_go.service.ConfiguracionSistemaService;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "*")
public class ConfiguracionSistemaController {

    private final ConfiguracionSistemaService service;

    public ConfiguracionSistemaController(ConfiguracionSistemaService service) {
        this.service = service;
    }

    @GetMapping
    public ConfiguracionSistema obtenerConfiguracion() {
        return service.obtenerConfiguracion();
    }

    @PutMapping("/{id}")
    public ConfiguracionSistema actualizarConfiguracion(@PathVariable Long id, @RequestBody ConfiguracionSistema configuracion) {
        return service.actualizarConfiguracion(id, configuracion);
    }

    @PostMapping
    public ConfiguracionSistema crearConfiguracion(@RequestBody ConfiguracionSistema configuracion) {
        return service.guardarConfiguracion(configuracion);
    }
}
