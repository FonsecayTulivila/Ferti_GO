package com.fertigo.ferti_go.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "guia_de_envio")
public class GuiaDeEnvio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idGuia;

    private LocalDateTime fechaEmision;

    @Enumerated(EnumType.STRING)
    private EstadoEnvio estadoEnvio = EstadoEnvio.PENDIENTE;

    private String descripcion;     

    @OneToOne
    @JoinColumn(name = "solicitud_id", nullable = false)
    private SolicitudFertilizante solicitud;

    @PrePersist
    protected void onCreate() {
        this.fechaEmision = LocalDateTime.now();
    }

    public enum EstadoEnvio {
        PENDIENTE,
        EN_RUTA,
        ENTREGADO
    }
}
