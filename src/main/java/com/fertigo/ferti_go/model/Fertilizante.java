package com.fertigo.ferti_go.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
@Data

@Entity

@Table(name="fertilizante")
public class Fertilizante {
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String tipo; // Líquido, sólido, orgánico, inorgánico
    private Integer cantidad;
    private String unidad; // kg, litros, gramos
    private String descripcion;
    
}
