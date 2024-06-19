# 本脚本由作者Yhzx233编写
# Wn1027进行了修复与适配

ver = [2,0,0] #2023.6.13

import time
start = time.time()

import sys
try:
    import cv2
except:
    sys.stderr.write('The cv2 library was not found. Please install the cv2 library using the following command\npip install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python\n')
    sys.exit(403)
import numpy as np
import os
import argparse

# 用法: python pyimg2bin.py -f <file> -d <dir> -W <width> -H <height>

parser = argparse.ArgumentParser()
parser.add_argument("-f", "--file", help="input file")
parser.add_argument("-d", "--dir", help="output dir")
parser.add_argument("-W", "--width", help="width")
parser.add_argument("-H", "--height", help="height")
args = parser.parse_args()

# 读取参数
file = args.file
dir = args.dir

if file is None:
    sys.stderr.write("Error: No input file")
    sys.exit(1)

if not os.path.exists(file):
    sys.stderr.write("Error: File not found")
    sys.exit(1)

# 读取图片
img = cv2.imread(file, cv2.IMREAD_UNCHANGED)
# 统一为RGBA格式
if len(img.shape) == 2:
    img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGBA)
elif img.shape[2] == 3:
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
elif img.shape[2] == 4:
    img = cv2.cvtColor(img, cv2.COLOR_BGRA2RGBA)

if args.width is None or args.height is None:
    # 分割为128*128的小图片（不足的补白）
    size = img.shape[:2]
    size = (size[1] // 128, size[0] // 128)
    if size[1] * 128 < img.shape[0]:
        size = (size[0], size[1] + 1)
    if size[0] * 128 < img.shape[1]:
        size = (size[0] + 1, size[1])
    # 补白
    white = np.zeros((size[1] * 128, size[0] * 128, 4), dtype=np.uint8)
    white[:img.shape[0], :img.shape[1]] = img
    img = white
else:
    size = (int(args.width), int(args.height))
    img = cv2.resize(img, (size[1] * 128, size[0] * 128), interpolation=cv2.INTER_LANCZOS4)

if dir is None:
    dir = os.path.splitext(file)[0]
    sys.stderr.write("Warning: No output dir, use default dir: " + dir)

if not os.path.exists(dir):
    os.makedirs(dir)

def convert_bin(arr : np.ndarray, output : str):
    # 序列化
    arr = arr.reshape((128 * 128 * 4))
    arr = arr.tobytes()
    with open(output, "wb") as f:
        f.write(arr)

for i in range(size[0]): 
    for j in range(size[1]):
        slice = img[j * 128: (j + 1) * 128, i * 128: (i + 1) * 128]
        convert_bin(slice, os.path.join(dir, f"{os.path.splitext(os.path.basename(file))[0]}-{i}_{j}"))

end = time.time()
sys.stderr.write(f"Time: {end - start}s")
sys.exit(0)