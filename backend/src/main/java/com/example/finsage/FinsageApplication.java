package com.example.finsage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;


@SpringBootApplication(exclude = { MailSenderAutoConfiguration.class })
public class FinsageApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinsageApplication.class, args);
	}

}
