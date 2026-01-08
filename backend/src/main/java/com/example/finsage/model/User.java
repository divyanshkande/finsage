package com.example.finsage.model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

    @Email
    @Column(unique = true, nullable = false)
    private String email;
     public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Column(nullable = true) // null for Google Sign-in users
    private String password;
    public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
    @Column(name = "full_name")
    private String fullName;
    public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
    @Enumerated(EnumType.STRING)
    @Column(name = "provider",nullable = false) 
    private AuthProvider authProvider; // LOCAL or GOOGLE

    public AuthProvider getAuthProvider() {
		return authProvider;
	}

	public void setAuthProvider(AuthProvider authProvider) {
		this.authProvider = authProvider;
	}
	 @Column(nullable = false)
	private String role = "USER";
    public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

    private double income;

    public double getIncome() {
		return income;
	}

	public void setIncome(double income) {
		this.income = income;
	}

	
	
	

	

	

	

    
  
    
   






}
