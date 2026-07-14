package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Coupon;
import com.rainbowforest.orderservice.repository.CouponRepository;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class AdminCouponController {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private HeaderGenerator headerGenerator;

    // 1. Validate Coupon
    @GetMapping("/coupons/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam("code") String code) {
        Optional<Coupon> opt = couponRepository.findByCode(code.trim().toUpperCase());
        if (opt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Mã giảm giá không tồn tại");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        Coupon coupon = opt.get();
        if (!coupon.getActive()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Mã giảm giá đã bị khóa");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        if (coupon.getExpirationDate().isBefore(LocalDate.now())) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Mã giảm giá đã hết hạn");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Mã giảm giá đã hết lượt sử dụng");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("code", coupon.getCode());
        response.put("discountPercent", coupon.getDiscountPercent());
        return new ResponseEntity<>(response, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    // 2. Admin: Get all coupons
    @GetMapping("/admin/coupons")
    public ResponseEntity<?> getCoupons(@RequestHeader(value = "X-User-Roles", required = false) String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<Coupon> coupons = couponRepository.findAll();
        return new ResponseEntity<>(coupons, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    // 3. Admin: Add coupon
    @PostMapping("/admin/coupons")
    public ResponseEntity<?> addCoupon(
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestBody Coupon coupon) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        // Normalize code
        coupon.setCode(coupon.getCode().trim().toUpperCase());
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Mã giảm giá này đã tồn tại");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        Coupon saved = couponRepository.save(coupon);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // 4. Admin: Delete coupon
    @DeleteMapping("/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @PathVariable("id") Long id) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if (!couponRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        couponRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // 5. Admin: Toggle coupon status
    @PostMapping("/admin/coupons/{id}/toggle")
    public ResponseEntity<?> toggleCoupon(
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @PathVariable("id") Long id) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Optional<Coupon> opt = couponRepository.findById(id);
        if (opt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Coupon coupon = opt.get();
        coupon.setActive(!coupon.getActive());
        couponRepository.save(coupon);
        return new ResponseEntity<>(coupon, HttpStatus.OK);
    }
}
