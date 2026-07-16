# 🌈 Hệ Thống Microservices Thương Mại Điện Tử — Aroma Forest (Rainbow Forest)

> **Đồ án Lab 1 + Lab 2 + Lab 3 + Lab 4** · Spring Cloud Microservices · Java 21 · Spring Boot 3.2.4 · React (Vite & Tailwind CSS v4)

Hệ thống e-commerce gồm **9 microservices** giao tiếp đồng bộ (REST + OpenFeign) và bất đồng bộ (Kafka Cloud/Local), bảo mật bằng **JWT + BCrypt**, lưu trữ phân tán (MySQL + H2 + Redis embedded + SSE stream), quản lý bởi **Eureka Service Discovery** và định tuyến qua **Spring Cloud Gateway**.

Giao diện người dùng được nâng cấp lên **React Web Client (Luxury Glassmorphic Design)** với đầy đủ tính năng hiện đại như Quiz tìm kiếm mùi hương (Scent Finder), Giỏ hàng đa dung tích, Khuyến mãi (Coupons), Trang Admin tích hợp Dashboard thống kê và Quản lý Saga đơn hàng.

---

## ⚡ Hướng Dẫn Chạy Dự Án Nhanh

> ⏱ **Lần đầu chạy**: ~10-15 phút (bao gồm tải thư viện và build)  
> ⏱ **Lần sau**: ~1 phút (khởi động trực tiếp các service)

### 🎯 Cách 1: Chạy nhanh bằng một lệnh duy nhất (Đã build sẵn)

Dùng khi bạn đã build các service rồi, chỉ cần chạy một lệnh duy nhất để khởi động toàn bộ CSDL, Backend Microservices và React Web Client:

```powershell
# Mở PowerShell (Run as Administrator hoặc User của bạn) tại thư mục gốc:
.\start_fast.ps1
```

> **Lưu ý:** Script `start_fast.ps1` tự động:
> 1. Kiểm tra và kích hoạt MySQL (XAMPP) trên cổng `3306` nếu chưa chạy.
> 2. Đọc và nạp các biến cấu hình từ tệp `.env`.
> 3. Tìm và chạy đúng các file JAR khả thi (kể cả `-exec.jar` của API Gateway).
> 4. Khởi động 9 microservices ngầm với log ghi vào thư mục `logs/`.
> 5. Khởi chạy máy chủ phát triển Vite của React Web Client.

* ✅ **Mở trình duyệt:** [http://localhost:5500](http://localhost:5500)
* ✅ **Đăng nhập mặc định:**
  * **Khách hàng:** `user` / `123456`
  * **Quản trị viên:** `admin` / `123456`
* ✅ **Dừng toàn bộ hệ thống:** `.\stop_all.ps1`

---

### 📋 Cách 2: Các bước triển khai và vận hành từ đầu (Đầy đủ)

#### Bước 1: Kiểm tra môi trường hệ thống
Mở **PowerShell** và kiểm tra các công cụ yêu cầu:
```powershell
java -version
# Kết quả: Java 21.0.x trở lên

.\mvnw.cmd --version
# Kết quả: Apache Maven 3.9.x
```

#### Bước 2: Khởi động MySQL và Nạp Dữ Liệu
1. Mở **XAMPP Control Panel** và **Start** dịch vụ **MySQL** (Port mặc định `3306`).
2. Nạp dữ liệu mẫu bằng cách chạy script sau trong PowerShell:
   ```powershell
   Get-Content seed.sql | C:\xampp\mysql\bin\mysql.exe -u root
   ```

#### Bước 3: Thiết lập cấu hình biến môi trường
Tạo tệp `.env` tại thư mục gốc bằng cách sao chép từ tệp mẫu:
```powershell
Copy-Item .env.example .env
```
Mở tệp `.env` ra và điền các thông tin của bạn. Cấu hình mặc định sử dụng **Aiven Cloud Kafka** đã được thiết lập sẵn, cùng với MySQL trống mật khẩu của XAMPP:
```ini
JWT_SECRET=mySecretKeyForEcommerceMicroservicesApplicationLongEnough
KAFKA_BOOTSTRAP_SERVERS=your-kafka-cloud-address.aivencloud.com:port
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=
```

#### Bước 4: Biên dịch dự án
```powershell
.\build_all.ps1
```
*Mất khoảng ~5-7 phút cho lần đầu tiên để tải các dependencies và tạo tệp JAR.*

#### Bước 5: Khởi động hệ thống
```powershell
.\start_with_env.ps1
```
Các dịch vụ sẽ lần lượt khởi động theo thứ tự:
1. **Eureka Server** (Port `8761`)
2. **API Gateway** (Port `8900`)
3. Các dịch vụ nghiệp vụ: **User**, **Product Catalog**, **Recommendation**, **Order**, **Payment**, **Inventory**, **Notification**.

*Đợi khoảng 30-40 giây để các dịch vụ đăng ký thành công lên Eureka: [http://localhost:8761](http://localhost:8761).*

#### Bước 6: Khởi chạy React Web Client
```powershell
cd web-client-react
npm install
npm run dev
```
Trang web sẽ tự động chạy trên cổng [http://localhost:5500](http://localhost:5500) với tính năng proxy tích hợp sẵn đến API Gateway.

---

## 🗺️ Kiến Trúc Hệ Thống (System Architecture)

```
                       ┌────────────────────────────────────────┐
                       │     React Web Client (Vite) :5500      │
                       └───────────────────┬────────────────────┘
                                           │ HTTP/JSON + JWT
                       ┌───────────────────▼────────────────────┐
                       │     API Gateway (Spring Cloud) :8900   │
                       │     - CORS  - Rate Limiter  - JWT      │
                       └───────────────────┬────────────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │        Eureka Server :8761          │
                        └──────────────────┬──────────────────┘
                                           │ Discovery
      ┌──────────┬──────────┬──────────────┼──────────┬──────────┬──────────┐
      ▼          ▼          ▼              ▼          ▼          ▼          ▼
  user-svc   catalog-svc recommend-svc  order-svc  payment-svc inven-svc  notif-svc
  :8811      :8810       :8812          :8813      :8815       :8816      :8817
  (MySQL)    (MySQL)     (MySQL)        (MySQL)    (H2 DB)     (H2 DB)    (MySQL)
             [Redis]                    [Redis]                           [SSE Stream]
      │          │                         │          │          │          │
      └──────────┼─────────────────────────┴──────────┴──────────┴──────────┘
                 │                      Kafka Event Bus (Topics)
                 └───────────────────────────────▲
                                                 │ (Saga Pattern Events)
```

### Luồng sự kiện Saga Pattern (Kafka Event-Driven)

1. **Khởi tạo Đơn hàng:** Khách hàng bấm thanh toán ở [CartPage](file:///d:/Bai%20Tap/java-project/e-commerce-microservices-master/web-client-react/src/pages/CartPage.jsx).
   * `order-service` tạo đơn hàng trạng thái `PAYMENT_EXPECTED`.
   * Chụp lại thông tin giao hàng tại thời điểm đặt (Address, Phone, Email, Name) và lưu vào `Order` (Database Shipping Snapshot).
   * Phát sự kiện `order-created` lên Kafka.
2. **Thanh toán:** `payment-service` lắng nghe `order-created`, thực hiện xử lý thanh toán qua Stripe giả lập, lưu log và phát sự kiện `payment-completed`.
3. **Cập nhật Trạng thái:** `order-service` lắng nghe `payment-completed`, chuyển đơn hàng sang trạng thái `PAID`.
4. **Vận chuyển & Trừ kho:** Quản trị viên cập nhật đơn hàng thành `SHIPPED` ở [AdminPage](file:///d:/Bai%20Tap/java-project/e-commerce-microservices-master/web-client-react/src/pages/AdminPage.jsx).
   * `order-service` phát sự kiện `order-shipped`.
   * **Trừ kho thực tế:** `inventory-service` lắng nghe `order-shipped` -> Trừ số lượng tồn kho thực tế.
   * **Đồng bộ hiển thị:** `product-catalog-service` lắng nghe `order-shipped` -> Trừ số lượng sản phẩm hiển thị, đồng thời xóa cache Redis.
   * **Thông báo:** `notification-service` lắng nghe `order-shipped` -> Lưu log notification và phát tín hiệu Server-Sent Events (SSE) thời gian thực đến Client.

---

## 📂 Danh Mục Các Microservices

| Service | Cổng Port | Database | Nhiệm vụ chính |
|---|---|---|---|
| `eureka-server` | 8761 | - | Máy chủ đăng ký & phát hiện dịch vụ (Service Registry) |
| `api-gateway` | 8900 | Redis | Gateway định tuyến, lọc JWT Token, CORS, Rate Limiting |
| `user-service` | 8811 | MySQL `users` | Quản lý tài khoản, mã hóa BCrypt, phân quyền (USER/ADMIN) |
| `product-catalog-service` | 8810 | MySQL `product_catalog` + Redis | Quản lý sản phẩm, các nốt hương, dung tích (variants), cache Redis |
| `product-recommendation-service` | 8812 | MySQL `product_recommendations` | Quản lý đánh giá sao, bình luận và xếp hạng sản phẩm |
| `order-service` | 8813 | MySQL `orders` + Embedded Redis | Giỏ hàng, áp dụng coupon giảm giá, tạo đơn hàng, quản lý doanh thu |
| `payment-service` | 8815 | H2 database | Xử lý thanh toán đồng bộ & bất đồng bộ (Stripe giả lập) |
| `inventory-service` | 8816 | H2 database | Quản lý số lượng tồn kho của các sản phẩm / dung tích |
| `notification-service` | 8817 | MySQL `notifications` | Ghi log hệ thống dạng tài liệu, phát Server-Sent Events (SSE) |

---

## ✨ Các Tính Năng Nâng Cao Đã Hoàn Thành

### 1. Quản lý Sản phẩm Đa biến thể & Thuộc tính Nước hoa
* Hỗ trợ thuộc tính nước hoa chuyên sâu: `topNotes`, `middleNotes`, `baseNotes`, `longevity` (độ lưu hương), `sillage` (độ tỏa hương), `concentration`.
* Hệ thống **Product Variants** (Biến thể sản phẩm): Mỗi sản phẩm có nhiều kích cỡ khác nhau (2ml, 10ml, 50ml, 100ml) với giá bán và số lượng trong kho riêng biệt.

### 2. Hệ Thống Khuyến Mãi (Coupons)
* Cho phép tạo và quản lý mã giảm giá trực tiếp từ Admin Dashboard.
* Tự động kiểm tra tính hợp lệ (ngày áp dụng, số lượng còn lại, giá trị đơn hàng tối thiểu) và tính toán giảm giá ngay trên Giỏ hàng.

### 3. Database Shipping Snapshot
* Khi tạo đơn hàng, toàn bộ thông tin người nhận (Tên, SĐT, Email, Địa chỉ) được chụp lại ngay tại thời điểm đó. Nếu người dùng thay đổi thông tin cá nhân trong tương lai, thông tin trên các đơn hàng cũ vẫn được giữ nguyên.

### 4. Tích Hợp Redis Cache & Rate Limiter
* Sử dụng **Spring Cache (Redis)** để tăng tốc độ truy vấn danh sách và chi tiết sản phẩm.
* Triển khai **Redis Rate Limiter** tại API Gateway để giới hạn số lượng request từ mỗi client (chống spam/DDoS).

### 5. Giao diện React Luxury Glassmorphism (Vite + Tailwind v4 + GSAP)
* **Home Page:** Danh sách sản phẩm, phân trang, lọc theo danh mục, thanh tìm kiếm mượt mà.
* **Product Detail Page:** Xem chi tiết nốt hương, chọn dung tích đổi giá động, bình luận và đánh giá sao.
* **Scent Finder Quiz:** Trắc nghiệm gợi ý nước hoa phù hợp dựa trên thuật toán tính điểm tương thích.
* **Wishlist Page:** Lưu sản phẩm yêu thích và cung cấp link chia sẻ bộ sưu tập.
* **Cart Page:** Quản lý giỏ hàng đa dung tích, áp mã coupon, điền thông tin ship.
* **Profile Page:** Cập nhật thông tin cá nhân và quản lý lịch sử đơn hàng.
* **Admin Dashboard:** Biểu đồ thống kê doanh thu, quản lý sản phẩm, tài khoản (khóa/mở khóa) và đơn hàng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Backend:** Java 21, Spring Boot 3.2.4, Spring Cloud 2023.0.0 (Eureka Server, OpenFeign, Gateway).
* **Security:** Spring Security 6, JWT (Json Web Token), BCrypt Password Encoder.
* **Messaging:** Apache Kafka (Spring Kafka) cho kiến trúc Event-Driven & Saga Pattern.
* **Databases:** MySQL 8, H2 Database (In-Memory), Redis.
* **Frontend:** React 19, Vite, Tailwind CSS v4, GSAP (GreenSock Animation Platform) cho hiệu ứng chuyển động, React Router DOM v7.

---

## 👤 Tác Giả & Bản Quyền

* **Sinh viên thực hiện:** Nguyễn Vũ Hiệp
* **Mã số sinh viên:** 2123110161
* **Lớp:** Lập trình Microservices
* **Niên khóa:** 2026
