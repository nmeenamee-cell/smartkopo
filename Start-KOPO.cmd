@echo off
setlocal
cd /d "%~dp0"
set "KOPO_NODE="
for /f "delims=" %%I in ('where node.exe 2^>nul') do if not defined KOPO_NODE set "KOPO_NODE=%%I"
if not defined KOPO_NODE set "KOPO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%KOPO_NODE%" (
  echo Node.js 24 is required. Install Node.js, then run pnpm install.
  pause
  exit /b 1
)
if not exist "node_modules\typescript\bin\tsc" (
  echo Dependencies are missing. Run pnpm install --frozen-lockfile first.
  pause
  exit /b 1
)
echo Starting KOPO NEXT at http://127.0.0.1:3100/
echo Keep this window open. Press Ctrl+C to stop.
"%KOPO_NODE%" scripts\dev.mjs
pause
