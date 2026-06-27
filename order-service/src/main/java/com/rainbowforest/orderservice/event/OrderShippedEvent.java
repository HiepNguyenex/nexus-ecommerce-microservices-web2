package com.rainbowforest.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderShippedEvent {
    private Long orderId;
    private Long userId;
    private String status;
    private List<OrderItemInfo> items;
}
