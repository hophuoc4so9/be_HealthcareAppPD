# Script upload facilities theo batch để tránh timeout và body size limit

Write-Host "[START] Uploading facilities to production..." -ForegroundColor Cyan

# Load facilities data
$jsonData = Get-Content -Path "facilities_export.json" -Raw | ConvertFrom-Json
$allFacilities = $jsonData.facilities
$totalCount = $allFacilities.Count

Write-Host "[INFO] Total facilities: $totalCount" -ForegroundColor Yellow

# Login để lấy token
Write-Host "`n[AUTH] Logging in..." -ForegroundColor Cyan
$credentials = @{
    email = "admin@healthcare.com"
    password = "Admin123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/auth/login" `
        -Method POST -Body $credentials -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "[SUCCESS] Login successful!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Login failed: $_" -ForegroundColor Red
    exit 1
}

# Thiết lập headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Upload theo batch
$batchSize = 500
$totalBatches = [Math]::Ceiling($totalCount / $batchSize)
$successCount = 0
$failCount = 0

Write-Host "`n[INFO] Splitting into $totalBatches batches ($batchSize facilities/batch)`n" -ForegroundColor Cyan

for ($i = 0; $i -lt $totalBatches; $i++) {
    $startIdx = $i * $batchSize
    $endIdx = [Math]::Min(($i + 1) * $batchSize - 1, $totalCount - 1)
    $batch = $allFacilities[$startIdx..$endIdx]
    $batchNum = $i + 1
    
    Write-Host "[BATCH $batchNum/$totalBatches] Uploading facilities $($startIdx + 1)-$($endIdx + 1)..." -NoNewline
    
    $batchData = @{
        facilities = $batch
    } | ConvertTo-Json -Depth 10 -Compress
    
    try {
        $response = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" `
            -Method POST -Headers $headers -Body $batchData -TimeoutSec 120
        
        $inserted = $response.data.inserted
        $skipped = $response.data.skipped
        $successCount += $inserted
        
        Write-Host " [OK] Inserted: $inserted, Skipped: $skipped" -ForegroundColor Green
    } catch {
        Write-Host " [FAIL] $_" -ForegroundColor Red
        $failCount += $batch.Count
    }
    
    # Delay ngắn giữa các batch để tránh quá tải
    if ($i -lt $totalBatches - 1) {
        Start-Sleep -Milliseconds 500
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "UPLOAD RESULTS:" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "[SUCCESS] Uploaded: $successCount facilities" -ForegroundColor Green
Write-Host "[FAILED] Failed: $failCount facilities" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "[TOTAL] Total: $totalCount facilities" -ForegroundColor Yellow

# Verify count
Write-Host "`n[INFO] Checking server count..." -ForegroundColor Cyan
try {
    $countResponse = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/seed/count" `
        -Method GET -Headers $headers
    $serverCount = $countResponse.data.count
    Write-Host "[OK] Server has: $serverCount facilities" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Cannot verify: $_" -ForegroundColor Yellow
}

Write-Host "`n[DONE] Upload completed!" -ForegroundColor Cyan
