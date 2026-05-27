# Test Transactions Service
Write-Host "=== Testing Transactions Service ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api/v1"

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "Success: Health Check OK" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Failed: Health Check - $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Create Transaction (CREDIT)
Write-Host "2. Creating CREDIT Transaction..." -ForegroundColor Yellow
$creditTransaction = @{
    amount = 1000.50
    type = "CREDIT"
    date = (Get-Date).ToString("yyyy-MM-dd")
    description = "Test Credit Transaction"
    idempotencyKey = [guid]::NewGuid().ToString()
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method POST -Body $creditTransaction -ContentType "application/json"
    Write-Host "Success: Transaction Created - $($response.id)" -ForegroundColor Green
    $creditId = $response.id
    $response | ConvertTo-Json
} catch {
    Write-Host "Failed: Create Transaction - $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create Transaction (DEBIT)
Write-Host "3. Creating DEBIT Transaction..." -ForegroundColor Yellow
$debitTransaction = @{
    amount = 500.25
    type = "DEBIT"
    date = (Get-Date).ToString("yyyy-MM-dd")
    description = "Test Debit Transaction"
    idempotencyKey = [guid]::NewGuid().ToString()
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method POST -Body $debitTransaction -ContentType "application/json"
    Write-Host "Success: Transaction Created - $($response.id)" -ForegroundColor Green
    $debitId = $response.id
    $response | ConvertTo-Json
} catch {
    Write-Host "Failed: Create Transaction - $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Transaction by ID
if ($creditId) {
    Write-Host "4. Getting Transaction by ID..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/transactions/$creditId" -Method GET
        Write-Host "Success: Transaction Retrieved" -ForegroundColor Green
        $response | ConvertTo-Json
    } catch {
        Write-Host "Failed: Get Transaction - $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: List Transactions
Write-Host "5. Listing Transactions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions?limit=10" -Method GET
    Write-Host "Success: Transactions Listed - $($response.total) total" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: List Transactions - $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Cancel Transaction
if ($creditId) {
    Write-Host "6. Cancelling Transaction..." -ForegroundColor Yellow
    $cancelData = @{
        reason = "Test cancellation"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/transactions/$creditId/cancel" -Method PATCH -Body $cancelData -ContentType "application/json"
        Write-Host "Success: Transaction Cancelled" -ForegroundColor Green
        $response | ConvertTo-Json
    } catch {
        Write-Host "Failed: Cancel Transaction - $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 7: Verify Cancelled Transaction
if ($creditId) {
    Write-Host "7. Verifying Cancelled Transaction..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/transactions/$creditId" -Method GET
        Write-Host "Success: Transaction Status - $($response.status)" -ForegroundColor Green
        $response | ConvertTo-Json
    } catch {
        Write-Host "Failed: Verify Transaction - $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== Tests Complete ===" -ForegroundColor Cyan

# Made with Bob
