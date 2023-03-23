from flask import Flask, request
from flask_cors import cross_origin
import requests
import ddddocr

app = Flask(__name__)

ocr_beta = ddddocr.DdddOcr(old=False, show_ad=False)
ocr_old = ddddocr.DdddOcr(old=True, show_ad=False)

@app.route('/ocr')
@cross_origin()
def get_verification_code():
    url = request.args.get('url')
    response = requests.get(url)

    #验证码是4位大写字母，如果不是，说明识别错误
    
    result = ocr_beta.classification(response.content)
    print("ocr_beta: " + result);
    if len(result) == 4 and result.isalpha():
        return result
    
    result = ocr_old.classification(response.content)
    print("ocr_old: " + result);
    if len(result) == 4 and result.isalpha():
        return result
    
    return ""

if __name__ == '__main__':
    app.run()