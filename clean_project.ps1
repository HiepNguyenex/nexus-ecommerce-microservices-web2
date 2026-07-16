# Script dọn dẹp project e-commerce-microservices để giảm tối đa dung lượng khi nộp bài
Write-Host "Bắt đầu dọn dẹp project..." -ForegroundColor Cyan

# 1. Xóa các thư mục target của Maven trong các Java microservices
Write-Host "Đang xóa các thư mục 'target' của các Java services..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "target" -Directory -Recurse | ForEach-Object {
    Write-Host "Xóa: $($_.FullName)"
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

# 2. Xóa node_modules và dist trong thư mục React (web-client-react)
if (Test-Path "web-client-react\node_modules") {
    Write-Host "Đang xóa web-client-react\node_modules (Thư mục này rất nặng)..." -ForegroundColor Yellow
    Remove-Item -Path "web-client-react\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "web-client-react\dist") {
    Write-Host "Đang xóa web-client-react\dist..." -ForegroundColor Yellow
    Remove-Item -Path "web-client-react\dist" -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Xóa thư mục logs ứng dụng
if (Test-Path "logs") {
    Write-Host "Đang xóa thư mục logs..." -ForegroundColor Yellow
    Remove-Item -Path "logs" -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Xóa các file log lỗi JVM ở thư mục gốc
Write-Host "Đang xóa các file log lỗi JVM..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "hs_err_pid*.log" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Filter "replay_pid*.log" | Remove-Item -Force -ErrorAction SilentlyContinue

# 5. Xóa các thư mục cache của AI Agent / IDE
foreach ($dir in @(".agents", ".codegraph", ".omo")) {
    if (Test-Path $dir) {
        Write-Host "Đang xóa thư mục cache $dir..." -ForegroundColor Yellow
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`nProject đã được dọn dẹp sạch sẽ và tối ưu dung lượng!" -ForegroundColor Green
Write-Host "Lưu ý: Không xóa thư mục '.git' tự động để tránh mất lịch sử commit của bạn. Nếu muốn xóa thủ công, bạn có thể xóa thư mục '.git' ẩn ở thư mục gốc." -ForegroundColor Cyan
