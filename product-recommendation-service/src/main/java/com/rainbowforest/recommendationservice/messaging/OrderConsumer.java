package com.rainbowforest.recommendationservice.messaging;

import com.rainbowforest.recommendationservice.event.OrderCreatedEvent;
import com.rainbowforest.recommendationservice.event.OrderItemInfo;
import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.feignClient.UserClient;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.model.Recommendation;
import com.rainbowforest.recommendationservice.model.User;
import com.rainbowforest.recommendationservice.repository.ProductRepository;
import com.rainbowforest.recommendationservice.repository.UserRepository;
import com.rainbowforest.recommendationservice.service.RecommendationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderConsumer.class);

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private UserClient userClient;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @KafkaListener(topics = "order-created", groupId = "${spring.kafka.consumer.group-id:recommendation-group-v2}")
    public void consumeOrderCreated(OrderCreatedEvent event) {
        log.info("[Kafka] Recommendation Service nhận sự kiện order-created cho đơn hàng #{}", event.getOrderId());
        if (event.getItems() == null || event.getItems().isEmpty()) {
            return;
        }

        try {
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user == null) {
                user = userClient.getUserById(event.getUserId());
                if (user != null) {
                    user = userRepository.save(user);
                } else {
                    log.warn("[Kafka] Không tìm thấy thông tin user #{}", event.getUserId());
                    return;
                }
            }

            for (OrderItemInfo item : event.getItems()) {
                Product product = productRepository.findById(item.getProductId()).orElse(null);
                if (product == null) {
                    product = productClient.getProductById(item.getProductId());
                    if (product != null) {
                        product = productRepository.save(product);
                    } else {
                        log.warn("[Kafka] Không tìm thấy thông tin sản phẩm #{}", item.getProductId());
                        continue;
                    }
                }

                log.info("[Kafka] Tự động tạo gợi ý 5 sao cho sản phẩm '{}' cho user '{}'", product.getProductName(), user.getUserName());
                Recommendation recommendation = new Recommendation();
                recommendation.setProduct(product);
                recommendation.setUser(user);
                recommendation.setRating(5); // Đánh giá mặc định 5 sao cho sản phẩm đã mua
                recommendationService.saveRecommendation(recommendation);
            }
        } catch (Exception e) {
            log.error("[Kafka] Lỗi xử lý sự kiện order-created", e);
        }
    }
}
