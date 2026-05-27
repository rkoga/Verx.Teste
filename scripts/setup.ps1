# Cash Flow System - Setup Script (PowerShell)
# This script sets up the complete backend environment on Windows

# Ensure we're in the workspace root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspaceRoot = Split-Path -Parent $scriptPath
Set-Location $workspaceRoot

Write-Host "Working directory: $workspaceRoot" -ForegroundColor Cyan

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-ColorOutput "========================================================" "Cyan"
    Write-ColorOutput "   $Message" "Cyan"
    Write-ColorOutput "========================================================" "Cyan"
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-ColorOutput "$Message" "Yellow"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[OK] $Message" "Green"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

# Main setup
Write-Header "Cash Flow System - Complete Backend Setup"

# [1/11] Check Node.js installation
Write-Step "[1/11] Checking Node.js installation..."
try {
    $nodeVersion = node -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js $nodeVersion found"
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-ErrorMessage "Node.js is not installed. Please install Node.js 20+ first."
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# [2/11] Check Docker installation
Write-Step "[2/11] Checking Docker installation..."
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$dockerVersion found"
    } else {
        throw "Docker not found"
    }
} catch {
    Write-ErrorMessage "Docker is not installed. Please install Docker Desktop first."
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# [3/11] Check Docker Compose installation
Write-Step "[3/11] Checking Docker Compose installation..."
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$composeVersion found"
    } else {
        throw "Docker Compose not found"
    }
} catch {
    Write-ErrorMessage "Docker Compose is not installed. Please install Docker Compose first."
    Write-Host "Usually included with Docker Desktop on Windows" -ForegroundColor Yellow
    exit 1
}

# [4/11] Setup environment variables
Write-Step "[4/11] Setting up environment variables..."
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Success "Created .env file from .env.example"
} else {
    Write-Info ".env file already exists, skipping..."
}

# [5/11] Install root dependencies
Write-Step "[5/11] Installing root dependencies..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Root dependencies installed"
} else {
    Write-ErrorMessage "Failed to install root dependencies"
    exit 1
}

# [6/11] Install shared module dependencies
Write-Step "[6/11] Installing shared module dependencies..."
Push-Location shared
npm install
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Success "Shared module dependencies installed"
} else {
    Write-ErrorMessage "Failed to install shared module dependencies"
    exit 1
}

# [7/11] Install transactions service dependencies
Write-Step "[7/11] Installing transactions service dependencies..."
Push-Location services/transactions
npm install
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Success "Transactions service dependencies installed"
} else {
    Write-ErrorMessage "Failed to install transactions service dependencies"
    exit 1
}

# [8/11] Install consolidation service dependencies
Write-Step "[8/11] Installing consolidation service dependencies..."
Push-Location services/consolidation
npm install
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Success "Consolidation service dependencies installed"
} else {
    Write-ErrorMessage "Failed to install consolidation service dependencies"
    exit 1
}

# [9/11] Install reporting service dependencies
Write-Step "[9/11] Installing reporting service dependencies..."
Push-Location services/reporting
npm install
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Success "Reporting service dependencies installed"
} else {
    Write-ErrorMessage "Failed to install reporting service dependencies"
    exit 1
}

# [10/11] Start infrastructure services
Write-Step "[10/11] Starting infrastructure services (PostgreSQL, Redis, RabbitMQ)..."
docker-compose up -d postgres redis rabbitmq
if ($LASTEXITCODE -eq 0) {
    Write-Success "Infrastructure services started"
} else {
    Write-ErrorMessage "Failed to start infrastructure services"
    exit 1
}

# Wait for services to be ready
Write-Step "Waiting for services to be ready (30 seconds)..."
Start-Sleep -Seconds 30
Write-Success "Services should be ready now"

# [11/11] Setup databases and run migrations for all services
Write-Step "[11/11] Setting up databases and running migrations..."

# Ask user if they want to reset databases
Write-Host ""
Write-ColorOutput "Do you want to reset the databases? This will delete all existing data." "Yellow"
Write-ColorOutput "Type 'yes' to reset, or press Enter to skip: " "Yellow" -NoNewline
$resetDb = Read-Host

if ($resetDb -eq "yes") {
    Write-Info "Resetting databases..."
    
    # Reset Transactions DB
    Push-Location services/transactions
    Write-Info "Resetting Transactions database..."
    npx prisma migrate reset --force --skip-seed
    Pop-Location
    
    # Reset Consolidation DB
    Push-Location services/consolidation
    Write-Info "Resetting Consolidation database..."
    npx prisma migrate reset --force --skip-seed
    Pop-Location
    
    # Reset Reporting DB
    Push-Location services/reporting
    Write-Info "Resetting Reporting database..."
    npx prisma migrate reset --force --skip-seed
    Pop-Location
    
    Write-Success "All databases reset successfully"
} else {
    Write-Info "Skipping database reset"
}

# Transactions Service
Write-Info "Setting up Transactions Service database..."
Push-Location services/transactions
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-ErrorMessage "Failed to generate Prisma Client for Transactions Service"
    exit 1
}

if ($resetDb -ne "yes") {
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-ErrorMessage "Failed to run migrations for Transactions Service. Try running with database reset."
        exit 1
    }
}
Pop-Location
Write-Success "Transactions Service database ready"

# Consolidation Service
Write-Info "Setting up Consolidation Service database..."
Push-Location services/consolidation
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-ErrorMessage "Failed to generate Prisma Client for Consolidation Service"
    exit 1
}

if ($resetDb -ne "yes") {
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-ErrorMessage "Failed to run migrations for Consolidation Service. Try running with database reset."
        exit 1
    }
}
Pop-Location
Write-Success "Consolidation Service database ready"

# Reporting Service
Write-Info "Setting up Reporting Service database..."
Push-Location services/reporting
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-ErrorMessage "Failed to generate Prisma Client for Reporting Service"
    exit 1
}

if ($resetDb -ne "yes") {
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-ErrorMessage "Failed to run migrations for Reporting Service. Try running with database reset."
        exit 1
    }
}
Pop-Location
Write-Success "Reporting Service database ready"

# Success message
Write-Host ""
Write-ColorOutput "========================================================" "Green"
Write-ColorOutput "   Setup completed successfully!" "Green"
Write-ColorOutput "========================================================" "Green"

Write-Host ""
Write-ColorOutput "Next steps:" "Cyan"
Write-Host "  1. Start all services using one of these methods:"
Write-Host ""
Write-ColorOutput "     Option A - Start all services at once:" "Yellow"
Write-ColorOutput "       .\start-all-services.ps1" "Yellow"
Write-Host ""
Write-ColorOutput "     Option B - Start services individually:" "Yellow"
Write-ColorOutput "       cd services/transactions; npm run dev" "Yellow"
Write-ColorOutput "       cd services/consolidation; npm run dev" "Yellow"
Write-ColorOutput "       cd services/reporting; npm run dev" "Yellow"

Write-Host ""
Write-Host "  2. Access the services:"
Write-ColorOutput "     - Transactions API: http://localhost:3001" "Yellow"
Write-ColorOutput "     - Consolidation API: http://localhost:3002" "Yellow"
Write-ColorOutput "     - Reporting API: http://localhost:3003" "Yellow"
Write-ColorOutput "     - PostgreSQL: localhost:5432" "Yellow"
Write-ColorOutput "     - Redis: localhost:6379" "Yellow"
Write-ColorOutput "     - RabbitMQ Management: http://localhost:15672 (guest/guest)" "Yellow"
Write-ColorOutput "     - Prometheus: http://localhost:9090" "Yellow"
Write-ColorOutput "     - Grafana: http://localhost:3000 (admin/admin)" "Yellow"

Write-Host ""
Write-Host "To stop infrastructure services:" -ForegroundColor Cyan
Write-ColorOutput "  docker-compose down" "Yellow"
Write-Host ""

# Made with Bob
