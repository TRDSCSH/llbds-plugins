@echo off
set /a restart_count=1

:monitor
tasklist | find /i "bedrock_server_mod.exe" > nul
if %errorlevel% neq 0 (
    echo [%date% %time%] [%restart_count%] Restarting...
    start /min "" "C:\Users\Administrator\Desktop\LeviLamina\bedrock_server_mod.exe"
    set /a restart_count+=1
)
timeout /t 10 /nobreak > nul
goto monitor
