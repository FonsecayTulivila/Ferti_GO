package com.fertigo.ferti_go.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fertigo.ferti_go.model.Finca;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.repository.FincaRepository;

@Service
public class FincaService {
@Autowired
    private FincaRepository fincaRepository;

    //Agregar Finca
    public Finca agregarFinca(Finca finca, UsuarioModel usuario){
        if (usuario.getRol()==UsuarioModel.Rol.ADMIN) {
            return fincaRepository.save(finca);
        } else {
            throw new IllegalArgumentException("Solo el ADMIN puede agregar fincas.");       
        }
    }
    //Obtener por ID
    public Finca obtenerFinca(Long id){
        return fincaRepository.findById(id).orElse(null);
    }
    //Listar Todos las fincas
    public List<Finca> listarTodos(){
        return fincaRepository.findAll();
    }
    //Editar Finca
    public Finca EditarFinca(Long id, Finca nuevaFinca){
        Finca fincaExistente = fincaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Finca con id " + id + " no encontrada"));

        // Actualizamos los campos
        fincaExistente.setNombre(nuevaFinca.getNombre());
        fincaExistente.setUbicacion(nuevaFinca.getUbicacion());
        fincaExistente.setEstado(nuevaFinca.getEstado());
        return fincaRepository.save(fincaExistente);
    }
    //Eliminar Finca
    public void eliminarFinca(Long id, UsuarioModel usuario){
        if (usuario.getRol()==UsuarioModel.Rol.ADMIN) {
            fincaRepository.deleteById(id);
        }
    }
    // editar estado de la finca
    public Finca cambiarEstadoFinca(Long id, Finca.EstadoFinca nuevoEstado
    ) {
        Finca fincaExistente = fincaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Finca con id " + id + " no encontrada"));

        fincaExistente.setEstado(nuevoEstado);
        return fincaRepository.save(fincaExistente);
    }    
}
