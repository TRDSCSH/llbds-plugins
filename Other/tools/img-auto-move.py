import schedule
import time
import shutil
import os

print('[定时移动]');

# 定义文件夹路径
source_folder = r"C:\Users\Administrator\Desktop\LeviLamina\plugins\CustomGetMap\.img"
destination_folder = r"C:\Users\Administrator\Desktop\img_old"

print(f'源: {source_folder}\n目标: {destination_folder}')

# 定义移动文件的函数
def move_files():
    # 遍历源文件夹中的所有文件
    for filename in os.listdir(source_folder):
        # 构造完整的源文件路径
        source_file = os.path.join(source_folder, filename)
        # 构造完整的目标文件路径
        destination_file = os.path.join(destination_folder, filename)
        
        # 移动文件
        shutil.move(source_file, destination_file)
        print(f"Moved {source_file} to {destination_file}")

# 设置计划任务，每天凌晨 1:27 执行
schedule.every().day.at("01:27").do(move_files)

# 运行计划任务
while True:
    schedule.run_pending()
    time.sleep(60)  # 每分钟检查一次计划任务
