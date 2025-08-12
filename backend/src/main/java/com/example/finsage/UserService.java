package com.example.finsage;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtservice;
    
    @Autowired private TokenRepository tokenRepo;
    @Autowired private JavaMailSender mailSender;


    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public User register(User user) {
        // Hash the password before saving the user
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public User verify(User user) {
        try {
            Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            if (authentication.isAuthenticated()) {
                return repo.findByEmail(user.getEmail()).orElse(null); // ✅ return the full User object
            }

            return null;
        } catch (AuthenticationException e) {
            return null; // Gracefully return null on failure
        }
    }
    
   

    public void sendResetLink(String email) {
        Optional<User> userOpt = repo.findByEmail(email);
        if (userOpt.isEmpty()) throw new RuntimeException("User not found");

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));

        tokenRepo.save(resetToken);

        String resetLink = "http://localhost:3000/reset-password/" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Reset your password");
        message.setText("Click this link to reset your password: " + resetLink);

        mailSender.send(message);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken tokenObj = tokenRepo.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (tokenObj.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = repo.findByEmail(tokenObj.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(newPassword); // 🔐 Use BCrypt encoder here ideally
        repo.save(user);

        tokenRepo.delete(tokenObj);
    }

}
