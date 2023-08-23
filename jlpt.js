const toolVersion = "2023 v1.1"

var examLevel = localStorage.getItem("tool_examLevel");
if (!examLevel) {
    examLevel = 1;
} else {
    examLevel = parseInt(examLevel);
}

function _onExamLevelChange(v) {
    examLevel = parseInt(v);
    kdInfos = {}; //更改报考等级需要清空缓存的考点信息
    localStorage.setItem("tool_examLevel", examLevel);
}

var _username = localStorage.getItem("tool_username");

function _onUsernameChange(v) {
    _username = v;
    localStorage.setItem("tool_username", v);
}

var _password = localStorage.getItem("tool_password");

function _onPasswordChange(v) {
    _password = v;
    localStorage.setItem("tool_password", v);
}

var isChangeSeat = localStorage.getItem("tool_isChangeSeat") == "true";

function _onIsChangeSeatChange(v) {
    isChangeSeat = v;
    localStorage.setItem("tool_isChangeSeat", v ? "true" : "false");
}

function _onIsChangeSeatHelp() {
    alert("1、订座成功后有且仅有一次改座机会。\n2、改座失败不影响当前订座。\n3、目标考场不要包含已报考场。");
}

var fastTryAddr = localStorage.getItem("tool_fastTryAddr");
if (!fastTryAddr) {
    fastTryAddr = [];
} else {
    fastTryAddr = JSON.parse(fastTryAddr);
}

function _onFastTryAddrChange(v) {
    fastTryAddr = v.split(',').map(item => item.trim()).filter(item => item !== '');
    localStorage.setItem("tool_fastTryAddr", JSON.stringify(fastTryAddr));
}

function _onFastTryAddrHelp() {
    alert("填写考点代号，用英文逗号分隔，例如：\n\n1020101,1020103,1020105\n\n1、因为在人多的时候，查询接口会卡。而第一天往往所有考场都是有座位的，所以可以跳过查询直接订座。\n2、可以在这里填写考场，会自动卡时间，2点开始，按照顺序尝试直接订座。注意每次订座都需要消耗验证码。");
}

var targetAddr = localStorage.getItem("tool_targetAddr");
if (!targetAddr) {
    targetAddr = [];
} else {
    targetAddr = JSON.parse(targetAddr);
}

function _onTargetAddrChange(v) {
    targetAddr = v.split(',').map(item => item.trim());
    localStorage.setItem("tool_targetAddr", JSON.stringify(targetAddr));
}

function _onTargetAddrHelp() {
    alert("填写考点代号，用英文逗号分隔，例如：\n\n1020101,1020103,1020105\n\n会通过接口去查询哪个有空座，然后按照列表的优先顺序选择有空座的考场。");
}

var ajaxTimeout = localStorage.getItem("tool_ajaxTimeout");
if (!ajaxTimeout) {
    ajaxTimeout = 2000;
} else {
    ajaxTimeout = parseInt(ajaxTimeout);
}

function _onAjaxTimeoutChange(v) {
    ajaxTimeout = parseInt(v);
    localStorage.setItem("tool_ajaxTimeout", ajaxTimeout);
}

function _onAjaxTimeoutHelp() {
    alert("用于查询请求以及验证码之类的请求超时");
}

var ajaxTimeoutCritical = localStorage.getItem("tool_ajaxTimeoutCritical");
if (!ajaxTimeoutCritical) {
    ajaxTimeoutCritical = 10000;
} else {
    ajaxTimeoutCritical = parseInt(ajaxTimeoutCritical);
}

function _onAjaxTimeoutCriticalChange(v) {
    ajaxTimeoutCritical = parseInt(v);
    localStorage.setItem("tool_ajaxTimeoutCritical", ajaxTimeoutCritical);
}

function _onAjaxTimeoutCriticalHelp() {
    alert("用于登录请求和订座请求的超时");
}

var pollInterval = localStorage.getItem("tool_pollInterval");
if (!pollInterval) {
    pollInterval = 700;
} else {
    pollInterval = parseInt(pollInterval);
}

function _onPollIntervalChange(v) {
    pollInterval = parseInt(v);
    localStorage.setItem("tool_pollInterval", pollInterval);
}

function _onPollIntervalHelp() {
    alert("控制多长时间查询一次空余考位（服务器有限流，小于500ms可能会导致请求报400）");
}

var ocrOn = localStorage.getItem("tool_ocrOn") == "true";

function _onIsOcrOnChange(v) {
    ocrOn = v;
    localStorage.setItem("tool_ocrOn", v ? "true" : "false");
}

var ocrUrl = localStorage.getItem("tool_ocrUrl");
if (!ocrUrl) {
    ocrUrl = "http://localhost:5000/ocr";
}

function _onOcrUrlChange(v) {
    ocrUrl = v;
    localStorage.setItem("tool_ocrUrl", ocrUrl);
}

function _onOcrHelp() {
    alert("1、可以用一些OCR方法自动识别验证码。\n2、参考说明搭建，填入url，勾选开关。\n3、自动识别准确率有限，网络高峰期可能导致刷新验证码较慢。");
}

//报考开始时间
const startHour = 7
const startMinite = 0
const startSecond = 0

let offsetX, offsetY, initialX, initialY;

let toolWindow;
function _initGUI() {
    toolWindow = document.getElementById('tool-window');
    if (!toolWindow) {
        toolWindow = document.createElement("div");
        toolWindow.id = "tool-window";
        toolWindow.style = "position: absolute; right: 50px; bottom: 50px; width: 700px; height: 620px; background-color: #ccc; z-index: 999";
        toolWindow.innerHTML = `
        <div id="tool-title" style="background-color: aqua; margin: 5px; text-align:center; cursor: move">
            <div>JLPT抢座脚本 ${toolVersion} (可拖动)</div>
            <button onclick="_closeGUI()" style="position: absolute; right: 5px; top: 5px">X</button>
        </div>
        <div style="width: 250px; display: inline-block; vertical-align: top">
            <div style="margin: 10px">
                <label>报考等级：</label>
                <select id="tool-examLevel" onchange="_onExamLevelChange(document.getElementById('tool-examLevel').value)">
                    <option value="1">N1</option>
                    <option value="2">N2</option>
                    <option value="3">N3</option>
                    <option value="4">N4</option>
                    <option value="5">N5</option>
                </select>
                <a href="https://jlpt.neea.cn/kdinfo.do?kdid=info" target="_blank" style="margin-left: 5px">查看考场列表</a>
            </div>
            <div style="margin: 10px">
                <label >证件号：</label>
                <input id="tool-username" style="width: 150px" onchange="_onUsernameChange(document.getElementById('tool-username').value)">                
            </div>
            <div style="margin: 10px">
                <label >密　码：</label>
                <input id="tool-password" style="width: 150px" onchange="_onPasswordChange(document.getElementById('tool-password').value)">                
            </div>
            <div style="margin: 10px">
                <label>改座模式：</label>
                <input id="tool-changeSeat" type="checkbox" onchange="_onIsChangeSeatChange(document.getElementById('tool-changeSeat').checked)">启用</input>
                <a onclick="_onIsChangeSeatHelp()" style="cursor: pointer; margin-left: 10px">�</a>
            </div>
            <div style="margin: 10px">
                <label>快速抢座考场：</label>
                <a onclick="_onFastTryAddrHelp()" style="cursor: pointer">�</a>
                <textarea id="tool-fastTryAddr" rows="5" style="resize: none; width: 100%;" onchange="_onFastTryAddrChange(document.getElementById('tool-fastTryAddr').value)"></textarea>
            </div>
            <div style="margin: 10px">
                <label>目标考场：</label>
                <a onclick="_onTargetAddrHelp()" style="cursor: pointer">�</a>
                <textarea id="tool-targetAddr" rows="5" style="resize: none; width: 100%;" onchange="_onTargetAddrChange(document.getElementById('tool-targetAddr').value)"></textarea>
            </div>
            <div style="margin: 10px">
                <label>查询请求超时(ms)：</label>
                <input id="tool-ajaxTimeout" style="width: 50px" onchange="_onAjaxTimeoutChange(document.getElementById('tool-ajaxTimeout').value)">
                <a onclick="_onAjaxTimeoutHelp()" style="cursor: pointer; margin-left: 10px">�</a>
                <br/>
                <label>订座请求超时(ms)：</label>
                <input id="tool-ajaxCriticalTimeout" style="width: 50px" onchange="_onAjaxTimeoutCriticalChange(document.getElementById('tool-ajaxCriticalTimeout').value)">
                <a onclick="_onAjaxTimeoutCriticalHelp()" style="cursor: pointer; margin-left: 10px">�</a>
                <br/>
                <label>轮询请求间隔(ms)：</label>
                <input id="tool-pollInterval" value="700" style="width: 50px" onchange="_onPollIntervalChange(document.getElementById('tool-pollInterval').value)">
                <a onclick="_onPollIntervalHelp()" style="cursor: pointer; margin-left: 10px">�</a>
            </div>
            <div style="margin: 10px">
                <button id="tool-start" onclick="start()" style="margin: 10px">开始</label>
                <button id="tool-stop" onclick="stop()" style="margin: 10px">停止</label>
            </div>
            <div style="margin: 10px">
                <label>验证码：</label>
                <img id="tool-chkImg" border="1" alt="验证码" width="80" height="25"><br/>
                <label>答案(回车提交)：</label>
                <input id="tool-chkImgAns" style="width: 100px" onkeydown="_handleChkImgKeyDown(event)"></input>
                <label>自动识别：</label>
                <a onclick="_onOcrHelp()" style="cursor: pointer">�</a>
                <input id="tool-ocrOn" type="checkbox" onchange="_onIsOcrOnChange(document.getElementById('tool-ocrOn').checked)">启用</input><br/>
                <input id="tool-ocrUrl" style="width: 100%" onchange="_onOcrUrlChange(document.getElementById('tool-ocrUrl').value)"></input>
            </div>
        </div>
        <div style="width: 400px; height: 100%; display: inline-block; vertical-align: top">
            <div style="margin: 10px">
                <label>日志：</label>
                <button onclick="_clearLog()" style="margin-left: 10px">清空</button>
                <textarea id="tool-log" wrap="off" style="resize: none; width: 100%; height: 530px"></textarea>
            </div>
        </div>
        `;
        document.body.append(toolWindow);

        document.getElementById('tool-examLevel').value = examLevel;
        document.getElementById('tool-username').value = _username;
        document.getElementById('tool-password').value = _password;
        document.getElementById('tool-changeSeat').checked = isChangeSeat;
        document.getElementById('tool-fastTryAddr').value = fastTryAddr.join(",");
        document.getElementById('tool-targetAddr').value = targetAddr.join(",");
        document.getElementById('tool-ajaxTimeout').value = ajaxTimeout;
        document.getElementById('tool-ajaxCriticalTimeout').value = ajaxTimeoutCritical;
        document.getElementById('tool-pollInterval').value = pollInterval;
        document.getElementById('tool-ocrOn').checked = ocrOn;
        document.getElementById('tool-ocrUrl').value = ocrUrl;
        document.getElementById('tool-stop').disabled = true;

        //增加拖动的功能
        let dragger = document.getElementById("tool-title");

        // 当鼠标按下时
        dragger.addEventListener('mousedown', function (e) {
            // 计算初始位置
            offsetX = e.clientX - toolWindow.offsetLeft;
            offsetY = e.clientY - toolWindow.offsetTop;
            initialX = toolWindow.offsetLeft;
            initialY = toolWindow.offsetTop;

            // 当鼠标移动时
            document.addEventListener('mousemove', _dragWindow);
            // 当鼠标松开时
            document.addEventListener('mouseup', _stopDragWindow);
        });
    }
}

function _closeGUI() {
    if (toolWindow) {
        stop();
        toolWindow.remove();
        toolWindow = null;
    }
}

function _dragWindow(e) {
    // 计算当前位置
    const currentX = e.clientX - offsetX;
    const currentY = e.clientY - offsetY;

    // 将悬浮窗移动到当前位置
    toolWindow.style.left = currentX + 'px';
    toolWindow.style.top = currentY + 'px';
}

function _stopDragWindow() {
    // 当鼠标松开时，移除事件监听器
    document.removeEventListener('mousemove', _dragWindow);
    document.removeEventListener('mouseup', _stopDragWindow);
}

function _log(msg, obj) {
    let str;
    if (obj) {
        str = msg + ": " + JSON.stringify(obj) + "\n";
        console.log(msg, obj);
    } else {
        str = msg + "\n";
        console.log(msg);
    }
    let logView = document.getElementById('tool-log');
    logView.value += str;
    logView.scrollTop = logView.scrollHeight;
}

function _clearLog() {
    document.getElementById('tool-log').value = '';
}

_initGUI();

async function _delay(timeountMS) {
    return new Promise((fin) => {
        setTimeout(fin, timeountMS);
    });
}

async function _login(code) {
    return new Promise((fin) => {
        if (!_username || !_password) {
            _log("请输入证件号和密码用于登录");
            canExit = true;
            fin(null);
        }

        let timeout = ajaxTimeoutCritical;
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
                } else {
                    updateUser(f);
                    user.set("chkImgFlag", escape(escape(user.get("ksIdNo"))));
                    _log("登录成功");
                    dispatch();
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


async function _getStatus() {
    return new Promise((fin) => {
        let timeout = ajaxTimeout;
        let timer = setTimeout(() => {
            timer = null;
            _log('status.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        new Ajax.Request(getURL("status.do"), {
            method: "post",
            parameters: serializeUser(["ksid", "ksIdNo", "ksLoginFlag"]),
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function (c) {
                var d = c.responseJSON;
                if (d == null) {
                    c.request.options.onFailure();
                    return
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                if (d.retVal == 0) {
                    if (d.errorNum == 101 || d.errorNum == 102) {
                        //登录已过期，或者在别处登录
                        user.set("ksLoginFlag", "");
                    }
                    _log("status: " + errorCode[d.errorNum]);
                } else {
                    updateUser(d);
                }
                fin(d);
            },
            onFailure: function (g) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("获取状态失败");
                fin(null);
            }
        })
    });
}


var chkImgAnsPromise = null;

function _handleChkImgKeyDown(event) {
    if (event.key === 'Enter') {
        let inputValue = event.target.value;
        if (inputValue) {
            inputValue = inputValue.trim().toUpperCase();
        }
        event.target.value = '';

        if (chkImgAnsPromise) {
            let fin = chkImgAnsPromise;
            chkImgAnsPromise = null;
            document.getElementById("tool-chkImg").src = "";
            fin(inputValue);
        } else if (inputValue == "EXIT" && !canExit) {
            stop();
        }
    }
}

function _tryOCR(url) {
    let xhr = new XMLHttpRequest();
    url = encodeURIComponent(url);
    xhr.open('GET', `${ocrUrl}?url=${url}`);
    xhr.onload = function () {
        let fin = chkImgAnsPromise;
        chkImgAnsPromise = null;
        if (fin) {
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
        }
    };
    xhr.onerror = () => {
        _log("验证码OCR请求失败");
        let fin = chkImgAnsPromise;
        chkImgAnsPromise = null;
        if (fin) {
            fin(null);
        }
    }
    xhr.send();
}

async function _refreshImg() {
    document.getElementById("tool-chkImg").src = "";
    return new Promise((fin) => {
        chkImgAnsPromise = null;
        let a = user.get("chkImgFlag");
        if (!a) {
            a = generateRandomFlag(18);
            user.set("chkImgFlag", a)
        }
        let timeout = ajaxTimeout;
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

                chkImgAnsPromise = fin;

                if (ocrOn && ocrUrl && ocrUrl.length > 0) {
                    _log("尝试自动识别验证码...");
                    _tryOCR(h.chkImgFilename);
                } else {
                    document.getElementById("tool-chkImg").src = h.chkImgFilename;
                    _log("【【【请输入验证码】】】");
                    document.getElementById("tool-chkImgAns").value = "";
                    document.getElementById("tool-chkImgAns").focus();
                }
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

var kdInfos = {};
async function _chooseAddr(onlyQuery) {
    return new Promise((fin) => {
        let timeout = ajaxTimeout;
        let timer = setTimeout(() => {
            timer = null;
            _log('chooseAddr.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        user.set("bkjb", examLevel);
        new Ajax.Request("chooseAddr.do?bkjb=" + user.get("bkjb"), {
            method: "get",
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function (originalRequest) {
                let jsonObj = eval(originalRequest.responseText);
                if (jsonObj == null) {
                    originalRequest.request.options.onFailure();
                    return
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let kdInfo = $A(jsonObj);
                let canBookList = {};
                let canBook = null;
                for (let i = 0; i < kdInfo.size(); ++i) {
                    let kd = kdInfo[i];
                    if (kd.vacancy > 0 && !onlyQuery) {
                        _log("找到有空座的考场", kd);
                        canBookList[kd.dm] = kd;
                    }
                    kdInfos[kd.dm] = kd.id;
                }
                for (let i = 0; i < targetAddr.size(); ++i) {
                    let t = targetAddr[i];
                    if (canBookList[t]) {
                        canBook = canBookList[t];
                        break;
                    }
                }
                if (!onlyQuery) {
                    if (!canBook) {
                        _log("暂时没有空座位");
                    } else {
                        _log("目标考场", canBook);
                    }
                }
                fin(canBook);
            },
            onFailure: function (originalRequest) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("查询考点信息失败");
                fin(null);
            }
        })
    });
}

async function _bookseat(kd, code) {
    return new Promise((fin) => {
        let timeout = ajaxTimeoutCritical;
        let timer = setTimeout(() => {
            timer = null;
            _log('book.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        user.set("bkjb", examLevel);
        user.set("bkkd", kd.id);
        let url;
        if (isChangeSeat) {
            url = getURL("changebook.do");
        } else {
            url = getURL("book.do");
        }
        new Ajax.Request(url, {
            method: "post",
            requestHeaders: {
                RequestType: "ajax"
            },
            parameters: serializeUser(["bkjb", "bkkd", "ksid", "ksIdNo", "chkImgFlag", "ksLoginFlag"]) + "&chkImgCode=" + code,
            onCreate: function () {
                _log("定座请求发送中...", kd);
            },
            onSuccess: function (e) {
                let h = e.responseJSON;
                if (h == null) {
                    e.request.options.onFailure();
                    return
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log(isChangeSeat ? "changebook.do" : "book.do", h);
                clearChkimgCache();
                fin(h);
            },
            onFailure: function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("定座请求失败");
                fin(null);
            }
        })
    });
}

async function _queryBook() {
    return new Promise((fin) => {
        let timeout = ajaxTimeout;
        let timer = setTimeout(() => {
            timer = null;
            _log('queryBook.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        new Ajax.Request(getURL("queryBook.do"), {
            method: "post",
            requestHeaders: {
                RequestType: "ajax"
            },
            parameters: serializeUser(["ksid", "ksIdNo", "ksLoginFlag"]),
            onCreate: function () {
                _log("定座请求结果查询中...");
            },
            onSuccess: function (l) {
                let m = l.responseJSON;
                if (m == null) {
                    l.request.options.onFailure();
                    return
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("queryBook.do", m);
                fin(m);
            },
            onFailure: function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("定座请求结果查询中失败");
                fin(null);
            }
        });
    });
}

var canExit = false;

async function loop() {
    let answer = null;
    let answerTime = 0;
    let kd = null;
    let fastTryList = fastTryAddr.slice();
    let startTime = new Date().setHours(startHour, startMinite, startSecond, 0);
    let statusTime = 0;
    let waitHint = false;

    _log("开始工作，当前报考等级：" + examLevel);

    while (!canExit) {
        let now = new Date().getTime();
        while (!canExit && (!answer || (now - answerTime > 1000 * 60 * 5))) {
            //实测5分钟的验证码是可以用的，10分钟会导致验证码已过期
            answer = null;
            answerTime = now;
            answer = await _refreshImg();
            if (answer && answer.length == 4) {
                _log("验证码：" + answer);
                break;
            } else {
                answer = null;
            }
        }

        if (!answer || answer == "EXIT") {
            canExit = true;
            break;
        }

        if (!user.get("ksLoginFlag") || user.get("step") == "login") {
            //未登录
            _log("开始登录");
            await _login(answer);
            answer = null;
            answerTime = 0;
            statusTime = 0;
            waitHint = false;
            continue;
        }

        if (!kd) {
            if (fastTryList.length > 0) {
                if (Object.keys(kdInfos).length == 0) {
                    _log("查询考点信息");
                    await _chooseAddr(true);
                    if (Object.keys(kdInfos).length == 0) {
                        await _delay(500);
                        _log("查询考点信息失败");
                        continue;
                    }
                }
                _log("###尝试直接订座：" + fastTryList[0]);
                let kdid = kdInfos[fastTryList[0]];
                if (kdid) {
                    kd = { id: kdid, dm: fastTryList[0] };
                } else {
                    _log("考点不存在：" + fastTryList[0]);
                    fastTryList = fastTryList.slice(1);
                    continue;
                }
            } else {
                kd = await _chooseAddr(false);
            }
            if (!kd) {
                if (new Date().getTime() - statusTime > 5000) {
                    //每5秒刷新一下状态，防止登录过期
                    await _getStatus();
                    statusTime = now;
                    //getStatus是网络请求，消耗多少时间未知，这里就不delay了
                } else {
                    await _delay(pollInterval);
                }
                continue;
            }
        }

        //快速订座的时候，因为直接发请求，所以最好等时间到了再继续。
        now = new Date().getTime();
        if (fastTryList.length > 0 && now < startTime) {
            if (!waitHint) {
                _log(`时间还没到，等到${startHour}:${startMinite}:${startSecond}之后自动开始...`);
                waitHint = true;
            }
            if (startTime - now > 10000 && now - statusTime > 5000) {
                //距离开始还有10秒以上，每5秒刷新一下状态，防止登录过期
                await _getStatus();
                statusTime = now;
            } else {
                await _delay(200);
            }
            continue;
        }

        let r = await _bookseat(kd, answer);
        answer = null;
        answerTime = 0;
        if (!r) {
            await _delay(500);
            continue;
        } else if (r.retVal == 0) {
            _log("订座失败：" + errorCode[r.errorNum]);
            if (r.errorNum == 305 || r.errorNum == 306) {
                //验证码过期或错误
            } else if (r.errorNum == 101 || r.errorNum == 102) {
                //登录已过期，或者在别处登录
                user.set("ksLoginFlag", "");
                gotoStep("login");
            } else {
                kd = null;
                if (fastTryList.length > 0) {
                    fastTryList = fastTryList.slice(1)
                }
            }
            continue;
        }

        if (isChangeSeat) {
            //改座模式不需要查询
            _log("改座成功！", kd);
            canExit = true;
            break;
        }

        while (!canExit) {
            r = await _queryBook();
            if (!r) {
                continue;
            } else if (r.retVal == 0) {
                if (r.errorNum == 310) {
                    _log("订座排队中...");
                    //重试
                    await _delay(200);
                    continue;
                }
                _log("订座查询失败：" + errorCode[r.errorNum]);
                if (r.errorNum == 313) {
                    //满了
                    kd = null;
                    if (fastTryList.length > 0) {
                        fastTryList = fastTryList.slice(1)
                    }
                    break;
                } else {
                    //查询失败了，需要重新订座
                    break;
                }
            } else {
                _log("预定成功！", kd);
                gotoStep("status");
                canExit = true;
                break;
            }
        }
    }

    _log("已停止");
    stop();
}


function start() {
    document.getElementById('tool-examLevel').disabled = true;
    document.getElementById('tool-changeSeat').disabled = true;
    document.getElementById('tool-fastTryAddr').disabled = true;
    document.getElementById('tool-targetAddr').disabled = true;
    document.getElementById('tool-start').disabled = true;
    document.getElementById('tool-stop').disabled = false;
    document.getElementById("tool-chkImg").src = "";
    document.getElementById("tool-chkImgAns").value = "";

    _clearLog();
    canExit = false;
    loop();
}

function stop() {
    canExit = true;
    document.getElementById('tool-examLevel').disabled = false;
    document.getElementById('tool-changeSeat').disabled = false;
    document.getElementById('tool-fastTryAddr').disabled = false;
    document.getElementById('tool-targetAddr').disabled = false;
    document.getElementById('tool-start').disabled = false;
    document.getElementById('tool-stop').disabled = true;
    document.getElementById("tool-chkImg").src = "";
    document.getElementById("tool-chkImgAns").value = "";
    if (chkImgAnsPromise) {
        chkImgAnsPromise("EXIT");
        chkImgAnsPromise = null;
    }
}
