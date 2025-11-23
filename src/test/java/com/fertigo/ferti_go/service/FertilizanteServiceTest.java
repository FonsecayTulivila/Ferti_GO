package com.fertigo.ferti_go.service;

import com.fertigo.ferti_go.model.Fertilizante;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.repository.FertilizanteRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class FertilizanteServiceTest {

    @Mock
    private FertilizanteRepository repo;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private FertilizanteService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAgregarFertilizante() {
        Fertilizante ferti = new Fertilizante();
        ferti.setNombre("Nitrofoska");
        ferti.setTipo("Químico");
        ferti.setCantidad(10);

        // Simulamos la respuesta del repositorio
        when(repo.save(any(Fertilizante.class))).thenReturn(ferti);

        // Simulamos un usuario admin
        UsuarioModel usuario = new UsuarioModel();
        usuario.setRol(UsuarioModel.Rol.ADMIN);

        // Llamamos al método
        Fertilizante resultado = service.AgregarFertilizante(ferti, usuario);

        // Verificamos que se guarde correctamente
        assertEquals("Nitrofoska", resultado.getNombre());
        assertEquals(10, resultado.getCantidad());
    }
}
