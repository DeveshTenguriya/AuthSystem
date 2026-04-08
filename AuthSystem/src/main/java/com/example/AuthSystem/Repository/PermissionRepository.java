package com.example.AuthSystem.Repository;

import com.example.AuthSystem.Entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission , Long> {
    Optional<Permission> findByName(String name);

}
