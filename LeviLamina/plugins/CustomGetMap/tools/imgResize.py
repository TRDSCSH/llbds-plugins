# encoding:utf-8
import sys
from pathlib import Path
import os
if os.name == "nt":
    os.system("") #启用彩色输出
try:
    import cv2
except:
    # logger.error('未找到cv2库, 请用以下命令安装cv2库')
    # logger.error('pip install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python')
    sys.stderr.write('The cv2 library was not found. Please install the cv2 library using the following command\npip install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python\n')
    sys.exit(403)

#----------------------------------------------------
# 读取路径
if len(sys.argv) >= 2:
	imgPath = Path(sys.argv[1])

if "-shape" not in sys.argv:
	# 参数不足
	if len(sys.argv) == 3:
		sys.stderr.write('参数不足 [图片路径] [Width] [height] [interpolation]\n')
		sys.exit(100)

	# 缩放尺寸
	if len(sys.argv) >= 4:
		new_width = sys.argv[2]
		new_height = sys.argv[3]

		if not(new_width.isdigit() and new_height.isdigit()):
			sys.stderr.write('参数错误 [图片路径] [Width] [height] 须为正整数\n')
			sys.exit(100)

		new_width = int(new_width)
		new_height = int(new_height)
		if new_width == 0 or  new_height == 0:
			sys.stderr.write('参数错误 [图片路径] [Width] [height] 须为正整数\n')
			sys.exit(100)

	# 插值选项
	Interpolation = cv2.INTER_AREA
	if len(sys.argv) >= 5:
		if sys.argv[4] ==  "nearest":
			Interpolation = cv2.INTER_NEAREST
		elif sys.argv[4] ==  "linear":
			Interpolation = cv2.INTER_LINEAR
		elif sys.argv[4] ==  "cubic":
			Interpolation = cv2.INTER_CUBIC
		elif sys.argv[4] ==  "area":
			Interpolation = cv2.INTER_AREA
		else:
			sys.stderr.write('参数错误 [interpolation]\nnearest: 最近邻插值\nlinear: 双线性插值\ncubic: 三次样条插值\narea: 使用像素区域关系重新采样(默认)\n')
			sys.exit(100)

	# cv2.INTER_NEAREST 最近邻插值
	# cv2.INTER_LINEAR 双线性插值
	# cv2.INTER_CUBIC 双线性插值
	# cv2.INTER_AREA 使用像素区域关系重新采样。它可能是图像抽取的首选方法。
	# 通常的，缩小使用cv.INTER_AREA，放缩使用cv.INTER_CUBIC(较慢)和cv.INTER_LINEAR(较快效果也不错)。
	# 默认情况下，所有的放缩都使用cv.INTER_LINEAR。

#----------------------------------------------------
# 定义

# 计算图片可能的缩小尺寸
def getShapes(w, h):
    if h < w:
        order = False
        n, m = h, w
    else:
        order = True
        n, m = w, h
    result = []
    n_share = int(n/128)
    m_share = int(m/128)
    ratio = n / m
    #print(f'原始近似比例: {n_share} {m_share}')
    
    for i in range(n_share):
        n_new = n_share - i
        m_new = int((n_share - i) /  ratio )
        if (order == True):
            result.append([n_new, m_new])
        else:
            result.append([m_new, n_new])
    return result

class logger:
	def info(msg):
		print(f'\033[96m{msg}\033[0m')
	def oper(msg):
		print(f'\033[92m{msg}\033[0m')
	def warn(msg):
		print(f'\033[93m{msg}\033[0m')
	def error(msg):
		print(f'\033[91m{msg}\033[0m')
	def fatal(msg):
		print(f'\033[31m{msg}\033[0m')
	def debug(msg):
		print(f'\033[90m{msg}\033[0m')

#----------------------------------------------------
# 用户界面模式
if len(sys.argv) == 1 or len(sys.argv) == 2:
	logger.oper('\n-- 图片压缩裁剪程序(CustomGetMap) | by Wn1027 --')
	logger.oper('- '*24)

#----------------------------------------------------
# 输入图片名
if len(sys.argv) == 1:
	imgPath = input('\033[92m请输入要转换的图片名(带后缀): \033[90m可输入图片路径 | 输入 q 退出程序\n\033[96m图片路径: \033[0m')
	if imgPath == 'q':
		sys.exit(0)
	imgPath = Path(imgPath)

#-----------------------------------------------------
# 读取图片文件	
if not imgPath.is_file():
	sys.stderr.write('未找到指定文件: '+str(imgPath)+'\n')
	sys.exit(404)
if imgPath.suffix not in ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', ".JPEG"]:
	sys.stderr.write('仅支持 .jpg 与 .png 格式\n')
	sys.exit(404)
img = cv2.imread(str(imgPath))	

#-----------------------------------------------------
# 获取尺寸功能
if "-shape" in sys.argv:
	print(f'{img.shape[1]},{img.shape[0]}') # width,height (cv2读取的是img.shape = [height, width])
	sys.exit(0)

#-----------------------------------------------------
# 确认尺寸
# 拖放文件 或 只输入了路径，手动确认尺寸
if len(sys.argv) == 1 or len(sys.argv) == 2:
	new_width = int(img.shape[1] / 128) * 128
	new_height = int(img.shape[0] / 128) * 128
	logger.info(f'原始尺寸: {img.shape[1]} × {img.shape[0]}')
	if (new_width <= 128) or (new_height <= 128):
		logger.info('该尺寸已经很小, 无需处理\n')
		os.system('pause')
		sys.exit(0)

	shapes = getShapes(img.shape[1], img.shape[0])
	for i in range(len(shapes)):
		print(f'# {i+1} | {shapes[i][0]*128} × {shapes[i][1]*128} | 将生成 {shapes[i][0]} × {shapes[i][1]} = {shapes[i][0]*shapes[i][1]} 张地图')
		
	while 1:
		choice = input('\033[92m请选择想要的尺寸\033[90m(输入 q 退出程序):\033[0m ')
		if choice == "q":
			sys.exit(0)
		if choice.isdigit():
			if (1 <= int(choice) <= len(shapes)):
				new_width = shapes[int(choice)-1][0]*128
				new_height = shapes[int(choice)-1][1]*128
				break
			else:
				logger.error(f'请输入正确的序号, 应当在 1 - {len(shapes)} 之间')
				continue
		else:
			logger.error(f'请输入正确的序号, {choice} 不是数字')
			continue

#-----------------------------------------------------
# 图片处理
logger.info(f'原始尺寸: {img.shape[1]} × {img.shape[0]} | 已选择尺寸: {new_width} × {new_height} | 将生成 {int(new_width/128)} × {int(new_height/128)} = {int(new_width/128)*int(new_height/128)} 张地图')
if int(new_width/128) < 30 and int(new_height/128) < 10 :
	for i in range(int(new_height/128)):
		logger.debug('     '+'■ ' * int(new_width/128));
smallimg = cv2.resize(img, (new_width, new_height), interpolation = Interpolation)

#-----------------------------------------------------
# 图片保存
dir_name, file_name = os.path.split(imgPath)
#cv2.imshow('preview',smallimg)
if dir_name == '':
	cv2.imwrite('./r-'+file_name, smallimg)
else:
	cv2.imwrite(dir_name+'/r-'+file_name, smallimg)
print('图片已保存至 '+dir_name+'/r-'+file_name)
sys.exit(0)

#-----------------------------------------------------
# 其他

#辗转相除
def gcd(a, b):
    m=max(a,b)
    n=min(a,b)
    t=m%n
    while t!=0:
        m,n=n,t # 每个除式的m、n是都是上一个式子的n和余数
        t=m%n #  更新余数
    return n
