package com.rainbowforest.notificationservice.messaging;

import com.rainbowforest.notificationservice.document.NotificationLog;
import com.rainbowforest.notificationservice.event.OrderCreatedEvent;
import com.rainbowforest.notificationservice.event.OrderShippedEvent;
import com.rainbowforest.notificationservice.event.PaymentCompletedEvent;
import com.rainbowforest.notificationservice.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class NotificationConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);
    private static final BigDecimal HIGH_VALUE_THRESHOLD = new BigDecimal("1000.00");

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @KafkaListener(topics = "order-created", groupId = "${spring.kafka.consumer.group-id:notification-group-v2}")
    public void consumeOrderCreated(OrderCreatedEvent event) {
        logger.info("Notification Service nhận được sự kiện order-created: {}", event);

        logger.info("[EMAIL SENT] Gửi email xác nhận đơn hàng tới User ID: {}. Đơn hàng ID: {}, Tổng tiền: {}. Trạng thái: {}.",
                event.getUserId(), event.getOrderId(), event.getTotal(), event.getStatus());

        saveLog("ORDER_CREATED", "USER", "Gửi email xác nhận đơn hàng #" + event.getOrderId(),
            "SENT", event.getOrderId(), event.getUserId());

        notifyAdmin("[ADMIN] Đơn hàng mới #" + event.getOrderId()
            + " từ User #" + event.getUserId()
            + " - Tổng: " + event.getTotal()
            + " - Trạng thái: " + event.getStatus());
    }

    @KafkaListener(topics = "payment-completed", groupId = "${spring.kafka.consumer.group-id:notification-group-v2}")
    public void consumePaymentCompleted(PaymentCompletedEvent event) {
        logger.info("Notification Service nhận được sự kiện payment-completed: {}", event);

        logger.info("[EMAIL SENT] Gửi email xác nhận THANH TOÁN thành công tới User. Đơn hàng ID: {}, Giao dịch ID: {}, Số tiền: {}. Trạng thái thanh toán: {}.",
                event.getOrderId(), event.getPaymentId(), event.getAmount(), event.getStatus());

        saveLog("PAYMENT_COMPLETED", "USER", "Thanh toán thành công #" + event.getPaymentId()
            + " cho đơn hàng #" + event.getOrderId() + " - " + event.getAmount(),
            "SENT", event.getOrderId(), null);

        String adminMsg = "[ADMIN] Thanh toán thành công cho đơn hàng #" + event.getOrderId()
            + " - Giao dịch: " + event.getPaymentId()
            + " - Số tiền: " + event.getAmount();
        if (event.getAmount() != null && event.getAmount().compareTo(HIGH_VALUE_THRESHOLD) > 0) {
            adminMsg += " *** HIGH-VALUE ORDER ***";
        }
        notifyAdmin(adminMsg);
    }

    @KafkaListener(topics = "order-shipped", groupId = "${spring.kafka.consumer.group-id:notification-group-v2}")
    public void consumeOrderShipped(OrderShippedEvent event) {
        logger.info("Notification Service nhận được sự kiện order-shipped: {}", event);

        logger.info("[EMAIL SENT] Gửi email xác nhận GIAO HÀNG tới User ID: {}. Đơn hàng ID: {}.",
                event.getUserId(), event.getOrderId());

        saveLog("ORDER_SHIPPED", "USER", "Đơn hàng #" + event.getOrderId() + " đã giao",
            "SENT", event.getOrderId(), event.getUserId());

        notifyAdmin("[ADMIN] Đơn hàng #" + event.getOrderId() + " đã được GIAO HÀNG. Trạng thái: " + event.getStatus());
    }

    private void notifyAdmin(String message) {
        logger.info("[ADMIN NOTIFICATION] {}", message);
        logger.info("[ADMIN EMAIL] Gửi email cho admin@rainbowforest.com với nội dung: {}", message);
        saveLog("ADMIN_NOTIFICATION", "ADMIN", message, "SENT", null, null);
    }

    private void saveLog(String eventType, String target, String message, String status,
                         Long orderId, Long userId) {
        try {
            NotificationLog log = NotificationLog.builder()
                .eventType(eventType)
                .target(target)
                .message(message)
                .status(status)
                .orderId(orderId)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .build();
            notificationLogRepository.save(log);
            logger.info("[MongoDB] Saved notification log: {}", eventType);
        } catch (Exception e) {
            logger.error("Failed to save notification log to MongoDB", e);
        }
    }
}
