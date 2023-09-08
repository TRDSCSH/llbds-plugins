// 导入函数
const getStats = ll.imports('PlayerStatsTracker', 'getStats');
const getFormatedStats = ll.imports('PlayerStatsTracker', 'getFormatedStats');
const getRanking = ll.imports('PlayerStatsTracker', 'getRanking');
const getFormatedRanking = ll.imports('PlayerStatsTracker', 'getFormatedRanking');
const getRankingKeyList = ll.imports('PlayerStatsTracker', 'getRankingKeyList');

// API
ll.exports(getFormattedLevel, 'nameDisplay', 'getFormattedLevel');
ll.exports(getFormattedExp, 'nameDisplay', 'getFormattedExp');
ll.exports(getExpBar, 'nameDisplay', 'getExpBar');
ll.exports(getLevelColor, 'nameDisplay', 'getLevelColor');
ll.exports(getLevel, 'nameDisplay', 'getLevel');
ll.exports(getLevelExp, 'nameDisplay', 'getLevelExp');
ll.exports(getExp, 'nameDisplay', 'getExp');
ll.exports(isMaxLevel, 'nameDisplay', 'isMaxLevel');

// 命令注册
mc.regPlayerCmd("namedisplay", "§r编辑显示的玩家名称", (pl, args) => {
    showMenu(pl);
});

// 常量&全局变量
const refreshTime = 100; // 刷新时间
const levels = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600, 919200, 1838400, 3676800, 7353600, 14707200, 29414400, 58828800, 117657600]; // 等级经验表(0~20级)
let playerNameChanged = false;
const dataFilePath = "plugins/nameDisplay/playerData.json"; // 数据文件路径
const playerTitleFilePath = "plugins/ch.json"; // 玩家称号文件路径
let DATAFILE = new JsonConfigFile(dataFilePath); // 数据文件
let PLAYER_TITLE_FILE = new JsonConfigFile(playerTitleFilePath); // 玩家称号文件
setInterval(() => {
    PLAYER_TITLE_FILE = new JsonConfigFile(playerTitleFilePath);
}, 30000);
const buttons = [
    {
        "text": "血量",
        "tag": "<health>",
        "needReflash": true
    },
    {
        "text": "血量与饥饿度",
        "tag": "<healthAndHunger>",
        "needReflash": true
    },
    {
        "text": "当前坐标",
        "tag": "<position>",
        "needReflash": true
    },
    {
        "text": "累计在线时间",
        "tag": "<onlineTime>",
        "needReflash": true
    },
    {
        "text": "金币数量",
        "tag": "<money>",
        "needReflash": true
    },
    {
        "text": "玩家称号",
        "tag": "<title>",
        "needReflash": true
    },
    {
        "text": "游戏等级",
        "tag": "<level>",
        "needReflash": true
    },
    {
        "text": "游戏经验值",
        "tag": "<exp_value>",
        "needReflash": true
    },
    {
        "text": "游戏经验条",
        "tag": "<exp_bar>",
        "needReflash": true
    },
    {
        "text": "延迟",
        "tag": "<ping>",
        "needReflash": true,
    },
    {
        "text": "丢包",
        "tag": "<packet-loss>",
        "needReflash": true,
    },
    {
        "text": "IP地址",
        "tag": "<ip>",
        "needReflash": false
    },
    {
        "text": "操作系统",
        "tag": "<os>",
        "needReflash": false
    }
];
/*
    json文件格式:
    {
        "玩家xuid": {
            "displayName": "<health>\n玩家名",
            "needReflash": true
        }
    }
*/

// 间隔刷新
let intervalTaskid = setInterval(intervalTask, refreshTime);

// 监听玩家加入
mc.listen("onJoin", (pl) => {
    // log(Object.keys(getStats(pl.realName)));
    const plTitleData = DATAFILE.get(pl.xuid);
    if (plTitleData == undefined) return;
    pl.rename(tr(pl, plTitleData.displayName));
    if (intervalTaskid == null) {
        intervalTaskid = setInterval(intervalTask, refreshTime);
    }
});

// 函数
function showMenu(pl, hint) {
    const dataFile = new JsonConfigFile(dataFilePath);
    const plXuid = pl.xuid;
    const notSet = dataFile.get(plXuid) == undefined;
    const menu = mc.newSimpleForm();
    menu.setTitle("编辑显示名称");
    menu.setContent(hint ? hint : `选择一项需要显示的内容， 它将会和玩家名一起显示在玩家头上。 ${notSet ? "" : `\n§7- - - - - - - - - - - - - - - - - -§r\n${tr(pl, dataFile.get(plXuid).displayName)}\n§7- - - - - - - - - - - - - - - - - -§r`}`);
    for (let i = 0; i < buttons.length; i++) {
        menu.addButton(buttons[i].text);
    }
    menu.addButton("重置显示名称");
    pl.sendForm(menu, (pl, id) => {
        if (id == null) return;
        if (id == buttons.length) {
            dataFile.delete(plXuid);
            DATAFILE = dataFile;
            pl.rename(pl.realName);
            showMenu(pl, "§a重置成功！§r");
            return;
        }
        confirmMenu(pl, id);
    });
}

function confirmMenu(pl, index) {
    const menu = mc.newCustomForm();
    const plName = pl.realName;
    const names = [`${plName}\n${buttons[index].tag}`, `${buttons[index].tag}\n${plName}`, `${plName} ${buttons[index].tag}`, `${buttons[index].tag} ${plName}`];
    menu.setTitle("预览");
    menu.addStepSlider("请选择显示效果", names.map((name) => "\n" + name));
    pl.sendForm(menu, (pl, id) => {
        if (id == null) {
            showMenu(pl);
            return;
        }
        changeName(pl, names[id[0]], buttons[index].needReflash);
        showMenu(pl, `§a设置成功！§r 当前显示: \n§7- - - - - - - - - - - - - - - - - -§r\n${tr(pl, names[id[0]])}\n§7- - - - - - - - - - - - - - - - - -§r`);
    });
}

function changeName(pl, displayName, needReflash) {
    const plXuid = pl.xuid;
    const dataFile = new JsonConfigFile(dataFilePath);
    dataFile.set(plXuid, {
        "displayName": displayName,
        "needReflash": needReflash
    });
    DATAFILE = dataFile;
    pl.rename(tr(pl, displayName));
}

function refreshName(pl) {
    const plXuid = pl.xuid;
    const data = DATAFILE.get(plXuid);
    if (data == undefined) return;
    const displayName = data.displayName;
    const needReflash = data.needReflash;
    if (needReflash) {
        pl.rename(tr(pl, displayName));
        playerNameChanged = true;
    }
}

function intervalTask() {
    const players = mc.getOnlinePlayers();
    for (let i = 0; i < players.length; i++) {
        refreshName(players[i]);
    }
    if (playerNameChanged) {
        playerNameChanged = false;
    } else {
        clearInterval(intervalTaskid);
        intervalTaskid = null;
    }
}

function tr(pl, str) {
    str = str.includes("<health>") ? str.replace("<health>", `§4❤§r${getHealth(pl)}`) : str;
    str = str.includes("<healthAndHunger>") ? str.replace("<healthAndHunger>", `§4❤§r${getHealth(pl)} §6§r${getHunger(pl)}`) : str;
    str = str.includes("<position>") ? str.replace("<position>", `§7(§r${pl.pos.x.toFixed(1)}§7,§r ${pl.pos.y.toFixed(1)}§7,§r ${pl.pos.z.toFixed(1)}§7)§r`) : str;
    str = str.includes("<onlineTime>") ? str.replace("<onlineTime>", `§r${getOnlineTime(pl)} 秒`) : str;
    str = str.includes("<money>") ? str.replace("<money>", `§6§r§l${getPlayerMoney(pl)}`) : str;
    str = str.includes("<title>") ? str.replace("<title>", `${getPlayerTitle(pl)}`) : str;
    str = str.includes("<ip>") ? str.replace("<ip>", `${getIP(pl).split(":")[0]}`) : str;
    str = str.includes("<os>") ? str.replace("<os>", `${getOS(pl)}`) : str;
    str = str.includes("<level>") ? str.replace("<level>", `§r${getFormattedLevel(pl)}`) : str;
    str = str.includes("<exp_value>") ? str.replace("<exp_value>", `§r${getFormattedExp(pl)}`) : str;
    str = str.includes("<exp_bar>") ? str.replace("<exp_bar>", `§r${getExpBar(pl)}`) : str;
    str = str.includes("<ping>") ? str.replace("<ping>", `§r${getFormattedPing(pl)}`) : str;
    str = str.includes("<packet-loss>") ? str.replace("<packet-loss>", `§r${getFormatedPacketLoss(pl)} §7Loss§r`) : str;
    return str;
}

function getHealth(pl) {
    const health = pl.health;
    return `§l${health > 14 ? '§2' : health > 6 ? '§e' : '§4'}${health}§r`;
}

function getHunger(pl) { // BetterName 1.1.4 https://www.minebbs.com/resources/bettername.4132/
    const hunger = pl.getNbt().getTag("Attributes").getData(9).getData("Current")
    const MaxHunger = pl.getNbt().getTag("Attributes").getData(9).getData("Max")
    switch (true) {
        case (hunger > MaxHunger * 0.7):
            return "§l§2" + hunger + "§r"
        case (hunger > MaxHunger * 0.3):
            return "§l§e" + hunger + "§r"
        default:
            return "§l§4" + hunger + "§r"
    }
}

function getPlayerTitle(pl) {
    const plName = pl.realName;
    const plTitleData = PLAYER_TITLE_FILE.get(plName);
    if (plTitleData == undefined) return "§7< - NULL - >§r";
    return plTitleData[plTitleData[0]];
}

function getOnlineTime(pl) {
    return pl.getScore("onlineTimeDB");
}

function getPlayerMoney(pl) {
    return pl.getMoney();
}

function getIP(pl) {
    return pl.getDevice().ip;
}

function getOS(pl) {
    return pl.getDevice().os;
}

// [death,placed,killed,highestLevel,tilled,damageTaken,damageDealt,destroyed,harvested,planted,overworldMined,netherMined,fished,hooked,ate,totem,chat,chatChars,jumped,expObtained,playTime,lastOnline,loginDays,distanceMoved,subStats]

function getExp(pl) {
    const plName = pl.realName;
    const plStats = getStats(plName);
    if (plStats == null) return 0;
    const killed = plStats.killed;
    const killed_wither = plStats.subStats.killed['minecraft:wither'];
    const killed_end_dragon = plStats.subStats.killed['minecraft:ender_dragon'];
    // const expObtained = plStats.expObtained;
    const exp = (pl.gameMode == 1) ? 0 : pl.getTotalExperience();
    const damageDealt = plStats.damageDealt;
    const destroyed = plStats.destroyed;
    const placed = plStats.placed;
    const harvested = plStats.harvested;
    const overworldMined = plStats.overworldMined;
    const netherMined = plStats.netherMined;
    const fished = plStats.fished;
    const hooked = plStats.hooked;
    const ate = plStats.ate;
    const tilled = plStats.tilled;
    const planted = plStats.planted;
    const chat = plStats.chat;
    const playTime = plStats.playTime;
    const loginDays = plStats.loginDays;
    // log(`killed: ${killed},\nkilled_wither: ${killed_wither},\nkilled_end_dragon: ${killed_end_dragon},\nexpObtained: ${expObtained},\ndamageDealt: ${damageDealt},\ndestroyed: ${destroyed},\nplaced: ${placed},\nharvested: ${harvested},\noverworldMined: ${overworldMined},\nnetherMined: ${netherMined},\nfished: ${fished},\nhooked: ${hooked},\nate: ${ate},\ntilled: ${tilled},\nplanted: ${planted},\nchat: ${chat},\nplayTime: ${playTime},\nloginDays: ${loginDays}`);
    const score = killed * 10 + killed_wither * 1000 + killed_end_dragon * 1000 + exp * 30 + damageDealt * 5 + destroyed * 5 + placed * 5 + harvested * 10 + overworldMined * 20 + netherMined * 20 + fished * 20 + hooked * 5 + ate * 5 + tilled * 10 + planted * 10 + chat * 50 + playTime * 1 + loginDays * 100 + pl.getMoney();
    // log(`score: ${score}`)
    return score < 0 ? 0 : Math.floor(score);
}

function getFormattedExp(pl) {
    return getLevelColor(pl) + getExp(pl) + "§r";
}

function getLevel(pl) {
    const score = getExp(pl);
    for (let i = 0; i < levels.length; i++) {
        if (score < levels[i]) {
            return i;
        }
        if (i == levels.length - 1) {
            return i + 1;
        }
    }
}

function getFormattedLevel(pl) {
    return getLevelColor(pl) + "Lv." + "§r" + getLevel(pl);
}

function getLevelColor(pl) {
    const score = getExp(pl);
    const colors = ["§0", "§8", "§8", "§7", "§7", "§1", "§1", "§9", "§9", "§2", "§2", "§2", "§a", "§a", "§3", "§b", "§4", "§c", "§e", "§g", "§6", "§6"];
    for (let i = 0; i < levels.length; i++) {
        if (score < levels[i]) {
            return colors[i];
        }
        if (i == levels.length - 1) {
            return colors[i + 1];
        }
    }
}

function getExpBar(pl) { // String
    const score = getExp(pl);
    let level = 0;
    for (let i = 0; i < levels.length; i++) {
        if (score < levels[i]) {
            level = i;
            break;
        }
        if (i == levels.length - 1) {
            level = i + 1;
        }
    }
    const prevLevelExp = levels[level - 1] ? levels[level - 1] : 0;
    const levelExp = levels[level] ? levels[level] : score;
    const exp = score - prevLevelExp;
    const color = (!["§0", "§7", "§8"].includes(getLevelColor(pl))) ? getLevelColor(pl) : "§r";
    const expBar = color + "丨".repeat(Math.floor(exp / (levelExp - prevLevelExp) * 50)) + "§7" + "丨".repeat(50 - Math.floor(exp / (levelExp - prevLevelExp) * 50)) + "§r";
    return expBar;
}

function getLevelExp(lv) {
    if (lv < 0) return 0;
    if (lv > levels.length - 1) return levels[levels.length - 1];
    return levels[lv];
}

function isMaxLevel(pl) {
    return getLevel(pl) == levels.length;
}

function getFormattedPing(pl) {
    const ping = pl.getDevice().lastPing;
    switch (true) {
        case ping <= 50:
            return Format.Green + ping + "ms" + Format.Clear;
            break;
        case ping <= 80:
            return Format.Yellow + ping + "ms" + Format.Clear;
            break;
        default:
            return Format.DarkRed + ping + "ms" + Format.Clear;
    };
}

function getFormatedPacketLoss(pl) {
    const pingl = pl.getDevice().lastPacketLoss;
    switch (true) {
        case pingl <= 5:
            return Format.Green + parseInt(pingl) + "%%" + Format.Clear;
            break;
        case pingl <= 10:
            return Format.Yellow + parseInt(pingl) + "%%" + Format.Clear;
            break;
        default:
            return Format.DarkRed + parseInt(pingl) + "%%" + Format.Clear;
    };
}


// mc.regPlayerCmd("ebt", "expBarTest(score)", (pl, args) => {
//     pl.tell(getExp(pl) + " " + getFormattedLevel(pl) + " " + expBarTest(args[0]))
// });
// function expBarTest(score) { // String
//     if (score == undefined) return "§c参数错误！§r";
//     let level = 0;
//     for (let i = 0; i < levels.length; i++) {
//         if (score < levels[i]) {
//             level = i;
//             break;
//         }
//         if (i == levels.length - 1) {
//             level = i + 1;
//         }
//     }
//     const prevLevelExp = levels[level - 1] ? levels[level - 1] : 0;
//     const levelExp = levels[level] ? levels[level] : score;
//     const exp = score - prevLevelExp;
//     // log(`score: ${score}, \nlevel: ${level}, \nprevLevelExp: ${prevLevelExp}, \nlevelExp: ${levelExp}, \nexp: ${exp}\n${Math.floor((exp) / (levelExp - prevLevelExp) * 50)}`);
//     const expBar = "［§a" + "丨".repeat(Math.floor(exp / (levelExp - prevLevelExp) * 50)) + "§7" + "丨".repeat(50 - Math.floor(exp / (levelExp - prevLevelExp) * 50)) + "§r］";
//     return expBar;
// }