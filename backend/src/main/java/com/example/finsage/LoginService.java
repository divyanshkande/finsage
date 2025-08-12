package com.example.finsage;

import org.springframework.stereotype.Service;

@Service
public class LoginService {



	public boolean validateUser(String email, String password) {
		 return "admin".equals(email) && "1234".equals(password);
    }


}
