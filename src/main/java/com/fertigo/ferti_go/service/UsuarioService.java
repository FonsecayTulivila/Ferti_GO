package com.fertigo.ferti_go.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.model.UsuarioModel.Rol;
import com.fertigo.ferti_go.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepo;

    // crear usuario (admin o capataz)
    public UsuarioModel crearUsuario(UsuarioModel usuario, Rol rol) {
        usuario.setRol(rol);

        if (rol == Rol.CAPATAZ) {
            if (usuario.getFinca() == null) {
                throw new IllegalArgumentException("Se requiere una finca para el capataz");
            }
        } else {
            usuario.setFinca(null);
        }

        return usuarioRepo.save(usuario);
    }

    // listar todos los usuarios
    public List<UsuarioModel> mostrarTodosUsuarios() {
        return usuarioRepo.findAll();
    }

    // obtener usuario por ID
    public UsuarioModel obtenerUsuario(Long id) {
        return usuarioRepo.findById(id).orElse(null);
    }

    // actualizar usuario
    public UsuarioModel actualizarUsuario(Long id, UsuarioModel actualizarDatos) {
        UsuarioModel usuarioExistente = obtenerUsuario(id);
        if (usuarioExistente != null) {
            usuarioExistente.setNombre(actualizarDatos.getNombre());
            usuarioExistente.setEmail(actualizarDatos.getEmail());
            usuarioExistente.setContraseña(actualizarDatos.getContraseña());

            if (usuarioExistente.getRol() == Rol.CAPATAZ && actualizarDatos.getFinca() != null) {
                usuarioExistente.setFinca(actualizarDatos.getFinca());
            }

            return usuarioRepo.save(usuarioExistente);
        }
        return null;
    }

    // eliminar usuario
    public void eliminarUsuario(Long id) {
        usuarioRepo.deleteById(id);
    }

    // login con rol específico (usado por web)
    public UsuarioModel validarLoginConRol(String email, String contraseña, Rol rol) {
        return usuarioRepo.findByEmailAndContraseña(email, contraseña)
                .filter(usuario -> usuario.getRol() == rol)
                .orElse(null);
    }

    // login para la app móvil (solo CAPATAZ)
    public UsuarioModel validarLoginCapataz(String email, String contraseña) {
        return usuarioRepo.findByEmailAndContraseña(email, contraseña)
                .filter(usuario -> usuario.getRol() == Rol.CAPATAZ)
                .orElse(null);
    }
}
