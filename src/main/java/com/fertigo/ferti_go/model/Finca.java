package com.fertigo.ferti_go.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="finca")    
public class Finca {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String ubicacion;

    @Enumerated(EnumType.STRING)
    private EstadoFinca estado;

    @OneToMany(mappedBy = "finca")
    @JsonIgnore
    private List<UsuarioModel> capataces;

    public enum EstadoFinca {
        ACTIVA,
        INACTIVA
    }
}
