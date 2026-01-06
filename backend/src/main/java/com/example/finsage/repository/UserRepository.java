package com.example.finsage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.finsage.model.User;



public interface UserRepository extends JpaRepository<User, Long> {
   Optional< User> findByEmail(String email);
}