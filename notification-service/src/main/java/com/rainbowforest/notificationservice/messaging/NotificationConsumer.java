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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class NotificationConsumer {

    @Autowired
    private com.rainbowforest.notificationservice.service.SseNotificationService sseNotificationService;

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);
    private static final BigDecimal HIGH_VALUE_THRESHOLD = new BigDecimal("1000.00");

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @KafkaListener(topics = "order-created", groupId = "${spring.kafka.consumer.group-id:notification-group-v2}")
    public void consumeOrderCreated(OrderCreatedEvent event) {
        logger.info("Notification Service nhận được sự kiện order-created: {}", event);

        String email = getEmailByUserId(event.getUserId());
        String subject = "Xác Nhận Đơn Hàng Mới #" + event.getOrderId();
        String body = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #dbccb8; padding: 20px; border-radius: 12px; background-color: #fffaf6;\">"
                + "<h2 style=\"color: #2d2a26; border-bottom: 2px solid #dbccb8; padding-bottom: 10px;\">Xác Nhận Đơn Hàng Mới #" + event.getOrderId() + "</h2>"
                + "<p>Chào bạn,</p>"
                + "<p>Cảm ơn bạn đã lựa chọn những túi hương tinh tế tại <b>Aroma Forest</b>. Chúng tôi đã nhận được đơn hàng của bạn.</p>"
                + "<table style=\"width: 100%; border-collapse: collapse; margin: 20px 0;\">"
                + "<tr style=\"background-color: rgba(219,204,184,0.2);\">"
                + "<th style=\"padding: 10px; border: 1px solid #dbccb8; text-align: left;\">Mã đơn hàng</th>"
                + "<td style=\"padding: 10px; border: 1px solid #dbccb8;\">" + event.getOrderId() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<th style=\"padding: 10px; border: 1px solid #dbccb8; text-align: left;\">Tổng thanh toán</th>"
                + "<td style=\"padding: 10px; border: 1px solid #dbccb8; font-weight: bold; color: #1a1a1a;\">$" + event.getTotal() + "</td>"
                + "</tr>"
                + "<tr style=\"background-color: rgba(219,204,184,0.2);\">"
                + "<th style=\"padding: 10px; border: 1px solid #dbccb8; text-align: left;\">Trạng thái</th>"
                + "<td style=\"padding: 10px; border: 1px solid #dbccb8; color: #8a7a6a; font-weight: bold;\">" + event.getStatus() + "</td>"
                + "</tr>"
                + "</table>"
                + "<p>Chúng tôi sẽ xử lý đơn hàng và giao đến bạn sớm nhất.</p>"
                + "<p style=\"font-size: 12px; color: #8a8480; border-top: 1px solid #dbccb8; padding-top: 15px;\">Aroma Forest E-Commerce. Tất cả quyền được bảo lưu.</p>"
                + "</div>";

        sendEmail(email, subject, body);

        saveLog("ORDER_CREATED", "USER", "Gửi email xác nhận đơn hàng #" + event.getOrderId(),
            "SENT", event.getOrderId(), event.getUserId());

        // Send real-time SSE notification
        try {
            String username = getUsernameByUserId(event.getUserId());
            sseNotificationService.sendNotification(username, "ORDER_STATUS", "Đơn hàng #" + event.getOrderId() + " đã được tạo! Trạng thái: " + event.getStatus());
        } catch (Exception e) {
            logger.error("Failed to send SSE notification", e);
        }

        notifyAdmin("[ADMIN] Đơn hàng mới #" + event.getOrderId()
            + " từ User #" + event.getUserId()
            + " - Tổng: " + event.getTotal()
            + " - Trạng thái: " + event.getStatus());
    }

    @KafkaListener(topics = "payment-completed", groupId = "${spring.kafka.consumer.group-id:notification-group-v2}")
    public void consumePaymentCompleted(PaymentCompletedEvent event) {
        logger.info("Notification Service nhận được sự kiện payment-completed: {}", event);

        String email = "customer@rainbowforest.com"; // Default for payment notifications
        String subject = "Thanh Toán Thành Công Cho Đơn Hàng #" + event.getOrderId();
        String body = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #dbccb8; padding: 20px; border-radius: 12px; background-color: #fffaf6;\">"
                + "<h2 style=\"color: #a8c5a0; border-bottom: 2px solid #dbccb8; padding-bottom: 10px;\">Thanh Toán Thành Công</h2>"
                + "<p>Chào bạn,</p>"
                + "<p>Đơn hàng <b>#" + event.getOrderId() + "</b> của bạn đã được thanh toán thành công qua cổng thanh toán tự động.</p>"
                + "<table style=\"width: 100%; border-collapse: collapse; margin: 20px 0;\">"
                + "<tr style=\"background-color: rgba(219,204,184,0.2);\">"
                + "<th style=\"padding: 10px; border: 1px solid #dbccb8; text-align: left;\">Mã giao dịch</th>"
                + "<td style=\"padding: 10px; border: 1px solid #dbccb8; font-family: monospace;\">" + event.getPaymentId() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<th style=\"padding: 10px; border: 1px solid #dbccb8; text-align: left;\">Số tiền thanh toán</th>"
                + "<td style=\"padding: 10px; border: 1px solid #dbccb8; font-weight: bold; color: #1a1a1a;\">$" + event.getAmount() + "</td>"
                + "</tr>"
                + "</table>"
                + "<p>Mùi hương tinh chọn đang trên đường chuẩn bị đóng gói. Cảm ơn bạn!</p>"
                + "<p style=\"font-size: 12px; color: #8a8480; border-top: 1px solid #dbccb8; padding-top: 15px;\">Aroma Forest E-Commerce. Tất cả quyền được bảo lưu.</p>"
                + "</div>";

        sendEmail(email, subject, body);

        saveLog("PAYMENT_COMPLETED", "USER", "Thanh toán thành công #" + event.getPaymentId()
            + " cho đơn hàng #" + event.getOrderId() + " - " + event.getAmount(),
            "SENT", event.getOrderId(), null);

        // Send real-time SSE notification (defaulting to johndoe)
        try {
            sseNotificationService.sendNotification("johndoe", "ORDER_STATUS", "Đơn hàng #" + event.getOrderId() + " đã thanh toán thành công!");
        } catch (Exception e) {
            logger.error("Failed to send SSE notification", e);
        }

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

        String email = getEmailByUserId(event.getUserId());
        String subject = "Đơn Hàng Đang Được Giao #" + event.getOrderId();
        String body = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #dbccb8; padding: 20px; border-radius: 12px; background-color: #fffaf6;\">"
                + "<h2 style=\"color: #8a7a6a; border-bottom: 2px solid #dbccb8; padding-bottom: 10px;\">Đơn Hàng Đang Được Giao</h2>"
                + "<p>Chào bạn,</p>"
                + "<p>Đơn hàng <b>#" + event.getOrderId() + "</b> đã được chuyển giao cho đối tác vận chuyển của Aroma Forest.</p>"
                + "<p>Bạn vui lòng chú ý điện thoại để nhận những chai nước hoa thơm mát từ chúng tôi nhé!</p>"
                + "<p style=\"font-size: 12px; color: #8a8480; border-top: 1px solid #dbccb8; padding-top: 15px;\">Aroma Forest E-Commerce. Tất cả quyền được bảo lưu.</p>"
                + "</div>";

        sendEmail(email, subject, body);

        saveLog("ORDER_SHIPPED", "USER", "Đơn hàng #" + event.getOrderId() + " đã giao",
            "SENT", event.getOrderId(), event.getUserId());

        // Send real-time SSE notification
        try {
            String username = getUsernameByUserId(event.getUserId());
            sseNotificationService.sendNotification(username, "ORDER_STATUS", "Đơn hàng #" + event.getOrderId() + " đang được giao!");
        } catch (Exception e) {
            logger.error("Failed to send SSE notification", e);
        }

        notifyAdmin("[ADMIN] Đơn hàng #" + event.getOrderId() + " đã được GIAO HÀNG. Trạng thái: " + event.getStatus());
    }

    private void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is null. Skipping SMTP send for subject: {}", subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("aroma-forest@rainbowforest.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send SMTP email to: {}", to, e);
        }
    }

    private String getEmailByUserId(Long userId) {
        if (userId == null) return "customer@rainbowforest.com";
        if (userId == 1) return "john.doe@example.com";
        if (userId == 2) return "jane.smith@example.com";
        return "customer@rainbowforest.com";
    }

    private String getUsernameByUserId(Long userId) {
        if (userId == null) return "guest";
        if (userId == 1) return "johndoe";
        if (userId == 2) return "janesmith";
        return "user_" + userId;
    }

    private void notifyAdmin(String message) {
        logger.info("[ADMIN NOTIFICATION] {}", message);
        logger.info("[ADMIN EMAIL] Gửi email cho admin@rainbowforest.com với nội dung: {}", message);
        sendEmail("admin@rainbowforest.com", "Thông Báo Hệ Thống [ADMIN]", "<h3>Thông báo hệ thống:</h3><p>" + message + "</p>");
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
            logger.info("[MySQL] Saved notification log: {}", eventType);
        } catch (Exception e) {
            logger.error("Failed to save notification log to MySQL", e);
        }
    }
}
