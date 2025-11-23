package com.fertigo.ferti_go.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fertigo.ferti_go.model.UsuarioModel;
import com.fertigo.ferti_go.service.UsuarioService;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/app")
public class LoginAppController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> loginCapataz(@RequestBody UsuarioModel credenciales) {
        try {
            UsuarioModel usuario = usuarioService.validarLoginCapataz(
                credenciales.getEmail(),
                credenciales.getContraseña()
            );

            if (usuario != null) {
                return ResponseEntity.ok(usuario);
            } else {
                return ResponseEntity.status(401).body("Credenciales inválidas");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al intentar iniciar sesión");
        }
    }
}
