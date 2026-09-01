param(
    [Parameter(Mandatory=$true)]
    [string]$PgPassword
)

$PG = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$env:PGPASSWORD = $PgPassword

Write-Host "[1/3] Creating posuser and posdb..." -ForegroundColor Cyan
$sql1 = @"
DO `$`$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'posuser') THEN
    CREATE ROLE posuser LOGIN PASSWORD 'pospassword';
    RAISE NOTICE 'posuser created';
  ELSE
    RAISE NOTICE 'posuser already exists';
  END IF;
END `$`$;
SELECT 'CREATE DATABASE posdb OWNER posuser' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'posdb')\gexec
GRANT ALL PRIVILEGES ON DATABASE posdb TO posuser;
"@

$sql1 | & $PG -U postgres
if ($LASTEXITCODE -ne 0) { Write-Error "Step 1 failed"; exit 1 }

Write-Host "[1b] Granting schema privileges..." -ForegroundColor Cyan
$env:PGPASSWORD = $PgPassword
"GRANT ALL ON SCHEMA public TO posuser; ALTER DATABASE posdb OWNER TO posuser;" | & $PG -U postgres -d posdb
if ($LASTEXITCODE -ne 0) { Write-Error "Schema grant failed"; exit 1 }

Write-Host "[2/3] Loading database schema..." -ForegroundColor Cyan
$env:PGPASSWORD = "pospassword"
& $PG -U posuser -d posdb -f "D:\Hunter\exView-reset\database\schema.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "Schema load failed"; exit 1 }

Write-Host "[3/3] Loading seed data..." -ForegroundColor Cyan
& $PG -U posuser -d posdb -f "D:\Hunter\exView-reset\database\seeds\seed.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "Seed load failed"; exit 1 }

Write-Host ""
Write-Host "Database ready!" -ForegroundColor Green
Write-Host "  posdb / posuser / pospassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "Now start the backend:" -ForegroundColor Cyan
Write-Host "  cd D:\Hunter\exView-reset\backend" -ForegroundColor White
Write-Host "  go run ./cmd/api/main.go" -ForegroundColor White
