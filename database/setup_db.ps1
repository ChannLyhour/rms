param(
    [Parameter(Mandatory=$true)]
    [string]$PgPassword
)

$PG = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$env:PGPASSWORD = $PgPassword

Write-Host "[1/3] Creating posuser and rms database..." -ForegroundColor Cyan
$sql1 = @"
DO `$`$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'posuser') THEN
    CREATE ROLE posuser LOGIN PASSWORD 'pospassword';
    RAISE NOTICE 'posuser created';
  ELSE
    RAISE NOTICE 'posuser already exists';
  END IF;
END `$`$;
SELECT 'CREATE DATABASE rms OWNER posuser' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rms')\gexec
GRANT ALL PRIVILEGES ON DATABASE rms TO posuser;
"@

$sql1 | & $PG -U postgres
if ($LASTEXITCODE -ne 0) { Write-Error "Step 1 failed"; exit 1 }

Write-Host "[1b] Granting schema privileges..." -ForegroundColor Cyan
$env:PGPASSWORD = $PgPassword
"GRANT ALL ON SCHEMA public TO posuser; ALTER DATABASE rms OWNER TO posuser;" | & $PG -U postgres -d rms
if ($LASTEXITCODE -ne 0) { Write-Error "Schema grant failed"; exit 1 }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "[2/3] Loading database schema..." -ForegroundColor Cyan
$env:PGPASSWORD = "pospassword"
& $PG -U posuser -d rms -f "$ScriptDir\schema.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "Schema load failed"; exit 1 }

Write-Host "[3/3] Loading seed data..." -ForegroundColor Cyan
& $PG -U posuser -d rms -f "$ScriptDir\seeds\seed.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "Seed load failed"; exit 1 }

Write-Host ""
Write-Host "Database ready!" -ForegroundColor Green
Write-Host "  rms / posuser / pospassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "Now start the backend:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  go run ./cmd/api/main.go" -ForegroundColor White
