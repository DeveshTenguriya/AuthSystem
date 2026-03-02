package com.example.AuthSystem.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email is Required")
    @Email(message = "Invalid Email Format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
