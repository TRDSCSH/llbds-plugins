# encoding:utf-8
import sys
from pathlib import Path
import os
if os.name == "nt":
    os.system("") #启用彩色输出
try:
    import cv2
except:
    sys.stderr.write('The cv2 library was not found. Please install the cv2 library using the following command\npip install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python\n')
    sys.exit(403)

args = sys.argv[1:]
res = []
for arg in args:
    imgPath = Path(arg)
    if not imgPath.is_file():
        sys.stderr.write('未找到指定文件: '+str(imgPath)+'\n')
        sys.exit(404)
    if imgPath.suffix not in ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', ".JPEG"]:
        sys.stderr.write('仅支持 .jpg 与 .png 格式\n')
        sys.exit(404)
    img = cv2.imread(str(imgPath))	
    res.append(f'{img.shape[1]}x{img.shape[0]}')
print(",".join(res))
sys.exit(0)