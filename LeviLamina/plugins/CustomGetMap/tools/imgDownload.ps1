# -*- coding: utf-8 -*-
param(
    [Parameter()]
    [string]$filename,
    [string]$url
)
[system.reflection.assembly]::loadwithpartialname("System.Drawing") | Out-Null
try {
    Invoke-WebRequest -Uri $url -OutFile $filename
}catch{
    Write-Output $_.Exception.Message
    exit 1
}
try {
    $objPic = [System.Drawing.Image]::FromFile($filename)
    $fileInfo = Get-ChildItem -Path $filename
    Write-Output $fileInfo.Length
    $objPic.Dispose()
    exit 0
}catch{
    Write-Output "Image Data error"
    exit 1
}