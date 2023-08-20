import logging
from flask import Flask, request
from flask_cors import cross_origin
from PIL import Image
from io import BytesIO
import requests
import ddddocr
import os

app = Flask(__name__)

#关闭flask的一些输出
#logging.getLogger('werkzeug').setLevel(logging.WARNING)

ocr_beta = ddddocr.DdddOcr(beta=True, show_ad=False)
ocr_old = ddddocr.DdddOcr(beta=False, show_ad=False)

#读取记录
captcha_record = {}
record_file = "captcha_record.txt"
if os.path.exists(record_file):
    with open(record_file, "r") as file:
        for line in file:
            line = line.rstrip()
            if line == "":
                continue
            l = line.split(":")
            captcha_record[l[0]] = l[1]


#验证码是4位大写字母，如果不是，说明识别错误
def process_answer(input_str):
    #检查长度是否为4
    if len(input_str) != 4:
        return ""

    input_str = input_str.replace('0', 'O') #也可能是Q
    input_str = input_str.replace('1', 'I')
    input_str = input_str.replace('5', 'S')
    input_str = input_str.replace('6', 'G')
    input_str = input_str.replace('8', 'B')

    #检查是否包含非英文字母
    if not all(c.isalpha() and c.isascii() for c in input_str):
        return ""

    return input_str.upper()

@app.route('/ocr')
@cross_origin()
def get_verification_code():
    url = request.args.get('url')

    #看是否有记录
    hash = os.path.splitext(os.path.basename(url))[0]
    if hash in captcha_record:
        ans = captcha_record[hash]
        print(f"record: {hash}: {ans}")
        return ans

    response = requests.get(url)

    if (response.status_code != 200):
        return ""

    #用新模型尝试识别
    result = ocr_beta.classification(response.content)
    print("ocr_beta: " + result)
    result = process_answer(result)
    if result != "":
        return result
    
    #用旧模型尝试识别
    result = ocr_old.classification(response.content)
    print("ocr_old: " + result)
    result = process_answer(result)
    if result != "":
        return result
    
    return ""

@app.route('/report')
@cross_origin()
def report_url():
    url = request.args.get('url')
    success = request.args.get('success')
    answer = request.args.get('answer')

    response = requests.get(url)

    if (response.status_code != 200):
        return "download fail"

    captchaImgFolder = "captcha_img_ocr"

    img_io = BytesIO(response.content)
    image = Image.open(img_io)
    width, height = image.size
    if width != 80 and height != 25:
        captchaImgFolder = captchaImgFolder + "/new"
        
    if success == "0":
        captchaImgFolder = captchaImgFolder + "/fail"
    if not os.path.exists(captchaImgFolder):
        os.makedirs(captchaImgFolder)

    fileName = url.split('/')[-1]
    fileName = f"{answer}_{fileName}"
    fileName = f"{captchaImgFolder}/{fileName}"
    if not os.path.exists(fileName):
        print(fileName)
        with open(fileName, 'wb') as file:
            file.write(response.content)

    return ""

if __name__ == '__main__':
    app.run()