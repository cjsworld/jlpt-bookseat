import os
import shutil
import tkinter as tk
from tkinter import simpledialog
from PIL import Image, ImageTk

# 获取图片文件列表
image_folder = "captcha_img_ocr/fail"
image_files = [f for f in os.listdir(image_folder) if f.endswith(".jpg")]

path_out = "captcha_img_ocr/correct"

if not os.path.exists(path_out):
        os.makedirs(path_out)

# 初始化窗口
root = tk.Tk()
root.title("Image Viewer")
root.geometry("500x300")  # 设置窗口初始大小

# 初始化图片索引
current_index = 0

# 显示图片函数
def show_image():
    global current_index
    file = image_files[current_index]
    image_path = os.path.join(image_folder, file)
    img = Image.open(image_path)
    img = img.resize((80 * 4, 25 * 4), Image.ANTIALIAS)
    img_tk = ImageTk.PhotoImage(img)

    label.config(image=img_tk)
    label.image = img_tk

# 切换图片函数
def next_image(event):
    global current_index
    file = image_files[current_index]
    user_input = entry.get()  # 获取输入框内容
    new_file = user_input.upper() + "_" + file.split("_")[1]
    shutil.move(os.path.join(image_folder, file), os.path.join(path_out, new_file))
    entry.delete(0, tk.END)  # 清空输入框内容
    current_index += 1
    if current_index == len(image_files):
        print("finish")
        exit(0)
    else:
        show_image()

# 显示第一张图片
label = tk.Label(root)
label.pack()
show_image()

# 创建输入框，等待用户输入并按下回车
entry = tk.Entry(root)
entry.bind("<Return>", next_image)
entry.pack()

# 运行主循环
root.mainloop()