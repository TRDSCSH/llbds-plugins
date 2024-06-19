// 插件注册
ll.registerPlugin("leaveMsgForOfflinePlayers", "给离线玩家留言", [1, 0, 0, Version.Dev]);

// 常量与全局变量
const dbPath = "plugins/leaveMsgForOfflinePlayers/data/";
const logFilePath = "plugins/leaveMsgForOfflinePlayers/log.txt";
let dateStr = "";
if (!fileExists(logFilePath)) initFile(logFilePath);
const db = new KVDatabase(dbPath);
if (!isInited()) initDatabase(); 
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
let playerXuidAndName;
if (isInited()) {
    playerXuidAndName = db.get("name-xuid");
} else {
    playerXuidAndName = initPlayerXuidAndName();
    updateNameXuidInDB();
}
const itemCountPerPage = 8;
const minMsgLength = 5;

// 函数导入
const xuid2name = ll.imports("PLINFO", "xuid2name");
// const getAllPlayerInfo = ll.imports("PLINFO", "getAllPlayerInfo");

// 命令注册
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("liuyan", "给离线的玩家留言", PermType.Any);
    cmd.setEnum("gui", ["gui"]);
    cmd.mandatory("action", ParamType.Enum, "gui", 1);
    cmd.overload([]);
    cmd.overload(["gui"]);
    cmd.setCallback((cmd, origin, output, results) => {
        const action = results.action;
        if (origin.type == 0) {
            const pl = origin.player;
            if (action == "gui" || !action) {
                SelectPlayerGUI(pl, filterOnlinePlayer(playerXuidAndName), 1);
            }
        }
    });
    cmd.setup();
});

// 事件
mc.listen("onJoin", async(pl) => {
    const playerXuid = pl.xuid;
    const playerName = pl.realName;
    const playerMsgData = db.get(playerXuid);
    if (!playerMsgData) {
        // 玩家第一次进入服务器，需要初始化玩家数据
        db.set(playerXuid, {
            "name": playerName,
            "leftTime": getDateAndTime(),
            "sent": [],
            "msg": []
        });
        if (playerFound(playerXuid)) {
            playerXuidAndName.push([playerXuid, playerName]);
            updateNameXuidInDB();
        }
    } else {
        // 玩家不是第一次进入服务器，需要检查玩家名是否匹配
        if (playerMsgData.name != playerName) {
            // 玩家名和xuid不匹配，需要更新数据库中的玩家名
            playerMsgData.name = playerName;
            db.set(playerXuid, playerMsgData);
            const pos = playerFound(playerXuid);
            if (pos != -1) {
                playerXuidAndName[pos][1] = playerName;
                updateNameXuidInDB();
            }
        }
        const msg = playerMsgData.msg;
        const msgCount = msg.length;
        if (msgCount > 0) {
            // 当玩家上线收到消息时，需要弹出顶部提示
            pl.sendToast("新留言", "有 " + msgCount + " 位玩家在你离线的时候给你留言了");
            // sleep(2000); // todo: 玩家留言间隔显示
            msg.forEach((item) => {
                const sender = item.sender;
                const time = item.time;
                const content = item.content;
                const msg = `§e${xuid2name(sender)} §r在 §a${time} §r留言：\n${content}`;
                pl.sendText(msg);
                // 更新玩家的已发送列表
                const senderMsgData = db.get(sender);
                const pos = senderMsgData.sent.indexOf(playerXuid);
                if (pos != -1) senderMsgData.sent.splice(pos, 1);
                db.set(sender, senderMsgData);
                logToFile(logFilePath, `[${getTime()}] ${playerName} 查看了 ${xuid2name(sender)} 的留言：${content}`);
            });
            // 清空玩家的留言
            playerMsgData.msg = [];
            db.set(playerXuid, playerMsgData);
            // 更新玩家的离线时间
            playerMsgData.leftTime = getDateAndTime();
            db.set(playerXuid, playerMsgData);
        }
    }
});

mc.listen("onLeft", (pl) => {
    const playerXuid = pl.xuid;
    const playerMsgData = db.get(playerXuid);
    if (playerMsgData) {
        // 更新玩家的离线时间
        playerMsgData.leftTime = getDateAndTime();
        db.set(playerXuid, playerMsgData);
    }
    // 玩家退出时，需要将玩家的留言排名提前
    const pos = playerFound(playerXuid);
    if (pos != -1) {
        const temp = playerXuidAndName[pos];
        playerXuidAndName.splice(pos, 1);
        playerXuidAndName.unshift(temp);
        updateNameXuidInDB();
    }
});

// GUI
function SelectPlayerGUI(pl, playerXuidArr, page, hint) {
    if (playerXuidArr.length == 0) {
        pl.tell("§c没有离线玩家");
        return;
    }
    // todo: 当玩家被留言时，将玩家留言排名提前 todo 日志记录留言内容
    const label1 = "§7发送一段留言给离线玩家， 当玩家上线时会收到这条留言。";
    let label2 = "§2有以下离线玩家：§r\n";
    const playerCount = playerXuidArr.length;
    const maxPage = Math.ceil(playerCount / itemCountPerPage);
    if (page < 1) {
        page = 1;
        hint = "§6已经是第一页了";
    } else if (page > maxPage) {
        page = maxPage;
        hint = "§6已经是最后一页了";
    }
    let start = (page - 1) * itemCountPerPage;
    if (start < 0) start = 0;
    if (start > playerCount) start = (maxPage - 1) * itemCountPerPage;
    let end = start + itemCountPerPage;
    if (end > playerCount) end = playerCount;
    for (let i = start; i < end; i++) {
        const playerXuid = playerXuidArr[i][0];
        const senderXuid = pl.xuid;
        const lastTime = getLastOnlineTime(playerXuid);
        label2 += `  §7${hasMsg(playerXuid) ? '§3' : ''}${hasMsgFrom(playerXuid, senderXuid) ? '§2' : ''}${i + 1}. §r${playerXuidArr[i][1]} §7${lastTime != "" ? "[" + lastTime.split(" ")[0] + "]" : ""}\n§r`;
    }
    label2 += `§7- 第 ${page} 页 · 共 ${maxPage} 页 -\n§r`;
    const sliderTitle = "§7滑动下面的滑块来选择玩家或翻页§r\n当前选择";
    let items = [];
    items.push(" §b< 上一页 >");
    for (let i = start; i < end; i++) {
        // pl.tell(i.toString());
        items.push(" §a§l" + playerXuidArr[i][1]);
    }
    items.push(" §b< 下一页 >");
    const fm = mc.newCustomForm()
        .setTitle("离线留言 - 选择玩家")
        .addLabel(label1)
        .addLabel(label2)
        .addStepSlider(sliderTitle, items, 1)
        .addInput("§7* §r通过玩家名搜索玩家§7（不区分大小写）§r", "如果不需要使用搜索功能， 这里留空即可")
        .addLabel(hint || "")
        .addLabel("点击下方的按钮来进行下一步操作");
    pl.sendForm(fm, (pl, fmdata) => {
        if (!fmdata) return;
        const slider = fmdata[2];
        const search = fmdata[3];
        if (search != "") {
            const result = searchPlayerXuidByName(playerXuidArr, search);
            // pl.tell(`§a搜索到 ${result.length} 个玩家`);
            // for (let i = 0; i < result.length; i++) {
            //     pl.tell(result[i][0] + " " + result[i][1]);
            // }
            if (result.length == 0) {
                SelectPlayerGUI(pl, playerXuidArr, page, `§c没有找到名字中包含 ${search} 玩家`);
            } else {
                SelectPlayerGUI(pl, result, 1, "");
            }
            return;
        }
        if (slider == 0) {
            // 上一页
            SelectPlayerGUI(pl, playerXuidArr, page - 1, "");
        } else if (slider == end - start + 1) {
            // 下一页
            SelectPlayerGUI(pl, playerXuidArr, page + 1, "");
        } else {
            // 选择玩家
            const pos = (page - 1) * itemCountPerPage + slider - 1;
            const playerXuid = playerXuidArr[pos][0];
            const senderXuid = pl.xuid;
            // 查找玩家是否有留言
            const playerMsgData = db.get(playerXuid);
            const msgArr = playerMsgData.msg;
            const hasMsgFromPl = hasMsgFrom(playerXuid, senderXuid);
            if (playerMsgData) {
                const msg = playerMsgData.msg;
                if (msg.length > 0) {
                    // 有留言，查找留言的发送者是否为当前玩家
                    const msgIndex = getMsgIndex(playerXuid, senderXuid);
                    if (msgIndex != -1) {
                        if (hasMsgFromPl) {
                            EditMsgGUI(pl, playerXuid, playerXuidArr, hasMsgFromPl, `§6你已经给 ${xuid2name(playerXuid)} 留言了， 你可以继续编辑留言内容`, msgArr[msgIndex].content, page);
                        } else {
                            EditMsgGUI(pl, playerXuid, playerXuidArr, hasMsgFromPl, "", "", page);
                        }
                    } else {
                        EditMsgGUI(pl, playerXuid, playerXuidArr, hasMsgFromPl, "", "", page);
                    }
                } else {
                    EditMsgGUI(pl, playerXuid, playerXuidArr, hasMsgFromPl, "", "", page);
                }
            } else {
                pl.tell("§c发生错误， 玩家数据不存在！");
            }
        }
    });
}

function EditMsgGUI(pl, receiverXuid, playerXuidArr, hasMsgFromPl, hint, content, page) {
    if (!page) page = 1;
    if (!hint) hint = "";
    if (!content) content = "";
    const fm = mc.newCustomForm()
        .setTitle("离线留言 - 编辑留言")
        .addLabel(`给 §2${xuid2name(receiverXuid)} §r留言`)
        .addLabel(hint || "")
        .addInput("§7* §r在下面文本框中输入留言内容", `在这里输入至少 ${minMsgLength} 个字符的留言`, content || "")
        .addLabel("点击下方的“提交”按钮来提交留言");
    pl.sendForm(fm, (pl, fmdata) => {
        if (!fmdata) {
            SelectPlayerGUI(pl, playerXuidArr, page, hasMsgFromPl ? `§6未修改留言` : `§c留言已放弃`);
            return;
        }
        const msg = fmdata[2];
        if (msg.length < minMsgLength) {
            if (hasMsgFromPl) {
                const playerMsgData = db.get(receiverXuid);
                const msgArr = playerMsgData.msg;
                const msgIndex = getMsgIndex(receiverXuid, pl.xuid);
                msgArr.splice(msgIndex, 1);
                playerMsgData.msg = msgArr;
                db.set(receiverXuid, playerMsgData);
                SelectPlayerGUI(pl, playerXuidArr, page, `§c留言已清除`);
                logToFile(logFilePath, `[${getTime()}] ${pl.realName} 把给 ${xuid2name(receiverXuid)} 留言清除了`);
            } else {
                EditMsgGUI(pl, receiverXuid, playerXuidArr, hasMsgFromPl, `§c留言内容需要至少 ${minMsgLength} 个字符`, msg, page);
            }
            return;
        }
        if (content == msg) {
            SelectPlayerGUI(pl, playerXuidArr, page, "");
            return;
        }
        const playerMsgData = db.get(receiverXuid);
        if (playerMsgData) {
            const msgArr = playerMsgData.msg;
            if (!hasMsgFromPl) {
                msgArr.push({
                    "sender": pl.xuid,
                    "time": getDateAndTime(),
                    "content": msg
                });
            } else {
                const msgIndex = getMsgIndex(receiverXuid, pl.xuid);
                if (msgIndex == -1) {
                    pl.tell("§c发生错误， 留言数据不存在！");
                } else {
                    msgArr[msgIndex].content = msg;
                    msgArr[msgIndex].time = getDateAndTime();
                }
            }   
            playerMsgData.msg = msgArr;
            db.set(receiverXuid, playerMsgData);
            // 更新玩家的已发送列表
            const senderMsgData = db.get(pl.xuid);
            if (senderMsgData) {
                const sent = senderMsgData.sent;
                if (!sent.includes(receiverXuid)) {
                    sent.push(receiverXuid);
                    senderMsgData.sent = sent;
                    db.set(pl.xuid, senderMsgData);
                }
            }
            logToFile(logFilePath, `[${getTime()}] ${pl.realName} 给 ${xuid2name(receiverXuid)} 留言：${msg}`);
            SelectPlayerGUI(pl, playerXuidArr, page, `${hasMsgFromPl ? `§a留言已修改` : `§a留言已发送`}`);
            // 提高玩家的留言排名
            const pos = playerFound(receiverXuid);
            if (pos != -1) {
                const temp = playerXuidAndName[pos];
                playerXuidAndName.splice(pos, 1);
                playerXuidAndName.unshift(temp);
                updateNameXuidInDB();
            }
        } else {
            pl.tell("§c发生错误， 玩家数据不存在！");
        }
    });
}

// function EditMsgAlertGUI(pl, receiverXuid, playerXuidArr, msg, page) {
//     const fm = mc.newSimpleForm()
//         .setContent("")
//         .addButton("继续编辑")
//         .addButton("§c退出");
//     pl.sendForm(fm, (pl, id) => {
//         if (id == null) {
//             EditMsgGUI(pl, receiverXuid, playerXuidArr, "", msg, page);
//         } else {
//             if (id == 0) {
//                 EditMsgGUI(pl, receiverXuid, playerXuidArr, "", msg, page);
//             } else {
//                 SelectPlayerGUI(pl, playerXuidArr, 1, `§6已舍弃留言`);
//                 pl.tell("§6已舍弃写给 " + xuid2name(receiverXuid) + " 的留言:\n" + msg);
//             }
//         }
//     });
// }

/*
    数据结构：
    {
        "inited": true, // 是否已从玩家数据库中读取数据
        "name-xuid": [ // 玩家名和xuid的对应关系
        "xuid1": {
            "name": "name1",
            "leftTime": "2020-01-01 00:00:00", // 玩家上线时，将此时间设为当前时间
            "sent": ["xuid"], // 已发送的玩家(供参考，判断需要看msg)，当玩家上线时，删除此数组中的相应玩家
            "msg": [ // 通过msg.length来判断是否有留言，暂时不考虑做留言数量限制
                {
                    "sender": "senderXuid",
                    "time": "2020-01-01 00:00:00",
                    "content": "msg1"
                },
                {
                    "sender": "senderXuid",
                    "time": "2020-01-01 00:00:00",
                    "content": "msg2"
                }
            ]
        },
        "xuid2": {
            "name": "name2",
            ...
        }
    }
*/

// 函数
function filterOnlinePlayer(arr) {
    const result = [];
    const onlinePlayerName = mc.getOnlinePlayers().map((item) => item.realName);
    for (let i = 0; i < arr.length; i++) {
        if (!onlinePlayerName.includes(arr[i][1])) {
            result.push(arr[i]);
        }
    }
    return result;
}

function searchPlayerXuidByName(arr, name) { // 不区分大小写
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][1].toLowerCase().includes(name.toLowerCase())) {
            result.push(arr[i]);
        }
    }
    return result;
}

function isInited() {
    if (db.get("inited")) {
        if (db.get("inited") == true) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function initDatabase() {
    const allPlayerInfo = getAllPlayerInfo();
    log(`共有 ${allPlayerInfo.length} 条玩家数据，开始初始化数据库...`);
    for (let i = 0; i < allPlayerInfo.length; i++) {
        const plInfo = allPlayerInfo[i];
        const xuid = plInfo.xuid;
        const name = plInfo.name;
        db.set(xuid, {
            "name": name,
            "leftTime": "",
            "sent": [],
            "msg": []
        });
    }
    db.set("inited", true);
    db.set("name-xuid", initPlayerXuidAndName());
    log("数据库初始化完成！");
}

function initPlayerXuidAndName() {
    const allPlayerInfo = getAllPlayerInfo();
    let playerXuidAndName = [];
    for (let i = 0; i < allPlayerInfo.length; i++) {
        const plInfo = allPlayerInfo[i];
        const xuid = plInfo.xuid;
        const name = plInfo.name;
        playerXuidAndName.push([xuid, name]);
    }
    return playerXuidAndName;
}

function getDateAndTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = date.getDate();
    if (day < 10) day = "0" + day;
    var hour = date.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = date.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = date.getSeconds();
    if (second < 10) second = "0" + second;
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

function getDateByString(str) { // 示例输入：2020-01-01 00:00:00
    return str.split(" ")[0];
}

function playerFound(xuid) {
    for (let i = 0; i < playerXuidAndName.length; i++) {
        if (playerXuidAndName[i][0] == xuid) {
            return i;
        }
    }
    return -1;
}

function updateNameXuidInDB() {
    db.set("name-xuid", playerXuidAndName);
}

function getLastOnlineTime(xuid) {
    const playerMsgData = db.get(xuid);
    if (playerMsgData) {
        return playerMsgData.leftTime;
    } else {
        return "";
    }
}

function hasMsg(xuid) {
    const playerMsgData = db.get(xuid);
    if (playerMsgData) {
        return playerMsgData.msg.length > 0;
    } else {
        return false;
    }
}

function hasMsgFrom(xuid, senderXuid) {
    const playerMsgData = db.get(xuid);
    if (playerMsgData) {
        const msg = playerMsgData.msg;
        for (let i = 0; i < msg.length; i++) {
            if (msg[i].sender == senderXuid) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
}

function hasMsgFrom2(xuid, senderXuid) {
    const playerMsgData = db.get(senderXuid);
    if (playerMsgData) {
        const sent = playerMsgData.sent;
        return sent.includes(xuid);
    } else {
        return false;
    }
}

function getMsgIndex(xuid, senderXuid) {
    const playerMsgData = db.get(xuid);
    if (playerMsgData) {
        const msg = playerMsgData.msg;
        for (let i = 0; i < msg.length; i++) {
            if (msg[i].sender == senderXuid) {
                return i;
            }
        }
        return -1;
    } else {
        return -1;
    }
}

// 日志相关函数
function getTime() {
    var date = new Date();
    var hour = date.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = date.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = date.getSeconds();
    if (second < 10) second = "0" + second;
    return hour + ":" + minute + ":" + second;
}

function getDateStr() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = date.getDate();
    if (day < 10) day = "0" + day;
    return year + "/" + month + "/" + day;
}

function fileExists(filename) {
    return File.readFrom(logFilePath);
}

function initFile(filename) {
    let header = "Server version: " + mc.getBDSVersion() + "\n" + "Start time: " + getDateAndTime();
    File.writeLine(logFilePath, header);
}

function logDateLine(filename, dateStr) {
    if (dateStr == undefined) dateStr = getDateStr();
    let line = "\n" + "--- " + dateStr + " ---";
    File.writeLine(logFilePath, line);
}

function dateCheck() {
    const curDate = getDateStr();
    if (dateStr != curDate) {
        dateStr = curDate;
        logDateLine(logFilePath, dateStr);
    }
}

function logToFile(filename, line) {
    dateCheck();
    File.writeLine(logFilePath, line);
}

// 调试
function tellArr(pl, arr, count) {
    for (let i = 0; i < count; i++) {
        pl.tell(arr[i]);
    }
}

/*
测试代码：
const playerXuidAndName = [
    ["114515", "afds"],
    ["114516", "asdfsadf"],
    ["114517", "asdfsdf"],
    ["114518", "Stesdfsave"],
    ["114514", "Steve"],
    ["114519", "sdfds"]
];

console.log(searchPlayerXuidByName(playerXuidAndName, "st"));
console.log(filterOnlinePlayer(playerXuidAndName));

function filterOnlinePlayer(arr) {
    const result = [];
    const onlinePlayerName = ["afds", "Stesdfsave"];
    for (let i = 0; i < arr.length; i++) {
        if (!onlinePlayerName.includes(arr[i][1])) {
            result.push(arr[i]);
        }
    }
    return result;
}

function searchPlayerXuidByName(arr, name) { // 不区分大小写
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][1].toLowerCase().includes(name.toLowerCase())) {
            result.push(arr[i]);
        }
    }
    
    return result;
}
*/

function getAllPlayerInfo() {
    const dataPath = "plugins/PlayerInfo/data.json";
    const dataFile = new JsonConfigFile(dataPath);

    const players = dataFile.get("players").map(player => {
        return {
            uuid: player[0],
            xuid: player[1],
            name: player[2],
            date: player[3],
            lastlogin: player[4]
        };
    });

    return players;
}