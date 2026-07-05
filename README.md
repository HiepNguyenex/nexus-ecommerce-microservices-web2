# 🌈 Hệ Thống Microservices Thương Mại Điện Tử — Rainbow Forest

> **Đồ án Lab 1 + Lab 2** · Spring Cloud Microservices · Java 21 · Spring Boot 3.2.4

Hệ thống e-commerce gồm **9 microservices** giao tiếp đồng bộ (REST + OpenFeign) và bất đồng bộ (Kafka), bảo mật bằng **JWT + BCrypt**, lưu trữ phân tán (MySQL + H2 + Redis embedded + MongoDB-style logs), quản lý bởi **Eureka Service Discovery** và định tuyến qua **Spring Cloud Gateway**.

---

## ⚡ Hướng Dẫn Chạy Dự Án

> ⏱ **Lần đầu chạy**: ~10-15 phút (bao gồm build)
> ⏱ **Lần sau**: ~1 phút (chỉ start services)

---

### 🎯 Cách 1: Chạy nhanh bằng một lệnh duy nhất (đã build sẵn)

Dùng khi bạn **đã build** các services rồi, chỉ cần chạy một lệnh duy nhất để khởi động toàn bộ DB, Backend Microservices và React Web Client:

```powershell
# Bật PowerShell (chạy với quyền của bạn) và thực thi:
.\start_fast.ps1
```

> **Lưu ý:** Script này tự động:
> 1. Kiểm tra và kích hoạt MySQL (XAMPP) nếu chưa chạy.
> 2. Đọc và nạp các cấu hình từ `.env`.
> 3. Tự động tìm và chạy đúng các file jar khả thi (kể cả `-exec.jar` của API Gateway).
> 4. Khởi động 9 microservices trong nền với log ghi vào thư mục `logs/`.
> 5. Khởi chạy máy chủ phát triển Vite của React Web Client.

✅ Mở trình duyệt: **http://localhost:5500**  
✅ Đăng nhập: `user` / `123456` hoặc `admin` / `123456`  
✅ Dừng toàn bộ hệ thống: `.\stop_all.ps1`

---

### 📋 Cách 2: Chạy từ đầu (đầy đủ chi tiết)

#### Bước 1: Kiểm tra môi trường

Mở **PowerShell** và kiểm tra:

```powershell
java -version
# Kết quả: java 21.0.x

cd "D:\Bai Tap\java-project\e-commerce-microservices-master"
.\mvnw.cmd --version
# Kết quả: Apache Maven 3.9.x
```

#### Bước 2: Khởi động MySQL

Mở **XAMPP Control Panel** → Bấm **Start** ở dòng **MySQL**.

> **Lưu ý:** 
> - Port mặc định: `3306`
> - User: `root`
> - Password: *(để trống)*
> - Nếu dùng MySQL khác, sửa trong file `.env`

Kiểm tra MySQL đã chạy:
```powershell
mysql -u root -p
# (Enter password để trống)
```

#### Bước 3: Tạo file .env (chỉ làm 1 lần)

```powershell
cd "D:\Bai Tap\java-project\e-commerce-microservices-master"
Copy-Item .env.example .env
```

📝 **Nội dung file `.env` mặc định:**
```ini
JWT_SECRET=mySecretKeyForEcommerceMicroservicesApplicationLongEnough
KAFKA_BOOTSTRAP_SERVERS=...  # Aiven Cloud Kafka
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=               # để trống
```

> File `.env` đã được cấu hình sẵn để chạy với XAMPP mặc định.

#### Bước 4: Build tất cả services (lần đầu tiên)

```powershell
.\build_all.ps1
```

> ⏱ **Mất ~5 phút** cho lần build đầu tiên (Maven tải dependencies).
> 
> Script này sẽ build **6 services**:
> `order-service`, `payment-service`, `inventory-service`,
> `notification-service`, `user-service`, `product-recommendation-service`
>
> *Riêng `eureka-server`, `api-gateway`, `product-catalog-service` đã build sẵn.*

#### Bước 5: Khởi động toàn bộ hệ thống

```powershell
.\start_with_env.ps1
```

Script sẽ khởi động lần lượt theo thứ tự:

| Thứ tự | Service | Port | ⏱ |
|:---:|---|:---:|:---:|
| 1 | **Eureka Server** | 8761 | Khởi động trước |
| 2 | **API Gateway** | 8900 | → |
| 3 | **User Service** | 8811 | → Sau Eureka 12s |
| 4 | **Product Catalog** | 8810 | → |
| 5 | **Product Recommendation** | 8812 | → |
| 6 | **Order Service** (+ Redis) | 8813 | → |
| 7 | **Payment Service** | 8815 | → |
| 8 | **Inventory Service** | 8816 | → |
| 9 | **Notification Service** | 8817 | → |

> ⏱ Đợi **~40 giây** để tất cả services khởi động xong.
> 
> Kiểm tra: http://localhost:8761 → phải thấy **9 services** đều **UP**.
>
> *Nếu không có Kafka, các services vẫn chạy nhưng thiếu luồng xử lý bất đồng bộ.*

#### Bước 6: Mở Web Client

```powershell
# Mở terminal MỚI (giữ nguyên terminal cũ đang chạy services)
cd "D:\Bai Tap\java-project\e-commerce-microservices-master\web-client"
python -m http.server 5500
```

✅ Mở trình duyệt: **http://localhost:5500**

> ⚠️ **Phải** dùng `http://localhost:5500`, **KHÔNG** dùng `file://` để tránh lỗi CORS.

#### Bước 7: Đăng nhập và sử dụng

| Tài khoản | Mật khẩu | Quyền | Chức năng |
|:---|---|:---:|---|
| `admin` | `123456` | `ROLE_ADMIN` | Xem doanh thu, quản lý sản phẩm, quản lý đơn hàng |
| `user` | `123456` | `ROLE_USER` | Xem sản phẩm, giỏ hàng, đặt hàng, đánh giá |
| `johndoe` | `password123` | `ROLE_USER` | Người dùng mẫu |
| `janesmith` | `password456` | `ROLE_ADMIN` | Admin mẫu |

#### Bước 8: Xem log (khi cần debug)

```powershell
# Xem log realtime của từng service
Get-Content "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\order.log" -Wait -Tail 50
Get-Content "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\gateway.log" -Wait -Tail 50
Get-Content "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\user.log" -Wait -Tail 50

# Các file log có sẵn:
# logs\eureka.log, gateway.log, user.log, catalog.log,
# recommendation.log, order.log, payment.log, inventory.log, notification.log
```

#### Bước 9: Dừng toàn bộ (khi không dùng nữa)

**Cách 1 - Dừng nhanh:**
```powershell
# Dừng tất cả Java processes
Get-Process -Name java | Stop-Process -Force

# Dừng Python web server (nếu cần)
Get-Process -Name python | Where-Object { $_.Path -like '*Python312*' } | Stop-Process -Force
```

**Cách 2 - Dùng script:**
```powershell
.\stop_all.ps1
```

---

### 🐳 Cách 3: Chạy với Kafka local (Docker)

Nếu muốn chạy Kafka local thay vì dùng Aiven Cloud:

```powershell
# Bước 1: Cài Docker Desktop và khởi động
# Bước 2: Chạy Kafka + Zookeeper
cd "D:\Bai Tap\java-project\e-commerce-microservices-master"
docker compose up -d

# Bước 3: Kiểm tra Kafka đã chạy
docker ps
# Kết quả: zookeeper (2181) và kafka (9092)

# Bước 4: Chạy services như bình thường
.\start_with_env.ps1
```

> 📌 **Lưu ý:** Khi dùng Kafka local, cập nhật `.env`:
> ```ini
> KAFKA_BOOTSTRAP_SERVERS=localhost:9092
> # Xóa các dòng SASL_SSL nếu dùng PLAINTEXT
> ```

---

## 🗺️ Kiến trúc hệ thống

```
                ┌──────────────────────────────────────┐
                │   Web Client (HTML/CSS/JS) :5500     │
                └────────────────┬─────────────────────┘
                                 │ JWT
                ┌────────────────▼─────────────────────┐
                │   API Gateway (Spring Cloud) :8900   │
                │   - CORS  - JWT filter - LoadBalance │
                └────────────────┬─────────────────────┘
                                 │ Eureka
                ┌────────────────▼─────────────────────┐
                │     Eureka Server :8761              │
                └────────────────┬─────────────────────┘
                                 │
   ┌──────────┬──────────┬───────┴────────┬──────────┬──────────┐
   ▼          ▼          ▼                ▼          ▼          ▼
 user      product    product           order    payment    inventory
 :8811     catalog    recommend         :8813    :8815      :8816
 (MySQL)   :8810      :8812             (MySQL)  (H2)       (H2)
            (MySQL)    (MySQL)           ▼         ▲          ▲
                                       │  Kafka   │          │
                                       └──────────┴──────────┘
                                                       │
                                       ┌───────────────▼──────────┐
                                       │  Notification :8817      │
                                       │  (MySQL - document log)  │
                                       └──────────────────────────┘

       Redis embedded :6379 (cart)   |   Aiven Cloud Kafka   |   MySQL :3306
```

### Luồng sự kiện Saga Pattern (Lab 2)

```
[User]  --POST /order/-->  order-service
                              │ 1. Tạo order (PAYMENT_EXPECTED) + snapshot phone/email/address
                              │ 2. Publish OrderCreatedEvent
                              ▼
                          Kafka: order-created
                              │
              ┌───────────────┼──────────────────┐
              ▼               ▼                  ▼
        payment-service  inventory-service   notification-service
        (1. lưu payment)  (1. reserve stock)  (1. email user + ADMIN notify)
              │                                  
              │ 2. Publish PaymentCompletedEvent
              ▼
          Kafka: payment-completed
              │
              ▼
        order-service  ---> set status = PAID
              │
        [Admin] --PUT /orders/{id}/status?status=SHIPPED--->
              │ 3. Publish OrderShippedEvent
              ▼
          Kafka: order-shipped
              │
        inventory-service ---> trừ kho chính thức
        notification-service ---> email user giao hàng + ADMIN notify
```

---

## 📂 Cấu trúc thư mục

```
e-commerce-microservices-master/
├── .env.example            # Template biến môi trường
├── .env                    # Biến thực tế (KHÔNG commit)
├── README.md               # File này
├── build_all.ps1           # Build tất cả service
├── start_with_env.ps1      # Khởi động stack (load .env)
├── run_all.ps1             # Khởi động không cần .env (fallback)
├── stop_all.ps1            # Dừng tất cả
├── setup_mysql_user.sql    # Tạo user MySQL riêng (optional)
│
├── eureka-server/          # Port 8761 — Service Discovery
├── api-gateway/            # Port 8900 — Routing + JWT + CORS
├── user-service/           # Port 8811 — Đăng ký/đăng nhập (MySQL)
├── product-catalog-service/# Port 8810 — CRUD sản phẩm (MySQL)
├── product-recommendation-service/ # Port 8812 — Đánh giá (MySQL)
├── order-service/          # Port 8813 — Giỏ hàng + đơn hàng (MySQL + Redis embedded)
├── payment-service/        # Port 8815 — Thanh toán (H2 + Kafka)
├── inventory-service/      # Port 8816 — Tồn kho (H2 + Kafka)
├── notification-service/   # Port 8817 — Ghi log + thông báo admin (MySQL + Kafka)
│
├── web-client/             # Frontend HTML/CSS/JS
│   ├── index.html          # Trang chủ
│   ├── login.html          # Đăng nhập
│   ├── product.html        # Danh sách sản phẩm
│   ├── cart.html           # Giỏ hàng
│   ├── admin.html          # Trang admin
│   ├── app.js              # Logic frontend
│   └── styles.css
│
└── logs/                   # Log redirect (có thể trống trên Windows)
```

---

## 🌐 API Endpoints chính

### Qua API Gateway (http://localhost:8900)

| Method | Path | Mô tả | Auth |
|---|---|---|---|
| `POST` | `/api/accounts/registration` | Đăng ký user mới | Public |
| `POST` | `/api/accounts/login` | Đăng nhập → JWT | Public |
| `GET`  | `/api/accounts/users` | Danh sách users | Admin |
| `GET`  | `/api/catalog/products` | Danh sách sản phẩm | Public |
| `GET`  | `/api/review/recommendations` | Gợi ý sản phẩm | Public |
| `GET`  | `/api/shop/cart` | Xem giỏ hàng | User |
| `POST` | `/api/shop/cart?productId=&quantity=` | Thêm vào giỏ | User |
| `POST` | `/api/shop/order/{userId}` | Tạo đơn hàng | User |
| `PUT`  | `/api/shop/orders/{id}/status?status=` | Cập nhật trạng thái (Lab 2) | User |
| `GET`  | `/api/admin/revenue` | Thống kê doanh thu (Lab 2) | Admin |
| `GET`  | `/api/notifications/logs` | Lịch sử thông báo (Lab 2) | Admin |
| `GET`  | `/api/notifications/logs/stats` | Thống kê notification | Admin |

### Trực tiếp service (port riêng)

| Service | Port | URL gốc |
|---|---|---|
| Eureka | 8761 | http://localhost:8761/ |
| Gateway | 8900 | http://localhost:8900/ |
| Web Client | 5500 | http://localhost:5500/ |

---

## 🛠️ Tech Stack

| Lớp | Công nghệ |
|---|---|
| Ngôn ngữ | **Java 21** |
| Framework | **Spring Boot 3.2.4** + **Spring Cloud 2023.0.0** |
| Gateway | Spring Cloud Gateway (WebFlux / Netty) |
| Service Discovery | Netflix Eureka |
| Giao tiếp đồng bộ | **OpenFeign** (REST giữa service) |
| Giao tiếp bất đồng bộ | **Spring Kafka 3.x** + Aiven Cloud Kafka (SASL_SSL) |
| Bảo mật | **JWT** (jjwt 0.11.5) + **BCrypt** + Spring Security 6 |
| Database | MySQL 8 (4 service) + H2 in-memory (3 service) |
| ORM | Spring Data JPA + Hibernate 6.4 |
| Cache | **Spring Data Redis** + **Embedded Redis** (cart) |
| Document log | JPA + MySQL (thay cho MongoDB — lý do bên dưới) |
| Build | **Maven** + Maven Wrapper |
| Frontend | HTML/CSS/JS thuần |

> **Lưu ý về MongoDB:** Đề bài Lab 2 yêu cầu MongoDB, nhưng môi trường thực tế:
> - MongoDB server không có sẵn.
> - Embedded MongoDB (`de.flapdoodle.embed.mongo`) download binary từ `fastdl.mongodb.org` **rất chậm** (~100MB, mất 15+ phút, dễ timeout).
> - **Giải pháp:** dùng **JPA + MySQL** với cấu trúc `@Entity` giống document. Khi có MongoDB server, chỉ cần đổi dependency là chạy được.

---

## ✅ Tính năng đã hoàn thành

### Lab 1 — Microservices cơ bản
- [x] 9 microservices + Eureka + Gateway
- [x] JWT auth + BCrypt
- [x] Kafka E2E flow: `order-created → payment-completed → PAID`
- [x] MySQL + H2 mix
- [x] Web client (user) + Admin panel
- [x] Verify script (`verify_flow.ps1`)

### Lab 2 — Saga Pattern + NoSQL

| Câu | Yêu cầu | Giải pháp | File chính |
|---|---|---|---|
| **1.1** | Đơn hàng `SHIPPED` → kho cập nhật đúng số lượng | **Saga pattern** qua Kafka topic `order-shipped`; status flow `PAYMENT_EXPECTED → PAID → SHIPPED` | `OrderController.java` (PUT status), `OrderProducer.java`, `OrderConsumer.java` (inventory) |
| **1.2** | Đổi SĐT/email/địa chỉ → đơn hàng cũ giữ thông tin cũ | **Snapshot** `shippingPhone`/`shippingEmail`/`shippingFullName`/`shippingAddress` lúc tạo order | `Order.java`, `OrderController.createOrder()` |
| **1.3** | Thống kê doanh thu | Endpoint `GET /api/admin/revenue?from=&to=` aggregate tổng `total` các order `PAID/SHIPPED/COMPLETED` | `OrderRepository.java`, `RevenueReport.java`, `OrderServiceImpl.java` |
| **1.4** | Thông báo hệ thống cho admin | Notification log riêng target=`ADMIN`, lưu MySQL, có flag `HIGH-VALUE` cho đơn > 1000 VND | `NotificationConsumer.java` |
| **2** | Redis + MongoDB | **Redis embedded** (cart thay vì in-memory); **MySQL** lưu `notification_logs` thay cho MongoDB | `RedisConfig.java`, `CartRedisRepositoryImpl.java`, `NotificationLog.java` |

---

## 🧪 Test thủ công (happy path)

1. Mở http://localhost:5500 → trang login
2. Login `user` / `123456`
3. Click **"Sản phẩm"** → thấy 5 sản phẩm mẫu
4. Click **"Thêm vào giỏ"** → chọn số lượng
5. Click **"Đặt hàng"** → order tạo xong
6. Đợi ~3s → status chuyển `PAID` (qua Kafka)
7. Logout, login `admin` / `123456`
8. Click **"Admin"** → xem:
   - Doanh thu tổng (`/api/admin/revenue`)
   - Notification logs (`/api/notifications/logs`)
9. Test saga: gọi API `PUT /api/shop/orders/{id}/status?status=SHIPPED` → kiểm tra kho trừ

---

## ❓ Troubleshooting

### MySQL không kết nối
- Kiểm tra XAMPP đã Start MySQL (port 3306)
- Kiểm tra user `root` không password (mặc định XAMPP)
- Xem `logs/user-error.log` để biết chi tiết

### Service không lên
- Kiểm tra Eureka trước: http://localhost:8761 — phải thấy tất cả service `UP`
- Đợi 30-60s cho lần đầu (Kafka + Eureka + Redis embedded cần thời gian)

### Login fail
- Username/password mặc định: `admin`/`123456` hoặc `user`/`123456`
- Nếu quên, xem MySQL: `SELECT user_name, active FROM users;`

### Port 8761/8900/5500 bị chiếm
- Tắt process cũ: `Get-Process -Name java | Stop-Process -Force`
- Hoặc đổi port trong `application.properties` từng service

### JWT token bị reject qua Gateway
- Token hết hạn (24h) → login lại
- Hoặc xung đột secret → đảm bảo `JWT_SECRET` trong `.env` giống nhau ở mọi service

### Web client không load
- Chạy `python -m http.server 5500` từ `web-client/`
- Mở `http://localhost:5500` (KHÔNG mở `file://`)

---

## 📚 Tài liệu tham khảo

- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Spring Cloud Netflix Eureka](https://spring.io/projects/spring-cloud-netflix)
- [Spring for Apache Kafka](https://spring.io/projects/spring-kafka)
- [Saga Pattern (microservices.io)](https://microservices.io/patterns/data/saga.html)
- [OpenFeign](https://spring.io/projects/spring-cloud-openfeign)

---

## 👤 Tác giả

- **Họ tên:** Nguyễn Vũ Hiệp
- **MSSV:** 2123110161
- **Môn học:** Lập trình Microservices
- **Niên khóa:** 2026

---

> 📌 **Tip:** Nếu bạn chỉ muốn xem demo mà không cần sửa code, chỉ cần:
> 1. Bật MySQL (XAMPP)
> 2. `.\start_with_env.ps1`
> 3. Mở http://localhost:5500
> 4. Login `user` / `123456`
