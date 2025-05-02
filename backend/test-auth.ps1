# Test script for Rend backend authentication

Write-Host "Testing login endpoint..."
$loginResponse = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body '{"email":"test2@example.com","password":"password123"}'
Write-Host "Login successful, token received."

Write-Host "\nTesting protected route..."
$headers = @{}
$headers.Add('Authorization', "Bearer $($loginResponse.token)")

try {
    $me = Invoke-RestMethod -Method GET -Uri 'http://localhost:5000/api/auth/me' -Headers $headers
    Write-Host "Protected route access successful!"
    Write-Host "User data:" -ForegroundColor Green
    $me | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error accessing protected route: $($_.Exception.Message)" -ForegroundColor Red
}