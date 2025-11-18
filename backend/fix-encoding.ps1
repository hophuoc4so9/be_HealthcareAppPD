# Check and fix UTF-8 encoding on Render PostgreSQL

Write-Host "`n[1] Login..." -ForegroundColor Cyan
$loginBody = @{email="admin@healthcare.com";password="Admin123456"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.data.token
Write-Host "[OK] Token received`n" -ForegroundColor Green

Write-Host "[2] Test query with UTF-8..." -ForegroundColor Cyan
$headers = @{"Authorization" = "Bearer $token"}

# Test get a facility to see encoding
$testResult = Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/facilities/nearest?lat=10.3137&lng=105.4815&limit=1" -Headers $headers

Write-Host "`nFacility name from API:" -ForegroundColor Yellow
Write-Host $testResult.data[0].name

Write-Host "`n[3] Check if re-upload needed..." -ForegroundColor Cyan
Write-Host "If name displays incorrectly (question marks), need to:" -ForegroundColor Yellow
Write-Host "  1. Drop existing data" -ForegroundColor White
Write-Host "  2. Re-upload with UTF-8 encoding" -ForegroundColor White
Write-Host "`nDo you want to re-upload all facilities with UTF-8? (y/n)" -ForegroundColor Cyan
$confirm = Read-Host

if ($confirm -eq 'y') {
    Write-Host "`n[RE-UPLOAD] Starting..." -ForegroundColor Cyan
    
    # Read facilities with UTF-8
    $allData = Get-Content "facilities_export.json" -Raw -Encoding UTF8 | ConvertFrom-Json
    $allFacilities = $allData.facilities
    $totalCount = $allFacilities.Count
    
    Write-Host "[INFO] Total facilities: $totalCount`n" -ForegroundColor Cyan
    
    # Upload in batches
    $BATCH_SIZE = 200
    $batches = [Math]::Ceiling($totalCount / $BATCH_SIZE)
    
    for ($i = 0; $i -lt $batches; $i++) {
        $batchNumber = $i + 1
        $startIndex = $i * $BATCH_SIZE
        $endIndex = [Math]::Min(($startIndex + $BATCH_SIZE - 1), ($totalCount - 1))
        
        Write-Host "[BATCH $batchNumber/$batches] Uploading $($startIndex+1)-$($endIndex+1)... " -NoNewline
        
        $batchFacilities = $allFacilities[$startIndex..$endIndex]
        $uploadBody = @{facilities = $batchFacilities} | ConvertTo-Json -Depth 5 -Compress
        
        try {
            $uploadResponse = Invoke-RestMethod `
                -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" `
                -Method POST `
                -Headers @{
                    "Authorization" = "Bearer $token"
                    "Content-Type" = "application/json; charset=utf-8"
                } `
                -Body ([System.Text.Encoding]::UTF8.GetBytes($uploadBody))
            
            Write-Host "[OK]" -ForegroundColor Green
        } catch {
            Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 300
    }
    
    Write-Host "`n[DONE] Re-upload completed!" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Re-upload cancelled" -ForegroundColor Yellow
}
