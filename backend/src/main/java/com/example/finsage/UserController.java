package com.example.finsage;
import java.security.Principal;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService service;

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity register(@RequestBody User user) {
        try {
            // Check if user already exists
            if (service.userExists(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
            }
            
            service.register(user);
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity login(
            @RequestBody User user,
            HttpServletResponse response) {
        try {
            AuthResponse auth = service.login(user, response);
            return ResponseEntity.ok(auth);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed"));
        }
    }

    // ================= GOOGLE LOGIN =================
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @RequestBody GoogleAuthRequest request,
            HttpServletResponse response) {

        try {
            AuthResponse auth = service.googleLogin(request.getIdToken(), response);
            return ResponseEntity.ok(auth);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Google login failed"));
        }
    }


    // ================= CURRENT USER =================
    @GetMapping("/me")
    public ResponseEntity getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Not authenticated"));
        }

        try {
            Map userData = service.getCurrentUser(principal.getName());
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found"));
        }
    }

    // ================= LOGOUT =================
    @PostMapping("/logout")
    public ResponseEntity logout(HttpServletResponse response) {
        service.logout(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ================= PASSWORD RESET =================
    @PostMapping("/forgot-password")
    public ResponseEntity forgot(@RequestParam String email) {
        try {
            service.sendResetLink(email);
            return ResponseEntity.ok(Map.of("message", "Reset link sent"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Email not found"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity reset(
            @RequestParam String token,
            @RequestParam String newPassword) {
        try {
            service.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
}