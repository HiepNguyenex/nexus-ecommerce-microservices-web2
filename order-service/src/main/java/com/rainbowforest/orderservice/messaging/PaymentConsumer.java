package com.rainbowforest.orderservice.messaging;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.event.PaymentCompletedEvent;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PaymentConsumer {

    private static final Logger logger = LoggerFactory.getLogger(PaymentConsumer.class);

    @Autowired
    private OrderRepository orderRepository;

    @KafkaListener(topics = "payment-completed", groupId = "${spring.kafka.consumer.group-id:order-group-v2}")
    public void consumePaymentCompleted(PaymentCompletedEvent event) {
        logger.info("Order Service nhận được sự kiện payment-completed từ Kafka: {}", event);

        Optional<Order> optOrder = orderRepository.findById(event.getOrderId());
        if (optOrder.isPresent()) {
            Order order = optOrder.get();
            if ("SUCCESS".equalsIgnoreCase(event.getStatus())) {
                order.setStatus("PAID");
                logger.info("Cập nhật trạng thái đơn hàng ID {} thành PAID", order.getId());
            } else {
                order.setStatus("PAYMENT_FAILED");
                logger.warn("Thanh toán thất bại cho đơn hàng ID {}. Trạng thái cập nhật: PAYMENT_FAILED", order.getId());
            }
            orderRepository.save(order);
        } else {
            logger.error("Không tìm thấy đơn hàng ID {} để cập nhật trạng thái thanh toán", event.getOrderId());
        }
    }
}
