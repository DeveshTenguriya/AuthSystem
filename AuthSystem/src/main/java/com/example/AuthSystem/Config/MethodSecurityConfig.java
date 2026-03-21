package com.example.AuthSystem.Config;

import com.example.AuthSystem.Security.CustomPermissionEvaluator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;


@Configuration
public class MethodSecurityConfig {

    @Bean
    public MethodSecurityExpressionHandler expressionHandler(
            CustomPermissionEvaluator permissionEvaluator) {

        DefaultMethodSecurityExpressionHandler handler =
                new DefaultMethodSecurityExpressionHandler();

        handler.setPermissionEvaluator(permissionEvaluator);

        return handler;
    }
}
