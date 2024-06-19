param(
    [Parameter()]
    [string]$path,
    [int]$Width,
    [int]$Height
)
[system.reflection.assembly]::loadwithpartialname("System.Drawing") | Out-Null
try {
    $img=[System.Drawing.Image]::FromFile($path)
    $size = New-Object System.Drawing.Size($Width,$Height)
    $bitmap =  New-Object System.Drawing.Bitmap($img,$size)
    $img.Dispose()
    $imgFolder = Split-Path $path 
    $imgname = Split-Path $path -Leaf
    $bitmap.Save("$imgFolder\r-$imgname")
    $bitmap.Dispose()
}catch{
    Write-Output $_.Exception.Message
    exit 1
}
exit 0