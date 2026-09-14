package com.example.AuthSystem.Common.Contants;

import com.example.AuthSystem.Config.JwtAuthenticationFilter;
import com.example.AuthSystem.Security.Filter.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConstants {

    private final RateLimitFilter rateLimitFilter;
    private final JwtAuthenticationFilter jwtAuthFilter;


    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                // Rate limit runs BEFORE JWT auth
                .addFilterBefore(rateLimitFilter,   UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter,     UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
