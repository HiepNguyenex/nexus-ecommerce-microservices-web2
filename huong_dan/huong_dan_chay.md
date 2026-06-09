# Hướng Dẫn Cài Đặt & Khởi Chạy Hệ Thống Nexus Microservices 🌈

Tài liệu này hướng dẫn chi tiết cách thiết lập cơ sở dữ liệu, biên dịch dự án và khởi chạy toàn bộ hệ thống microservices sử dụng Aiven Cloud Kafka.

---

## 📋 Yêu Cầu Hệ Thống
* **Hệ điều hành**: Windows (đã cài đặt PowerShell và Python).
* **Java SDK**: Java 21 (đã cấu hình biến môi trường `JAVA_HOME`).
* **Cơ sở dữ liệu**: MySQL (ví dụ: XAMPP) đang chạy tại cổng `3306` (không mật khẩu).

---

## 🚀 Các Bước Thực Hiện Chi Tiết

### Bước 1: Khởi tạo dữ liệu MySQL
1. Bật MySQL từ bảng điều khiển XAMPP Control Panel.
2. Mở cửa sổ Terminal (PowerShell) tại thư mục gốc của dự án và chạy lệnh:
   ```powershell
   Get-Content seed.sql | C:\xampp\mysql\bin\mysql.exe -u root
   ```
   *Lệnh này sẽ tự động tạo các database (`users`, `orders`, `product_catalog`, `product_recommendations`) và nạp dữ liệu mẫu.*

### Bước 2: Biên dịch (Build) toàn bộ dự án
Chạy script tự động đóng gói các microservices thành tệp `.jar`:
```powershell
.\build_all.ps1
```
*Đợi khoảng 1-2 phút cho đến khi màn hình hiển thị thông báo "All builds completed!".*

### Bước 3: Khởi chạy các Microservices ngầm
Bật đồng loạt các microservices kết nối với Eureka Server và Aiven Cloud Kafka:
```powershell
.\run_all_background.ps1
```
* **Lưu ý**: Script sẽ tự động chờ Eureka Server khởi động hoàn tất (12 giây) rồi mới bật các dịch vụ khác. Toàn bộ log của các dịch vụ sẽ được ghi vào thư mục `\logs` tại thư mục gốc để dễ dàng theo dõi lỗi nếu có.

### Bước 4: Khởi động máy chủ giao diện (Web Client)
Chạy máy chủ web Python ở cổng `5500` để phục vụ giao diện người dùng:
```powershell
python -m http.server 5500
```

### Bước 5: Chạy kịch bản kiểm thử tự động (E2E Test)
Chạy script kiểm thử để kiểm tra luồng đặt hàng (Kafka Events) và các tính năng của Admin:
```powershell
.\verify_flow.ps1
```
*Kết quả đầu ra sẽ hiển thị trạng thái chuyển đổi đơn hàng sang `PAID` và các tính năng khóa tài khoản, quản lý đánh giá.*

---

## 🖥️ Liên Kết Trải Nghiệm Hệ Thống
* **Trang chủ cửa hàng**: [http://localhost:5500/index.html](http://localhost:5500/index.html) (Đăng nhập: `johndoe` / `password123`).
* **Trang quản trị (Admin Panel)**: [http://localhost:5500/admin.html](http://localhost:5500/admin.html) (Đăng nhập: `janesmith` / `password456`).
* **Eureka Server Dashboard**: [http://localhost:8761/](http://localhost:8761/) (Xem danh sách các microservice đã kết nối thành công).
