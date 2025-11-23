package com.fertigo.ferti_go.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fertigo.ferti_go.model.Novedades;
import com.fertigo.ferti_go.repository.NovedadesRepository;

@Service
public class NovedadesService {

    @Autowired
    private NovedadesRepository novedadesRepo;
     //Agregar Novedad
    public Novedades agregarNovedad(Novedades novedad) {
        return novedadesRepo.save(novedad);
    }
    //Mostrar todas la Novedad
    public List<Novedades> obtenerNovedades() {
        return novedadesRepo.findAll();
    }
    //Mostrar Novedad por ID
    public Novedades obtenerNovedadPorId(Long id) {
        return novedadesRepo.findById(id).orElse(null);
    }
    //Eliminar Novedad
    public void eliminarNovedad(Long id) {
        novedadesRepo.deleteById(id);
    }

    
}
