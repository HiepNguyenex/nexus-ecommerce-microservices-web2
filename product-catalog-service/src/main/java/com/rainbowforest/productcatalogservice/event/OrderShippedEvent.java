package com.rainbowforest.productcatalogservice.event;

import java.util.List;

public class OrderShippedEvent {
    private Long orderId;
    private Long userId;
    private String status;
    private List<OrderItemInfo> items;

    public OrderShippedEvent() {}

    public OrderShippedEvent(Long orderId, Long userId, String status, List<OrderItemInfo> items) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<OrderItemInfo> getItems() {
        return items;
    }

    public void setItems(List<OrderItemInfo> items) {
        this.items = items;
    }
}
