package com.fertigo.ferti_go.integracion;

import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.model.UsuarioModel.Rol;
import com.fertigo.ferti_go.repository.UsuarioRepository;
import com.fertigo.ferti_go.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional  //  Revierte los cambios al terminar cada test
class UsuarioServiceIntegrationTest {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void testGuardarYBuscarUsuario() {
        // Crear un nuevo usuario
        UsuarioModel usuario = new UsuarioModel();
        usuario.setNombre("Carlos Alfonso");
        usuario.setEmail("carlos@fertigo.com");
        usuario.setContraseña("123456");

        // Guardar usuario en la BD (usando el servicio real)
        UsuarioModel guardado = usuarioService.crearUsuario(usuario, Rol.ADMIN);

        assertNotNull(guardado.getId(), "El ID debe generarse automáticamente");

        // Buscar el usuario por ID
        Optional<UsuarioModel> encontrado = Optional.ofNullable(usuarioService.obtenerUsuario(guardado.getId()));
        assertTrue(encontrado.isPresent(), "El usuario debe existir en la BD");

        // Verificar que los datos coincidan
        assertEquals("Carlos Alfonso", encontrado.get().getNombre());
        assertEquals("carlos@fertigo.com", encontrado.get().getEmail());
    }

    @Test
    void testListarUsuarios() {
        // Crear dos usuarios
        UsuarioModel u1 = new UsuarioModel();
        u1.setNombre("Ana Torres");
        u1.setEmail("ana@fertigo.com");
        u1.setContraseña("abc");

        UsuarioModel u2 = new UsuarioModel();
        u2.setNombre("Luis Gómez");
        u2.setEmail("luis@fertigo.com");
        u2.setContraseña("xyz");

        usuarioRepository.save(u1);
        usuarioRepository.save(u2);

        //  Listar todos los usuarios
        List<UsuarioModel> lista = usuarioService.mostrarTodosUsuarios();

        //  Debe haber al menos 2 usuarios
        assertTrue(lista.size() >= 2);
    }
}
