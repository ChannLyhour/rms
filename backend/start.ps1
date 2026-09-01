# ============================================================
# POS Backend Start Script
# Usage: .\start.ps1
# ============================================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "         POS Backend Auto Setup           " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Run DB Schema & Seeds
Write-Host "[1/2] Initializing database schema and seed data..." -ForegroundColor Cyan
go run ./cmd/init_db/main.go
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Migration failed! Check your database connection in .env" -ForegroundColor Red
    exit 1
}

# 2. Start Go Server
Write-Host ""
Write-Host "[2/2] Starting Go API server on http://localhost:8080 ..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""
go run ./cmd/server/main.go
