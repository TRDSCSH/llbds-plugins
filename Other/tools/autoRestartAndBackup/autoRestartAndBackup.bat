@echo off
chcp 65001 >nul

setlocal EnableDelayedExpansion

set "RESTART_TIME="
for /f "usebackq delims=" %%a in ("restartTime.txt") do set "RESTART_TIME=!RESTART_TIME!%%a"

set FILE_NAME="bedrock_server_mod.exe"
set EXE_PATH=.\%FILE_NAME%
set WORLD_NAME="Bedrock level"
set WORLD_PATH=".\worlds\%WORLD_NAME%\"
set TEMP_PATH="C:\Users\Administrator\Desktop\tempBackup\"
set BACKUP_PATH="C:\Users\Administrator\Desktop\MinecraftWorldBackup\"
set /a CRASH_TIME=0
set /a IS_BACKUP_DONE=0
set DEFAULT_TIMEOUT=10

echo 【定时重启时间：%RESTART_TIME%】
echo.
echo 【当前时间：%time%】

:loop
set "RESTART_TIME="
for /f "usebackq delims=" %%a in ("restartTime.txt") do set "RESTART_TIME=!RESTART_TIME!%%a"
set CURRENT_TIME=%time:~0,5%
set filename=%WORLD_NAME: =_%_%date:~3,4%-%date:~8,2%-%date:~11,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
if "%CURRENT_TIME%"=="%RESTART_TIME%" (
    if "!IS_BACKUP_DONE!"=="1" (
        echo %CURRENT_TIME% 本次已备份
        goto check
    )

    echo 【正在尝试关闭: %EXE_PATH%】
    tasklist /FI "IMAGENAME eq %FILE_NAME%" 2>nul | find /I /N "%FILE_NAME%">nul
    if "%ERRORLEVEL%"=="0" (
        taskkill /IM %FILE_NAME% /F
    )
    echo 【正在备份】
    @REM : %WORLD_PATH%
    @REM echo 文件名: %filename%
    7z.exe a -t7z "%TEMP_PATH%%filename%" "%WORLD_PATH%" -mx=9 -mmt=on
    move %TEMP_PATH%* %BACKUP_PATH%
    echo 【备份完成，重启: %EXE_PATH%】
    start "" "%EXE_PATH%" /wait

    set /a IS_BACKUP_DONE=1
    echo ============================
    echo 重启与备份完成
    echo 日期:%date%
    echo 时间:%time%
    echo ============================
)

:check
tasklist /FI "IMAGENAME eq %FILE_NAME%" | find /I /N %FILE_NAME% >nul
if "%ERRORLEVEL%"=="1" (
    echo 【未检测到程序运行，启动: %EXE_PATH%】
    start "" "%EXE_PATH%" /wait
    set /a CRASH_TIME = %CRASH_TIME% + 1
    echo 【程序已启动 !CRASH_TIME! 次】
) else (
    if "!IS_BACKUP_DONE!"=="1" (
        echo %CURRENT_TIME% 检测到程序已经启动
        if "!CURRENT_TIME!" neq "!RESTART_TIME!" (
            set /a IS_BACKUP_DONE=0
        )
    )
)

timeout /t !DEFAULT_TIMEOUT! /nobreak >nul
goto loop

endlocal