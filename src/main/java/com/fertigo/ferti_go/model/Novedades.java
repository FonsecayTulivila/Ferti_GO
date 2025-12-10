package com.fertigo.ferti_go.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "novedades")
@Data
public class Novedades {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idNovedad;
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    @NotBlank(message = "El nombre de la finca es obligatorio")
    private String nombreDeFinca;
    @Email(message = "Correo no válido")
    private String correo;
    @NotBlank(message = "El mensaje es obligatorio")
    private String novedad;
    private LocalDate fechaEnvio;
    @PrePersist
    public void asignarFecha() {
        this.fechaEnvio = LocalDate.now();
    }
}
