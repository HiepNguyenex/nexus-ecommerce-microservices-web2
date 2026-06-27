package com.rainbowforest.orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class RevenueReport {
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal totalRevenue;
    private Long orderCount;
    private BigDecimal averageOrderValue;
    private List<OrderRevenue> breakdown;

    public RevenueReport() {}

    public RevenueReport(LocalDate fromDate, LocalDate toDate, BigDecimal totalRevenue,
                         Long orderCount, BigDecimal averageOrderValue, List<OrderRevenue> breakdown) {
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.totalRevenue = totalRevenue;
        this.orderCount = orderCount;
        this.averageOrderValue = averageOrderValue;
        this.breakdown = breakdown;
    }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public Long getOrderCount() { return orderCount; }
    public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }

    public BigDecimal getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }

    public List<OrderRevenue> getBreakdown() { return breakdown; }
    public void setBreakdown(List<OrderRevenue> breakdown) { this.breakdown = breakdown; }

    public static class OrderRevenue {
        private String status;
        private BigDecimal revenue;
        private Long count;

        public OrderRevenue() {}

        public OrderRevenue(String status, BigDecimal revenue, Long count) {
            this.status = status;
            this.revenue = revenue;
            this.count = count;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
    }
}
