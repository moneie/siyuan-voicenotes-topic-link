@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed. Install a supported Node.js LTS version first.
  pause
  exit /b 1
)

echo [1/3] Installing build dependencies (internet connection required)...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed. Check network access and try again.
  pause
  exit /b 1
)

echo [2/3] Building plugin...
call npm run build
if errorlevel 1 (
  echo ERROR: build failed.
  pause
  exit /b 1
)

if exist release rmdir /s /q release
mkdir release
copy /y dist\index.js release\index.js >nul
copy /y dist\plugin.json release\plugin.json >nul
copy /y dist\README.md release\README.md >nul

echo [3/3] Creating install ZIP with required files at ZIP root...
if exist siyuan-voicenotes-topic-link-0.1.4.zip del /q siyuan-voicenotes-topic-link-0.1.4.zip
powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path 'release\*' -DestinationPath 'siyuan-voicenotes-topic-link-0.1.4.zip' -Force"
if errorlevel 1 (
  echo ERROR: Could not create ZIP. The built files are in the release folder.
  pause
  exit /b 1
)
echo.
echo SUCCESS: siyuan-voicenotes-topic-link-0.1.4.zip was created.
echo IMPORTANT: ZIP contents must directly contain index.js, plugin.json and README.md.
echo This ZIP is the installable plugin package. Do not install the source project ZIP itself.
pause
