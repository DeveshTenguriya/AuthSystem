package com.example.AuthSystem.Config;

import com.example.AuthSystem.Entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;


public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Set<GrantedAuthority> authorities = new HashSet<>();

        user.getRoles().forEach(role -> {

            // ✅ Add ROLE
            authorities.add(
                    new SimpleGrantedAuthority(role.getName())
            );

            // ✅ Add PERMISSIONS
            role.getPermissionEntity().forEach(permission -> {
                authorities.add(
                        new SimpleGrantedAuthority(permission.getName())
                );
            });

        });

        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isAccountNonLocked();
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}
