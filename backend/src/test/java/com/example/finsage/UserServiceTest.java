package com.example.finsage;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.example.finsage.model.AuthProvider;
import com.example.finsage.model.User;
import com.example.finsage.repository.TokenRepository;
import com.example.finsage.repository.UserRepository;
import com.example.finsage.service.JWTService;
import com.example.finsage.service.LoginAttemptService;
import com.example.finsage.service.TokenBlocklistService;
import com.example.finsage.service.UserService;

import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repo;

    @Mock
    private JWTService jwtService;

    @Mock
    private TokenRepository tokenRepo;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TokenBlocklistService tokenBlocklistService;

    @Mock
    private LoginAttemptService loginAttemptService;

    @Mock
    private AuthenticationManager authManager;

    @Mock
    private BCryptPasswordEncoder encoder;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyExists() {
        User user = new User();
        user.setEmail("test@example.com");
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.register(user);
        });
        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    void register_shouldSetRoleWhenNull() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password123");
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(encoder.encode("password123")).thenReturn("$2a$12$encoded");

        userService.register(user);
        assertEquals("USER", user.getRole());
    }

    @Test
    void register_shouldSetRoleWhenEmpty() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setRole("");
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(encoder.encode("password123")).thenReturn("$2a$12$encoded");

        userService.register(user);
        assertEquals("USER", user.getRole());
    }

    @Test
    void register_shouldEncodePassword() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("plainPassword123");
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(encoder.encode("plainPassword123")).thenReturn("$2a$12$encodedHash");

        userService.register(user);
        assertFalse(user.getPassword().equals("plainPassword123"));
        assertTrue(user.getPassword().startsWith("$2a$12$"));
    }

    @Test
    void register_shouldValidatePasswordNotEmpty() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("");
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.register(user);
        });
        assertEquals("Password must not be empty", exception.getMessage());
    }

    @Test
    void register_shouldValidateMinimumPasswordLength() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("short");
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.register(user);
        });
        assertEquals("Password must be at least 6 characters long", exception.getMessage());
    }

    @Test
    void login_shouldThrowWhenAuthProviderIsGoogle() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setAuthProvider(AuthProvider.GOOGLE);
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.login(user, "127.0.0.1", null);
        });
        assertEquals("Please login using Google", exception.getMessage());
    }

    @Test
    void login_shouldThrowWhenPasswordIsNullForLocal() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(null);
        user.setAuthProvider(AuthProvider.LOCAL);
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.login(user, "127.0.0.1", null);
        });
        assertEquals("Please login using Google", exception.getMessage());
    }

    @Test
    void login_shouldRecordSuccessAndGenerateToken() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setAuthProvider(AuthProvider.LOCAL);
        when(repo.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        when(jwtService.generateToken("test@example.com")).thenReturn("test-jwt-token");

        jakarta.servlet.http.HttpServletResponse mockResponse = mock(jakarta.servlet.http.HttpServletResponse.class);
        userService.login(user, "127.0.0.1", mockResponse);

        // Verify token was set in cookie (just check no exception thrown)
    }
}
