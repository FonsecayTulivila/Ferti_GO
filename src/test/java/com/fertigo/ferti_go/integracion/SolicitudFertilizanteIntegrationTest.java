package com.fertigo.ferti_go.integracion;

import com.fertigo.ferti_go.model.SolicitudFertilizante;
import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.repository.SolicitudFertilizanteRepository;
import com.fertigo.ferti_go.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class SolicitudFertilizanteIntegrationTest {

    @Autowired
    private SolicitudFertilizanteRepository solicitudRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    private UsuarioModel usuario;

    @BeforeEach
    void setUp() {
        usuario = new UsuarioModel();
        usuario.setNombre("Carlos Pérez");
        usuario.setEmail("carlos@example.com");
        usuario.setContraseña("12345");
        usuarioRepo.save(usuario);
    }

    @Test
    void testGuardarSolicitud() {
        SolicitudFertilizante solicitud = new SolicitudFertilizante();
        solicitud.setUsuario(usuario);
        solicitud.setFinca("Finca La Esperanza");
        solicitud.setUbicacion("Valle del Cauca");
        solicitud.setTipoFertilizante("Nitrogenado");
        solicitud.setCantidad(25.5f);
        solicitud.setFechaRequerida(LocalDate.now().plusDays(7));
        solicitud.setMotivo("Mejorar la calidad del suelo");
        solicitud.setNotas("Aplicar antes de la temporada de lluvias");
        solicitud.setPrioridad("ALTA");
        solicitud.setEstado(SolicitudFertilizante.EstadoSolicitud.PENDIENTE);

        SolicitudFertilizante guardada = solicitudRepo.save(solicitud);

        assertThat(guardada.getIdSolicitud()).isNotNull();
        assertThat(guardada.getUsuario().getNombre()).isEqualTo("Carlos Pérez");
        assertThat(guardada.getTipoFertilizante()).isEqualTo("Nitrogenado");
        assertThat(guardada.getEstado()).isEqualTo(SolicitudFertilizante.EstadoSolicitud.PENDIENTE);
    }

    @Test
    void testCambiarEstadoSolicitud() {
        SolicitudFertilizante solicitud = new SolicitudFertilizante();
        solicitud.setUsuario(usuario);
        solicitud.setFinca("Finca Los Robles");
        solicitud.setUbicacion("Tolima");
        solicitud.setTipoFertilizante("Orgánico");
        solicitud.setCantidad(10f);
        solicitud.setFechaRequerida(LocalDate.now().plusDays(10));
        solicitud.setMotivo("Producción ecológica");
        solicitud.setNotas("Solicitar entrega temprana");
        solicitud.setPrioridad("MEDIA");
        solicitud.setEstado(SolicitudFertilizante.EstadoSolicitud.PENDIENTE);

        solicitudRepo.save(solicitud);

        // ✅ Cambiar estado a APROBADA
        solicitud.setEstado(SolicitudFertilizante.EstadoSolicitud.APROBADA);
        solicitudRepo.save(solicitud);

        SolicitudFertilizante encontrada = solicitudRepo.findById(solicitud.getIdSolicitud()).orElseThrow();
        assertThat(encontrada.getEstado()).isEqualTo(SolicitudFertilizante.EstadoSolicitud.APROBADA);
    }

    @Test
    void testListarSolicitudes() {
        List<SolicitudFertilizante> solicitudes = solicitudRepo.findAll();
        assertThat(solicitudes).isNotNull();
    }
}
