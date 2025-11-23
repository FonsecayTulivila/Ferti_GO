package com.fertigo.ferti_go.service;

import com.fertigo.ferti_go.model.GuiaDeEnvio;
import com.fertigo.ferti_go.model.SolicitudFertilizante;
import com.fertigo.ferti_go.repository.GuiaDeEnvioRepository;
import com.fertigo.ferti_go.repository.SolicitudFertilizanteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GuiaDeEnvioServiceTest {

    @Mock
    private GuiaDeEnvioRepository guiaRepo;

    @Mock
    private SolicitudFertilizanteRepository solicitudRepo;

    @InjectMocks
    private GuiaDeEnvioService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this); // Activa los mocks
    }

    @Test
    void testGenerarGuia_SolicitudAprobada() {
        // Simular solicitud aprobada
        SolicitudFertilizante solicitud = new SolicitudFertilizante();
        solicitud.setIdSolicitud(1L);
        solicitud.setEstado(SolicitudFertilizante.EstadoSolicitud.APROBADA);

        // Simular guía guardada
        GuiaDeEnvio guiaGuardada = new GuiaDeEnvio();
        guiaGuardada.setIdGuia(100L);
        guiaGuardada.setDescripcion("Entrega rápida");

        // Configurar mocks
        when(solicitudRepo.findById(1L)).thenReturn(Optional.of(solicitud));
        when(guiaRepo.save(any(GuiaDeEnvio.class))).thenReturn(guiaGuardada);

        // Ejecutar método
        GuiaDeEnvio resultado = service.generarGuia(1L, "Entrega rápida");

        //  Verificar resultado
        assertNotNull(resultado);
        assertEquals("Entrega rápida", resultado.getDescripcion());
        assertEquals(GuiaDeEnvio.EstadoEnvio.PENDIENTE, resultado.getEstadoEnvio());
        verify(guiaRepo, times(1)).save(any(GuiaDeEnvio.class));
    }

    @Test
    void testGenerarGuia_SolicitudNoAprobada() {
        // Simular solicitud NO aprobada
        SolicitudFertilizante solicitud = new SolicitudFertilizante();
        solicitud.setIdSolicitud(2L);
        solicitud.setEstado(SolicitudFertilizante.EstadoSolicitud.PENDIENTE);

        when(solicitudRepo.findById(2L)).thenReturn(Optional.of(solicitud));

        //  Ejecutar y verificar excepción
        Exception ex = assertThrows(IllegalArgumentException.class, () ->
                service.generarGuia(2L, "Entrega pendiente")
        );

        assertEquals("Solo se pueden generar guías a partir de solicitudes APROBADAS.", ex.getMessage());
        verify(guiaRepo, never()).save(any(GuiaDeEnvio.class)); // No debe intentar guardar
    }
}
