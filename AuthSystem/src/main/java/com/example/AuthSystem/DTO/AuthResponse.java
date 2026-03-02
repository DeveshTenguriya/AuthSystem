package com.example.AuthSystem.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@AllArgsConstructor
@Setter
@Getter
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
}
