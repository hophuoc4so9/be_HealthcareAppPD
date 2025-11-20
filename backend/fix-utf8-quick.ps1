# Quick fix: Delete all and re-upload with correct UTF-8 encoding
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "`n=== FIX UTF-8 ENCODING ISSUE ===" -ForegroundColor Cyan
Write-Host "This will delete all facilities and re-upload with UTF-8`n"

# Login
Write-Host "[1] Login..." -ForegroundColor Yellow
$loginBody = @{email="admin@healthcare.com";password="Admin123456"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json; charset=utf-8"
$token = $response.data.token
Write-Host "    ✓ Authenticated`n" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

# Delete all (truncate table via API)
Write-Host "[2] Clearing old data via API..." -ForegroundColor Yellow
try {
    $clearResponse = Invoke-RestMethod `
        -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" `
        -Method DELETE `
        -Headers $headers
    
    Write-Host "    ✓ Old data cleared: $($clearResponse.message)`n" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Error clearing data: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    This might be OK if table doesn't exist yet`n" -ForegroundColor Yellow
}

# Re-upload with UTF-8
Write-Host "`n[3] Re-uploading with UTF-8 encoding..." -ForegroundColor Yellow

$allData = Get-Content "facilities_export.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$allFacilities = $allData.facilities
$totalCount = $allFacilities.Count
$BATCH_SIZE = 200
$batches = [Math]::Ceiling($totalCount / $BATCH_SIZE)

Write-Host "    Total: $totalCount facilities, $batches batches`n" -ForegroundColor Cyan

$successCount = 0

for ($i = 0; $i -lt $batches; $i++) {
    $batchNumber = $i + 1
    $startIndex = $i * $BATCH_SIZE
    $endIndex = [Math]::Min(($startIndex + $BATCH_SIZE - 1), ($totalCount - 1))
    
    Write-Host "    [BATCH $batchNumber/$batches] $($startIndex+1)-$($endIndex+1)... " -NoNewline
    
    $batchFacilities = $allFacilities[$startIndex..$endIndex]
    $uploadBody = @{facilities = $batchFacilities} | ConvertTo-Json -Depth 5
    
    try {
        $uploadResponse = Invoke-RestMethod `
            -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" `
            -Method POST `
            -Headers $headers `
            -Body $uploadBody `
            -ContentType "application/json; charset=utf-8"
        
        $successCount += $uploadResponse.data.inserted
        Write-Host "✓" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

# Verify
Write-Host "`n[4] Verifying..." -ForegroundColor Yellow
$testUrl = "https://be-healthcareapppd.onrender.com/api/facilities/nearest?lat=10.3137&lng=105.4815&limit=1"
$testResult = Invoke-RestMethod -Uri $testUrl -Headers $headers

Write-Host "    Sample name: " -NoNewline -ForegroundColor Cyan
Write-Host $testResult.data[0].name -ForegroundColor White

$countResult = Invoke-RestMethod `
    -Uri "https://be-healthcareapppd.onrender.com/api/seed/count" `
    -Headers $headers

Write-Host "    Total in DB: $($countResult.data.count)" -ForegroundColor Cyan

Write-Host "`n=== COMPLETED ===" -ForegroundColor Green
Write-Host "Successfully uploaded: $successCount facilities" -ForegroundColor White
