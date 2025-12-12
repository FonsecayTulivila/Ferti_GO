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
    @Column(name = "id_novedad")
    private Long idNovedad;

    @Email(message = "Correo no válido")
    @NotBlank(message = "El correo es obligatorio")  
    @Column(name = "correo")
    private String correo;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(name = "nombre")
    private String nombre;

    @NotBlank(message = "El nombre de la finca es obligatorio")
    @Column(name = "nombre_de_finca")
    private String nombreDeFinca;

    @NotBlank(message = "La novedad es obligatoria")
    @Column(name = "novedad")
    private String novedad;

    @Column(name = "fecha_envio")
    private LocalDate fechaEnvio;

    @PrePersist
    public void asignarFecha() {
        this.fechaEnvio = LocalDate.now();
    }
}
