<# :
:: Header to create Batch/PowerShell hybrid
@echo off
cd %~dp0
echo �˽ű������ڵ�ǰ�ļ��а�װQsign
echo ��ȷ���ű���������ȷ���ļ��У�
pause
setlocal
set "POWERSHELL_BAT_ARGS=%*"
if defined POWERSHELL_BAT_ARGS set "POWERSHELL_BAT_ARGS=%POWERSHELL_BAT_ARGS:"=\"%"
endlocal & powershell -NoLogo -NoProfile -Command "$_ = $input; Invoke-Expression $( '$input = $_; $_ = \"\"; $args = @( &{ $args } %POWERSHELL_BAT_ARGS% );' + [String]::Join( [char]10, $( Get-Content \"%~f0\" ) ) )"

:: Any batch code that gets run after your PowerShell goes here
pause
goto :EOF
#>

Import-Module BitsTransfer

if (Test-Path -Path ".\bin\unidbg-fetch-qsign.bat" -PathType Leaf)
{
    Write-Host "��ǰ�ļ������Ѿ���һ��Qsign��װ!" -ForegroundColor red
    Exit
}

Try 
{
	Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction Stop
	function Unzip
	{
		param([string]$zipfile, [string]$outpath)

		[System.IO.Compression.ZipFile]::ExtractToDirectory($zipfile, $outpath)
	}
}
Catch {
	if (-Not (Test-Path -Path ".\unzip.exe" -PathType Leaf))
	{
		$ZipURL = "https://ghproxy.com/https://github.com/rhwong/unidbg-fetch-qsign-onekey/releases/download/tools/unzip.exe"
		Start-BitsTransfer -Source $ZipURL -Destination ".\unzip.exe"
	}
	
	if (-Not (Test-Path -Path ".\unzip.exe" -PathType Leaf))
	{
		Write-Host "�޷�����Unzip" -ForegroundColor red
		Exit
	}
	
	function Unzip
	{
		param([string]$zipfile, [string]$outpath)

		& .\unzip.exe $zipfile -d $outpath
	}
}

Write-Host "���Git"
$GitURL = "https://ghproxy.com/https://github.com/rhwong/unidbg-fetch-qsign-onekey/releases/download/tools/MinGit-Windows-x86.zip"
$GIT = ""

Try 
{
	$Command = Get-Command -Name git -ErrorAction Stop
	$GIT = "git"
}
Catch {}

Try 
{
	$Command = Get-Command -Name ".\git\cmd\git" -ErrorAction Stop
	$GIT = ".\git\cmd\git"
}
Catch {}

if ($GIT -eq "")
{
	Start-BitsTransfer -Source $GitURL -Destination ".\git.zip"
	Unzip ".\git.zip" ".\git\"
	Remove-Item ".\git.zip"
	Try 
	{
		$Command = Get-Command -Name ".\git\cmd\git" -ErrorAction Stop
		$GIT = ".\git\cmd\git"
	}
	Catch 
	{
		Write-Host "�޷�����Git!" -ForegroundColor red
		Exit
	}
}

Write-Host "Git: $GIT" -ForegroundColor green
Remove-Item -Path .\.git -Recurse -ErrorAction SilentlyContinue

& $GIT init -b main
& $GIT remote add origin http://ghproxy.com/https://github.com/rhwong/unidbg-fetch-qsign-onekey
& $GIT fetch --depth=1
& $GIT checkout main
Write-Host "��װ�ɹ�!" -ForegroundColor green