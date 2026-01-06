package com.example.finsage.service;

import org.springframework.stereotype.Service;

@Service
public class LoginService {



	public boolean validateUser(String email, String password) {
		 return "admin".equals(email) && "1234".equals(password);
    }


}
