# Upload all facilities to production in batches
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$API_URL = "https://be-healthcareapppd.onrender.com"
$BATCH_SIZE = 200  # Smaller batch to avoid timeouts
$EMAIL = "admin@healthcare.com"
$PASSWORD = "Admin123456"

Write-Host "`n[START] Uploading facilities to production..." -ForegroundColor Cyan
Write-Host "========================================`n"

# Step 1: Login
Write-Host "[AUTH] Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$API_URL/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json; charset=utf-8"
    
    $token = $loginResponse.data.token
    Write-Host "[SUCCESS] Authenticated!`n" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Load facilities data
Write-Host "[LOAD] Reading facilities_export.json..." -ForegroundColor Yellow
$allData = Get-Content "facilities_export.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$allFacilities = $allData.facilities
$totalCount = $allFacilities.Count
Write-Host "[INFO] Total facilities: $totalCount`n" -ForegroundColor Cyan

# Step 3: Split into batches
$batches = [Math]::Ceiling($totalCount / $BATCH_SIZE)
Write-Host "[INFO] Splitting into $batches batches ($BATCH_SIZE facilities/batch)`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

# Step 4: Upload each batch
for ($i = 0; $i -lt $batches; $i++) {
    $batchNumber = $i + 1
    $startIndex = $i * $BATCH_SIZE
    $endIndex = [Math]::Min(($startIndex + $BATCH_SIZE - 1), ($totalCount - 1))
    $currentBatchSize = $endIndex - $startIndex + 1
    
    Write-Host "[BATCH $batchNumber/$batches] Uploading facilities $($startIndex + 1)-$($endIndex + 1)... " -NoNewline
    
    # Get batch slice
    $batchFacilities = $allFacilities[$startIndex..$endIndex]
    
    # Prepare request body
    $uploadBody = @{
        facilities = $batchFacilities
    } | ConvertTo-Json -Depth 5 -Compress
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json; charset=utf-8"
    }
    
    # Upload with retry logic
    $maxRetries = 3
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $maxRetries -and !$success) {
        try {
            $response = Invoke-RestMethod `
                -Uri "$API_URL/api/seed/facilities" `
                -Method POST `
                -Headers $headers `
                -Body $uploadBody `
                -TimeoutSec 120
            
            $success = $true
            $successCount += $response.data.inserted
            $failCount += $response.data.skipped
            
            Write-Host "[OK] Inserted: $($response.data.inserted), Skipped: $($response.data.skipped)" -ForegroundColor Green
            
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "[RETRY $retryCount/$maxRetries] " -NoNewline -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            } else {
                Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
                $failCount += $currentBatchSize
                
                # Try to get error details
                if ($_.Exception.Response) {
                    try {
                        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                        $reader.BaseStream.Position = 0
                        $errorBody = $reader.ReadToEnd()
                        Write-Host "       Error details: $errorBody" -ForegroundColor Red
                    } catch {
                        # Ignore error reading error response
                    }
                }
            }
        }
    }
    
    # Small delay between batches to avoid overwhelming server
    if ($batchNumber -lt $batches) {
        Start-Sleep -Milliseconds 500
    }
}

# Step 5: Verify final count
Write-Host "`n[VERIFY] Checking database count..." -ForegroundColor Yellow
try {
    $countResponse = Invoke-RestMethod `
        -Uri "$API_URL/api/seed/count" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    $dbCount = $countResponse.data.count
    Write-Host "[DATABASE] Total facilities in database: $dbCount" -ForegroundColor Cyan
} catch {
    Write-Host "[WARNING] Could not verify count: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total processed: $totalCount"
Write-Host "Successfully inserted: $successCount" -ForegroundColor Green
Write-Host "Skipped/Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Yellow" } else { "Green" })
Write-Host "========================================`n" -ForegroundColor Cyan
