package com.example.finsage.model;


public class AuthResponse {
    private String token;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String token, String email) {
        this.token = token;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Deprecated - for backward compatibility
    public String getUsername() {
        return email;
    }

    public void setUsername(String username) {
        this.email = username;
    }
}
