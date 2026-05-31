package com.example.AuthSystem.Config;

import com.example.AuthSystem.Entity.PermissionEntity;
import com.example.AuthSystem.Entity.Role;
import com.example.AuthSystem.Repository.PermissionRepository;
import com.example.AuthSystem.Repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;



    @Override
    public void run(ApplicationArguments args) {

        // Step 1 — Create permissions if they don't exist
        PermissionEntity createUser  = getOrCreate("CREATE_USER");
        PermissionEntity deleteUser  = getOrCreate("DELETE_USER");
        PermissionEntity readUsers   = getOrCreate("READ_USERS");
        PermissionEntity readProfile = getOrCreate("READ_PROFILE");

        // Step 2 — Create ADMIN role with all permissions
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role admin = Role.builder()
                    .name("ROLE_ADMIN")
                    .permissionEntity(Set.of(createUser, deleteUser, readUsers, readProfile))
                    .build();
            roleRepository.save(admin);
            System.out.println("✅ ROLE_ADMIN created");
        }

        // Step 3 — Create USER role with only READ_PROFILE
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role user = Role.builder()
                    .name("ROLE_USER")
                    .permissionEntity(Set.of(readProfile))
                    .build();
            roleRepository.save(user);
            System.out.println("✅ ROLE_USER created");
        }
    }

    private PermissionEntity getOrCreate(String name) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> permissionRepository.save(
                        PermissionEntity.builder().name(name).build()
                ));
    }
}
