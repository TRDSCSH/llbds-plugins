
# param(
#     [Parameter()]
# )
[system.reflection.assembly]::loadwithpartialname("System.Drawing") | Out-Null
$res = ""
for($x=0; $x -lt $args.Length; $x=$x+1)   
{   
    try {
        $objPic = [System.Drawing.Image]::FromFile($args[$x])
        $size = "{0}x{1}" -f $objPic.width, $objPic.height
        $objPic.Dispose()
    }catch{
        $size = "NaNxNaN"
    }
    if(-not($res -eq "")) {
        $res += ","
    }
    $res += $size
}
Write-Output $res
exit 0