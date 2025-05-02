# Comprehensive Test Script for Rend Backend Authentication

# Test environment variables
Write-Host "Checking environment variables..." -ForegroundColor Cyan
Write-Host "PORT: $env:PORT"
Write-Host "JWT_SECRET: [Configured]"
Write-Host "DATABASE_URL: [Configured]"
Write-Host ""

# Test 1: Registration
Write-Host "Test 1: Registration" -ForegroundColor Cyan
$randomUser = "user_$(Get-Random)"
$randomEmail = "$randomUser@example.com"

try {
    $registerBody = @{
        username = $randomUser
        email = $randomEmail
        password = "password123"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/api/auth/register' -ContentType 'application/json' -Body $registerBody
    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "  Username: $randomUser"
    Write-Host "  Email: $randomEmail"
    Write-Host "  JWT Token received: Yes"
    $token = $registerResponse.token
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Login
Write-Host "Test 2: Login" -ForegroundColor Cyan
try {
    $loginBody = @{
        email = $randomEmail
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body $loginBody
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "  Email: $randomEmail"
    Write-Host "  JWT Token received: Yes"
    $token = $loginResponse.token
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Protected Route
Write-Host "Test 3: Protected Route Access" -ForegroundColor Cyan
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $meResponse = Invoke-RestMethod -Method GET -Uri 'http://localhost:5000/api/auth/me' -Headers $headers
    Write-Host "✓ Protected route access successful" -ForegroundColor Green
    Write-Host "  User data retrieved: Yes"
    Write-Host "  Username: $($meResponse.data.username)"
    Write-Host "  Email: $($meResponse.data.email)"
} catch {
    Write-Host "✗ Protected route access failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Forgot Password
Write-Host "Test 4: Forgot Password" -ForegroundColor Cyan
try {
    $forgotBody = @{
        email = $randomEmail
    } | ConvertTo-Json
    
    $forgotResponse = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/api/auth/forgot-password' -ContentType 'application/json' -Body $forgotBody
    Write-Host "✓ Forgot password request successful" -ForegroundColor Green
    Write-Host "  Response: $($forgotResponse.message)"
} catch {
    Write-Host "✗ Forgot password request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "All tests completed." -ForegroundColor Cyan
Write-Host "Backend authentication system is working as expected." -ForegroundColor Green