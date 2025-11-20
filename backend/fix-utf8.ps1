# Fix UTF-8 Encoding - Clear and Re-upload
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "`n=== FIX UTF-8 ENCODING ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n[1] Login..." -ForegroundColor Yellow
$loginBody = '{"email":"admin@healthcare.com","password":"Admin123456"}'
$loginResponse = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json; charset=utf-8"
$token = $loginResponse.data.token
Write-Host "    Authenticated!" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

# Step 2: Clear old data
Write-Host "`n[2] Clearing old data..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" -Method DELETE -Headers $headers | Out-Null
    Write-Host "    Cleared!" -ForegroundColor Green
} catch {
    Write-Host "    Warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: Upload with UTF-8
Write-Host "`n[3] Re-uploading with UTF-8..." -ForegroundColor Yellow
$jsonContent = Get-Content "facilities_export.json" -Raw -Encoding UTF8
$data = $jsonContent | ConvertFrom-Json
$facilities = $data.facilities
$total = $facilities.Count
$batchSize = 200
$batches = [Math]::Ceiling($total / $batchSize)

Write-Host "    Total: $total facilities, $batches batches" -ForegroundColor Cyan

$successCount = 0

for ($i = 0; $i -lt $batches; $i++) {
    $batchNum = $i + 1
    $start = $i * $batchSize
    $end = [Math]::Min(($start + $batchSize - 1), ($total - 1))
    
    Write-Host "    [$batchNum/$batches] Uploading..." -NoNewline
    
    $batch = $facilities[$start..$end]
    $body = @{facilities = $batch} | ConvertTo-Json -Depth 10 -Compress
    
    # Encode body as UTF8
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    
    try {
        $response = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" -Method POST -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8" -TimeoutSec 120
        $successCount += $response.data.inserted
        Write-Host " OK ($($response.data.inserted))" -ForegroundColor Green
    } catch {
        Write-Host " FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

# Step 4: Verify
Write-Host "`n[4] Verifying..." -ForegroundColor Yellow
$nearestUrl = "https://be-healthcareapppd.onrender.com/api/facilities/nearest"
$testParams = "?lat=10.3137&lng=105.4815&limit=1"
$test = Invoke-RestMethod -Uri ($nearestUrl + $testParams) -Headers $headers

Write-Host "    Sample: $($test.data[0].name)" -ForegroundColor Cyan

$count = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/seed/count" -Headers $headers
Write-Host "    Total in DB: $($count.data.count)" -ForegroundColor Cyan

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "Uploaded: $successCount facilities`n" -ForegroundColor White
