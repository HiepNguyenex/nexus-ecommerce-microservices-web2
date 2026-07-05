package com.rainbowforest.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rainbowforest.orderservice.domain.Order;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatus(String status);

    List<Order> findByOrderedDateBetween(LocalDate from, LocalDate to);

    // Tìm đơn hàng theo username của user (dùng để kiểm tra quyền sở hữu)
    List<Order> findByUserUserName(String userName);

    // Tìm đơn hàng theo ID và username cùng lúc (kiểm tra sở hữu nhanh)
    Optional<Order> findByIdAndUserUserName(Long id, String userName);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status IN :statuses AND o.orderedDate BETWEEN :from AND :to")
    BigDecimal sumRevenueByStatusesAndDateRange(
        @Param("statuses") List<String> statuses,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN :statuses AND o.orderedDate BETWEEN :from AND :to")
    Long countByStatusesAndDateRange(
        @Param("statuses") List<String> statuses,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to);
}
