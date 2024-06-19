// 常量
const databasePath = "plugins/home/data";
const configFilePath = "plugins/home/config.json";
const langFilePath = "plugins/home/i18n.json";
const db = new KVDatabase(databasePath);
const config = new JsonConfigFile(configFilePath, `{ "defaultLocale": "zh_CN", "command": "home", "maxHomeCount": 5, "pageMaxCount": 12 }`);
const defaultLocale = config.get("defaultLocale");

// 语言支持
i18n.load(langFilePath, "", {
    "zh_CN": {
        "dimName0": "主世界",
        "dimName1": "下界",
        "dimName2": "末地",
        "dimNameUnknown": "未知",
        "cmdDescraption": "家",
        "cmd.opSuccess": "已将 {0} 设为管理员",
        "cmd.alreadyOp": "{0} 已经是管理员了",
        "cmd.deopSuccess": "已移除 {0} 的管理员权限",
        "cmd.opNameNotFound": "找不到名为 {0} 的管理员",
        "cmd.opList": "管理员列表: {0}",
        "cmd.unfinished": "该功能尚未完成",
        "cmd.playerOnly": "请不要在终端使用此命令",
        "cmd.noPermission": "你没有权限使用此命令",
        "cmd.noPermissionHint": "如果你可以操作服务端，请在终端输入 §6{0} op \"{1}\"§r 来设置你的管理员权限",
        "cmd.homeCountLimit": "玩家 {0} 设置的家的数量已达到上限",
        "cmd.homeUnnamed": "未命名",
        "cmd.homeAddSuccess": "§a家传送点添加成功 §7[#{0}]§r\n名称: {1}\n坐标: ({2}, {3}, {4})",
        "cmd.langSetSuccess": "§a语言设置成功:§r {0}",
        "cmd.langNotFound": "在配置文件中没有 {0} 语言",
        "cmd.isTerminalCmd": "请在终端使用此命令",
        "cmd.pluginReloaded": "插件重载成功",
        "cmd.homeTpSuccess": "§a传送成功§r\n传送到: {0}",
        "cmd.homeTpSuccessByOP": "§a传送成功§r\n传送到: {0}\n执行者: {1})",
        "cmd.homeNotFound": "§c家传送点不存在",
        "cmd.homeDelSuccess": "§a家传送点删除成功§r",
        "cmd.homeSetAsMainSuccess": "§a默认家传送点设置成功§r",
    },
    "zh_TW": {
        "dimName0": "主世界",
        "dimName1": "下界",
        "dimName2": "終界",
        "dimNameUnknown": "未知",
        "cmdDescraption": "家",
        "cmd.opSuccess": "已將 {0} 設為管理員",
        "cmd.alreadyOp": "{0} 已經是管理員了",
        "cmd.deopSuccess": "已移除 {0} 的管理員權限",
        "cmd.opNameNotFound": "找不到名為 {0} 的管理員",
        "cmd.opList": "管理員列表: {0}",
        "cmd.unfinished": "該功能尚未完成",
        "cmd.playerOnly": "請不要在終端使用此命令",
        "cmd.noPermission": "你沒有權限使用此命令",
        "cmd.noPermissionHint": "如果你可以操作服務端，請在終端輸入 §6{0} op \"{1}\"§r 來設置你的管理員權限",
        "cmd.homeCountLimit": "玩家 {0} 設置的家的數量已達到上限",
        "cmd.homeUnnamed": "未命名",
        "cmd.homeAddSuccess": "§a家傳送點添加成功 §7[#{0}]§r\n名稱: {1}\n坐標: ({2}, {3}, {4})",
        "cmd.langSetSuccess": "§a語言設置成功:§r {0}",
        "cmd.langNotFound": "在配置文件中沒有 {0} 語言",
        "cmd.isTerminalCmd": "請在終端使用此命令",
        "cmd.pluginReloaded": "插件重載成功",
        "cmd.homeTpSuccess": "§a傳送成功§r\n傳送到: {0}",
        "cmd.homeTpSuccessByOP": "§a傳送成功§r\n傳送到: {0}\n執行者: {1})",
        "cmd.homeNotFound": "§c家傳送點不存在",
        "cmd.homeDelSuccess": "§a家傳送點刪除成功§r",
        "cmd.homeSetAsMainSuccess": "§a默認家傳送點設置成功§r",
    },
    "en": {
        "dimName0": "Overworld",
        "dimName1": "Nether",
        "dimName2": "End",
        "dimNameUnknown": "Unknown",
        "cmdDescraption": "HOME",
        "cmd.opSuccess": "{0} has been set as an operator",
        "cmd.alreadyOp": "{0} is already an operator",
        "cmd.deopSuccess": "{0} has been removed from the operator",
        "cmd.opNameNotFound": "Operator {0} not found",
        "cmd.opList": "Operator list: {0}",
        "cmd.unfinished": "This function is not finished yet",
        "cmd.playerOnly": "Please do not use this command in the terminal",
        "cmd.noPermission": "You do not have permission to use this command",
        "cmd.noPermissionHint": "If you can operate the server, please enter §6{0} op \"{1}\"§r in the terminal to set your operator permissions",
        "cmd.homeCountLimit": "The number of homes set by {0} has reached the upper limit",
        "cmd.homeUnnamed": "Unnamed",
        "cmd.homeAddSuccess": "§aHome added successfully §7[#{0}]§r\nName: {1}\nPosition: ({2}, {3}, {4})",
        "cmd.langSetSuccess": "§aCurrent language:§r {0}",
        "cmd.langNotFound": "Locale {0} not found in config file",
        "cmd.isTerminalCmd": "Please use this command in the terminal",
        "cmd.pluginReloaded": "Plugin reloaded",
        "cmd.homeTpSuccess": "§aTeleported successfully§r\nTeleported to: {0}",
        "cmd.homeTpSuccessByOP": "§aTeleported successfully§r\nTeleported to: {0}\nOperator: {1})",
        "cmd.homeNotFound": "§cHome not found",
        "cmd.homeDelSuccess": "§aHome deleted successfully§r",
        "cmd.homeSetAsMainSuccess": "§aDefault home set successfully§r",
    }
});

// 命令注册
mc.listen("onServerStarted", () => {
    const config = new JsonConfigFile(configFilePath);
    const cmd = mc.newCommand(config.get("command"), i18n.trl(defaultLocale, "cmdDescraption"), PermType.Any);
    cmd.setEnum("Add", ["set", "add"]);
    cmd.setEnum("Rename", ["rename"]);
    cmd.setEnum("Del", ["del"]);
    cmd.setEnum("List", ["ls"]);
    cmd.setEnum("Tp", ["tp"]);
    cmd.setEnum("SetAsMain", ["main"]);
    cmd.setEnum("Lang", ["lang"]);
    cmd.setEnum("Gui", ["gui"]);
    cmd.setEnum("Mgr", ["mgr"]);
    cmd.setEnum("Op", ["op"]);
    cmd.setEnum("Deop", ["deop"]);
    cmd.setEnum("Oplist", ["oplist"]);
    cmd.setEnum("Reload", ["reload"]);

    cmd.mandatory("action", ParamType.Enum, "Add", 1);
    cmd.mandatory("action", ParamType.Enum, "Rename", 1);
    cmd.mandatory("action", ParamType.Enum, "Del", 1);
    cmd.mandatory("action", ParamType.Enum, "List", 1);
    cmd.mandatory("action", ParamType.Enum, "Tp", 1);
    cmd.mandatory("action", ParamType.Enum, "Gui", 1);
    cmd.mandatory("opaction", ParamType.Enum, "Mgr", 1);
    cmd.mandatory("opaction", ParamType.Enum, "Reload", 1);
    cmd.mandatory("action", ParamType.Enum, "Lang", 1);
    cmd.mandatory("action", ParamType.Enum, "SetAsMain", 1);
    cmd.mandatory("terminalAction", ParamType.Enum, "Op", 1);
    cmd.mandatory("terminalAction", ParamType.Enum, "Deop", 1);
    cmd.mandatory("terminalAction", ParamType.Enum, "Oplist", 1);
    cmd.mandatory("homeID", ParamType.Int);
    cmd.optional("homeId", ParamType.Int);
    cmd.optional("page-num", ParamType.Int);
    cmd.mandatory("victimid", ParamType.Int);
    cmd.mandatory("homepos", ParamType.Vec3);
    cmd.optional("o-homepos", ParamType.Vec3);
    cmd.mandatory("homename", ParamType.String);
    cmd.optional("o-homename", ParamType.String);
    cmd.mandatory("ori-homename", ParamType.String);
    cmd.optional("o-ori-homename", ParamType.String);
    cmd.mandatory("victimname", ParamType.String);
    cmd.optional("o-victimname", ParamType.String);
    cmd.mandatory("locale", ParamType.String);
    cmd.mandatory("opName", ParamType.String);

    cmd.overload(["homeId"]);
    cmd.overload(["Add", "homename", "o-homepos"]);
    cmd.overload(["Add", "o-homepos"]);
    cmd.overload(["Rename", "homeID", "homename"]);
    cmd.overload(["Rename", "ori-homename", "homename"]);
    cmd.overload(["Del", "homeID"]);
    cmd.overload(["Del", "homename"]);
    cmd.overload(["List", "page-num"]);
    cmd.overload(["Tp", "homeID"]);
    cmd.overload(["Tp", "homename"]);
    cmd.overload(["SetAsMain", "homeID"]);
    cmd.overload(["Lang", "locale"]);
    cmd.overload(["Op", "opName"]);
    cmd.overload(["Deop", "opName"]);
    cmd.overload(["Oplist"]);
    cmd.overload(["Reload"]);
    cmd.overload(["Gui"]);
    cmd.overload(["Mgr", "victimname", "homeId"]);
    cmd.overload(["Mgr", "victimname", "Add", "homename", "o-homepos"]);
    cmd.overload(["Mgr", "victimname", "Add", "o-homepos"]);
    cmd.overload(["Mgr", "victimname", "Rename", "homeID", "homename"]);
    cmd.overload(["Mgr", "victimname", "Rename", "ori-homename", "homename"]);
    cmd.overload(["Mgr", "victimname", "Del", "homeID"]);
    cmd.overload(["Mgr", "victimname", "Del", "homename"]);
    cmd.overload(["Mgr", "victimname", "List", "page-num"]);
    cmd.overload(["Mgr", "victimname", "Tp", "homeID"]);
    cmd.overload(["Mgr", "victimname", "Tp", "homename"]);
    cmd.overload(["Mgr", "victimname", "SetAsMain", "homeID"]);
    cmd.overload(["Mgr", "victimname", "Lang", "locale"]);
    cmd.overload(["Mgr", "victimname", "Gui"]);

    cmd.setCallback((_cmd, _ori, out, res) => {
        if (_ori.type != 0) {
            if (_ori.type == 7) { // 终端命令
                if (res.terminalAction) {
                    let opList = db.get("opList") ? db.get("opList") : [];
                    if (res.terminalAction == "op") {
                        if (res.opName) {
                            if (!opList.includes(res.opName)) {
                                db.set("opList", opList.concat([res.opName]));
                                log(i18n.trl(defaultLocale, "cmd.opSuccess", res.opName));
                            } else {
                                log(i18n.trl(defaultLocale, "cmd.alreadyOp", res.opName));
                            }
                        }
                    } else if (res.terminalAction == "deop") {
                        if (opList.includes(res.opName)) {
                            db.set("opList", opList.filter((v) => v != res.opName));
                            log(i18n.trl(defaultLocale, "cmd.deopSuccess", res.opName));
                        } else {
                            log(i18n.trl(defaultLocale, "cmd.opNameNotFound", res.opName));
                        }
                    } else if (res.terminalAction == "oplist") {
                        log(i18n.trl(defaultLocale, "cmd.opList", opList.join(", ")));
                    }
                } else if (res.opaction) {
                    if (res.opaction == "reload") {
                        mc.runcmd("ll reload home");
                    }
                } else {
                    log(i18n.trl(defaultLocale, "cmd.playerOnly"));
                }
            }
            return;
        }

        const pl = _ori.player;
        const playerLocale = getPlayerLang(pl.realName);

        if (res.opaction) { // 管理员权限检查
            if (_ori.type == 0) {
                if (db.get("opList").includes(pl.realName)) {
                    if (!pl.isOP()) { // 使用管理员命令需要玩家是OP
                        pl.tell("§c" + i18n.trl(playerLocale, "cmd.noPermission") + "§r\n");
                        return;
                    }
                } else {
                    pl.tell("§c" + i18n.trl(playerLocale, "cmd.noPermission") + "§r\n" + i18n.trl(playerLocale, "cmd.noPermissionHint", config.get("command"), pl.realName));
                }
            }
        }
        if (!hasPlayerConfig(pl.realName)) initPlayerConfig(pl.realName);
        pl.tell("§6" + JSON.stringify(res) + "§r");
        let victimName = res.victimname ? res.victimname : pl.realName;
        if (!res.action && !res.opaction && !res.terminalAction && !isNumber(res.homeId) && !res.homename) {
            tpHomeById(pl, pl.realName);
        } else if (res.action) {
            let action = res.action;
            if (action == "add" || action == "set") {
                let homePos = res["o-homepos"] ? res["o-homepos"] : pl.pos;
                let homeName = res.homename ? res.homename : "";
                if (!addHome(victimName, homeName, homePos)) {
                    pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeCountLimit", victimName)}§r`);
                    return;
                }
                pl.tell(`${i18n.trl(playerLocale, "cmd.homeAddSuccess", homeCount(victimName), homeName == "" ? "§7" + i18n.trl(playerLocale, "cmd.homeUnnamed") + "§r" : homeName, homePos.x.toFixed(2), homePos.y.toFixed(2), homePos.z.toFixed(2))}`);
            } else if (action == "tp") {
                if (isNumber(res.homeID)) {
                    let homeId = res.homeID - 1;
                    pl.tell(`§6${homeId}§r`);
                    let victimName = res.victimname ? res.victimname : pl.realName;
                    tpHomeById(pl, victimName, homeId);
                } else if (res.homename) {
                    let homeName = res.homename;
                    tpHomeByName(pl, victimName, homeName);
                }
            } else if (action == "del") {
                let victimName = res.victimname ? res.victimname : pl.realName;
                if (isNumber(res.homeID)) {
                    let homeId = res.homeID - 1;
                    if (!removeHomeById(victimName, homeId)) {
                        pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeNotFound")}§r`);
                        return;
                    }
                    pl.tell(`§a${i18n.trl(playerLocale, "cmd.homeDelSuccess")}§r`);
                } else if (res.homename) {
                    let homeName = res.homename;
                    if (!removeHomeByName(victimName, homeName)) {
                        pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeNotFound")}§r`);
                        return;
                    }
                    pl.tell(`§a${i18n.trl(playerLocale, "cmd.homeDelSuccess")}§r`);
                }
            } else if (action == "list") {
                /* 
                [1] home1 (x, y, z) 主世界
                [2] home2 (x, y, z) 主世界
                [3] home3 (x, y, z) 下界
                [4] home4 (x, y, z) 末地
                - - - - - - -
                第 1 页 / 共 2 页
                */
            } else if (action == "setasmain") {
                let homeId = res.homeID;
                let victimName = res.victimname ? res.victimname : pl.realName;
                if (!setAsMainHome(victimName, homeId)) {
                    pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeNotFound")}§r`);
                    return;
                }
                pl.tell(`§a${i18n.trl(playerLocale, "cmd.homeSetAsMainSuccess")}§r`);
            } else if (action == "rename") {

            } else if (action == "lang") {
                let langList = getLocalesArrayFromConfig();
                // log(langList);
                for (let i = 0; i < langList.length; i++) {
                    if (langList[i] == res.locale) {
                        break;
                    }
                    if (i == langList.length - 1) {
                        pl.tell(`§c${i18n.trl(playerLocale, "cmd.langNotFound", res.locale)}§r`);
                        return;
                    }
                }
                setPlayerLang(pl.realName, res.locale);
                pl.tell(`§a${i18n.trl(res.locale, "cmd.langSetSuccess", res.locale)}§r`);
            } else if (action == "gui") {

            } else {
                pl.tell(`§c${i18n.trl(playerLocale, "cmd.unfinished")}§r`);
            }
        } else if (isNumber(res.homeId)) {
            tpHomeById(pl, pl.realName, res.homeId - 1);
        } else if (res.opaction) {
            if (res.opaction == "reload") {
                mc.runcmd("ll reload home");
                pl.sendText("§a" + i18n.trl(playerLocale, "cmd.pluginReloaded") + "§r");
            }
        } else if (res.terminalAction) {
            pl.sendText("§c" + i18n.trl(playerLocale, "cmd.isTerminalCmd") + "§r");
        }
    });

    cmd.setup();
});

// 函数
function addHome(victimname, homeName, homePos) {
    // log(`${victimname} ${homeName} ${homePos}`); // 可以记录到日志（.csv文件）
    if (homeCount(victimname) >= getMaxHomeCount()) {
        return false;
    }
    let homeData = db.get(victimname) ? db.get(victimname) : [];
    homeData.push([homeName, [homePos.x, homePos.y, homePos.z, homePos.dimid]]);
    db.set(victimname, homeData);
    return true;
}

function removeHomeById(victimname, homeId) {
    let homeData = db.get(victimname);
    if (!homeData) return false;
    if (homeId > homeData.length - 1 || homeId < 0) return false;
    homeData.splice(homeId, 1);
    db.set(victimname, homeData);
    return true;
}

function removeHomeByName(victimname, homeName) {
    let homeData = db.get(victimname);
    if (!homeData) return false;
    for (let i = 0; i < homeData.length; i++) {
        if (homeData[i][0] == homeName) {
            homeData.splice(i, 1);
            db.set(victimname, homeData);
            return true;
        }
    }
    return false;
}

function setAsMainHome(victimName, homeId) {
    if (!swapHome(victimName, 0, homeId)) return false;
}

function swapHome(victimname, homeId1, homeId2) {
    homeData = db.get(victimname);
    if (!homeData) return false;
    if (homeId1 > homeData.length - 1 || homeId2 > homeData.length - 1) return false;
    let temp = homeData[homeId1];
    homeData[homeId1] = homeData[homeId2];
    homeData[homeId2] = temp;
    db.set(victimname, homeData);
    return true;
}

function renameHomeById(victimname, homeId, newName) {
    homeData = db.get(victimname);
    if (!homeData) return false;
    if (homeId > homeData.length - 1) return false;
    homeData[homeId][0] = newName;
    db.set(victimname, homeData);
    return true;
}

function renameHomeByName(victimname, oldName, newName) {
    homeData = db.get(victimname);
    if (!homeData) return false;
    for (let i = 0; i < homeData.length; i++) {
        if (homeData[i][0] == oldName) {
            homeData[i][0] = newName;
            db.set(victimname, homeData);
            return true;
        }
    }
    return false;
}

function homeList(victimname) {
    homeData = db.get(victimname);
    if (!homeData) return false;
    let homeList = [];
    for (let i = 0; i < homeData.length; i++) {
        homeList.push([i, homeData[i][0]]);
    }
    return homeList;
}

function pageText(array, pageMaxCount) {
    let text = "";
    for (let i = 0; i < array.length; i++) {
        if (i % pageMaxCount == 0) {
            text += "\n";
        }
        text += array[i];
    }
    return text;
}

function tpHomeById(pl, victimName, homeId) {
    if (!homeId) homeId = 0;
    let playerLocale = getPlayerLang(pl.realName);
    let homeData = db.get(victimName);
    let victim;
    if (!findOnlinePlayerByName(victimName)) {
        pl.tell(`§c${i18n.trl(playerLocale, "cmd.playerNotOnline", victimName)}§r`);
        return;
    } else {
        victim = findOnlinePlayerByName(victimName);
    }
    if (!homeData) {
        pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeNotFound")}§r`);
        return;
    }
    if (homeId > homeData.length - 1 || homeId < 0) {
        pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeNotFound")}§r`);
        return;
    }
    victim.teleport(new FloatPos(homeData[homeId][1][0], homeData[homeId][1][1], homeData[homeId][1][2], homeData[homeId][1][3]));
    pl.tell(i18n.trl(playerLocale, "cmd.homeTpSuccess", homeData[homeId][0] == "" ? "§7" + i18n.trl(playerLocale, "cmd.homeUnnamed") + "§r" : homeData[homeId][0]));
    if (pl.realName != victimName) {
        victim.tell(i18n.trl(getPlayerLang(victimName), "cmd.homeTpSuccessByOP", homeData[homeId][0], pl.realName));
    }
}

function tpHomeByName(pl, victimName, homeName) {
    let playerLocale = getPlayerLang(pl.realName);
    let homeData = db.get(victimName);
    let victim;
    if (!findOnlinePlayerByName(victimName)) {
        pl.tell(`§c${i18n.trl(playerLocale, "cmd.playerNotOnline", victimName)}§r`);
        return;
    } else {
        victim = findOnlinePlayerByName(victimName);
    }
    if (!homeData) {
        pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeNotFound")}§r`);
        return;
    }
    for (let i = 0; i < homeData.length; i++) {
        if (homeData[i][0] == homeName) {
            victim.teleport(new FloatPos(homeData[i][1][0], homeData[i][1][1], homeData[i][1][2], homeData[i][1][3]));
            pl.tell(i18n.trl(playerLocale, "cmd.homeTpSuccess", homeData[i][0] == "" ? "§7" + i18n.trl(playerLocale, "cmd.homeUnnamed") + "§r" : homeData[i][0]));
            if (pl.realName != victimName) {
                victim.tell(i18n.trl(getPlayerLang(victimName), "cmd.homeTpSuccessByOP", homeData[i][0], pl.realName));
            }
            return;
        }
    }
    pl.tell(`§c${i18n.trl(playerLocale, "cmd.homeNotFound")}§r`);
}

function findOnlinePlayerByName(playerName) {
    let players = mc.getOnlinePlayers();
    for (let i = 0; i < players.length; i++) {
        if (players[i].realName == playerName) {
            return players[i];
        }
    }
    return null;
}

function getMaxHomeCount() {
    const config = new JsonConfigFile(configFilePath);
    return config.get("maxHomeCount");
}

function getPlayerLang(playerName) {
    if (db.get(playerName + ".config")) {
        return db.get(playerName + ".config")[0];
    } else {
        return defaultLocale;
    }
}

function setPlayerLang(playerName, lang) {
    let playerConfig = db.get(playerName + ".config");
    playerConfig[0] = lang;
    db.set(playerName + ".config", playerConfig);
}

/*
<playername>.unread: [""] // 玩家未读消息 TODO
oplist: ["player1", "player2"] // 管理员列表
<playername>.config: [""] // 玩家配置 （0: 语言,留空则使用默认语言）
<playername>: 
[
    [
        "home1", {} // homeName, homePos
    ], 
    [
        "home2", {}
    ]
]
*/

function hasPlayerConfig(playerName) {
    if (db.get(playerName) || db.get(playerName + ".config")) {
        return true;
    } else {
        return false;
    }
}

function initPlayerConfig(playerName) {
    db.set(playerName, []);
    db.set(playerName + ".config", [""]);
}

function homeCount(victimname) {
    let count = 0;

    if (!db.get(victimname)) {
        count = 0;
    } else {
        count = db.get(victimname).length;
    }

    return count;
}

function generateRandomString(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

function dimName(id, locale) {
    switch (id) {
        case 0:
            return `§3${i18n.trl(locale, "dimName0")}§r`;
        case 1:
            return `§4${i18n.trl(locale, "dimName1")}§r`;
        case 2:
            return `§5${i18n.trl(locale, "dimName2")}§r`;
        default:
            return `§7${i18n.trl(locale, "dimNameUnknown")}§r`;
    }
}

function getLocalesArrayFromConfig() {
    const langFileObj = JSON.parse(new JsonConfigFile(langFilePath).read());
    let result = [];
    Object.keys(langFileObj).forEach((key) => {
        result.push(key);
    });
    return result;
}

function isNumber(obj) {
    if (obj === null || obj === undefined) return false;
    log(typeof obj);
    return typeof obj === 'number' && !isNaN(obj);
}