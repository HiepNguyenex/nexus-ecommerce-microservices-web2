package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.http.request.LoginRequest;
import com.rainbowforest.userservice.http.request.LogoutRequest;
import com.rainbowforest.userservice.http.request.TokenRefreshRequest;
import com.rainbowforest.userservice.http.response.JwtResponse;
import com.rainbowforest.userservice.http.response.TokenRefreshResponse;
import com.rainbowforest.userservice.security.JwtProvider;
import com.rainbowforest.userservice.service.RefreshTokenService;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.getUserByName(loginRequest.getUsername());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không chính xác");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getUserPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không chính xác");
        }

        if (user.getActive() != 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản đã bị khóa");
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
        String accessToken = jwtProvider.generateToken(user.getUserName(), user.getId(), Collections.singletonList(roleName));
        String refreshToken = refreshTokenService.createRefreshToken(user.getUserName());

        return ResponseEntity.ok(new JwtResponse(accessToken, user.getUserName(), roleName, user.getId(), refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String username = refreshTokenService.validateRefreshToken(request.getRefreshToken());
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token không hợp lệ hoặc đã hết hạn");
        }

        User user = userService.getUserByName(username);
        if (user == null || user.getActive() != 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản không hợp lệ hoặc đã bị khóa");
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
        String newAccessToken = jwtProvider.generateToken(username, user.getId(), Collections.singletonList(roleName));
        String newRefreshToken = refreshTokenService.createRefreshToken(username);

        return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, newRefreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) LogoutRequest request) {
        if (request != null && request.getAccessToken() != null && !request.getAccessToken().isBlank()) {
            // Blacklist access token để nó không dùng được nữa
            refreshTokenService.blacklistAccessToken(request.getAccessToken());
        }
        return ResponseEntity.ok("Đã đăng xuất thành công");
    }
}
