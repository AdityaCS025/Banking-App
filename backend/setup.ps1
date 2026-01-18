# VaultBank Backend - Quick Setup Script

Write-Host "🏦 VaultBank Backend Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "`nChecking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL not found. Please install PostgreSQL 14+ from https://www.postgresql.org" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Set-Location -Path $PSScriptRoot

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please update it with your configuration." -ForegroundColor Green
    Write-Host "  Important: Set DB_PASSWORD, JWT secrets, and EMAIL credentials" -ForegroundColor Yellow
} else {
    Write-Host "`n.env file already exists" -ForegroundColor Green
}

# Database setup
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Database Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$setupDb = Read-Host "Do you want to set up the database now? (y/n)"

if ($setupDb -eq "y") {
    $dbName = Read-Host "Enter database name (default: vaultbank)"
    if ([string]::IsNullOrWhiteSpace($dbName)) {
        $dbName = "vaultbank"
    }

    $dbUser = Read-Host "Enter PostgreSQL username (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) {
        $dbUser = "postgres"
    }

    Write-Host "`nCreating database '$dbName'..." -ForegroundColor Yellow
    & psql -U $dbUser -c "CREATE DATABASE $dbName;" 2>$null
    
    Write-Host "Running schema.sql..." -ForegroundColor Yellow
    & psql -U $dbUser -d $dbName -f "database/schema.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database schema created successfully" -ForegroundColor Green
        
        $seedData = Read-Host "`nDo you want to load sample data? (y/n)"
        if ($seedData -eq "y") {
            Write-Host "Loading seed data..." -ForegroundColor Yellow
            & psql -U $dbUser -d $dbName -f "database/seed.sql"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Sample data loaded successfully" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✗ Failed to create database schema" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your configuration" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Test the API at http://localhost:5000/health" -ForegroundColor White
Write-Host "4. Check README.md for API documentation`n" -ForegroundColor White

Write-Host "Test credentials (if you loaded sample data):" -ForegroundColor Yellow
Write-Host "  Customer: john.doe@gmail.com / Test@123" -ForegroundColor White
Write-Host "  Admin: admin@vaultbank.com / Test@123`n" -ForegroundColor White

Write-Host "Happy coding! 🚀" -ForegroundColor Green
