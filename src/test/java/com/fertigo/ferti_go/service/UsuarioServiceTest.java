package com.fertigo.ferti_go.service;

import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    public UsuarioServiceTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCrearUsuario() {
        UsuarioModel usuario = new UsuarioModel();
        usuario.setNombre("Juan");
        usuario.setEmail("juan@example.com");
        usuario.setContraseña("1234");

        when(usuarioRepository.save(any(UsuarioModel.class))).thenReturn(usuario);

        UsuarioModel resultado = usuarioService.crearUsuario(usuario, UsuarioModel.Rol.ADMIN);

        assertNotNull(resultado);
        assertEquals("Juan", resultado.getNombre());
    }
}
