$baseUrl = "http://localhost:8900/api"

# 1. Log in as johndoe
$loginBodyUser = @{
    username = "johndoe"
    password = "password123"
} | ConvertTo-Json

Write-Host "Logging in as johndoe..."
$loginResUser = Invoke-RestMethod -Uri "$baseUrl/accounts/login" -Method Post -Body $loginBodyUser -ContentType "application/json"
$userToken = $loginResUser.token
$userId = 1
Write-Host "User token acquired successfully!"

# 2. Add product to cart
$headers = @{
    "Authorization" = "Bearer $userToken"
    "Cookie" = "JSESSIONID=testsession_$(Get-Random)"
}

Write-Host "Adding product 1 (Smartphone Galaxy S21) to cart..."
$addCartRes = Invoke-RestMethod -Uri "$baseUrl/shop/cart?productId=1&quantity=1" -Method Post -Headers $headers
Write-Host "Cart updated. Items in cart: $($addCartRes.Count)"

# 3. Checkout
Write-Host "Checking out..."
$checkoutRes = Invoke-RestMethod -Uri "$baseUrl/shop/order/$userId" -Method Post -Headers $headers
Write-Host "Order created! Order ID: $($checkoutRes.id), Total: $($checkoutRes.total), Status: $($checkoutRes.status)"

# Let's wait 5 seconds for Kafka events to propagate
Write-Host "Waiting 5 seconds for Kafka propagation..."
Start-Sleep -Seconds 5

# Check if order is updated to PAID via Kafka event
Write-Host "Retrieving order status..."
$orderRes = Invoke-RestMethod -Uri "$baseUrl/shop/orders/$($checkoutRes.id)" -Method Get -Headers $headers
Write-Host "Order status is now: $($orderRes.status)"

# 4. Log in as admin (janesmith / password456)
$loginBodyAdmin = @{
    username = "janesmith"
    password = "password456"
} | ConvertTo-Json

Write-Host "Logging in as admin..."
$loginResAdmin = Invoke-RestMethod -Uri "$baseUrl/accounts/login" -Method Post -Body $loginBodyAdmin -ContentType "application/json"
$adminToken = $loginResAdmin.token
Write-Host "Admin token acquired successfully!"

$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
}

# 5. Lock User test
Write-Host "Locking user johndoe..."
$lockRes = Invoke-RestMethod -Uri "$baseUrl/accounts/users/1/status?active=0" -Method Put -Headers $adminHeaders
Write-Host "User active status is now: $($lockRes.active)"

# Verify user is locked (should not be able to log in)
Write-Host "Verifying user is locked by trying to login..."
try {
    $loginFailRes = Invoke-RestMethod -Uri "$baseUrl/accounts/login" -Method Post -Body $loginBodyUser -ContentType "application/json"
    Write-Host "WARNING: User login succeeded even though locked!" -ForegroundColor Red
} catch {
    Write-Host "User login failed as expected: $_" -ForegroundColor Green
}

# Unlock user back
Write-Host "Unlocking user johndoe..."
$unlockRes = Invoke-RestMethod -Uri "$baseUrl/accounts/users/1/status?active=1" -Method Put -Headers $adminHeaders
Write-Host "User active status is now: $($unlockRes.active)"

# 6. Retrieve Recommendations test
Write-Host "Fetching all recommendations..."
$recsRes = Invoke-RestMethod -Uri "$baseUrl/review/recommendations" -Method Get -Headers $adminHeaders
Write-Host "Recommendations list (Count: $($recsRes.Count)):"
foreach ($rec in $recsRes) {
    Write-Host "  ID: $($rec.id), Rating: $($rec.rating), Product: $($rec.product.productName), User: $($rec.user.userName)"
}

# Delete a recommendation
if ($recsRes.Count -gt 0) {
    $firstRecId = $recsRes[0].id
    Write-Host "Deleting recommendation ID $firstRecId..."
    $deleteRes = Invoke-RestMethod -Uri "$baseUrl/review/recommendations/$firstRecId" -Method Delete -Headers $adminHeaders
    Write-Host "Delete request completed successfully!"
    Write-Host "Re-fetching recommendations..."
    $recsRes2 = Invoke-RestMethod -Uri "$baseUrl/review/recommendations" -Method Get -Headers $adminHeaders
    Write-Host "New count: $($recsRes2.Count)"
}
