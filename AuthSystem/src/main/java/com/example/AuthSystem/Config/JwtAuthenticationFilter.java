package com.example.AuthSystem.Config;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtServices jwtServices;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtServices jwtServices, CustomUserDetailsService userDetailsService) {
        this.jwtServices = jwtServices;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request
            , HttpServletResponse response
            , FilterChain filterChain)
            throws ServletException,  java.io.IOException {

        String authHeader = request.getHeader("Authorization");

        String token = null;
        String username= null;

        if (authHeader!=null || authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request,response);
            return;

        }

        token= authHeader.substring(7);
        username = jwtServices.extractUsername(token);

        if(username!=null && SecurityContextHolder.getContext().getAuthentication()==null){
            UserDetails userDetails=
                    userDetailsService
                    .loadUserByUsername(username);
        }
    }

    
}
