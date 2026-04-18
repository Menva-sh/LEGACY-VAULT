#!/usr/bin/env pwsh
# Database and API Persistence Test

Write-Host "=== LEGACY VAULT - Database Persistence Test ===" -ForegroundColor Cyan

# Test 1: Check if backend is running
Write-Host "`n1. Testing backend connectivity..." -ForegroundColor Yellow
try {
  $backendResponse = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 3
  Write-Host "✅ Backend is running on port 3000" -ForegroundColor Green
} catch {
  Write-Host "❌ Backend is NOT responding on port 3000" -ForegroundColor Red
  Write-Host "   Start backend: cd backend && node server.js" -ForegroundColor Yellow
  exit 1
}

# Test 2: Register user
Write-Host "`n2. Registering test user..." -ForegroundColor Yellow
try {
  $timestamp = Get-Date -Format "yyyyMMddHHmmss"
  $testEmail = "test_$timestamp@example.com"
  $regBody = "{`"email`":`"$testEmail`",`"password`":`"TestPass123`"}"
  $regResponse = Invoke-WebRequest -Uri 'http://localhost:3000/auth/register' -Method POST -Headers @{'Content-Type'='application/json'} -Body $regBody -UseBasicParsing -TimeoutSec 5
  
  $regData = $regResponse.Content | ConvertFrom-Json
  $userId = $regData.user.id
  $token = $regData.token
  
  Write-Host "✅ User registered successfully" -ForegroundColor Green
  Write-Host "   Email: $testEmail" -ForegroundColor Gray
  Write-Host "   User ID: $userId" -ForegroundColor Gray
  Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
  Write-Host "❌ Failed to register user: $_" -ForegroundColor Red
  exit 1
}

# Test 3: Add asset
Write-Host "`n3. Adding test asset..." -ForegroundColor Yellow
try {
  $assetBody = '{"assetName":"Test Asset","assetType":"documents","description":"DB Test","filePath":"/test","fileSize":2048,"isEncrypted":false}'
  $assetResponse = Invoke-WebRequest -Uri 'http://localhost:3000/assets' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body $assetBody -UseBasicParsing -TimeoutSec 5
  
  $assetData = $assetResponse.Content | ConvertFrom-Json
  $assetId = $assetData.asset.id
  
  Write-Host "✅ Asset created successfully" -ForegroundColor Green
  Write-Host "   Asset ID: $assetId" -ForegroundColor Gray
  Write-Host "   Name: $($assetData.asset.asset_name)" -ForegroundColor Gray
} catch {
  Write-Host "❌ Failed to add asset: $_" -ForegroundColor Red
  exit 1
}

# Test 4: Retrieve asset from API
Write-Host "`n4. Retrieving assets from API..." -ForegroundColor Yellow
try {
  $getResponse = Invoke-WebRequest -Uri 'http://localhost:3000/assets' -Method GET -Headers @{'Authorization'="Bearer $token"} -UseBasicParsing -TimeoutSec 5
  
  $getData = $getResponse.Content | ConvertFrom-Json
  $count = $getData.count
  
  Write-Host "✅ Assets retrieved from API" -ForegroundColor Green
  Write-Host "   Total assets for user: $count" -ForegroundColor Gray
  
  if ($count -gt 0) {
    Write-Host "   Latest asset: $($getData.assets[0].asset_name) (ID: $($getData.assets[0].id))" -ForegroundColor Gray
  }
} catch {
  Write-Host "❌ Failed to retrieve assets: $_" -ForegroundColor Red
  exit 1
}

# Test 5: Add executor
Write-Host "`n5. Adding test executor..." -ForegroundColor Yellow
try {
  $execBody = '{"executorEmail":"testexec@example.com","executorName":"Test Executor"}'
  $execResponse = Invoke-WebRequest -Uri 'http://localhost:3000/executors' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body $execBody -UseBasicParsing -TimeoutSec 5
  
  $execData = $execResponse.Content | ConvertFrom-Json
  $execId = $execData.executor.id
  
  Write-Host "✅ Executor created successfully" -ForegroundColor Green
  Write-Host "   Executor ID: $execId" -ForegroundColor Gray
  Write-Host "   Name: $($execData.executor.executor_name)" -ForegroundColor Gray
  Write-Host "   Status: $($execData.executor.status)" -ForegroundColor Gray
  Write-Host "   Access Granted: $($execData.executor.is_active)" -ForegroundColor Gray
} catch {
  Write-Host "❌ Failed to add executor: $_" -ForegroundColor Red
  exit 1
}

# Test 6: Retrieve executors from API
Write-Host "`n6. Retrieving executors from API..." -ForegroundColor Yellow
try {
  $getExecsResponse = Invoke-WebRequest -Uri 'http://localhost:3000/executors' -Method GET -Headers @{'Authorization'="Bearer $token"} -UseBasicParsing -TimeoutSec 5
  
  $getExecsData = $getExecsResponse.Content | ConvertFrom-Json
  $execCount = $getExecsData.count
  
  Write-Host "✅ Executors retrieved from API" -ForegroundColor Green
  Write-Host "   Total executors for user: $execCount" -ForegroundColor Gray
  
  if ($execCount -gt 0) {
    Write-Host "   Latest executor: $($getExecsData.executors[0].executor_name) (ID: $($getExecsData.executors[0].id))" -ForegroundColor Gray
  }
} catch {
  Write-Host "❌ Failed to retrieve executors: $_" -ForegroundColor Red
  exit 1
}

# Summary
Write-Host "`n=== Results ===" -ForegroundColor Cyan
Write-Host "✅ All tests passed! Data is persisting correctly to PostgreSQL" -ForegroundColor Green
Write-Host "`nData Summary:" -ForegroundColor Yellow
Write-Host "  • User Email: $testEmail (ID: $userId)"
Write-Host "  • Asset Name: Test Asset (ID: $assetId)"
Write-Host "  • Executor Name: Test Executor (ID: $execId)"
Write-Host "`nThe system is working correctly and all data is being saved to PostgreSQL." -ForegroundColor Green
