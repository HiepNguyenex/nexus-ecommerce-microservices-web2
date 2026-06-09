package com.rainbowforest.inventoryservice.messaging;

import com.rainbowforest.inventoryservice.entity.Inventory;
import com.rainbowforest.inventoryservice.event.OrderCreatedEvent;
import com.rainbowforest.inventoryservice.event.OrderItemInfo;
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

    @KafkaListener(topics = "order-created", groupId = "inventory-group")
    public void consumeOrderCreated(OrderCreatedEvent event) {
        logger.info("Inventory Service nhận được sự kiện order-created: {}", event);

        if (event.getItems() != null) {
            for (OrderItemInfo item : event.getItems()) {
                Long productId = item.getProductId();
                int orderQty = item.getQuantity();

                Optional<Inventory> optInv = inventoryRepository.findByProductId(productId);
                Inventory inventory;
                if (optInv.isPresent()) {
                    inventory = optInv.get();
                } else {
                    // Tự động khởi tạo tồn kho mẫu ban đầu nếu sản phẩm chưa có trong DB tồn kho
                    inventory = new Inventory();
                    inventory.setProductId(productId);
                    inventory.setProductName(item.getProductName() != null ? item.getProductName() : "Sản phẩm " + productId);
                    inventory.setQuantity(100); // Tồn kho ban đầu là 100
                    inventory = inventoryRepository.save(inventory);
                    logger.info("Đã khởi tạo tồn kho mẫu ban đầu cho sản phẩm ID {}: 100 cái", productId);
                }

                // Thực hiện trừ kho
                int newQty = Math.max(0, inventory.getQuantity() - orderQty);
                inventory.setQuantity(newQty);
                inventoryRepository.save(inventory);

                logger.info("Đã cập nhật tồn kho cho sản phẩm '{}' (ID {}): {} -> {} (Trừ {} cái)", 
                        inventory.getProductName(), productId, inventory.getQuantity() + orderQty, newQty, orderQty);
            }
        }
    }
}
