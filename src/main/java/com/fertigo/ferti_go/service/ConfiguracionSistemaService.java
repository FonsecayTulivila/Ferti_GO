package com.fertigo.ferti_go.service;


import org.springframework.stereotype.Service;

import com.fertigo.ferti_go.model.ConfiguracionSistema;
import com.fertigo.ferti_go.repository.ConfiguracionSistemaRepository;

import java.util.Optional;

@Service
public class ConfiguracionSistemaService {

    private final ConfiguracionSistemaRepository repo;

    public ConfiguracionSistemaService(ConfiguracionSistemaRepository repo) {
        this.repo = repo;
    }

    public ConfiguracionSistema obtenerConfiguracion() {
        return repo.findAll().stream().findFirst().orElse(null);
    }

    public ConfiguracionSistema guardarConfiguracion(ConfiguracionSistema configuracion) {
        return repo.save(configuracion);
    }

    public ConfiguracionSistema actualizarConfiguracion(Long id, ConfiguracionSistema datos) {
        Optional<ConfiguracionSistema> existente = repo.findById(id);
        if (existente.isPresent()) {
            ConfiguracionSistema c = existente.get();
            c.setNombreEmpresa(datos.getNombreEmpresa());
            c.setIdioma(datos.getIdioma());
            return repo.save(c);
        }
        return null;
    }
}

