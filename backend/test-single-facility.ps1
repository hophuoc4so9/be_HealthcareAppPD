# Test upload 1 facility đơn giản
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Login
Write-Host "[AUTH] Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@healthcare.com"
    password = "Admin123456"
} | ConvertTo-Json -Compress

$loginResponse = Invoke-RestMethod `
    -Uri "https://be-healthcareapppd.onrender.com/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json; charset=utf-8"

$token = $loginResponse.token
Write-Host "[SUCCESS] Token: $($token.Substring(0,20))..." -ForegroundColor Green

# Load 1 facility
$allData = Get-Content "facilities_export.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$testFacility = $allData.facilities[0]

Write-Host "`n[TEST] Facility data:" -ForegroundColor Yellow
Write-Host ($testFacility | ConvertTo-Json -Depth 3)

# Upload
Write-Host "`n[UPLOAD] Sending to server..." -ForegroundColor Cyan
$uploadBody = @{
    facilities = @($testFacility)
} | ConvertTo-Json -Depth 5 -Compress

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

try {
    $response = Invoke-RestMethod `
        -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" `
        -Method POST `
        -Headers $headers `
        -Body $uploadBody
    
    Write-Host "[SUCCESS] Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "[ERROR] Failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Message: $($_.Exception.Message)"
    
    # Try to get detailed error
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response Body: $responseBody"
}
