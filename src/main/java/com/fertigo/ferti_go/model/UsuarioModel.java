package com.fertigo.ferti_go.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuario")
@Data
public class UsuarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    @Column(nullable = false, unique = true) 
    private String email;
    private String contraseña;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @ManyToOne(cascade = CascadeType.ALL) // cada capataz pertenece a una finca
    @JoinColumn(name = "finca_id")
    private Finca finca;

    public enum Rol {
        ADMIN,
        CAPATAZ
    }
}
