# TÓM TẮT ĐẦY ĐỦ: HỆ THỐNG MICROSERVICES E-COMMERCE (AROMA FOREST)
> Dự án: `D:\Bai Tap\java-project\e-commerce-microservices-master`
> Mã số sinh viên: 2123110161 | Sinh viên: Nguyễn Vũ Hiệp

---

## 1. YÊU CẦU TỔNG THỂ & CÁC TÍNH NĂNG ĐÃ NÂNG CẤP
Hệ thống microservices E-Commerce (Aroma Forest — Artisan Perfume House) chạy trên **Java 21 & Spring Boot 3.2.4**, giao tiếp đồng bộ qua OpenFeign, bất đồng bộ qua **Kafka Cloud (Aiven)**, bảo mật bằng **JWT & BCrypt**, định tuyến qua **Spring Cloud Gateway**.

Các tính năng nâng cấp nâng cao của **Lab 1 & Lab 2**:
* **Bảo mật**: Mã hóa mật khẩu bằng `BCryptPasswordEncoder` (thay vì plain text).
* **Quản lý Sản phẩm nâng cao**: Hỗ trợ thuộc tính nước hoa (top notes, middle notes, base notes, sillage, longevity, concentration) và các biến thể dung tích (Product Variants: 2ml, 10ml, 50ml, 100ml) với giá và số lượng tồn kho riêng biệt.
* **Saga Pattern (Kafka)**: 
  * `order-created` -> `payment-service` xử lý thanh toán -> phát `payment-completed` -> `order-service` cập nhật trạng thái `PAID`.
  * Khi chuyển trạng thái sang `SHIPPED` -> phát `order-shipped` -> `inventory-service` trừ số lượng kho + `notification-service` lưu log và thông báo.
* **Database Shipping Snapshot**: Khi đặt hàng, hệ thống lưu lại ảnh chụp thông tin giao hàng tại thời điểm đặt (Tên, SĐT, Email, Địa chỉ) để đảm bảo nếu user thay đổi thông tin cá nhân sau này, đơn hàng cũ vẫn không bị ảnh hưởng.
* **Quản trị Khuyến mãi**: Cho phép tạo, xác thực và áp dụng mã giảm giá (Coupons/Promotions) trực tiếp vào đơn hàng.
* **Tích hợp Cache & Rate Limiting**: Tích hợp Spring Cache (Redis) cho catalog sản phẩm, Redis Rate Limiter (Token Bucket) ở Gateway.
* **SSE Notifications**: Hỗ trợ Server-Sent Events (SSE) để đẩy thông báo trạng thái đơn hàng thời gian thực từ Backend tới giao diện khách hàng.
* **Giao diện React (Luxury Glassmorphism)**: Tích hợp đầy đủ các trang Home (phân trang, lọc, tìm kiếm), Scent Finder (quiz gợi ý mùi hương theo thuật toán), Wishlist (yêu thích & chia sẻ), Cart (giỏ hàng đa dung tích, áp mã giảm giá), Profile (lịch sử đơn hàng, cập nhật thông tin cá nhân) và Admin Dashboard (thống kê doanh thu, quản lý sản phẩm/đơn hàng/tài khoản).

---

## 2. KIẾN TRÚC HỆ THỐNG
```
TRÌNH DUYỆT (web-client-react / port 5500)
       ↓ HTTP :8900 (Có Redis Rate Limiter)
┌─────────────────────────────────────────────────────────────┐
│           API GATEWAY (port 8900)                           │
│  • Spring Cloud Gateway (reactive Netty)                    │
│  • JwtAuthenticationFilter (validate JWT, attach headers)   │
│  • SessionFilter (cookie sessionId -> downstream)            │
│  • CorsWebFilter (cho phép browser gọi API)                 │
│  • StripPrefix routing                                      │
└──────────┬──────────┬──────────┬──────────┬────────────────┘
           │          │          │          │
     /api/accounts  /api/catalog  /api/shop  /api/review
           ↓          ↓          ↓          ↓
       USER-SVC   CATALOG-SVC  ORDER-SVC  RECOMMEND-SVC
       :8811      :8810        :8813      :8812
       MySQL(users) MySQL(catalog) MySQL(orders) MySQL(recommend)
       (BCrypt)   (Redis Cache) (Redis Cart)
           │                         │
      JWT /login                 Kafka Event
           ↓                         ↓
     ┌──────────────────────────────────────────────────┐
     │           AIVEN CLOUD KAFKA BROKER               │
     └──────────────────────────────────────────────────┘
           │          │          │          │
           ↓          ↓          ↓          ↓
      PAYMENT-SVC  INVEN-SVC  NOTIF-SVC   CATALOG-SVC
      :8815 (H2)   :8816 (H2) :8817(MySQL/SSE) :8810 (Sync kho)
```

---

## 3. CÁC SERVICES VÀ CỔNG PORT THỰC TẾ
| Service | Cổng Port | Database | Trạng thái | Tính năng chính |
|---|---|---|---|---|
| `eureka-server` | 8761 | - | ✅ Hoạt động | Đăng ký dịch vụ trung tâm (Service Discovery) |
| `api-gateway` | 8900 | Redis | ✅ Hoạt động | Định tuyến, validate JWT, CORS, Rate limiting |
| `user-service` | 8811 | MySQL `users` | ✅ Hoạt động | Quản lý user, mã hóa BCrypt, thông tin chi tiết |
| `product-catalog-service` | 8810 | MySQL `product_catalog` | ✅ Hoạt động | CRUD sản phẩm, nước hoa notes, các dung tích variant |
| `product-recommendation-service` | 8812 | MySQL `product_recommendations` | ✅ Hoạt động | Quản lý đánh giá và xếp hạng sản phẩm (reviews, ratings) |
| `order-service` | 8813 | MySQL `orders` | ✅ Hoạt động | Giỏ hàng, áp mã giảm giá, checkout, lưu snapshot địa chỉ |
| `payment-service` | 8815 | H2 database | ✅ Hoạt động | Xử lý thanh toán bất đồng bộ qua Kafka |
| `inventory-service` | 8816 | H2 database | ✅ Hoạt động | Trừ/cập nhật tồn kho thật bất đồng bộ qua Kafka |
| `notification-service` | 8817 | MySQL `notifications` | ✅ Hoạt động | Ghi log thông báo hệ thống, cung cấp SSE stream đẩy notify |

---

## 4. TÀI KHOẢN DEMO (Đã mã hóa BCrypt)
* **Khách hàng thường**: `user` / `123456` (Quyền: `ROLE_USER` — Mua hàng, xem sản phẩm, Scent Finder, Wishlist, đặt hàng, viết review).
* **Quản trị viên**: `admin` / `123456` (Quyền: `ROLE_ADMIN` — Tất cả các quyền trên + xem doanh thu thống kê, quản lý sản phẩm, đơn hàng, khóa/mở khóa tài khoản).
* **User mẫu**: `johndoe` / `password123` (`ROLE_USER`)
* **Admin mẫu**: `janesmith` / `password456` (`ROLE_ADMIN`)

---

## 5. API GATEWAY - CẤU HÌNH ROUTING
File: `api-gateway/src/main/resources/application.properties`
* `/api/accounts/**` -> `lb://user-service` (StripPrefix=2)
* `/api/catalog/**` -> `lb://product-catalog-service` (StripPrefix=2)
* `/api/shop/**` -> `lb://order-service` (StripPrefix=2)
* `/api/admin/**` -> `lb://order-service` (StripPrefix=1)
* `/api/notifications/**` -> `lb://notification-service` (StripPrefix=1)
* `/api/review/**` -> `lb://product-recommendation-service` (StripPrefix=2)
* `/api/payment/**` -> `lb://payment-service` (StripPrefix=2)

---

## 6. LUỒNG SAGA PATTERN (EVENT-DRIVEN FLOW)
1. **Đặt hàng**: Khách hàng checkout (`POST /api/shop/order/{userId}`).
   * `order-service` lưu đơn hàng ở trạng thái `PAYMENT_EXPECTED`.
   * Ghi nhận snapshot địa chỉ giao hàng và SĐT của user.
   * Phát sự kiện `order-created` lên Kafka topic.
2. **Thanh toán**: `payment-service` nhận được sự kiện `order-created`.
   * Giả lập cổng thanh toán thành công (COD hoặc Bank).
   * Lưu thông tin giao dịch vào H2 DB.
   * Phát sự kiện `payment-completed` lên Kafka topic.
3. **Cập nhật Trạng thái**: `order-service` nhận được `payment-completed`.
   * Cập nhật trạng thái đơn hàng thành `PAID`.
4. **Vận chuyển & Trừ kho**: Admin cập nhật đơn hàng thành `SHIPPED` (`PUT /api/shop/orders/{id}/status?status=SHIPPED`).
   * `order-service` phát sự kiện `order-shipped` lên Kafka topic.
   * **Trừ kho thật**: `inventory-service` nhận sự kiện -> thực hiện trừ số lượng kho.
   * **Trừ kho hiển thị**: `product-catalog-service` nhận sự kiện -> trừ số lượng tồn kho sản phẩm hiển thị trên web, đồng thời xóa cache Redis.
   * **Thông báo**: `notification-service` nhận sự kiện -> ghi nhận log notify dạng tài liệu cho ADMIN và sẵn sàng đẩy notify SSE cho khách hàng.

---

## 7. GIAO DIỆN REACT WEB CLIENT (web-client-react)
Đường dẫn: `D:\Bai Tap\java-project\e-commerce-microservices-master\web-client-react\`

| File/Trang | Mô tả chi tiết chức năng |
|---|---|
| `HomePage.jsx` | Trang chủ sang trọng: hiển thị danh sách nước hoa, bộ lọc theo nhóm giới tính (Nam, Nữ, Unisex), tìm kiếm thông minh, phân trang, thêm vào wishlist, thêm nhanh mẫu thử vào giỏ hàng. |
| `ProductPage.jsx` | Chi tiết nước hoa: hiển thị các nốt hương (top/middle/base notes), độ lưu hương, tỏa hương, chọn dung tích (2ml, 10ml, 50ml, 100ml) với giá cập nhật động, và xem/gửi đánh giá sao. |
| `ScentFinderPage.jsx` | Quiz tìm mùi hương thông minh: Gồm 4 câu hỏi trắc nghiệm tâm lý và sở thích để gợi ý 3 chai nước hoa phù hợp nhất với tỉ lệ tương thích (%). |
| `WishlistPage.jsx` | Danh sách yêu thích: cho phép xem các sản phẩm đã thích, thêm nhanh vào giỏ hàng, và tạo link chia sẻ bộ sưu tập của mình. |
| `CartPage.jsx` | Giỏ hàng chi tiết: xem danh sách các mẫu thử/chai đầy chọn mua, đổi số lượng, áp mã giảm giá (coupon), điền thông tin ship và chọn phương thức thanh toán để checkout. |
| `ProfilePage.jsx` | Trang cá nhân: Cập nhật thông tin chi tiết (Email, SĐT, Địa chỉ) và xem danh sách đơn hàng đã đặt kèm trạng thái thực tế. |
| `AdminPage.jsx` | Dashboard Admin: Thống kê tổng doanh thu lọc theo thời gian, quản lý danh sách sản phẩm và các biến thể kích thước, cập nhật trạng thái đơn hàng theo luồng Saga, quản lý danh sách người dùng (khóa/mở khóa tài khoản). |

---

## 8. LỆNH VẬN HÀNH THÔNG DỤNG (PowerShell)
```powershell
# 1. Dừng nhanh tất cả các dịch vụ đang chạy
.\stop_all.ps1

# 2. Khởi tạo dữ liệu MySQL ban đầu (XAMPP 3306)
Get-Content seed.sql | C:\xampp\mysql\bin\mysql.exe -u root

# 3. Biên dịch lại toàn bộ các microservices
.\build_all.ps1

# 4. Khởi chạy toàn bộ hệ thống ngầm và React Client bằng một lệnh duy nhất
.\start_fast.ps1

# 5. Chạy kiểm thử tự động luồng E2E
.\verify_flow.ps1
```

---
*Cập nhật trạng thái hoàn thành đồ án ngày: 2026-07-15 — Sinh viên thực hiện: Nguyễn Vũ Hiệp*
