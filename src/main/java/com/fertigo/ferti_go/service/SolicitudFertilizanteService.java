package com.fertigo.ferti_go.service;

import com.fertigo.ferti_go.model.Fertilizante;
import com.fertigo.ferti_go.model.SolicitudFertilizante;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.repository.SolicitudFertilizanteRepository;
import com.fertigo.ferti_go.repository.FertilizanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitudFertilizanteService {

    @Autowired
    private SolicitudFertilizanteRepository solicitudRepo;
    
    @Autowired
    private FertilizanteRepository fertilizanteRepo;

    // Crear nueva solicitud (solo capataz)
    public SolicitudFertilizante crearSolicitud(SolicitudFertilizante solicitud, UsuarioModel usuario) {
        if (usuario.getRol() != UsuarioModel.Rol.CAPATAZ) {
            throw new RuntimeException("Solo los capataces pueden crear solicitudes");
        }
        if (solicitud.getTipoFertilizante() == null || solicitud.getTipoFertilizante().trim().isEmpty()) {
            throw new RuntimeException("El tipo de fertilizante es obligatorio");
        }
        
        if (solicitud.getCantidad() == null || solicitud.getCantidad() <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }
        if (usuario.getFinca() != null) {
            solicitud.setFinca(usuario.getFinca().getNombre());
            solicitud.setUbicacion(usuario.getFinca().getUbicacion());
        }

        solicitud.setUsuario(usuario);
        System.out.println(" Guardando solicitud:");
        System.out.println("   - Tipo: " + solicitud.getTipoFertilizante());
        System.out.println("   - Cantidad: " + solicitud.getCantidad());
        System.out.println("   - Usuario ID: " + usuario.getId());
        
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

    // ⭐ MÉTODO MEJORADO: Cambiar estado y descontar inventario si se aprueba
    @Transactional
    public String cambiarEstado(Long id, String estado) {
        SolicitudFertilizante solicitud = obtenerSolicitud(id);

        // Validar que solo se cambie desde PENDIENTE
        if (solicitud.getEstado() != SolicitudFertilizante.EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("Solo se puede cambiar el estado de solicitudes PENDIENTES");
        }

        // Normalizar texto
        estado = estado.toUpperCase();

        SolicitudFertilizante.EstadoSolicitud nuevoEstado;
        try {
            nuevoEstado = SolicitudFertilizante.EstadoSolicitud.valueOf(estado);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + estado);
        }

        // SI SE APRUEBA, DESCONTAR DEL INVENTARIO
        if (nuevoEstado == SolicitudFertilizante.EstadoSolicitud.APROBADA) {
            descontarInventario(solicitud);
        }

        solicitud.setEstado(nuevoEstado);
        solicitudRepo.save(solicitud);
        
        return "Estado actualizado a: " + estado + 
               (nuevoEstado == SolicitudFertilizante.EstadoSolicitud.APROBADA 
                   ? " (Inventario descontado)" 
                   : "");
    }

    // MÉTODO PRIVADO: Descontar del inventario
    private void descontarInventario(SolicitudFertilizante solicitud) {
        String tipoFertilizante = solicitud.getTipoFertilizante();
        Integer cantidadSolicitada = solicitud.getCantidad().intValue();

        System.out.println("🔍 Buscando fertilizante: " + tipoFertilizante);

        // Buscar fertilizante por nombre o tipo
        List<Fertilizante> fertilizantes = fertilizanteRepo.findAll();
        Fertilizante fertilizante = fertilizantes.stream()
            .filter(f -> f.getNombre().equalsIgnoreCase(tipoFertilizante) || 
                         f.getTipo().equalsIgnoreCase(tipoFertilizante))
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "No se encontró el fertilizante '" + tipoFertilizante + "' en el inventario"
            ));

        System.out.println("📦 Fertilizante encontrado: " + fertilizante.getNombre());
        System.out.println("   - Cantidad actual: " + fertilizante.getCantidad());
        System.out.println("   - Cantidad a descontar: " + cantidadSolicitada);

        // Verificar stock suficiente
        if (fertilizante.getCantidad() < cantidadSolicitada) {
            throw new RuntimeException(
                String.format(
                    "INVENTARIO INSUFICIENTE - Fertilizante: %s | Disponible: %d %s | Solicitado: %d %s | Faltante: %d %s",
                    fertilizante.getNombre(),
                    fertilizante.getCantidad(),
                    fertilizante.getUnidad(),
                    cantidadSolicitada,
                    fertilizante.getUnidad(),
                    cantidadSolicitada - fertilizante.getCantidad(),
                    fertilizante.getUnidad()
                )
            );
        }

        // Descontar cantidad
        Integer nuevaCantidad = fertilizante.getCantidad() - cantidadSolicitada;
        fertilizante.setCantidad(nuevaCantidad);
        fertilizanteRepo.save(fertilizante);

        System.out.println(" Inventario actualizado:");
        System.out.println("   - " + fertilizante.getNombre() + ": " + nuevaCantidad + " " + fertilizante.getUnidad());
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