# Test Wallet Authentication Endpoints
# This script tests the wallet authentication functionality

$baseUrl = "http://localhost:3000/api/auth"

Write-Host "=== Testing Wallet Authentication ===" -ForegroundColor Green

# Test 1: Get nonce for EVM wallet
Write-Host "`n1. Testing GET nonce for EVM wallet..." -ForegroundColor Yellow
$noncePayload = @{
    walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A"
    walletType = "evm"
} | ConvertTo-Json

try {
    $nonceResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/nonce" -Method POST -Body $noncePayload -ContentType "application/json"
    Write-Host "✅ Nonce generated successfully" -ForegroundColor Green
    Write-Host "Nonce: $($nonceResponse.data.nonce)" -ForegroundColor Cyan
    Write-Host "Message: $($nonceResponse.data.message)" -ForegroundColor Cyan
    $nonce = $nonceResponse.data.nonce
    $message = $nonceResponse.data.message
} catch {
    Write-Host "❌ Failed to get nonce: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get nonce for Solana wallet
Write-Host "`n2. Testing GET nonce for Solana wallet..." -ForegroundColor Yellow
$solanaPayload = @{
    walletAddress = "11111111111111111111111111111112"
    walletType = "solana"
} | ConvertTo-Json

try {
    $solanaResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/nonce" -Method POST -Body $solanaPayload -ContentType "application/json"
    Write-Host "✅ Solana nonce generated successfully" -ForegroundColor Green
    Write-Host "Nonce: $($solanaResponse.data.nonce)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get Solana nonce: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test invalid wallet type
Write-Host "`n3. Testing invalid wallet type..." -ForegroundColor Yellow
$invalidPayload = @{
    walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A"
    walletType = "invalid"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/nonce" -Method POST -Body $invalidPayload -ContentType "application/json"
    Write-Host "❌ Should have failed with invalid wallet type" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected invalid wallet type" -ForegroundColor Green
}

# Test 4: Test missing wallet address
Write-Host "`n4. Testing missing wallet address..." -ForegroundColor Yellow
$missingPayload = @{
    walletType = "evm"
} | ConvertTo-Json

try {
    $missingResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/nonce" -Method POST -Body $missingPayload -ContentType "application/json"
    Write-Host "❌ Should have failed with missing wallet address" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected missing wallet address" -ForegroundColor Green
}

# Test 5: Test wallet authentication with invalid signature
Write-Host "`n5. Testing wallet authentication with invalid signature..." -ForegroundColor Yellow
$authPayload = @{
    walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A"
    signature = "0xinvalidsignature"
    message = $message
    walletType = "evm"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/wallet" -Method POST -Body $authPayload -ContentType "application/json"
    Write-Host "❌ Should have failed with invalid signature" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected invalid signature" -ForegroundColor Green
}

# Test 6: Test wallet authentication with missing fields
Write-Host "`n6. Testing wallet authentication with missing fields..." -ForegroundColor Yellow
$incompletePayload = @{
    walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A"
    # Missing signature, message, walletType
} | ConvertTo-Json

try {
    $incompleteResponse = Invoke-RestMethod -Uri "$baseUrl/wallet" -Method POST -Body $incompletePayload -ContentType "application/json"
    Write-Host "❌ Should have failed with missing fields" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected missing fields" -ForegroundColor Green
}

# Test 7: Test invalid message format
Write-Host "`n7. Testing invalid message format..." -ForegroundColor Yellow
$invalidMsgPayload = @{
    walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A"
    signature = "0xinvalidsignature"
    message = "Invalid message without proper nonce format"
    walletType = "evm"
} | ConvertTo-Json

try {
    $invalidMsgResponse = Invoke-RestMethod -Uri "$baseUrl/wallet" -Method POST -Body $invalidMsgPayload -ContentType "application/json"
    Write-Host "❌ Should have failed with invalid message format" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected invalid message format" -ForegroundColor Green
}

Write-Host "`n=== Wallet Authentication Tests Completed ===" -ForegroundColor Green
Write-Host "Note: For complete testing with valid signatures, use the Jest test suite:" -ForegroundColor Cyan
Write-Host "npm test -- walletAuth.test.js" -ForegroundColor Cyan 