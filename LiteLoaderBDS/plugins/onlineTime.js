const databasePath = "plugins/onlineTime/data";
const db = new KVDatabase(databasePath);
const scordboardName = "onlineTimeDB";

mc.regPlayerCmd("onlinetimequery", "§r查看指定玩家的在线时间", (pl, args) => {
    const playerName = args[0] || pl.realName;
    const title = args[0] || "你";
    let value = db.get(playerName);
    if (value != undefined) {
        pl.tell(title + "的在线时间为: " + value + "秒");
    } else {
        pl.tell("未找到玩家 " + title + " 的在线时间数据");
    }
});

let onlinePlayers = mc.getOnlinePlayers().map((player) => player.realName);
// log("当前在线玩家: " + onlinePlayers.join(", ") + " 共 " + onlinePlayers.length + " 人");
for (const playerName of onlinePlayers) {
    let value = db.get(playerName);
    if (value == undefined) {
        db.set(playerName, 0);
        log("插入新玩家 " + playerName + " 的在线时间数据");
    }
}

setTimeout(() => {
    mc.runcmd("scoreboard objectives remove " + scordboardName);
    mc.runcmd("scoreboard objectives add " + scordboardName + " dummy" + " \"在线时间 (秒)\"");
    mc.runcmd("scoreboard objectives setdisplay list " + scordboardName);
}, 10000);

mc.listen("onJoin", (player) => {
    const playerName = player.realName;
    if (!onlinePlayers.includes(player.realName)) onlinePlayers.push(playerName);
    let value = db.get(playerName);
    if (value == undefined) {
        db.set(playerName, 0);
        log("插入新玩家 " + playerName + " 的在线时间数据");
    }
    if (!player.isSimulatedPlayer()) player.setScore(scordboardName, value);
    log("[Join] 当前在线玩家: " + onlinePlayers.join(", ") + " 共 " + onlinePlayers.length + " 人");
});

mc.listen("onLeft", (player) => {
    const playerName = player.realName;
    player.deleteScore(scordboardName);
    onlinePlayers = onlinePlayers.filter((name) => name != playerName);
    log("[Left] 当前在线玩家: " + onlinePlayers.join(", ") + " 共 " + onlinePlayers.length + " 人");
});

setInterval(() => {
    for (const playerName of onlinePlayers) {
        let value = db.get(playerName);
        value++;
        // log(playerName + " 的在线时间为 " + value + " 秒");
        if (value != undefined) {
            db.set(playerName, value);
        }
    }
     
    const allOnlinePlayers = mc.getOnlinePlayers();
    for (const player of allOnlinePlayers) {
        const playerName = player.realName;
        let value = db.get(playerName);
        if (value != undefined) {
            if (!player.isSimulatedPlayer()) player.setScore(scordboardName, value);
        }
    }
}, 1000);