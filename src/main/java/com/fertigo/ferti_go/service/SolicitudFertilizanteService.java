package com.fertigo.ferti_go.service;

import com.fertigo.ferti_go.model.SolicitudFertilizante;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.repository.SolicitudFertilizanteRepository;
    import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudFertilizanteService {

    @Autowired
    private SolicitudFertilizanteRepository solicitudRepo;


    // Crear nueva solicitud (solo capataz)
    public SolicitudFertilizante crearSolicitud(SolicitudFertilizante solicitud, UsuarioModel usuario) {
        if (usuario.getRol() != UsuarioModel.Rol.CAPATAZ) {
            throw new RuntimeException("Solo los capataces pueden crear solicitudes");
        }

        if (usuario.getFinca() != null) {
            solicitud.setFinca(usuario.getFinca().getNombre());
            solicitud.setUbicacion(usuario.getFinca().getUbicacion());
        }

        solicitud.setUsuario(usuario);
        return solicitudRepo.save(solicitud);
    }

    // Listar todas
    public List<SolicitudFertilizante> listarTodos() {
        return solicitudRepo.findAll();
    }

    // Obtener por ID
    public SolicitudFertilizante obtenerSolicitud(Long id) {
        return solicitudRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
    }

    // Actualizar solicitud
    public SolicitudFertilizante actualizarSolicitud(Long id, SolicitudFertilizante nueva, UsuarioModel usuario) {
        SolicitudFertilizante existente = obtenerSolicitud(id);

        if (!existente.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No puedes modificar solicitudes de otro usuario");
        }

        if (existente.getEstado() != SolicitudFertilizante.EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("Solo se pueden modificar solicitudes pendientes");
        }

        existente.setTipoFertilizante(nueva.getTipoFertilizante());
        existente.setCantidad(nueva.getCantidad());
        existente.setMotivo(nueva.getMotivo());
        existente.setNotas(nueva.getNotas());
        existente.setPrioridad(nueva.getPrioridad());
        existente.setFechaRequerida(nueva.getFechaRequerida());

        return solicitudRepo.save(existente);
    }

    // Cambiar estado (según rol del usuario en BD)
    public String cambiarEstado(Long id, String estado) {
        SolicitudFertilizante solicitud = obtenerSolicitud(id);

        // Normalizamos texto
        estado = estado.toUpperCase();

        SolicitudFertilizante.EstadoSolicitud nuevoEstado;
        try {
            nuevoEstado = SolicitudFertilizante.EstadoSolicitud.valueOf(estado);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + estado);
        }

        solicitud.setEstado(nuevoEstado);
        solicitudRepo.save(solicitud);
        return "Estado actualizado a: " + estado;
    }

    // Eliminar solicitud
    public void eliminarSolicitud(Long id, UsuarioModel usuario) {
        SolicitudFertilizante solicitud = obtenerSolicitud(id);

        if (!solicitud.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No puedes eliminar solicitudes de otro usuario");
        }

        if (solicitud.getEstado() != SolicitudFertilizante.EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("Solo se pueden eliminar solicitudes pendientes");
        }

        solicitudRepo.delete(solicitud);
    }
}
