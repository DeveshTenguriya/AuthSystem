package com.example.AuthSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthSystemApplication {

	public static void main(String[] args)
    {
		SpringApplication.run(AuthSystemApplication.class, args);

        System.out.println("Devesh Tenuriya");
        //the application was running good
	}

}

//com.devesh.authsystem
//│
//├── AuthSystemApplication.java
//│
//├── config
//│   ├── security
//│   ├── jwt
//│   ├── redis
//│   ├── mail
//│   └── cors
//│
//├── controller
//│   ├── auth
//│   ├── user
//│   ├── admin
//│   └── health
//│
//├── service
//│   ├── auth
//│   ├── user
//│   ├── token
//│   ├── email
//│   └── role
//│
//├── repository
//│
//├── entity
//│
//├── dto
//│   ├── request
//│   └── response
//│
//├── security
//│   ├── filter
//│   ├── handler
//│   └── provider
//│
//├── exception
//│
//├── util
//│
//└── constant


