package com.fertigo.ferti_go.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fertigo.ferti_go.model.Finca;

public interface FincaRepository extends JpaRepository<Finca, Long> {
}
