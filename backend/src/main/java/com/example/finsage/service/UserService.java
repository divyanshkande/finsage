package com.example.finsage.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.finsage.model.AuthProvider;
import com.example.finsage.model.AuthResponse;
import com.example.finsage.model.PasswordResetToken;
import com.example.finsage.model.User;
import com.example.finsage.repository.TokenRepository;
import com.example.finsage.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.HashMap;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private TokenRepository tokenRepo;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    // ================= REGISTER =================
    public User register(User user) {
        // Check if email already exists
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        
        user.setPassword(encoder.encode(user.getPassword()));
        user.setAuthProvider(AuthProvider.LOCAL);
        
        // ✅ Ensure role is set
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        return repo.save(user);
    }
    // ================= LOGIN (EMAIL/PASSWORD) =================
    public AuthResponse login(User user, HttpServletResponse response) {

        User existingUser = repo.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // ✅ FIXED: Allow LOCAL users, block ONLY Google users without password
        if (existingUser.getAuthProvider() == AuthProvider.GOOGLE) {
            throw new RuntimeException("Please login using Google");
        }

        // ✅ Check if password exists (shouldn't be null for LOCAL users)
        if (existingUser.getPassword() == null || existingUser.getPassword().isEmpty()) {
            throw new RuntimeException("Please login using Google");
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(), user.getPassword())
            );
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(existingUser.getEmail());
        setJwtCookie(response, token);

        return new AuthResponse(token, existingUser.getEmail());
    }
 // Add this method after register()
    public boolean userExists(String email) {
        return repo.findByEmail(email).isPresent();
    }
 // ================= GOOGLE LOGIN =================
    public AuthResponse googleLogin(String idToken, HttpServletResponse response) {

        try {
            // ✅ FIX 1: clear previous login (VERY IMPORTANT)
            SecurityContextHolder.clearContext();

            FirebaseToken decodedToken =
                    FirebaseAuth.getInstance().verifyIdToken(idToken);

            String email = decodedToken.getEmail();
            String name = decodedToken.getName();

            User user = repo.findByEmail(email)
                    .orElseGet(() -> {
                        User u = new User();
                        u.setEmail(email);
                        u.setFullName(name);
                        u.setAuthProvider(AuthProvider.GOOGLE);
                        u.setRole("USER");
                        u.setPassword(null);
                        return repo.save(u);
                    });

            if (user.getAuthProvider() != AuthProvider.GOOGLE) {
                throw new RuntimeException("Use email/password login");
            }

            // ✅ FIX 2: clear OLD JWT cookie
            ResponseCookie clear = ResponseCookie.from("token", "")
                    .path("/")
                    .httpOnly(true)
                    .maxAge(0)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, clear.toString());

            // ✅ FIX 3: generate NEW JWT for current Google user
            String token = jwtService.generateToken(user.getEmail());
            setJwtCookie(response, token);

            return new AuthResponse(token, user.getEmail());

        } catch (RuntimeException e) {
            throw e; // 👈 pass message upward
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed");
        }

    }

    // ================= LOGOUT =================
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.setHeader("Set-Cookie", cookie.toString());
    }
    
 // ================= CURRENT USER =================
    public Map<String, Object> getCurrentUser(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole());

        return response;
    }

    // ================= PASSWORD RESET =================
    public void sendResetLink(String email) {

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenRepo.save(resetToken);

        String resetLink = "http://localhost:3000/reset-password/" + token;

        if (mailSender != null) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Reset your password");
            message.setText("Reset link: " + resetLink);
            mailSender.send(message);
        } else {
            System.out.println("RESET LINK: " + resetLink);
        }
    }

    public void resetPassword(String token, String newPassword) {

        PasswordResetToken tokenObj = tokenRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (tokenObj.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = repo.findByEmail(tokenObj.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(encoder.encode(newPassword));
        repo.save(user);

        tokenRepo.delete(tokenObj);
    }

    // ================= HELPER =================
    private void setJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false) // Change to true in production (HTTPS)
                .path("/")
                .maxAge(30 * 60 * 60) // 30 hours
                .sameSite("Lax")
                .build();

        // Use HttpHeaders.SET_COOKIE — this is CORS-friendly
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
