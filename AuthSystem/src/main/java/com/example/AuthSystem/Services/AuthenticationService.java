package com.example.AuthSystem.Services;

import com.example.AuthSystem.Config.CustomUserDetails;
import com.example.AuthSystem.Config.JwtServices;
import com.example.AuthSystem.DTO.AuthResponse;
import com.example.AuthSystem.DTO.LoginRequest;
import com.example.AuthSystem.DTO.RefreshRequest;
import com.example.AuthSystem.DTO.RegisterRequest;
import com.example.AuthSystem.Entity.RefreshToken;
import com.example.AuthSystem.Entity.Role;
import com.example.AuthSystem.Entity.User;
import com.example.AuthSystem.Repository.RefreshTokenRepository;
import com.example.AuthSystem.Repository.RoleRepository;
import com.example.AuthSystem.Repository.UserRepository;
import org.slf4j.Marker;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtServices jwtServices;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository  roleRepository;

    public AuthenticationService(AuthenticationManager authenticationManager, JwtServices jwtServices, UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtServices = jwtServices;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    public AuthResponse login(LoginRequest request){

        System.out.println("=== LOGIN DEBUG ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password length: " + request.getPassword().length());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword())
            );
            System.out.println("✅ Authentication SUCCESS");
        } catch (Exception e) {
            System.out.println("❌ Authentication FAILED: " + e.getClass().getSimpleName() + " — " + e.getMessage());
            throw e;
        }
//        authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(
//                        request.getEmail(),
//                        request.getPassword())
//
//        );

        User user=userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(()-> new RuntimeException("User not found"));

//        List<SimpleGrantedAuthority> authorities =
//                user.getRoles()
//                        .stream()
//                        .map(role -> new SimpleGrantedAuthority(role.getName()))
//                        .toList();

        //Use CustomUserDetails — includes ROLE_ prefix + permissions
        CustomUserDetails userDetails= new CustomUserDetails(user);

        String accessToken=
                jwtServices.generateToken(userDetails);

        String refreshToken = UUID.randomUUID().toString();

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .token(refreshToken)
                        .user(user)
                        .expiryDate(LocalDateTime.now().plusDays(7))
                        .revoked(false)
                        .build()
        );

        //Extract role for response
        String role = user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("ROLE_USER");

        return new AuthResponse(accessToken, refreshToken,role, user.getUsername());
    }

    public AuthResponse register(RegisterRequest request){

        if (userRepository.findByEmail(request.getEmail()).isPresent()){
            throw  new RuntimeException("Email already exists");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException(
                        "ROLE_USER not found — make sure DataSeeder has run"
                ));

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(userRole))
                .accountNonLocked(true)
                .enabled(true)
                .failedAttempts(0)
                .build();

        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);

        String accessToken = jwtServices.generateToken(userDetails);

        String refreshToken = UUID.randomUUID().toString();

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .token(refreshToken)
                        .user(user)
                        .expiryDate(LocalDateTime.now().plusDays(7))
                        .revoked(false)
                        .build()
        );

        //new users get the role USER by default
        return new AuthResponse(accessToken,refreshToken,"ROLE_USER", user.getUsername());

    }


    public AuthResponse refresh(RefreshRequest request){


        //find the refresh token in DataBase
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

            CustomUserDetails userDetails = new CustomUserDetails(user);



            //Generate new access token
                String newAccessToken = jwtServices.generateToken(userDetails);


                //Rotate Refresh Token
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

        String role = user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("ROLE_USER");


        return new AuthResponse(newAccessToken, newRefreshToken, role, user.getUsername());
    }

    public void logout(RefreshRequest request){

        //find the token in database
        RefreshToken storedToken = refreshTokenRepository
                .findByToken(request.getRefreshToken())
                .orElseThrow(()->
                        new RuntimeException("Token not found")
                );

        //set the token as revoked
        storedToken.setRevoked(true);

        //save the change now user will automatically logout as his token is revoked from the system
        refreshTokenRepository.save(storedToken);

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
