package com.example.AuthSystem.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.security.Permission;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean accountNonLocked = true;

    private int failedAttempts = 0;

    @ManyToMany(fetch = FetchType.EAGER)
    //Without this join table:
    //You cannot assign multiple roles to a user.
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    //phase-4

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_permissions", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission")
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();

    // ── Phase 5: Account locking ──────────────────────────────
    @Column(nullable = false)
    @Builder.Default
    private boolean accountLocked = false;

    @Column(nullable = false)
    @Builder.Default
    private int failedLoginAttempts = 0;

    private Instant lockTime;

    // ── Phase 5: Email verification ───────────────────────────
    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    private String verificationToken;
    private Instant verificationExpiry;

    // ── Timestamps ────────────────────────────────────────────
    @Column(updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
