package com.rainbowforest.productcatalogservice.messaging;

import com.rainbowforest.productcatalogservice.event.OrderItemInfo;
import com.rainbowforest.productcatalogservice.event.OrderShippedEvent;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderConsumer {

    private static final Logger logger = LoggerFactory.getLogger(OrderConsumer.class);

    @Autowired
    private ProductService productService;

    @KafkaListener(topics = "order-shipped", groupId = "${spring.kafka.consumer.group-id:product-catalog-group-v2}")
    public void consumeOrderShipped(OrderShippedEvent event) {
        logger.info("[Saga Sync] Product Catalog nhận được sự kiện order-shipped cho đơn hàng #{}: thực hiện trừ kho hiển thị", event.getOrderId());

        if (event.getItems() != null) {
            for (OrderItemInfo item : event.getItems()) {
                Long productId = item.getProductId();
                int orderQty = item.getQuantity();
                try {
                    productService.reduceStock(productId, orderQty);
                } catch (Exception e) {
                    logger.error("[Saga Sync] Lỗi khi trừ tồn kho hiển thị cho sản phẩm ID {}: {}", productId, e.getMessage());
                }
            }
        }
    }
}
