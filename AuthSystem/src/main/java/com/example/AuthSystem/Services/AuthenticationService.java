package com.example.AuthSystem.Services;

import com.example.AuthSystem.Config.JwtServices;
import com.example.AuthSystem.DTO.AuthResponse;
import com.example.AuthSystem.DTO.LoginRequest;
import com.example.AuthSystem.DTO.RefreshRequest;
import com.example.AuthSystem.DTO.RegisterRequest;
import com.example.AuthSystem.Entity.RefreshToken;
import com.example.AuthSystem.Entity.User;
import com.example.AuthSystem.Repository.RefreshTokenRepository;
import com.example.AuthSystem.Repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtServices jwtServices;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationService(AuthenticationManager authenticationManager, JwtServices jwtServices, UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtServices = jwtServices;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public AuthResponse login(LoginRequest request){

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword())

        );

        User user=userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(()-> new RuntimeException("User not found"));

        List<SimpleGrantedAuthority> authorities =
                user.getRoles()
                        .stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .toList();

        String accessToken=
                jwtServices.generateToken(
                        new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                authorities
                        )
                );

        String refreshToken = UUID.randomUUID().toString();

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .token(refreshToken)
                        .user(user)
                        .expiryDate(LocalDateTime.now().plusDays(7))
                        .revoked(false)
                        .build()
        );

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse register(RegisterRequest request){

        if (userRepository.findByEmail(request.getEmail()).isPresent()){
            throw  new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        String accessToken = jwtServices.generateToken(
                new org.springframework.security.core.userdetails.User(
                  user.getEmail(),
                  user.getPassword(),
                  List.of(new SimpleGrantedAuthority("ROLE_USER"))
                )
        );

        String refreshToken = UUID.randomUUID().toString();

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .token(refreshToken)
                        .user(user)
                        .expiryDate(LocalDateTime.now().plusDays(7))
                        .revoked(false)
                        .build()
        );

        return new AuthResponse(accessToken,refreshToken);

    }
public AuthResponse refresh(RefreshRequest request){


            RefreshToken storedToken = refreshTokenRepository
                    .findByToken(request.getRefreshToken())
                    .orElseThrow(()-> new RuntimeException("Token not found"));

            if (storedToken.isRevoked()){
                throw  new RuntimeException("Token is already revoked");
            }

            if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())){
                throw new RuntimeException("Refresh token is expired");
            }

            User user = storedToken.getUser();

            List<SimpleGrantedAuthority> authorities=
                    user.getRoles()
                            .stream()
                            .map(role -> new SimpleGrantedAuthority(role.getName()))
                            .toList();

                String newAccessToken = jwtServices.generateToken(
                        new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                authorities
                        )
                );


                storedToken.setRevoked(true);
             refreshTokenRepository.save(storedToken);

             String newRefreshToken = UUID.randomUUID().toString();

            refreshTokenRepository.save(
                    RefreshToken.builder()
                            .token(newRefreshToken)
                            .user(user)
                            .expiryDate(LocalDateTime.now().plusDays(7))
                            .revoked(false)
                            .build()
            );

            return new AuthResponse(newAccessToken, newRefreshToken);
}



    //Full Flow Summary
    //
    //User sends email + password
    //
    //Spring Security validates credentials
    //
    //You fetch user entity
    //
    //Generate access token (15 min)
    //
    //Generate refresh token (7 days)
    //
    //Store refresh token in DB
    //
    //Return both tokens
}
