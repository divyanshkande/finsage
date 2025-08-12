package com.example.finsage;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

   
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setProvider("local"); // optional if you support OAuth
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    // ✅ LOGIN USER with email
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody User user, HttpServletResponse response) {
        try {
            // Authenticate using email and password
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            // Get the authenticated user
            Optional<User> authenticatedUserOptional = userRepository.findByEmail(user.getEmail());
            if (authenticatedUserOptional.isEmpty()) {
                return ResponseEntity.status(401).body(new AuthResponse(null, null));
            }

            User authenticatedUser = authenticatedUserOptional.get();

            // Generate JWT token
            String token = jwtService.generateToken(authenticatedUser.getEmail());

            // Set token in cookie
            ResponseCookie cookie = ResponseCookie.from("token", token)
                    .httpOnly(true)
                    .secure(false) // set to true if using HTTPS in prod
                    .path("/")
                    .maxAge(3600)
                    .sameSite("Lax")
                    .build();

            response.setHeader("Set-Cookie", cookie.toString());

            return ResponseEntity.ok(new AuthResponse(token, authenticatedUser.getEmail()));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponse(null, null));
        }
    }

    // ✅ LOGOUT USER
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
        // Invalidate the JWT cookie
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.setHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok(new AuthResponse(null, null));
    }
    
    

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        service.sendResetLink(email);
        return ResponseEntity.ok("Reset link sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        service.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password updated");
    }
}
