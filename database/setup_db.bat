@echo off
REM POS Database Setup Script for Windows
REM Usage: setup_db.bat <postgres_password>

SET PG_BIN=C:\Program Files\PostgreSQL\17\bin
SET PGPASSWORD=%1

IF "%1"=="" (
    echo Usage: setup_db.bat ^<postgres_password^>
    echo Example: setup_db.bat mypassword
    exit /b 1
)

echo [1/3] Creating posuser and rms database...
"%PG_BIN%\psql.exe" -U postgres -f database\setup_local.sql
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create user/database. Check your postgres password.
    exit /b 1
)

echo [2/3] Loading schema...
"%PG_BIN%\psql.exe" -U posuser -d rms -f database\schema.sql
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to load schema.
    exit /b 1
)

echo [3/3] Loading seed data...
"%PG_BIN%\psql.exe" -U posuser -d rms -f database\seeds\seed.sql
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to load seeds.
    exit /b 1
)

echo.
echo SUCCESS! Database is ready.
echo   Host:     localhost:5432
echo   Database: rms
echo   User:     posuser
echo   Password: pospassword
