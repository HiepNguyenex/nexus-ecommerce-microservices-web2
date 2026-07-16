package com.rainbowforest.paymentservice.controller;

import com.rainbowforest.paymentservice.entity.Payment;
import com.rainbowforest.paymentservice.event.PaymentCompletedEvent;
import com.rainbowforest.paymentservice.messaging.PaymentProducer;
import com.rainbowforest.paymentservice.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/stripe")
public class StripePaymentController {

    private static final Logger logger = LoggerFactory.getLogger(StripePaymentController.class);

    @Value("${stripe.apiKey}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${stripe.webhook.verify-signature:false}")
    private boolean verifySignature;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentProducer paymentProducer;

    @PostMapping("/create-session")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, Object> requestData) {
        try {
            Stripe.apiKey = stripeApiKey;

            Long orderId = Long.valueOf(requestData.get("orderId").toString());
            BigDecimal amount = new BigDecimal(requestData.get("amount").toString());
            String successUrl = requestData.get("successUrl").toString();
            String cancelUrl = requestData.get("cancelUrl").toString();

            logger.info("Tạo Stripe Checkout Session cho đơn hàng: {}, số tiền: {}", orderId, amount);

            // Kiểm tra xem đã có bản ghi Payment chưa
            Payment payment = paymentRepository.findByOrderId(orderId);
            if (payment == null) {
                payment = new Payment();
                payment.setOrderId(orderId);
                payment.setAmount(amount);
                payment.setStatus("PENDING");
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);
            }

            // Stripe yêu cầu số tiền bằng cent (1 USD = 100 cent)
            long amountInCents = amount.multiply(new BigDecimal("100")).longValue();

            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "&orderId=" + orderId)
                    .setCancelUrl(cancelUrl)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(amountInCents)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Thanh toán đơn hàng Aroma Forest #" + orderId)
                                            .setDescription("Đơn hàng nước hoa tinh chọn Aroma Forest")
                                            .build())
                                    .build())
                            .build())
                    .putMetadata("orderId", String.valueOf(orderId))
                    .build();

            Session session = Session.create(params);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sessionId", session.getId());
            responseData.put("checkoutUrl", session.getUrl());

            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            logger.error("Lỗi khi tạo Stripe Checkout Session", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        logger.info("Nhận được webhook từ Stripe");
        Event event = null;

        if (verifySignature) {
            try {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            } catch (SignatureVerificationException e) {
                logger.error("Xác thực chữ ký Stripe Webhook thất bại: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
            }
        } else {
            // Dev mode: parse payload trực tiếp không check signature
            try {
                event = Event.GSON.fromJson(payload, Event.class);
            } catch (Exception e) {
                logger.error("Không thể phân tích dữ liệu Stripe Webhook payload", e);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid JSON");
            }
        }

        if (event == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Event is null");
        }

        logger.info("Loại sự kiện Webhook: {}", event.getType());

        if ("checkout.session.completed".equals(event.getType())) {
            // Thanh toán thành công từ Stripe Checkout
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                String orderIdStr = session.getMetadata().get("orderId");
                if (orderIdStr != null) {
                    Long orderId = Long.parseLong(orderIdStr);
                    logger.info("Thanh toán thành công qua Stripe cho đơn hàng ID: {}", orderId);
                    
                    Payment payment = paymentRepository.findByOrderId(orderId);
                    if (payment != null) {
                        if (!"SUCCESS".equalsIgnoreCase(payment.getStatus())) {
                            payment.setStatus("SUCCESS");
                            payment.setPaymentDate(LocalDateTime.now());
                            paymentRepository.save(payment);
                            
                            // Phát Kafka Event để báo cho Order Service cập nhật trạng thái đơn sang PAID
                            PaymentCompletedEvent completedEvent = new PaymentCompletedEvent(
                                    payment.getOrderId(),
                                    payment.getId(),
                                    payment.getStatus(),
                                    payment.getAmount()
                            );
                            paymentProducer.sendPaymentCompletedEvent(completedEvent);
                            logger.info("Đã bắn sự kiện payment-completed cho đơn hàng: {}", orderId);
                        } else {
                            logger.info("Thanh toán cho đơn hàng {} đã được xử lý thành công trước đó.", orderId);
                        }
                    } else {
                        logger.error("Không tìm thấy thông tin Payment tương ứng cho đơn hàng: {}", orderId);
                    }
                }
            }
        }

        return ResponseEntity.ok("Success");
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<String> confirmPayment(@RequestParam("orderId") Long orderId) {
        logger.info("Yêu cầu xác nhận thanh toán trực tiếp (Dev/Redirect) cho đơn hàng ID: {}", orderId);
        
        Payment payment = paymentRepository.findByOrderId(orderId);
        if (payment != null) {
            if (!"SUCCESS".equalsIgnoreCase(payment.getStatus())) {
                payment.setStatus("SUCCESS");
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);
                
                // Phát Kafka Event để báo cho Order Service cập nhật trạng thái đơn sang PAID
                PaymentCompletedEvent completedEvent = new PaymentCompletedEvent(
                        payment.getOrderId(),
                        payment.getId(),
                        payment.getStatus(),
                        payment.getAmount()
                );
                paymentProducer.sendPaymentCompletedEvent(completedEvent);
                logger.info("Đã bắn sự kiện payment-completed cho đơn hàng: {} qua xác nhận trực tiếp", orderId);
                return ResponseEntity.ok("Payment confirmed successfully");
            } else {
                logger.info("Thanh toán cho đơn hàng {} đã được xử lý thành công trước đó.", orderId);
                return ResponseEntity.ok("Payment was already successful");
            }
        } else {
            logger.error("Không tìm thấy thông tin Payment tương ứng cho đơn hàng: {}", orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Payment not found");
        }
    }
}

