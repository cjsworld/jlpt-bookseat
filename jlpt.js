var errorCode = {};
errorCode[100] = "网络错误或服务器繁忙";
errorCode[101] = "会话已过期，请重新登录";
errorCode[102] = "已经在其它地方登录,请求被拒绝";
errorCode[103] = "非法请求";
errorCode[104] = "参数错误";
errorCode[105] = "登录次数过多";
errorCode[106] = "操作次数过多";
errorCode[107] = "查询失败，不存在的账户";
errorCode[108] = "密码问题回答错误";
errorCode[109] = "查询失败";
errorCode[200] = "证件号或密码错误";
errorCode[201] = "此证件号已被删除";
errorCode[202] = "注册请求不被接受";
errorCode[203] = "此证件号已经被注册";
errorCode[204] = "注册请求执行错误";
errorCode[205] = "报名尚未开始";
errorCode[206] = "报名已经结束";
errorCode[207] = "此手机号码已经被注册";
errorCode[208] = "此电子邮箱地址已经被注册";
errorCode[209] = "短信验证码不正确或已过期";
errorCode[210] = "更新考生信息请求执行失败";
errorCode[211] = "删除考生信息请求执行失败";
errorCode[212] = "两次密码输入不符";
errorCode[213] = "更新报名表请求执行失败";
errorCode[214] = "母语代码输入不正确";
errorCode[215] = "用户名或密码错误次数过多，账户被锁定";
errorCode[216] = "用户名或密码错误次数过多，账户被锁定30分钟";
errorCode[217] = "上传照片功能关闭";
errorCode[250] = "请输入您的证件号";
errorCode[251] = "您输入的证件号不存在";
errorCode[252] = "更改座位请求无法被执行";
errorCode[300] = "加入队列失败";
errorCode[301] = "此级别不允许定座";
errorCode[303] = "提交的考生id与缓存中不一致";
errorCode[304] = "考生已经预定了座位";
errorCode[305] = "验证码过期";
errorCode[306] = "验证码输入错误,请重新输入";
errorCode[307] = "不符合更改考点条件";
errorCode[308] = "更改考点请求不被接受";
errorCode[310] = "请求排队中...";
errorCode[311] = "无定座请求";
errorCode[313] = "该考点已无剩余座位";
errorCode[314] = "错误的定座请求";
errorCode[315] = "缓存不同步";
errorCode[316] = "查询重试";
errorCode[317] = "查询重试次数过多";
errorCode[320] = "错误的取消预定请求";
errorCode[321] = "取消请求不被接受";
errorCode[330] = "验证签名错误";
errorCode[331] = "无效的登录状态";
errorCode[332] = "更新照片失败";

function _consoleImage(url) {
    console.log('%c ', 'padding:13px 40px; font-size: 0; background:url("' + url + '"); no-repeat;')
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
            console.log('chkImg.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        new Ajax.Request(getURL("chkImg.do"), {
            method: "post",
            parameters: "chkImgFlag=" + a,
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function(g) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let h = g.responseJSON;
                if (h == null) {
                    g.request.options.onFailure();
                    return
                }
                console.log("chkImg.do", h);
                if (!h.retVal) {
                    console.log("获取验证码失败：" + errorCode[h.errorNum]);
                    fin(null);
                    return
                }
                user.set("chkImgSrc", h.chkImgFilename);
                _consoleImage(h.chkImgFilename);
                let _answerCode = prompt("输入验证码");
                if (_answerCode) {
                    _answerCode = _answerCode.toUpperCase();
                }
                fin(_answerCode);
            },
            onFailure: function(g) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                console.log("获取验证码失败，请点击验证码重新获取!");
                fin(null);
            }
        })
    });
}

var kdInfos = {};
async function _chooseAddr() {
    return new Promise((fin) => {
        let timeout = 3000;
        let timer = setTimeout(() => {
            timer = null;
            console.log('chooseAddr.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        user.set("bkjb", examLevel);
        new Ajax.Request("chooseAddr.do?bkjb=" + user.get("bkjb"),{
            method: "get",
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function(originalRequest) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let jsonObj = eval(originalRequest.responseText);
                if (jsonObj == null) {
                    originalRequest.request.options.onFailure();
                    return
                }
                let kdInfo = $A(jsonObj);
                let canBookList = {};
                let canBook = null;
                for (let i = 0; i < kdInfo.size(); ++i) {
                    let kd = kdInfo[i];
                    if (kd.vacancy > 0) {
                        console.log("找到有空座的考场", kd);
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
                if (!canBook) {
                    console.log("暂时没有空座位");
                } else {
                    console.log("目标考场", canBook);
                }
                fin(canBook);
            },
            onFailure: function(originalRequest) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                console.log("查询考点信息失败");
                fin(null);
            }
        })
    });
}

async function _bookseat(kd, code) {
    return new Promise((fin) => {
        let timeout = 5000;
        let timer = setTimeout(() => {
            timer = null;
            console.log('book.do timed out after ' + timeout + ' ms');
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
            onCreate: function() {
                console.log("定座请求发送中...", kd);
            },
            onSuccess: function(e) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let h = e.responseJSON;
                if (h == null) {
                    e.request.options.onFailure();
                    return
                }
                console.log("book.do", h);
                clearChkimgCache();
                fin(h);
            },
            onFailure: function() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                console.log("定座请求失败");
                fin(null);
            }
        })
    });
}

async function _queryBook() {
    return new Promise((fin) => {
        let timeout = 5000;
        let timer = setTimeout(() => {
            timer = null;
            console.log('queryBook.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        new Ajax.Request(getURL("queryBook.do"),{
            method: "post",
            requestHeaders: {
                RequestType: "ajax"
            },
            parameters: serializeUser(["ksid", "ksIdNo", "ksLoginFlag"]),
            onCreate: function() {
                layer.setMsg("定座请求结果查询中...")
            },
            onSuccess: function(l) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let m = l.responseJSON;
                if (m == null) {
                    l.request.options.onFailure();
                    return
                }
                console.log("queryBook.do", m);
                fin(m);
            },
            onFailure: function() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                console.log("定座请求结果查询中失败");
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
    let startTime = new Date().setHours(startHour, startMinite, startSecond, 0);

    while (!canExit) {
        let now = new Date().getTime();
        while (!answer/* || (now - answerTime >= 1000 * 60 * 3)*/) {
            answer = null;
            answerTime = now;
            answer = await _refreshImg();
            console.log("验证码：" + answer);
            if (answer && answer == "EXIT") {
                canExit = true;
                console.log("退出流程");
                return;
            }
        }
        
        
        if (!kd) {
            if (targetAddr.length == 1) {
                let kdid = kdInfos[targetAddr[0]];
                if (!kdid) {
                    await _chooseAddr();
                }
                kdid = kdInfos[targetAddr[0]];
                if (kdid) {
                    kd = {id: kdid, dm: targetAddr[0]};
                }
            } else {
                kd = await _chooseAddr();
            }
            if (!kd) {
                await _delay(1000);
                continue;
            }
        }

        //只有1个目标考场的时候，因为直接发请求，所以最好等时间到了再继续。
        if (targetAddr.length == 1 && new Date().getTime() < startTime) {
            await _delay(200);
            continue;
        }

        let r = await _bookseat(kd, answer);
        answer = null;
        answerTime = 0;
        if (!r) {
            await _delay(500);
            continue;
        } else if (r.retVal == 0) {
            console.log("订座失败：" + errorCode[r.errorNum]);
            if (r.errorNum == 305 || r.errorNum == 306) {
                //验证码过期或错误
            } else {
                kd = null;
            }
            continue;
        }

        if (isChangeSeat) {
            console.log("改座成功！", kd);
            //改座模式不需要查询
            break;
        }
        
        while (!canExit) {
            r = await _queryBook();
            if (!r) {
                continue;
            } else if (r.retVal == 0) {
                console.log("订座查询显示失败", errorCode[r.errorNum]);
                if (r.errorNum == 310) {
                    //重试
                    await _delay(200);
                    continue;
                } else if (r.errorNum == 313) {
                    //满了
                    kd = null;
                    break;
                } else {
                    break;
                }
            } else {
                console.log("预定成功！", kd);
                canExit = true;
                break;
            }
        }
    }
    console.log("停止");
}

function start() {
    canExit = false;
    loop();
}

function stop() {
    canExit = true;
}


//报考开始时间
var startHour = 14
var startMinite = 0
var startSecond = 0

//报考等级
var examLevel = 2;

//是否改座模式
var isChangeSeat = false;

//目标考场，可查询：https://jlpt.neea.cn/kdinfo.do?kdid=info
//如果只填写一个，会直接尝试去订座。如果有多个，会通过接口去查询哪个有空座。在人多的时候，查询接口会卡。
var targetAddr = ["1022102", "1023301", "1021701", "1021702", "1022801", "1023902", "1022202"];

start();
