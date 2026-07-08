@echo off
title Sentinel AI - Startup Control
echo ==============================================================
echo              SENTINEL AI AUTONOMOUS RECOVERY
echo ==============================================================
echo.
echo Preparing containerized setup...
echo Make sure Docker Desktop is running.
echo.
echo [1] Launch full application via Docker Compose (Recommended - includes MongoDB, Redis, Backend, Frontend)
echo [2] Run Backend only (requires local MongoDB and Redis)
echo [3] Run Frontend only
echo.
set /p choice="Enter execution profile [1-3]: "

if "%choice%"=="1" (
    echo Launching docker-compose up --build...
    docker-compose up --build
) else if "%choice%"=="2" (
    echo Launching Backend FastAPI...
    cd backend
    pip install -r requirements.txt
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else if "%choice%"=="3" (
    echo Launching Frontend Next.js...
    cd frontend
    npm install --legacy-peer-deps
    npm run dev
) else (
    echo Invalid choice. Starting full containerized stack as fallback...
    docker-compose up --build
)
pause
