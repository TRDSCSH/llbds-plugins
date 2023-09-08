const stopServer = ll.imports("stopdelay", "stopServer");

let backupTimeStr = null; // e.g. " 0:00"
let backupTimeH = null; // e.g. 0
let backupTimeM = null; // e.g. 0
let taskid1 = null;
let taskid2 = null;
let timeFilePath = "restartTime.txt";

taskid1 = setInterval(timeCheck, 60000);

function readConfig() {
    backupTimeStr = File.readFrom(timeFilePath);
    if (backupTimeStr == null) {
        return false;
    } else {
        let arr = backupTimeStr.split(":");
        backupTimeH = parseInt(arr[0]);
        backupTimeM = parseInt(arr[1]);
        // log("读取到的备份时间为" + backupTimeH + ":" + backupTimeM);
        return true;
    }
}

function timeCheck() {
    readConfig();
    let tm = system.getTimeObj();
    if (backupTimeM < tm.m) return;
    let leftM = (backupTimeM + 60 - tm.m) % 60; // 剩余分钟数
    if (tm.h == backupTimeH && (leftM == 2 || leftM == 5 || leftM == 10 || leftM == 15 || leftM == 30 || leftM == 55)) {
        broadcast(`§7[§a■§7]§r 服务器将在 ${backupTimeStr} 重启并备份 (${leftM}分钟后)`);
    } else if (tm.h == backupTimeH && leftM == 1) {
        broadcast(`§7[§a■§7]§r 服务器将在 1 分钟后重启并进行备份`);
        taskid2 = setInterval(countdown, 500);
    }
}

function countdown() {
    let tm = system.getTimeObj();
    let s = 60 - tm.s;
    if (tm.h == backupTimeH && tm.m == backupTimeM) {
        broadcast(`§7[§a■§7]§r 服务器即将重启`);
        if (tm.s == 0) stopServer();
        setTimeout(() => {
            broadcast(`§7[§c■§7]§r 服务器可能重启失败`);
            clearInterval(taskid2);
        }, 60000);
    } else {
        broadcast(`§7[§6■§7]§r 服务器将在 ${s} 秒后重启`);
    }
}

function broadcast(msg) {
    let players = mc.getOnlinePlayers();
    players.forEach(function (pl) {
        pl.setTitle(msg,4,1,80,1);
    });
};


