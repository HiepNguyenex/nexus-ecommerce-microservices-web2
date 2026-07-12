package com.rainbowforest.inventoryservice.messaging;

import com.rainbowforest.inventoryservice.entity.Inventory;
import com.rainbowforest.inventoryservice.event.OrderCreatedEvent;
import com.rainbowforest.inventoryservice.event.OrderItemInfo;
import com.rainbowforest.inventoryservice.event.OrderShippedEvent;
import com.rainbowforest.inventoryservice.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrderConsumer {

    private static final Logger logger = LoggerFactory.getLogger(OrderConsumer.class);

    @Autowired
    private InventoryRepository inventoryRepository;

    @KafkaListener(topics = "order-created", groupId = "${spring.kafka.consumer.group-id:inventory-group-v2}")
    public void consumeOrderCreated(OrderCreatedEvent event) {
        logger.info("[Saga] Inventory Service nhận sự kiện order-created #{}: chuẩn bị tồn kho (RESERVATION)", event.getOrderId());

        if (event.getItems() != null) {
            for (OrderItemInfo item : event.getItems()) {
                Long productId = item.getProductId();
                Optional<Inventory> optInv = inventoryRepository.findByProductId(productId);
                Inventory inventory;
                if (optInv.isPresent()) {
                    inventory = optInv.get();
                } else {
                    inventory = new Inventory();
                    inventory.setProductId(productId);
                    inventory.setProductName(item.getProductName() != null ? item.getProductName() : "Sản phẩm " + productId);
                    inventory.setQuantity(100);
                    inventory = inventoryRepository.save(inventory);
                    logger.info("Khởi tạo tồn kho mẫu cho sản phẩm ID {}: 100", productId);
                }
                logger.info("[Saga] Đơn hàng #{} - Sản phẩm {}: tồn kho hiện tại = {} (giữ chỗ, chưa trừ)",
                    event.getOrderId(), productId, inventory.getQuantity());
            }
        }
    }

    @KafkaListener(topics = "order-shipped", groupId = "${spring.kafka.consumer.group-id:inventory-group-v2}")
    public void consumeOrderShipped(OrderShippedEvent event) {
        logger.info("[Saga] Inventory Service nhận sự kiện order-shipped #{}: TRỪ KHO chính thức", event.getOrderId());

        if (event.getItems() != null) {
            for (OrderItemInfo item : event.getItems()) {
                Long productId = item.getProductId();
                int orderQty = item.getQuantity();
                Optional<Inventory> optInv = inventoryRepository.findByProductId(productId);
                if (optInv.isPresent()) {
                    Inventory inventory = optInv.get();
                    int oldQty = inventory.getQuantity();
                    int newQty = Math.max(0, oldQty - orderQty);
                    inventory.setQuantity(newQty);
                    inventoryRepository.save(inventory);
                    logger.info("[Saga] Đơn hàng #{} ĐÃ GIAO: trừ kho sản phẩm {}: {} -> {} (trừ {})",
                        event.getOrderId(), productId, oldQty, newQty, orderQty);
                } else {
                    logger.warn("[Saga] Đơn hàng #{} ĐÃ GIAO nhưng sản phẩm {} chưa có trong kho - bỏ qua",
                        event.getOrderId(), productId);
                }
            }
        }
    }
}
