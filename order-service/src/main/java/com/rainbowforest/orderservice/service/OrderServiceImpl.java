package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.dto.RevenueReport;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final List<String> REVENUE_STATUSES = Arrays.asList("PAID", "SHIPPED", "COMPLETED", "DELIVERED");

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public List<Order> getOrdersByUserName(String userName) {
        return orderRepository.findByUserUserName(userName);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public boolean isOrderOwner(Long orderId, String userName) {
        return orderRepository.findByIdAndUserUserName(orderId, userName).isPresent();
    }

    @Override
    public RevenueReport getRevenueReport(LocalDate from, LocalDate to) {
        BigDecimal totalRevenue = orderRepository.sumRevenueByStatusesAndDateRange(REVENUE_STATUSES, from, to);
        Long totalCount = orderRepository.countByStatusesAndDateRange(REVENUE_STATUSES, from, to);
        BigDecimal avg = totalCount > 0
            ? totalRevenue.divide(BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        List<RevenueReport.OrderRevenue> breakdown = new ArrayList<>();
        for (String status : REVENUE_STATUSES) {
            BigDecimal rev = orderRepository.sumRevenueByStatusesAndDateRange(Arrays.asList(status), from, to);
            Long cnt = orderRepository.countByStatusesAndDateRange(Arrays.asList(status), from, to);
            if (cnt != null && cnt > 0) {
                breakdown.add(new RevenueReport.OrderRevenue(status, rev, cnt));
            }
        }

        return new RevenueReport(from, to,
            totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
            totalCount != null ? totalCount : 0L,
            avg, breakdown);
    }
}

