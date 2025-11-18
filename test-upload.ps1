# Test upload 1 facility
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "[AUTH] Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@healthcare.com"
    password = "Admin123456"
} | ConvertTo-Json -Compress

$loginResponse = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json; charset=utf-8"

$token = $loginResponse.token
Write-Host "[SUCCESS] Token received" -ForegroundColor Green

# Load 1 facility
$allData = Get-Content "facilities_export.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$testFacility = $allData.facilities[0]

Write-Host "`n[TEST] Uploading 1 facility: $($testFacility.name)" -ForegroundColor Yellow

# Upload
$uploadBody = @{
    facilities = @($testFacility)
} | ConvertTo-Json -Depth 5 -Compress

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

try {
    $response = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" -Method POST -Headers $headers -Body $uploadBody
    Write-Host "[SUCCESS] Uploaded!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "[ERROR] Failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error: $errorBody"
}
