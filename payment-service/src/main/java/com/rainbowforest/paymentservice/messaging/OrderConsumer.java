package com.rainbowforest.paymentservice.messaging;

import com.rainbowforest.paymentservice.entity.Payment;
import com.rainbowforest.paymentservice.event.OrderCreatedEvent;
import com.rainbowforest.paymentservice.event.PaymentCompletedEvent;
import com.rainbowforest.paymentservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OrderConsumer {

    private static final Logger logger = LoggerFactory.getLogger(OrderConsumer.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentProducer paymentProducer;

    @KafkaListener(topics = "order-created", groupId = "${spring.kafka.consumer.group-id:payment-group-v2}")
    public void consumeOrderCreated(OrderCreatedEvent event) {
        logger.info("Nhận được sự kiện order-created từ Kafka: {}", event);

        // Giả lập xử lý thanh toán và lưu lịch sử
        Payment payment = new Payment();
        payment.setOrderId(event.getOrderId());
        payment.setUserId(event.getUserId());
        payment.setAmount(event.getTotal());
        payment.setStatus("SUCCESS"); // Mặc định giả lập thanh toán thành công
        payment.setPaymentDate(LocalDateTime.now());

        payment = paymentRepository.save(payment);
        logger.info("Đã lưu lịch sử thanh toán thành công: {}", payment);

        // Gửi sự kiện thanh toán hoàn thành
        PaymentCompletedEvent completedEvent = new PaymentCompletedEvent(
                payment.getOrderId(),
                payment.getId(),
                payment.getStatus(),
                payment.getAmount()
        );

        paymentProducer.sendPaymentCompletedEvent(completedEvent);
    }
}
