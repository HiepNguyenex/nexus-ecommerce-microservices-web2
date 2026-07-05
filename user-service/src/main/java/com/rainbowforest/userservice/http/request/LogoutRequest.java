package com.rainbowforest.userservice.http.request;

import lombok.Data;

@Data
public class LogoutRequest {
    private String accessToken;
}
