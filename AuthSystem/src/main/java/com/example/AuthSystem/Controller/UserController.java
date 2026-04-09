package com.example.AuthSystem.Controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/users")
public class UserController {

    @PreAuthorize("hasAuthority('CREATE_USER')")
    @PostMapping
    public String createUser() {
        return "User created";
    }

    @PreAuthorize("hasAuthority('DELETE_USER')")
    @DeleteMapping("/{id}")
    public String deleteUser() {
        return "User deleted";
    }

    @PreAuthorize("hasAuthority('READ_PROFILE')")
    @GetMapping("/profile")
    public String profile() {
        return "User profile";
    }
}
