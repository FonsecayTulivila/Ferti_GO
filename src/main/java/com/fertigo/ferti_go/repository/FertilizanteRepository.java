package com.fertigo.ferti_go.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fertigo.ferti_go.model.Fertilizante;

public interface FertilizanteRepository extends JpaRepository<Fertilizante, Long> {
    Optional<Fertilizante> findByNombre(String nombre);
}
