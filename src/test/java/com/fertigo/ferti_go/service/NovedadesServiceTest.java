package com.fertigo.ferti_go.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import com.fertigo.ferti_go.model.Novedades;
import com.fertigo.ferti_go.repository.NovedadesRepository;

public class NovedadesServiceTest {

    @Mock
    private NovedadesRepository novedadesrepo;

    @InjectMocks
    private NovedadesService service;

    @BeforeEach
    void setUp() {
        org.mockito.MockitoAnnotations.openMocks(this);
    }
    @Test
    void testCrearNovedad() {
        Novedades novedad = new Novedades();
        novedad.setNombre("Angel Fonseca");
        novedad.setNombreDeFinca("EL DORADO");
        novedad.setCorreo("Angel@gmail.com");
        novedad.setNovedad("Falta de fertilizante en la finca");

        when(novedadesrepo.save(any(Novedades.class))).thenReturn(novedad);
        Novedades resultado = service.agregarNovedad(novedad);
        assertEquals("Angel Fonseca", resultado.getNombre());
        assertEquals("Angel@gmail.com", resultado.getCorreo());

    }
    
}
