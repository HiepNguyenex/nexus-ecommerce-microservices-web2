# TÓM TẮT ĐẦY ĐỦ: BÀI TẬP THỰC HÀNH 4 - MICROSERVICES E-COMMERCE
> Dự án: `D:\Bai Tap\java-project\e-commerce-microservices-master`

---

## 1. YÊU CẦU TỔNG THỂ

Nâng cấp hệ thống microservices E-Commerce (Rainbow Forest) lên **Java 21 & Spring Boot 3.x** với các mục tiêu chính:
- Thay thế Zuul bằng **Spring Cloud Gateway**
- Tích hợp **Spring Security 6.x + JWT** xác thực/phân quyền tập trung tại Gateway
- Tích hợp **Apache Kafka** giao tiếp bất đồng bộ giữa các services
- Xây dựng **giao diện Web Client & Admin Dashboard** Glassmorphism/Dark Mode
- **Cơ sở dữ liệu**: MySQL của XAMPP (4 services cũ) + H2 in-memory (3 services mới Kafka)

---

## 2. KIẾN TRÚC HỆ THỐNG (ĐÃ HOÀN THÀNH)

```
TRÌNH DUYỆT (web-client/*.html)
       ↓ HTTP :8900
┌─────────────────────────────────────────────────────────────┐
│           API GATEWAY (port 8900)                           │
│  • Spring Cloud Gateway (reactive Netty)                    │
│  • JwtAuthenticationFilter (validate JWT, attach headers)   │
│  • SessionFilter (cookie sessionId → downstream)            │
│  • CorsWebFilter (cho phép browser gọi API)                 │
│  • StripPrefix=2 routing                                    │
└──────────┬──────────┬──────────┬──────────┬────────────────┘
           │          │          │          │
    /api/accounts  /api/catalog  /api/shop  /api/review
           ↓          ↓          ↓          ↓
      USER-SVC   CATALOG-SVC  ORDER-SVC  RECOMMEND-SVC
      :8811      :8810        :8813      :8812
      MySQL(users) MySQL(pc)  MySQL(ord) MySQL(rec)
           ↓                      │
      JWT /login             Kafka Producer
                                  ↓
                         Apache Kafka Broker (:9092)
                         ┌──────────┬──────────┬──────────┐
                         ↓          ↓          ↓
                   PAYMENT-SVC  INVEN-SVC  NOTIF-SVC
                   :8815 (H2)  :8816 (H2)  :8817 (H2)

Tất cả services đăng ký với EUREKA SERVER (:8761)
```

---

## 3. CÁC SERVICES VÀ CỔNG PORT

| Service | Port | DB | Trạng thái | Ghi chú |
|---|---|---|---|---|
| `eureka-server` | 8761 | - | ✅ UP | Service Registry |
| `api-gateway` | 8900 | - | ✅ UP | Spring Cloud Gateway + JWT Filter + CORS |
| `user-service` | 8811 | MySQL `users` | ✅ UP | JWT /login endpoint |
| `product-catalog-service` | 8810 | MySQL `product_catalog` | ✅ UP | - |
| `product-recommendation-service` | 8812 | MySQL `product_recommendations` | ✅ UP | Kafka Consumer mới lắng nghe `order-created` để tự động gợi ý |
| `order-service` | 8813 | MySQL `orders` | ✅ UP | Kafka Producer |
| `payment-service` | 8815 | H2 in-memory | ✅ UP | Kafka Consumer mới |
| `inventory-service` | 8816 | H2 in-memory | ✅ UP | Kafka Consumer mới |
| `notification-service` | 8817 | H2 in-memory | ✅ UP | Kafka Consumer mới |

---

## 4. TÀI KHOẢN DEMO (MySQL XAMPP)

| Username | Password | Role | Quyền hạn |
|---|---|---|---|
| `johndoe` | `password123` | `ROLE_USER` | Mua hàng, giỏ hàng, đặt hàng, viết review |
| `janesmith` | `password456` | `ROLE_ADMIN` | Tất cả + quản lý sản phẩm, đơn hàng |

> **Lưu ý**: Password được lưu dưới dạng plain text (`NoOpPasswordEncoder`) - chỉ dùng cho demo/học tập.

---

## 5. API GATEWAY - CẤU HÌNH ROUTING

File: `api-gateway/src/main/resources/application.properties`

```properties
spring.cloud.gateway.routes[0].id=user-service
spring.cloud.gateway.routes[0].uri=lb://user-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/accounts/**
spring.cloud.gateway.routes[0].filters[0]=StripPrefix=2

spring.cloud.gateway.routes[1].id=product-catalog-service
spring.cloud.gateway.routes[1].uri=lb://product-catalog-service
spring.cloud.gateway.routes[1].predicates[0]=Path=/api/catalog/**
spring.cloud.gateway.routes[1].filters[0]=StripPrefix=2

spring.cloud.gateway.routes[2].id=order-service
spring.cloud.gateway.routes[2].uri=lb://order-service
spring.cloud.gateway.routes[2].predicates[0]=Path=/api/shop/**
spring.cloud.gateway.routes[2].filters[0]=StripPrefix=2

spring.cloud.gateway.routes[3].id=product-recommendation-service
spring.cloud.gateway.routes[3].uri=lb://product-recommendation-service
spring.cloud.gateway.routes[3].predicates[0]=Path=/api/review/**
spring.cloud.gateway.routes[3].filters[0]=StripPrefix=2
```

**Ý nghĩa StripPrefix=2**: Request `/api/catalog/products` → Sau khi strip 2 tiền tố → `/products` gửi tới service.

---

## 6. CÁC ENDPOINT API QUAN TRỌNG

### User Service (qua Gateway /api/accounts/*)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/api/accounts/login` | Đăng nhập, lấy JWT token | Public |
| POST | `/api/accounts/register` | Đăng ký tài khoản mới | Public |
| GET | `/api/accounts/users` | Danh sách users | JWT |
| GET | `/api/accounts/users?name=xxx` | Tìm user theo tên | JWT |
| GET | `/api/accounts/users/{id}` | Lấy user theo ID | JWT |

### Product Catalog Service (qua Gateway /api/catalog/*)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/catalog/products` | Danh sách tất cả sản phẩm | Public |
| GET | `/api/catalog/products/{id}` | Chi tiết sản phẩm | Public |
| POST | `/api/catalog/admin/products` | Thêm/Cập nhật sản phẩm | **ROLE_ADMIN** |
| DELETE | `/api/catalog/admin/products/{id}` | Xóa sản phẩm | **ROLE_ADMIN** |

### Order Service (qua Gateway /api/shop/*)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/shop/cart` | Xem giỏ hàng | JWT |
| POST | `/api/shop/cart?productId=X&quantity=Y` | Thêm/Cập nhật sản phẩm trong giỏ | JWT |
| DELETE | `/api/shop/cart?productId=X` | Xóa sản phẩm khỏi giỏ | JWT |
| POST | `/api/shop/order/{userId}` | Đặt hàng (kích hoạt Kafka) | JWT |
| GET | `/api/shop/orders` | Danh sách tất cả đơn hàng | **ROLE_ADMIN** |
| PUT | `/api/shop/orders/{id}/status?status=X` | Cập nhật trạng thái đơn hàng | **ROLE_ADMIN** |

### Recommendation Service (qua Gateway /api/review/*)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/review/recommendations/products/{productId}` | Đánh giá theo sản phẩm | Public |
| POST | `/api/review/recommendations?productId=X&userName=Y&rating=Z` | Gửi đánh giá | JWT |

---

## 7. LUỒNG KAFKA (ASYNC)

```
Khách đặt hàng (POST /api/shop/order/{userId})
  → order-service tạo Order trong MySQL
  → order-service PHÁT sự kiện "order-created" topic
       ↓ (bất đồng bộ)
       ├── payment-service: Nhận sự kiện → Giả lập thanh toán → Lưu DB H2
       │       → PHÁT sự kiện "payment-completed" topic
       │             ↓
       │           order-service: Nhận → Cập nhật status = "PAID"
       │
       ├── inventory-service: Nhận sự kiện → Trừ số lượng kho (giả lập, lưu H2)
       │
       ├── product-recommendation-service: Nhận sự kiện → Tự động tạo gợi ý 5 sao cho sản phẩm đã mua
       │
       └── notification-service: Nhận sự kiện → In log giả lập email
```

> **Lưu ý quan trọng**: Dự án đã được nâng cấp kết nối trực tiếp tới **Kafka Cloud (Aiven)** qua SSL/SASL. Do đó, người dùng **không cần** chạy Zookeeper & Kafka cục bộ qua Docker Desktop nữa. Chỉ cần kết nối Internet, luồng bất đồng bộ của cả 5 services (`order-service`, `payment-service`, `inventory-service`, `product-recommendation-service`, `notification-service`) sẽ tự động hoạt động đồng bộ.

---

## 8. GIAO DIỆN WEB CLIENT

Đường dẫn: `D:\Bai Tap\java-project\e-commerce-microservices-master\web-client\`

| File | Mô tả |
|---|---|
| `index.html` | Trang chủ: danh sách sản phẩm, lọc theo danh mục, tìm kiếm, thêm vào giỏ hàng |
| `product.html` | Chi tiết sản phẩm: mô tả, giá, đánh giá 5 sao, thêm vào giỏ |
| `login.html` | Đăng nhập / Đăng ký với tab UI |
| `cart.html` | Giỏ hàng: xem, thay đổi số lượng, xóa sản phẩm, đặt hàng |
| `admin.html` | Admin Dashboard: stats, quản lý sản phẩm, quản lý đơn hàng + đổi trạng thái |
| `styles.css` | Design system: Glassmorphism, Dark/Light mode, animations |
| `app.js` | Hàm chung: `apiRequest()` (tự inject JWT), `showToast()`, `syncAuthUI()`, logout |

**Cách mở giao diện**: Mở trực tiếp file `index.html` bằng trình duyệt Chrome/Edge (không cần web server riêng).

---

## 9. CẤU TRÚC THƯ MỤC DỰ ÁN

```
e-commerce-microservices-master/
├── api-gateway/                    ← Spring Cloud Gateway + JWT + CORS
│   └── src/.../filter/
│       ├── JwtAuthenticationFilter.java
│       └── SessionFilter.java
├── eureka-server/                  ← Service Registry
├── user-service/                   ← MySQL, JWT /login
│   └── src/.../
│       ├── controller/AuthController.java   ← POST /login → JWT
│       └── security/
│           ├── JwtProvider.java
│           └── WebSecurityConfig.java
├── product-catalog-service/        ← MySQL
│   └── src/.../controller/
│       ├── ProductController.java          ← GET /products
│       └── AdminProductController.java     ← POST/DELETE /admin/products (ROLE_ADMIN)
├── product-recommendation-service/ ← MySQL
├── order-service/                  ← MySQL + Kafka Producer
│   └── src/.../
│       ├── controller/
│       │   ├── CartController.java         ← GET/POST/DELETE /cart
│       │   └── OrderController.java        ← POST /order/{userId}, GET /orders, PUT /orders/{id}/status
│       ├── messaging/OrderProducer.java
│       └── messaging/PaymentConsumer.java  ← Nhận payment-completed
├── payment-service/                ← [NEW] H2, Kafka Consumer order-created
├── inventory-service/              ← [NEW] H2, Kafka Consumer order-created
├── notification-service/           ← [NEW] H2, Kafka Consumer order-created
├── web-client/                     ← Frontend: HTML/CSS/JS Glassmorphism
│   ├── index.html, product.html, login.html, cart.html, admin.html
│   ├── styles.css, app.js
├── docker-compose.yml              ← Zookeeper + Kafka broker
├── seed.sql                        ← Dữ liệu mẫu cho MySQL XAMPP
├── run_all_background.ps1          ← Khởi chạy tất cả 9 services ngầm
└── logs/                           ← Log của từng service
```

---

## 10. CÁC VẤN ĐỀ KỸ THUẬT ĐÃ GIẢI QUYẾT

| Vấn đề | Giải pháp |
|---|---|
| Zuul không tương thích Spring Boot 3.x | Viết lại sang Spring Cloud Gateway reactive |
| `javax.*` không tồn tại ở Spring Boot 3.x | Thay tất cả bằng `jakarta.*` |
| `WebSecurityConfigurerAdapter` bị xóa | Dùng `SecurityFilterChain` Bean pattern |
| Redis không cần thiết cho Cart | Mock bằng `ConcurrentHashMap` trong memory |
| JUnit 4 test compile lỗi | Thêm `junit-vintage-engine` dependency |
| User/Product thiếu getter/setter cho `id` | Thêm thủ công getter `getId()`, `getProductId()` |
| CORS block browser gọi API | Thêm `CorsWebFilter` Bean vào `WebSecurityConfig` |
| Gateway cần tích hợp JWT | Viết `JwtAuthenticationFilter` implements `GlobalFilter` |
| Lỗi Hibernate Lazy Initialization (500) tại Catalog Service | Chuyển `getOne(id)` thành `findById(id).orElse(null)` để tránh proxy initialization error khi Feign Client truy xuất giá sản phẩm |
| Detached Entity Persistence Exception tại Recommendation Service | Loại bỏ `@GeneratedValue` trên các thực thể replica (`Product`, `User`), thêm `@Transactional` cho service, và loại bỏ `CascadeType.ALL` trên `@ManyToOne` để tránh lỗi lưu trùng khoá chính và ngăn chặn việc xoá nhầm sản phẩm/người dùng khi xoá đánh giá |

---

## 11. LỖI THƯỜNG GẶP & CÁCH XỬ LÝ

### Gateway báo 401 Unauthorized
- Kiểm tra token JWT còn hạn chưa (24h).
- Đăng nhập lại tại trang `login.html`.

### Services không kết nối được Kafka (WARN trong log)
- **Nguyên nhân**: Docker chưa chạy hoặc chưa `docker compose up -d`.
- **Xử lý**: Services vẫn hoạt động bình thường, chỉ thiếu luồng Kafka bất đồng bộ. Đặt hàng vẫn thành công nhưng Payment/Inventory/Notification không xử lý.

### `mvn clean package` lỗi "Failed to delete .jar"
- **Nguyên nhân**: File JAR đang bị Java process lock (đang chạy).
- **Xử lý**: Dừng services trước bằng `Stop-Process -Name java -Force`.

### Cannot find file D:\Bai (lỗi unicode trong path)
- Lỗi hiển thị của Maven Wrapper khi đường dẫn có dấu cách. **Không ảnh hưởng** đến quá trình build.

---

## 12. LỆNH VẬN HÀNH THƯỜNG DÙNG (PowerShell)

```powershell
# Dừng tất cả Java services
Stop-Process -Name java -Force -ErrorAction SilentlyContinue

# Khởi động lại tất cả services
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
cd "D:\Bai Tap\java-project\e-commerce-microservices-master"
.\run_all_background.ps1

# Biên dịch một service cụ thể (ví dụ order-service)
cd "D:\Bai Tap\java-project\e-commerce-microservices-master\order-service"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd clean package -DskipTests

# Khởi động Kafka (cần Docker Desktop)
cd "D:\Bai Tap\java-project\e-commerce-microservices-master"
docker compose up -d

# Xem log realtime của một service
Get-Content "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\order.log" -Wait -Tail 50
```

---

## 13. SEED DATA - DỮ LIỆU MẪU

File: `seed.sql` - Đã import vào MySQL XAMPP:

**Products (product_catalog DB)**:
- ID 1: Le Labo Santal 33 - $310.00 - Unisex
- ID 2: Chanel No. 5 - $165.00 - Women
- ID 3: Dior Sauvage - $145.00 - Men
- ID 4: Byredo Gypsy Water - $200.00 - Unisex
- ID 5: Bleu de Chanel - $150.00 - Men
- ID 6: Baccarat Rouge 540 - $325.00 - Unisex
- ... và các sản phẩm nước hoa cao cấp khác (Tổng cộng 18 sản phẩm).

**Users (users DB)**:
- `johndoe` / `password123` → ROLE_USER
- `janesmith` / `password456` → ROLE_ADMIN

---

## 14. VIỆC CÒN LẠI / CÓ THỂ LÀM TIẾP

- [x] Triển khai và kết nối Kafka Cloud (Aiven) thành công cho cả 5 services để chạy luồng bất đồng bộ
- [ ] Mã hoá password bằng BCrypt (hiện đang dùng NoOpPasswordEncoder)
- [ ] Thêm tính năng tải ảnh sản phẩm thực tế (hiện dùng Unsplash URL backup)
- [ ] Đẩy source code lên GitHub theo yêu cầu bài tập
- [ ] Thêm validation và error handling chi tiết hơn cho các form
- [x] Thực thi và kiểm thử thành công chức năng quản trị tài khoản (khóa/mở khóa) tại Admin Dashboard

---

## 15. THÔNG TIN KỸ THUẬT STACK

| Thành phần | Phiên bản |
|---|---|
| Java | 21 |
| Spring Boot | 3.2.4 |
| Spring Cloud | 2023.0.0 |
| Spring Security | 6.x |
| JWT (jjwt) | 0.11.5 |
| Spring Kafka | 3.x (bundled) |
| Hibernate | 6.4.4.Final |
| MySQL Connector | 8.0.33 |
| H2 Database | 2.x (in-memory) |
| Netflix Eureka | Bundled with Spring Cloud 2023 |
| Spring Cloud Gateway | Reactive Netty |

---

*Tóm tắt tạo lúc: 2026-06-08 14:08 (ICT) - Đường dẫn dự án: `D:\Bai Tap\java-project\e-commerce-microservices-master`*
