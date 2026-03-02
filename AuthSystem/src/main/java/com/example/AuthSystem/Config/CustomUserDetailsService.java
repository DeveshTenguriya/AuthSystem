package com.example.AuthSystem.Config;

import com.example.AuthSystem.Entity.User;
import com.example.AuthSystem.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;


    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
               user.getRoles()
                       .stream()
                       .map(role ->{
                           String roleName = role.getName();
                           if (!roleName.startsWith("ROLE_")) {
                               roleName = "ROLE_" + roleName;
                           }
                           return new SimpleGrantedAuthority(role.getName());
                       })
                       .collect(Collectors.toSet())
        );
    }

    //Why This Class Is Critical
    //That contains:
    //
    //Username
    //
    //Password
    //
    //Authorities (roles)
    //
    //Spring then:
    //
    //Stores it in SecurityContext
    //
    //Uses it for authorization
    //
    //Checks roles in @PreAuthorize
    //
    //Checks roles in SecurityConfig
}
