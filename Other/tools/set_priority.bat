@echo off
chcp 65001
setlocal

:CHECK_PROCESS
REM Check if bedrock_server_mod.exe is running
tasklist /FI "IMAGENAME eq bedrock_server_mod.exe" | find /I "bedrock_server_mod.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo bedrock_server_mod.exe is running.
    REM Set the process priority to high
    wmic process where name="bedrock_server_mod.exe" CALL setpriority "256"
    echo The priority of bedrock_server_mod.exe has been set to high.
) else (
    echo bedrock_server_mod.exe is not running.
)

REM Wait for 60 seconds and then check again
timeout /t 60 /nobreak >nul
goto CHECK_PROCESS

endlocal
exit /b
