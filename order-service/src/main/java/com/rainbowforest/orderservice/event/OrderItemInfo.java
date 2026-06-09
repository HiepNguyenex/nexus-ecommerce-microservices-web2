package com.rainbowforest.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemInfo {
    private Long productId;
    private String productName;
    private int quantity;
}
