package com.rainbowforest.notificationservice.controller;

import com.rainbowforest.notificationservice.document.NotificationLog;
import com.rainbowforest.notificationservice.repository.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @GetMapping("/logs")
    public ResponseEntity<List<NotificationLog>> getAllLogs() {
        return ResponseEntity.ok(notificationLogRepository.findAll());
    }

    @GetMapping("/logs/order/{orderId}")
    public ResponseEntity<List<NotificationLog>> getLogsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(notificationLogRepository.findByOrderIdOrderByCreatedAtDesc(orderId));
    }

    @GetMapping("/logs/event/{eventType}")
    public ResponseEntity<List<NotificationLog>> getLogsByEvent(@PathVariable String eventType) {
        return ResponseEntity.ok(notificationLogRepository.findByEventTypeOrderByCreatedAtDesc(eventType));
    }

    @GetMapping("/logs/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long total = notificationLogRepository.count();
        long sentCount = notificationLogRepository.countByStatus("SENT");
        long adminCount = notificationLogRepository.countByStatus("ADMIN_NOTIFICATION");
        return ResponseEntity.ok(Map.of(
            "totalLogs", total,
            "sentNotifications", sentCount,
            "adminNotifications", adminCount
        ));
    }
}
