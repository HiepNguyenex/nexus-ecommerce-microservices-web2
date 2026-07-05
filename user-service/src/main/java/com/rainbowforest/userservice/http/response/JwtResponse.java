package com.rainbowforest.userservice.http.response;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String username;
    private String role;
    private Long userId;
    private String refreshToken;

    public JwtResponse(String token, String username, String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }

    public JwtResponse(String token, String username, String role, Long userId, String refreshToken) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.refreshToken = refreshToken;
    }
}
