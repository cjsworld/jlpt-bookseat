function _log(msg, obj) {
    if (obj) {
        console.log(msg, obj);
    } else {
        console.log(msg);
    }
}

async function _delay(timeountMS) {
    return new Promise((fin) => {
        setTimeout(fin, timeountMS);
    });
}

async function _refreshImg() {
    return new Promise((fin) => {
        let a = user.get("chkImgFlag");
        if (!a) {
            a = generateRandomFlag(18);
            user.set("chkImgFlag", a)
        }
        let timeout = 2000;
        let timer = setTimeout(() => {
            timer = null;
            _log('chkImg.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        new Ajax.Request(getURL("chkImg.do"), {
            method: "post",
            parameters: "chkImgFlag=" + a,
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function (g) {
                let h = g.responseJSON;
                if (h == null) {
                    g.request.options.onFailure();
                    return
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("chkImg.do", h);
                if (!h.retVal) {
                    _log("获取验证码失败：" + errorCode[h.errorNum]);
                    fin(null);
                    return
                }
                user.set("chkImgSrc", h.chkImgFilename);
                fin(h.chkImgFilename);
            },
            onFailure: function (g) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("获取验证码失败");
                fin(null);
            }
        })
    });
}

var _username = "123"
var _password = "456"

async function _login(code) {
    return new Promise((fin) => {
        let timeout = 5000;
        let timer = setTimeout(() => {
            timer = null;
            _log('login.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);

        user.set("ksIdNo", _username);
        user.set("sFlag", escape(escape(_username)));

        let formData = new FormData();
        formData.append("ksIDNO", _username);
        formData.append("ksPwd", _password);
        formData.append("clientTime", "");

        formData.append("chkImgFlag", user.get("chkImgFlag"));
        formData.append("chkImgCode", code);
        formData.append("btnlogin", "登录");

        new Ajax.Request(getURL("login.do"), {
            method: "post",
            parameters: new URLSearchParams(formData).toString(),
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function (e) {
                var f = e.responseJSON;
                if (f == null) {
                    e.request.options.onFailure();
                    return
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                clearChkimgCache();
                _log("login.do", f);
                if (f.retVal == 0) {
                    _log("登录失败：" + errorCode[f.errorNum]);
                }
                fin(f);
            },
            onFailure: function (g) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("登录请求失败");
                fin(null);
            }
        })
    });
}

async function _ocr(url) {
    return new Promise((fin) => {
        let xhr = new XMLHttpRequest();
        url = encodeURIComponent(url);
        xhr.open('GET', `http://localhost:5000/ocr?url=${url}`);
        xhr.onload = function () {
            if (xhr.status === 200) {
                let ans = xhr.responseText;
                if (ans.length == 4) {
                    fin(ans.toUpperCase());
                } else {
                    _log("验证码OCR识别失败");
                    fin(null);
                }
            } else {
                fin(null);
            }
        };
        xhr.onerror = () => {
            fin(null);
        }
        xhr.send();
    });
}

async function _report(url, success, answer) {
    return new Promise((fin) => {
        let xhr = new XMLHttpRequest();
        url = encodeURIComponent(url);
        xhr.open('GET', `http://localhost:5000/report?url=${url}&success=${success}&answer=${answer}`);
        xhr.onload = function () {
            fin(null);
        };
        xhr.onerror = () => {
            fin(null);
        }
        xhr.send();
    });
}


var canExit = false;
var delayMs = 1;

async function loop() {
    while (!canExit) {
        let url = await _refreshImg();
        if (url) {
            let answer = await _ocr(url);
            if (!answer) {
                await _report(url, 0, "0000");
            } else {
                let ret = await _login(answer);
                if (ret.errorNum === 306) {
                    //验证码错误
                    await _report(url, 0, answer);
                } else if (ret.errorNum === 200) {
                    //验证码正确
                    await _report(url, 1, answer);
                }
            }
        }

        await _delay(delayMs);
    }
}


function start(delay) {
    canExit = false;
    if (delay) {
        delayMs = delay;
    }
    loop();
}

function stop() {
    canExit = true;
}