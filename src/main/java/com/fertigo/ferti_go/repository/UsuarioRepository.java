package com.fertigo.ferti_go.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fertigo.ferti_go.model.UsuarioModel;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
    Optional<UsuarioModel> findByEmailAndContraseña(String email, String contraseña);
}
