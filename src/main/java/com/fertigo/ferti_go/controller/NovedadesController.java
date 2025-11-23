package com.fertigo.ferti_go.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fertigo.ferti_go.model.Novedades;
import com.fertigo.ferti_go.service.NovedadesService;
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/novedades")
public class NovedadesController {
    @Autowired  
    private NovedadesService novedadesService;
    
    @PostMapping
    public Novedades agregarNovedad(@RequestBody Novedades novedad) {
        return novedadesService.agregarNovedad(novedad);
    }
    @GetMapping
    public List<Novedades> obtenerNovedades() {
        return novedadesService.obtenerNovedades();
    }
    @GetMapping("/{id}")
    public Novedades obtenerNovedadPorId(@PathVariable Long id) {
        return novedadesService.obtenerNovedadPorId(id);
    }
    @DeleteMapping("/{id}")
    public void eliminarNovedad(@PathVariable Long id) {
        novedadesService.eliminarNovedad(id);
    }



}
