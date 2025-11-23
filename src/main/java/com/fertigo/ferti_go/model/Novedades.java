package com.fertigo.ferti_go.model;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "novedades")
@Data
public class Novedades {
    @Id @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long idNovedad;
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    @NotBlank(message = "El nombre es obligatorio")
    private String nombreDeFinca;
    @Email(message = "Correo no válido")
    private String correo;
    @NotBlank(message = "El mensaje es obligatorio")
    private String novedad;
}
