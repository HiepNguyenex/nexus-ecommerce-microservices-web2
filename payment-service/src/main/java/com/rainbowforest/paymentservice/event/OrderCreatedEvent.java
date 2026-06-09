package com.rainbowforest.paymentservice.event;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderCreatedEvent {
    private Long orderId;
    private Long userId;
    private BigDecimal total;
    private String status;
}
