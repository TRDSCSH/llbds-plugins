param(
    [Parameter()]
    [string]$f, # -f <filePath> 图片路径
    [string]$d, # -d <filePath> 生成路径
    [int]$W,    # -W <Number> 宽(无效参数)
    [int]$H     # -H <Number> 高(无效参数)
)
[system.reflection.assembly]::loadwithpartialname("System.Drawing") | Out-Null

$imgFolder = Split-Path $f
$imgFileName = Split-Path $f -Leaf
$imgName = $imgFileName.Split(".")[0];
$extension = $imgFileName.Split(".")[1];
$pixelFormat = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
try {
    $image=[System.Drawing.Image]::FromFile($f)
    $size = @(0, 0)
    $size[0] = ($image.Width - $image.Width % 128)/128 + (($image.Width % 128) -gt 0)
    $size[1] = ($image.Height - $image.Height % 128)/128 + (($image.Height % 128) -gt 0)
    $newSizeW = 128*$size[0]
    $newSizeH = 128*$size[1]
    $bitmap = New-Object System.Drawing.Bitmap($newSizeW, $newSizeH, $pixelFormat)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.DrawImage($image, 0, 0, $image.Width, $image.Height)  
    Write-Output $bitmap.PixelFormat
    $imgcout = 0;
    for($x=0; $x -lt $size[0]; $x=$x+1) {
        for($y=0; $y -lt $size[1]; $y=$y+1) {
            $region = @(0 ,0 ,0, 0)
            $region[0] = $x * 128
            $region[1] = $y * 128
            $region[2] = ($x + 1) * 128
            $region[3] = ($y + 1) * 128
            Write-Output "size: $region"
            # 获取128*128图片
            $tmp = New-Object System.Drawing.Rectangle($region[0], $region[1], 128, 128)
            $mcmap = $bitmap.Clone($tmp, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            # $mcmap.Save("$d\split-$imgName_$imgcout.png")

            # 获取像素ARGB字节数组(1维)
            $tmp2 = New-Object System.Drawing.Rectangle(0, 0, $mcmap.Width, $mcmap.Height)
            $bitmapData = $mcmap.LockBits($tmp2, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $pixelFormat)
            $scan0 = $bitmapData.Scan0 # 获取像素数据的起始地址 、
            $pixelArray = New-Object byte[](128 * 128 * 4) # 创建一个数组来存储像素数据  、
            [System.Runtime.InteropServices.Marshal]::Copy($scan0, $pixelArray, 0, $pixelArray.Length) # 复制像素数据到数组中  
            # $pixelArray | Out-File -FilePath "./pixelArr.txt"
            # Write-Output $pixelArray[7]
            # $flatArray = (($pixelArray | ForEach-Object { $_ }) | ForEach-Object { $_ }) | ForEach-Object { $_ } 
            $fileStream = New-Object System.IO.FileStream("$d/$imgName-${x}_${y}", [System.IO.FileMode]::Create) # 创建 FileStream 对象，以写入模式打开（或创建）文件  
            $binaryWriter = New-Object System.IO.BinaryWriter($fileStream)  # 创建 BinaryWriter 对象，用于写入二进制数据  
            
            $pixNum = 0; # 遍历一维数组，并将每个整数转换为字节后写入文件  
            for($i=0; $i -lt $pixelArray.Length; $i=$i+1) {
                $j = $i 
                if ($i % 4 -eq 0){ # BGRA -> RGBA
                    $j = $i + 2
                }
                if ($i % 4 -eq 2){
                    $j = $i - 2
                }
                $binaryWriter.Write($pixelArray[$j]) 
                $pixNum++;
            } 
            
            # 解锁图片区域  
            $mcmap.UnlockBits($bitmapData) 
            # 释放 BinaryWriter 和 FileStream  
            $mcmap.Dispose();
            $binaryWriter.Dispose()  
            $fileStream.Dispose()  
            $imgcout =  $imgcout + 1
        }
    }
    # $bitmap.Save("$d\rbg-$imgName.png")
    $image.Dispose()
    $bitmap.Dispose()
    exit 0
}catch{
    Write-Output $_.Exception
    exit 1
}
