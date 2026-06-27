package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.dto.RevenueReport;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    public Order saveOrder(Order order);
    public List<Order> getAllOrders();
    public Order getOrderById(Long id);
    public RevenueReport getRevenueReport(LocalDate from, LocalDate to);
}

