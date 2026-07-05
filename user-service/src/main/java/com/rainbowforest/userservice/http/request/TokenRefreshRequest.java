package com.rainbowforest.userservice.http.request;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}
