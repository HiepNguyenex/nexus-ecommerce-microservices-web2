package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import com.rainbowforest.orderservice.messaging.OrderProducer;
import com.rainbowforest.orderservice.event.OrderCreatedEvent;
import com.rainbowforest.orderservice.event.OrderItemInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

import com.rainbowforest.orderservice.repository.CouponRepository;
import com.rainbowforest.orderservice.repository.UserRepository;
import com.rainbowforest.orderservice.domain.Coupon;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private OrderProducer orderProducer;

    @Autowired
    private UserRepository userRepository;
    
    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<Order> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestParam(value = "promoCode", required = false) String promoCode,
    		@RequestParam(value = "shippingName", required = false) String shippingName,
    		@RequestParam(value = "shippingPhone", required = false) String shippingPhone,
    		@RequestParam(value = "shippingEmail", required = false) String shippingEmail,
    		@RequestParam(value = "shippingAddress", required = false) String shippingAddress,
    		@RequestParam(value = "paymentMethod", required = false) String paymentMethod,
    		@RequestHeader(value = "Cookie") String cartId,
    		HttpServletRequest request){
    	
        List<Item> cart = cartService.getAllItemsFromCart(cartId);
        User user = userClient.getUserById(userId);   
        if(cart != null && user != null) {
            // Đảm bảo user được đồng bộ/lưu ở database cục bộ của order-service
            user = userRepository.save(user);
        	Order order = this.createOrder(cart, user, promoCode, shippingName, shippingPhone, shippingEmail, shippingAddress, paymentMethod);
        	try{
                orderService.saveOrder(order);
                cartService.deleteCart(cartId);

                // Phát sự kiện order-created tới Kafka
                try {
                    List<OrderItemInfo> itemInfos = order.getItems().stream().map(item -> {
                        Long prodId = item.getProduct().getId() != null ? item.getProduct().getId() : item.getProduct().getProductId();
                        return new OrderItemInfo(prodId, item.getProduct().getProductName(), item.getQuantity());
                    }).collect(Collectors.toList());

                    OrderCreatedEvent event = new OrderCreatedEvent(
                            order.getId(),
                            user.getId() != null ? user.getId() : userId,
                            order.getTotal(),
                            order.getStatus(),
                            order.getPaymentMethod(),
                            itemInfos
                    );
                    orderProducer.sendOrderCreatedEvent(event);
                } catch (Exception e) {
                    log.error("Failed to publish OrderCreatedEvent for order {}", order.getId(), e);
                }

                return new ResponseEntity<Order>(
                		order, 
                		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                		HttpStatus.CREATED);
            }catch (Exception ex){
                log.error("Failed to save order", ex);
                throw new RuntimeException("Failed to save order", ex);
            }
        }
  
        return new ResponseEntity<Order>(
        		headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/admin/revenue")
    public ResponseEntity<com.rainbowforest.orderservice.dto.RevenueReport> getRevenueReport(
            @RequestParam(value = "from", required = false) String fromStr,
            @RequestParam(value = "to", required = false) String toStr,
            @RequestHeader("X-User-Roles") String roles) {
        // Chỉ ADMIN mới có thể xem doanh thu (Gateway đã chặn, kiểm tra thêm)
        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        java.time.LocalDate to = (toStr != null && !toStr.isEmpty()) ? java.time.LocalDate.parse(toStr) : java.time.LocalDate.now();
        java.time.LocalDate from = (fromStr != null && !fromStr.isEmpty()) ? java.time.LocalDate.parse(fromStr) : to.minusMonths(1);
        com.rainbowforest.orderservice.dto.RevenueReport report = orderService.getRevenueReport(from, to);
        return new ResponseEntity<>(report, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    /**
     * Lấy danh sách đơn hàng:
     * - ADMIN: tất cả đơn hàng
     * - USER: chỉ đơn hàng của chính họ
     */
    @GetMapping(value = "/orders")
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestHeader("X-User-Name") String userName,
            @RequestHeader("X-User-Roles") String roles) {
        List<Order> orders;
        if (roles.contains("ROLE_ADMIN")) {
            // ADMIN xem tất cả
            orders = orderService.getAllOrders();
        } else {
            // USER chỉ xem đơn của mình
            orders = orderService.getOrdersByUserName(userName);
        }

        return new ResponseEntity<List<Order>>(
                orders != null ? orders : new ArrayList<>(),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/orders/my")
    public ResponseEntity<List<Order>> getMyOrders(@RequestHeader("X-User-Name") String userName) {
        List<Order> orders = orderService.getOrdersByUserName(userName);
        return new ResponseEntity<List<Order>>(
                orders != null ? orders : new ArrayList<>(),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/orders/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(
            @PathVariable("userId") Long userId,
            @RequestHeader("X-User-Roles") String roles,
            @RequestHeader("X-User-Id") String currentUserId) {
        if (!roles.contains("ROLE_ADMIN") && !currentUserId.equals(userId.toString())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return new ResponseEntity<List<Order>>(
                orders != null ? orders : new ArrayList<>(),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    /**
     * Lấy chi tiết đơn hàng:
     * - ADMIN: xem bất kỳ
     * - USER: chỉ xem đơn của mình
     */
    @GetMapping(value = "/orders/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Name") String userName,
            @RequestHeader("X-User-Roles") String roles) {
        Order order = orderService.getOrderById(id);
        if (order != null) {
            // Kiểm tra quyền sở hữu: ADMIN được xem tất cả, USER chỉ xem đơn của mình
            boolean isAdmin = roles.contains("ROLE_ADMIN");
            boolean isOwner = order.getUser() != null && userName.equals(order.getUser().getUserName());
            if (isAdmin || isOwner) {
                return new ResponseEntity<Order>(
                        order,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            } else {
                // User không phải chủ đơn hàng
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return new ResponseEntity<Order>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        
        Order order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        boolean isAdmin = roles != null && roles.contains("ROLE_ADMIN");
        boolean isOwner = order.getUser() != null && userName != null && userName.equals(order.getUser().getUserName());

        // Nếu không phải admin và cũng không phải chủ nhân đơn hàng
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Khách hàng tự hủy đơn: chỉ được hủy khi trạng thái là PAYMENT_EXPECTED và đổi thành CANCELLED
        if (!isAdmin && isOwner) {
            if (!"CANCELLED".equalsIgnoreCase(status)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (!"PAYMENT_EXPECTED".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        }

        String previousStatus = order.getStatus();
        order.setStatus(status);
        try {
            orderService.saveOrder(order);

                // Saga pattern: khi chuyển sang SHIPPED, phát OrderShippedEvent
                // để inventory trừ kho + notification gửi mail xác nhận giao hàng
                if ("SHIPPED".equalsIgnoreCase(status) && !"SHIPPED".equalsIgnoreCase(previousStatus)) {
                    try {
                        List<com.rainbowforest.orderservice.event.OrderItemInfo> itemInfos = new ArrayList<>();
                        if (order.getItems() != null) {
                            for (com.rainbowforest.orderservice.domain.Item item : order.getItems()) {
                                Long prodId = item.getProduct() != null && item.getProduct().getId() != null
                                    ? item.getProduct().getId() : item.getProduct().getProductId();
                                itemInfos.add(new com.rainbowforest.orderservice.event.OrderItemInfo(
                                    prodId,
                                    item.getProduct().getProductName(),
                                    item.getQuantity()));
                            }
                        }
                        com.rainbowforest.orderservice.event.OrderShippedEvent event =
                            new com.rainbowforest.orderservice.event.OrderShippedEvent(
                                order.getId(),
                                order.getUser() != null ? order.getUser().getId() : null,
                                order.getStatus(),
                                itemInfos
                            );
                        orderProducer.sendOrderShippedEvent(event);
                    } catch (Exception e) {
                        log.error("Failed to publish OrderShippedEvent for order {}", order.getId(), e);
                    }
                }

                return new ResponseEntity<Order>(
                        order,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            } catch (Exception e) {
                log.error("Failed to update order status", e);
                throw new RuntimeException("Failed to update order status", e);
            }
    }
    
    private Order createOrder(List<Item> cart, User user, String promoCode,
                              String shippingName, String shippingPhone,
                              String shippingEmail, String shippingAddress,
                              String paymentMethod) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        java.math.BigDecimal total = OrderUtilities.countTotalPrice(cart);
        if (promoCode != null && !promoCode.trim().isEmpty()) {
            Optional<Coupon> opt = couponRepository.findByCode(promoCode.trim().toUpperCase());
            if (opt.isPresent()) {
                Coupon coupon = opt.get();
                if (coupon.getActive() 
                    && !coupon.getExpirationDate().isBefore(LocalDate.now()) 
                    && coupon.getUsedCount() < coupon.getMaxUses()) {
                    
                    double factor = (100.0 - coupon.getDiscountPercent()) / 100.0;
                    total = total.multiply(new java.math.BigDecimal(String.valueOf(factor)));
                    
                    // Increment used count
                    coupon.setUsedCount(coupon.getUsedCount() + 1);
                    couponRepository.save(coupon);
                }
            }
        }
        order.setTotal(total);
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PAYMENT_EXPECTED");
        order.setPaymentMethod(paymentMethod != null && !paymentMethod.trim().isEmpty() ? paymentMethod : "COD");

        // Snapshot thông tin giao hàng tại thời điểm đặt hàng (Câu 1.2 Lab 2)
        // Khi user đổi SĐT/email/địa chỉ sau này, đơn hàng cũ vẫn giữ thông tin lúc đặt
        if (shippingName != null && !shippingName.trim().isEmpty()) {
            order.setShippingFullName(shippingName);
        } else if (user != null) {
            if (user.getUserDetails() != null) {
                order.setShippingFullName(
                    ((user.getUserDetails().getFirstName() != null ? user.getUserDetails().getFirstName() : "")
                    + " " +
                    (user.getUserDetails().getLastName() != null ? user.getUserDetails().getLastName() : "")).trim()
                );
            } else {
                order.setShippingFullName(user.getUserName());
            }
        }

        if (shippingPhone != null && !shippingPhone.trim().isEmpty()) {
            order.setShippingPhone(shippingPhone);
        } else if (user != null && user.getUserDetails() != null) {
            order.setShippingPhone(user.getUserDetails().getPhoneNumber());
        }

        if (shippingEmail != null && !shippingEmail.trim().isEmpty()) {
            order.setShippingEmail(shippingEmail);
        } else if (user != null && user.getUserDetails() != null) {
            order.setShippingEmail(user.getUserDetails().getEmail());
        }

        if (shippingAddress != null && !shippingAddress.trim().isEmpty()) {
            order.setShippingAddress(shippingAddress);
        } else if (user != null && user.getUserDetails() != null) {
            order.setShippingAddress(
                ((user.getUserDetails().getStreetNumber() != null ? user.getUserDetails().getStreetNumber() : "") + " "
                + (user.getUserDetails().getStreet() != null ? user.getUserDetails().getStreet() : "") + ", "
                + (user.getUserDetails().getLocality() != null ? user.getUserDetails().getLocality() : "") + ", "
                + (user.getUserDetails().getCountry() != null ? user.getUserDetails().getCountry() : "")).trim()
            );
        }

        return order;
    }
}
