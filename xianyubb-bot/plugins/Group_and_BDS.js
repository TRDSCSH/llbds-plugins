const bot = require("../app").bot

const https = require('https');
const ws = require("ws")
const fs = require("fs-extra")
const he = require('he');
const schedule = require('node-schedule');

const defaultImagePath = './plugins/img/'; // 文件的保存路径
const defaultOldImagePath = './plugins/img_old/';

let bdsConnected = 0;

if (!fs.existsSync(defaultImagePath)) fs.mkdir(defaultImagePath, (err) => {
    if (err) throw err; // 如果出现错误就抛出错误信息
    console.log('文件夹创建成功');
})

if (!fs.existsSync(defaultOldImagePath)) fs.mkdir(defaultOldImagePath, (err) => {
    if (err) throw err; // 如果出现错误就抛出错误信息
    console.log('文件夹创建成功');
})

let moveImages = schedule.scheduleJob('0 0 0 * * *', () => {
    moveAllFilesFrom(defaultImagePath, defaultOldImagePath);
    console.log('文件移动成功');
});

function decodeHTMLEntities(text) {
    return he.decode(text);
}

let config = JSON.stringify({
    wsaddress: "localhost",
    wsPort: 8081,
    ListenGroup: [114514]
})

if (!fs.existsSync("./plugins/Group_and_BDS/config.json")) {
    fs.mkdir("./plugins/Group_and_BDS", (err) => {
        if (err) throw new Error(err.message)
    })
    fs.writeFileSync("./plugins/Group_and_BDS/config.json", config, "utf8",)
}
const data = JSON.parse(fs.readFileSync("./plugins/Group_and_BDS/config.json").toString())
let bds = new ws.Server({
    address: data.wsaddress,
    port: data.wsPort
})

let listenGroup = data.ListenGroup

// 需要使用正则表达式匹配的消息类型
// at: '[CQ:reply,id=-2071119681][CQ:at,qq=3204417902] test'
// reply: '[CQ:reply,id=-2071119681] test'
// image: 'test[CQ:image,file=17aff1023dcc036687f858c1b037c3d5.image,subType=1,url=https://gchat.qpic.cn/gchatpic_new/3245008773/713728802-3080979658-17AFF1023DCC036687F858C1B037C3D5/0?term=3&amp;is_origin=0]'

bds.on("connection", (ws) => {
    if (bdsConnected == true) return;
    bdsConnected = true;
    bot.BotEvents.on("onReceiveGroupMessage", (msg) => {
        let data = msg
        const nickname = data.sender.nickname;
        const card = data.sender.card;
        const message = data.message;
        listenGroup.forEach((group) => {
            if (data.group_id === group) {
                imageMsgHandle(message, group);
                ws.send(`[群聊] ${data.sender.role == 'admin' || data.sender.role == 'owner' ? '§6' : ''}${card != '' ? card : nickname}§r(` + data.sender.user_id + ") > " + `${decodeHTMLEntities(messageHandle(message))}`)
            }
        })
    })
    ws.on("message", (msg) => {
        let data = msg.toString()
        console.log(`${data}`)
        listenGroup.forEach((e) => {
            bot.send_group_msg(e, data, true)
        })
    })
})

function messageHandle(msg) { // 替换消息中的CQ码
    let handledMsg = msg;
    const cqCodeReg = /\[CQ:.*?\]/g;
    const cqCodeList = msg.match(cqCodeReg);
    if (cqCodeList) {
        cqCodeList.forEach((cqCode) => {
            const cqCodeType = cqCode.match(/\[CQ:([^,]+),/)[1];
            // console.log(cqCode);
            // console.log(cqCodeType);
            switch (cqCodeType) {
                case 'at':
                    const atQQ = cqCode.match(/qq=(.*?)\]/)[1];
                    handledMsg = handledMsg.replace(cqCode, '§e@' + atQQ + '§r');
                    break;
                case 'reply':
                    handledMsg = handledMsg.replace(cqCode, '§a[回复]§r');
                    break;
                case 'image':
                    handledMsg = handledMsg.replace(cqCode, '§b[图片]§r');
                    break;
                default:
                    handledMsg = handledMsg.replace(cqCode, "§a[" + cqCodeType + "]§r");
                    break;
            }
        });
    }
    return handledMsg;
}

function imageMsgHandle(msg, group) {
    const cqCodeReg = /\[CQ:.*?\]/g;
    const cqCodeList = msg.match(cqCodeReg);
    // console.log(cqCodeList);
    const rawText = msg.replace(/\[.*?\]/g, '');
    if (cqCodeList && rawText.replace('\n', '') == '上传') {
        let fileNameList = [];
        let fileUploadSuccess = [];
        let resultValue;
        let resultText;
        cqCodeList.forEach((cqCode) => {
            const cqCodeType = cqCode.match(/\[CQ:([^,]+),/)[1];
            // console.log(cqCode);
            // console.log(cqCodeType);
            switch (cqCodeType) {
                case 'image':
                    // 匹配文件名
                    const fileRegex = /file=([^\s,]+)/;
                    const fileMatch = cqCode.match(fileRegex);
                    const file = fileMatch ? fileMatch[1] : null;

                    // 匹配URL
                    const urlRegex = /url=([^']+?)(?=[',\]])/;
                    const urlMatch = cqCode.match(urlRegex);
                    const url = urlMatch ? urlMatch[1] : null;
                    console.log('- - - - File uploaded. - - -');
                    console.log('URL:', url);
                    console.log('文件名:', file);

                    if (file && url) {
                        const result = downloadImage(url, defaultImagePath + file + '.jpg');
                        if (result) {
                            resultValue = 0;
                            console.log(result);
                        } else {
                            resultValue = 1;
                            console.log('文件下载成功');
                        }
                        if (fileNameList.indexOf(file) == -1) {
                            fileNameList.push(file);
                            fileUploadSuccess.push(resultValue);
                        }
                    }
                    
                    console.log('- - - - - - - - - - - - - -');

                    break;
            }
        });
        resultText = '文件上传结果：\n';

        for (let i = 0; i < fileNameList.length; i++) {
            if (fileUploadSuccess[i] == 1) {
                resultText += `✅ [${i + 1}] \n`;
                resultText += fileNameList[i] + '\n';
            } else {
                resultText += `🔴 [${i + 1}] \n`;
                resultText += fileNameList[i] + '\n';
            }
        }
        bot.send_group_msg(group, resultText, true);
    }
}

function downloadImage(fileUrl, path) {
    const file = fs.createWriteStream(path);

    https.get(fileUrl, (response) => {
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            return 0;
        });
    }).on('error', (err) => {
        fs.unlink(path, () => {
            return err.message;
        });
    });
}

function moveAllFilesFrom(oldPath, newPath) {
    fs.readdir(oldPath, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        files.forEach((file) => {
            const filePath = oldPath + file;
            const newFilePath = newPath + file;
            fs.rename(filePath, newFilePath, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        });
    });
}