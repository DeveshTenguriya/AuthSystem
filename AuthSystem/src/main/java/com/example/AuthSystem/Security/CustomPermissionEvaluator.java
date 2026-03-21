package com.example.AuthSystem.Security;

import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Collection;

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication authentication, //current logged in user
                                 Object targetDomainObject, //the object being accessed (null here)
                                 Object permission) {  //"DELETE_USER" string

        Collection<? extends GrantedAuthority> authorities =
                authentication.getAuthorities();

        return authorities.stream()
                .anyMatch(a -> a.getAuthority().equals(permission));
    }

    @Override
    public boolean hasPermission(Authentication authentication,
                                 Serializable targetId,
                                 String targetType,
                                 Object permission) {
        return false;
    }
}
