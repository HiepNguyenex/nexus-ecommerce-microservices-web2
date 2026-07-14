package com.rainbowforest.recommendationservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderCreatedEvent {
    private Long orderId;
    private Long userId;
    private BigDecimal total;
    private String status;
    private List<OrderItemInfo> items;
}
