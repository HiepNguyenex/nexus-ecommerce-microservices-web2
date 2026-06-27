package com.rainbowforest.orderservice.messaging;

import com.rainbowforest.orderservice.event.OrderCreatedEvent;
import com.rainbowforest.orderservice.event.OrderShippedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderProducer {

    private static final Logger logger = LoggerFactory.getLogger(OrderProducer.class);
    private static final String CREATED_TOPIC = "order-created";
    private static final String SHIPPED_TOPIC = "order-shipped";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderCreatedEvent(OrderCreatedEvent event) {
        logger.info("Gửi sự kiện tạo đơn hàng tới Kafka topic [{}]: {}", CREATED_TOPIC, event);
        kafkaTemplate.send(CREATED_TOPIC, String.valueOf(event.getOrderId()), event);
    }

    public void sendOrderShippedEvent(OrderShippedEvent event) {
        logger.info("Gửi sự kiện giao hàng tới Kafka topic [{}]: {}", SHIPPED_TOPIC, event);
        kafkaTemplate.send(SHIPPED_TOPIC, String.valueOf(event.getOrderId()), event);
    }
}
