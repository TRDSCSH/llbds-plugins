// 函数导入
const isPlayerTrusted = lxl.import('ILAPI_IsPlayerTrusted');
const isLandOwner = lxl.import('ILAPI_IsLandOwner');
const posGetLand = lxl.import('ILAPI_PosGetLand');
const getOwner = lxl.import('ILAPI_GetOwner');

// 常量及全局变量
const DEBUG = false;
const defaultInterval = 50;
// const loadingDots = ["▁", "▁", "▁", "▂", "▂", "▃", "▃", "▄", "▅", "▆", "▇", "█"];
// const loadingDotsLength = loadingDots.length;
const maxJumpCount = 2;
let playerStatus = {}; // 标记玩家分配到的循环任务id "uuid": taskid 如果没有任务，则 undefined
let playerJumpCount = {}; // 记录玩家跳跃次数
let playerJumpCountTaskid = null;
let injuryFreeTaskid = null;
let remainInjuryFreeTime = new Map();
let injuryFreeTime = '5000'; // 无敌的时间(ms)

// 检测玩家是否在领地内
setInterval(() => {
    const players = mc.getOnlinePlayers();
    for (let i = 0; i < players.length; i++) {
        const player = players[i];

        if (!player) break; // 玩家离线
        if (!(player.gameMode == 0 || player.gameMode == 2)) break;

        // if (DEBUG) {
        //     log(`${player.realName} ${player.canFly}`)
        // }

        if (ableToFly(player)) {
            setFly(player, true);
            clearPlayerTaskid(player);
        } else {
            if (player.canFly) startDisableFly(player);
        }
    }
}, 500);

// 事件监听
mc.listen("onJump", (pl) => {
    if (ableToFly(pl)) {
        playerJumpCount[pl.uuid] = playerJumpCount[pl.uuid] ? playerJumpCount[pl.uuid] + 1 : 1;
        if (DEBUG) log(`${pl.realName}: ${playerJumpCount[pl.uuid]}`);
        if (playerJumpCount[pl.uuid] >= maxJumpCount) {
            setFly(pl, false, false);
            setFly(pl, true, true);
            delete playerJumpCount[pl.uuid];
        }

        if (playerJumpCountTaskid == null) {
            playerJumpCountTaskid = setInterval(() => {
                for (let uuid in playerJumpCount) {
                    playerJumpCount[uuid] = playerJumpCount[uuid] - 1;
                    if (playerJumpCount[uuid] < 0) {
                        delete playerJumpCount[uuid];
                    }
                }
                if (Object.keys(playerJumpCount).length == 0) {
                    clearInterval(playerJumpCountTaskid);
                    playerJumpCountTaskid = null;
                }
            }, 2000);
        }
    }
});

mc.listen("onMobHurt", (en, hurt, dam) => {
    if (en.hasTag('donthurt2')) {
        en.stopFire();
        return false;
    }
});

mc.listen("onLeft", (pl) => {
    removePlayer(pl);
    clearPlayerTaskid(pl);
});

// 函数
function startDisableFly(pl) { // 玩家为飞行状态，且刚离开领地
    const uuid = pl.uuid;
    
    if (playerStatus[uuid] == undefined) {
        playerStatus[uuid] = start();
    }

    function start() {
        const allTime = 4096;
        let remainTime = allTime;
        const taskid = setInterval(() => {
            remainTime -= 512;
            // log(`remainTime: ${remainTime}`);
            if (remainTime <= 0) {
                clearInterval(taskid);
                setFly(pl, false);
            }
        }, 512);

        return taskid;
    }
}

function clearPlayerTaskid(pl) { // 玩家为飞行状态，且刚离开领地，然后重新进入领地
    const uuid = pl.uuid;
    const taskid = playerStatus[uuid];
    if (taskid != undefined) {
        clearInterval(taskid);
        // pl.setTitle("[" + Format.Green + "■" + Format.Clear + "] " + '重回领地', 4, 1, 3, 1);
        delete playerStatus[uuid];
    }
}

function setFly(pl, status, showTitle = true) {
    if (status) {
        if (pl.canFly) return;
        pl.setAbility(10, true);
    } else {
        if (!pl.canFly) return;
        pl.setAbility(10, false);
        pushPlayer(pl, injuryFreeTime);
    }
    if (showTitle) {
        const statusText = status ? '开启' : '关闭';
        const color = status ? Format.Green : Format.Red;
        pl.setTitle("[" + color + "■" + Format.Clear + "] 领地飞行已" + statusText, 4, 1, 3, 1);
    }
}

function ableToFly(pl) {
    const pos = pl.pos;
    const xuid = pl.xuid;
    const landId = posGetLand(pos);
    if (landId == -1) return false;
    return isLandOwner(landId, xuid) || isPlayerTrusted(landId, xuid) || getOwner(landId) == 'public';
}

function donthurt(pl) {
    pl.addTag('donthurt2');
    if (injuryFreeTaskid == null) {
        injuryFreeTaskid = setInterval(intervalCode, defaultInterval);
    }
}

function intervalCode() {
    const players = mc.getOnlinePlayers();
    players.forEach(function (pl) {
        const time = getPlayerTime(pl);
        if (time != null) {
            if (time > 0) {
                setPlayerTime(pl, time - defaultInterval);
            } else {
                removePlayer(pl);
                pl.removeTag('donthurt2');
            }
        }
    });
    if (remainInjuryFreeTime.size == 0) {
        clearInterval(injuryFreeTaskid);
        injuryFreeTaskid = null;
    }
}

function addPlayer(pl) {
    remainInjuryFreeTime.set(pl.xuid, injuryFreeTime);
}

function setPlayerTime(pl, time) {
    remainInjuryFreeTime.set(pl.xuid, time);
}

function removePlayer(pl) {
    remainInjuryFreeTime.delete(pl.xuid);
}

function getPlayerTime(pl) {
    return remainInjuryFreeTime.get(pl.xuid);
}

function pushPlayer(pl, time) {
    pl.addTag('donthurt2');
    remainInjuryFreeTime.set(pl.xuid, time);
    if (injuryFreeTaskid == null) {
        injuryFreeTaskid = setInterval(intervalCode, defaultInterval);
    }
}