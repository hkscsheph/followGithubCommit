@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Portfolio Update Sequence
echo ========================================
echo.

REM Clean any uncommitted submodule changes first
echo [0/6] Cleaning submodule working directories...
git submodule foreach --recursive "git clean -fd && git reset --hard" 2>nul
echo.

REM Checkout default branch in submodules
echo [0.5/6] Checking out default branches in submodules...
git submodule foreach "git checkout -B main origin/main 2>nul || git checkout -B master origin/master 2>nul || true"
echo.

REM Step 1: Gather repos
echo [1/6] Gathering latest repositories...
node scripts\gather-repos.js
if errorlevel 1 (
  echo Error: Failed to gather repos
  pause
  exit /b 1
)
echo.

REM Step 2: Clean gitmodules
echo [2/6] Cleaning .gitmodules...
node scripts\clean-gitmodules.js
if errorlevel 1 (
  echo Error: Failed to clean gitmodules
  pause
  exit /b 1
)
echo.

REM Step 3: Clean portfolio folders
echo [3/6] Cleaning portfolio folders...
node scripts\clean-submodule-folders.js
if errorlevel 1 (
  echo Error: Failed to clean folders
  pause
  exit /b 1
)
echo.

REM Step 4: Update portfolio content
echo [4/6] Updating portfolio content...
node scripts\update-portfolio.js
if errorlevel 1 (
  echo Error: Failed to update portfolio
  pause
  exit /b 1
)
echo.

REM Step 5: Generate portfolio data
echo [5/6] Generating portfolio data...
node scripts\generate-portfolio-data.js
if errorlevel 1 (
  echo Error: Failed to generate portfolio data
  pause
  exit /b 1
)
echo.

REM Step 6: Commit and push
echo [6/6] Committing changes...
git add .
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
git commit -m "Update portfolio: !mydate!"
if errorlevel 1 (
  echo Warning: No changes to commit or commit failed
) else (
  echo Pushing to remote...
  git push --recurse-submodules=no
  if errorlevel 1 (
    echo Warning: Failed to push to remote
  )
)

echo.
echo ========================================
echo   Portfolio Update Complete!
echo ========================================
echo.
pause
