package com.fertigo.ferti_go.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fertigo.ferti_go.model.Fertilizante;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.repository.FertilizanteRepository;
@Service
public class FertilizanteService {
    @Autowired
    private FertilizanteRepository fertilizanteRepo;

    // Agregar fertilizante (suma cantidades si ya existe)
    public Fertilizante AgregarFertilizante(Fertilizante solicitud, UsuarioModel usuario){
        if (usuario.getRol() == UsuarioModel.Rol.ADMIN){ // solo Admin puede
            return fertilizanteRepo.findByNombre(solicitud.getNombre())
                    .map(f -> {
                        f.setCantidad(f.getCantidad() + solicitud.getCantidad()); // sumamos
                        return fertilizanteRepo.save(f);
                    })
                    .orElseGet(() -> fertilizanteRepo.save(solicitud)); // si no existe lo crea
        } else {
            throw new RuntimeException("Solo los ADMIN pueden agregar fertilizantes");
        }
    }

    // Obtener por iD
    public Fertilizante ObetenerFertilizante(Long id){
        return fertilizanteRepo.findById(id).orElse(null);
    }

    // Editar fertilizante
    public Fertilizante editarFertilizante(Long id, Fertilizante nuevoFertilizante) {
        Fertilizante fertilizanteExistente = fertilizanteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fertilizante con id " + id + " no encontrado"));

        fertilizanteExistente.setNombre(nuevoFertilizante.getNombre());
        fertilizanteExistente.setTipo(nuevoFertilizante.getTipo());
        fertilizanteExistente.setCantidad(nuevoFertilizante.getCantidad());
        fertilizanteExistente.setUnidad(nuevoFertilizante.getUnidad());
        fertilizanteExistente.setDescripcion(nuevoFertilizante.getDescripcion());

        return fertilizanteRepo.save(fertilizanteExistente);
    }

    // Listar Todos
    public List<Fertilizante> listarTodos(){
        return fertilizanteRepo.findAll();
    }

    // Eliminar fertilizante
    public void EliminarFertilizante(Long id, UsuarioModel usuario){
        if (usuario.getRol() == UsuarioModel.Rol.ADMIN){
            fertilizanteRepo.deleteById(id);
        } else {
            throw new RuntimeException("Solo los ADMIN pueden eliminar fertilizantes");
        }
    }
}
