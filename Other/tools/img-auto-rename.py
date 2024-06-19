import os
import re
import string
from PIL import Image
import time

# 指定目录路径
directory_to_watch = r"C:\Users\Administrator\Desktop\LeviLamina\plugins\CustomGetMap\.img"

# 判断文件是否为图片文件
def is_image_file(file_path):
    try:
        with Image.open(file_path) as img:
            img.verify()  # 验证图片文件
        return True
    except Exception:
        return False

# 判断文件名是否包含非 ASCII 码字符
def has_non_ascii(filename):
    return any(char not in string.printable for char in filename)

# 获取唯一的文件名
def get_unique_filename(directory, filename):
    base_name, ext = os.path.splitext(filename)
    counter = 1
    new_filename = filename
    while os.path.exists(os.path.join(directory, new_filename)):
        new_filename = f"{base_name}_{counter}{ext}"
        counter += 1
    return new_filename

# 定期检查目录中的文件
def check_directory():
    while True:
        for file_name in os.listdir(directory_to_watch):
            file_path = os.path.join(directory_to_watch, file_name)
            
            # 检查是否是文件而不是目录
            if os.path.isfile(file_path):
                # 删除非图片文件
                if not is_image_file(file_path):
                    os.remove(file_path)
                    print(f"Deleted non-image file: {file_path}")
                
                # 重命名文件名包含非 ASCII 码的文件
                if has_non_ascii(file_name):
                    # 替换文件名中的非 ASCII 字符
                    new_name = ''.join([c if c in string.printable else '_' for c in file_name])
                    
                    # 获取唯一的文件名
                    new_name = get_unique_filename(directory_to_watch, new_name)
                    
                    new_file_path = os.path.join(directory_to_watch, new_name)
                    os.rename(file_path, new_file_path)
                    print(f"Renamed file: {file_path} -> {new_file_path}")
        
        # 每隔60秒检测一次
        time.sleep(60)

if __name__ == '__main__':
    print(f"[自动重命名和删除非图片文件] Monitoring directory: {directory_to_watch}")
    check_directory()
