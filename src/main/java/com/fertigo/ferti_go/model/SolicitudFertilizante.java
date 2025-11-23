package com.fertigo.ferti_go.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "solicitud_fertilizante")
public class SolicitudFertilizante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSolicitud;

    private String finca;
    private String ubicacion;
    private String tipoFertilizante;
    private Float cantidad;
    private LocalDate fechaRequerida;
    private String motivo;
    private String notas;
    private String prioridad;

    @Column(name = "fecha_solicitud", updatable = false)
    private LocalDateTime fechaSolicitud;

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private UsuarioModel usuario;

    public enum EstadoSolicitud {
        PENDIENTE,
        APROBADA,
        RECHAZADA
    }

    @PrePersist
    protected void onCreate() {
        if (this.fechaRequerida == null) {
            this.fechaRequerida = LocalDate.now();
        }
        // Asignar fecha de solicitud automáticamente
        this.fechaSolicitud = LocalDateTime.now();
    }

    public EstadoSolicitud getEstado() {
        return estado;
    }

    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }
}