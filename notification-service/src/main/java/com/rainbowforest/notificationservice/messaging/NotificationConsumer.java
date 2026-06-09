package com.rainbowforest.notificationservice.messaging;

import com.rainbowforest.notificationservice.event.OrderCreatedEvent;
import com.rainbowforest.notificationservice.event.PaymentCompletedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    @KafkaListener(topics = "order-created", groupId = "notification-group")
    public void consumeOrderCreated(OrderCreatedEvent event) {
        logger.info("Notification Service nhận được sự kiện order-created: {}", event);
        
        // Giả lập gửi mail
        logger.info("[EMAIL SENT] Gửi email xác nhận đơn hàng tới User ID: {}. Đơn hàng ID: {}, Tổng tiền: {}. Trạng thái: {}.", 
                event.getUserId(), event.getOrderId(), event.getTotal(), event.getStatus());
    }

    @KafkaListener(topics = "payment-completed", groupId = "notification-group")
    public void consumePaymentCompleted(PaymentCompletedEvent event) {
        logger.info("Notification Service nhận được sự kiện payment-completed: {}", event);

        // Giả lập gửi mail
        logger.info("[EMAIL SENT] Gửi email xác nhận THANH TOÁN thành công tới User. Đơn hàng ID: {}, Giao dịch ID: {}, Số tiền: {}. Trạng thái thanh toán: {}.",
                event.getOrderId(), event.getPaymentId(), event.getAmount(), event.getStatus());
    }
}
