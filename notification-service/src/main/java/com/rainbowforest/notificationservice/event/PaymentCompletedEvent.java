package com.rainbowforest.notificationservice.event;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentCompletedEvent {
    private Long orderId;
    private Long paymentId;
    private String status;
    private BigDecimal amount;
}
