package com.rainbowforest.notificationservice.repository;

import com.rainbowforest.notificationservice.document.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    List<NotificationLog> findByEventTypeOrderByCreatedAtDesc(String eventType);
    long countByStatus(String status);
}
