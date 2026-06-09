package com.rainbowforest.notificationservice.event;

import lombok.Data;

@Data
public class OrderItemInfo {
    private Long productId;
    private String productName;
    private int quantity;
}
