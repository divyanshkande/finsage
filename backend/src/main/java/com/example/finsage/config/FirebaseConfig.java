package com.example.finsage.config;

import java.io.InputStream;
import java.io.FileInputStream;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {

	@Value("${firebase.credentials}")
	private String firebasePath;

	@PostConstruct
	public void init() throws IOException {
	    FileInputStream serviceAccount = new FileInputStream(firebasePath);
	    FirebaseOptions options = FirebaseOptions.builder()
	        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
	        .build();
	    if (FirebaseApp.getApps().isEmpty()) {
	        FirebaseApp.initializeApp(options);
	    }
	}


}

