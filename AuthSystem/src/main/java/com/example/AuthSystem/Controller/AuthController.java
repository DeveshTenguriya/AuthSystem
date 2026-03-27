package com.example.AuthSystem.Controller;

import com.example.AuthSystem.DTO.AuthResponse;
import com.example.AuthSystem.DTO.LoginRequest;
import com.example.AuthSystem.DTO.RefreshRequest;
import com.example.AuthSystem.DTO.RegisterRequest;
import com.example.AuthSystem.Services.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody @Valid RegisterRequest request) {

        return ResponseEntity.ok(
                authenticationService.register(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authenticationService.login(request)
        );
    }

    @PostMapping(path = "/refresh")
  public ResponseEntity<AuthResponse> refreshToken(
          @RequestBody RefreshRequest request){

        return ResponseEntity.ok(
                authenticationService.refresh(request)
        );
  }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestBody RefreshRequest request) {

        authenticationService.logout(request);
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Not authenticated"));
        }
        // If JWT is invalid, filter blocks request before reaching here
        // If we reach here, token is already validated ✅
        return ResponseEntity.ok(Map.of(
                "username", userDetails.getUsername(),
                "roles", userDetails.getAuthorities()
        ));
    }
}
