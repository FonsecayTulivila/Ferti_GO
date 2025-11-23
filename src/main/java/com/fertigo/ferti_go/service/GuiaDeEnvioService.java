package com.fertigo.ferti_go.service;

import com.fertigo.ferti_go.model.GuiaDeEnvio;
import com.fertigo.ferti_go.model.SolicitudFertilizante;
import com.fertigo.ferti_go.repository.GuiaDeEnvioRepository;
import com.fertigo.ferti_go.repository.SolicitudFertilizanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GuiaDeEnvioService {

    @Autowired
    private GuiaDeEnvioRepository guiaRepo;

    @Autowired
    private SolicitudFertilizanteRepository solicitudRepo;

    //  Generar una nueva guía (a partir de una solicitud aprobada)
    public GuiaDeEnvio generarGuia(Long idSolicitud, String descripcion) {
        SolicitudFertilizante solicitud = solicitudRepo.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud con id " + idSolicitud + " no encontrada"));

        if (solicitud.getEstado() != SolicitudFertilizante.EstadoSolicitud.APROBADA) {
            throw new IllegalArgumentException("Solo se pueden generar guías a partir de solicitudes APROBADAS.");
        }

        GuiaDeEnvio guia = new GuiaDeEnvio();
        guia.setSolicitud(solicitud);
        guia.setDescripcion(descripcion);
        guia.setEstadoEnvio(GuiaDeEnvio.EstadoEnvio.PENDIENTE);

        return guiaRepo.save(guia);
    }

    // Listar todas las guías
    public List<GuiaDeEnvio> listarGuias() {
        return guiaRepo.findAll();
    }

    // Obtener una guía por ID
    public GuiaDeEnvio obtenerGuia(Long id) {
        return guiaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Guía con id " + id + " no encontrada"));
    }

    // Cambiar estado de la guía (Pendiente → En Ruta → Entregado)
    public GuiaDeEnvio cambiarEstado(Long id, GuiaDeEnvio.EstadoEnvio nuevoEstado) {
        GuiaDeEnvio guia = guiaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Guía con id " + id + " no encontrada"));

        guia.setEstadoEnvio(nuevoEstado);
        return guiaRepo.save(guia);
    }
}
