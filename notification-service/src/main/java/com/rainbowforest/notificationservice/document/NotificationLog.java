package com.rainbowforest.notificationservice.document;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notification_logs", indexes = {
    @Index(name = "idx_order_id", columnList = "orderId"),
    @Index(name = "idx_event_type", columnList = "eventType"),
    @Index(name = "idx_created_at", columnList = "createdAt")
})
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String eventType;

    @Column(length = 50)
    private String target;

    @Column(length = 500)
    private String message;

    @Column(length = 30)
    private String status;

    private Long orderId;
    private Long userId;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
