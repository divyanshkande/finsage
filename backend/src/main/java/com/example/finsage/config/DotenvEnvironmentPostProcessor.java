package com.example.finsage.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Dotenv dotenv = Dotenv.configure()
                .directory(System.getProperty("user.dir"))
                .ignoreIfMissing()
                .load();

        Map<String, Object> envProps = new HashMap<>();

        // Keep all your existing Spring property mappings
        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null) {
                // For Spring Boot properties
                switch (key) {
                    case "DB_USERNAME" -> envProps.put("spring.datasource.username", value);
                    case "DB_PASSWORD" -> envProps.put("spring.datasource.password", value);
                    case "DB_URL" -> envProps.put("spring.datasource.url", value);
                    case "JWT_SECRET" -> envProps.put("jwt.secret", value);
                    case "SPRING_MAIL_HOST" -> envProps.put("spring.mail.host", value);
                    case "SPRING_MAIL_PORT" -> envProps.put("spring.mail.port", value);
                    case "SPRING_MAIL_USERNAME" -> envProps.put("spring.mail.username", value);
                    case "SPRING_MAIL_PASSWORD" -> envProps.put("spring.mail.password", value);
                    case "OPENROUTER_KEY" -> envProps.put("openrouter.key", value);
                }
            }
        });

        // THIS LINE FIXES TESSERACT FOREVER
        String tessPath = dotenv.get("TESSDATA_PATH");
        if (tessPath != null && !tessPath.trim().isEmpty()) {
            System.setProperty("tesseract.datapath", tessPath.trim());
            System.out.println("TESSERACT DATAPATH SET TO: " + tessPath.trim());
        }

        // Add to Spring environment (for other properties)
        environment.getPropertySources().addFirst(new MapPropertySource("dotenv", envProps));
    }
}