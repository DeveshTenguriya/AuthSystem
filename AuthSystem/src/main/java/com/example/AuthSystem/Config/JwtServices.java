package com.example.AuthSystem.Config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

public class JwtServices {

    private final long EXPIRATION = 1000*60*15;
    private final String SECRET= "ichigocansoloallthebig3verseandheisthestrongestMCinthe3";

    public String generateToken(UserDetails userDetails) {
        String token= Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+EXPIRATION))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
                .compact();
        return token;
    }
}
