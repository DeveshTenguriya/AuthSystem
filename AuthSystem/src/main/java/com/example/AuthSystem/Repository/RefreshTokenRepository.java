package com.example.AuthSystem.Repository;

import com.example.AuthSystem.Entity.RefreshToken;
import com.example.AuthSystem.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);


}
