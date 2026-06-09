package com.rainbowforest.notificationservice.event;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderCreatedEvent {
    private Long orderId;
    private Long userId;
    private BigDecimal total;
    private String status;
    private List<OrderItemInfo> items;
}
