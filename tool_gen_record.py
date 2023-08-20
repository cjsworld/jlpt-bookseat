import os

def process_file(path, r):
    files = os.listdir(path)
    files = [file for file in files if file.endswith('.jpg')]
    for file in files:
        file = os.path.splitext(file)[0]
        ff = file.split("_")
        if ff[1] in r:
            if r[ff[1]] != ff[0]:
                print(f"{file} conflict")
        else:
            r[ff[1]] = ff[0]

result = {}
process_file("captcha_img_ocr", result)
process_file("captcha_img_ocr/correct", result)
print(len(result))

with open("captcha_record.txt", "w") as file:
    for key, value in result.items():
        file.write(f"{key}:{value}\n")

print("finish")