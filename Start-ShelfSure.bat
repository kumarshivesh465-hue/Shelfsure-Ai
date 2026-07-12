@echo off
title ShelfSure AI
cd /d "%~dp0"

echo ==================================================
echo    ShelfSure AI  -  starting up
echo ==================================================
echo.

REM ---- Build the interface on first run (or if it was removed) ----
if not exist "frontend\dist\index.html" (
    echo First-time setup: building the app interface...
    echo This may take a minute. Please wait.
    echo.
    pushd frontend
    call npm run build
    popd
    echo.
    if not exist "frontend\dist\index.html" (
        echo [ERROR] The interface failed to build.
        echo Make sure Node.js is installed, then run this file again.
        echo.
        pause
        exit /b 1
    )
)

echo Launching ShelfSure AI...
echo.
echo   Keep THIS window open while you use the app.
echo   Closing the app window will shut everything down.
echo.

pushd electron
call npm start
popd

echo.
echo ShelfSure AI has closed.
