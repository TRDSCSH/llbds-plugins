// 函数导入
const isPlayerTrusted = lxl.import('ILAPI_IsPlayerTrusted');
const isLandOwner = lxl.import('ILAPI_IsLandOwner');
const posGetLand = lxl.import('ILAPI_PosGetLand');
const getOwner = lxl.import('ILAPI_GetOwner');

// 常量及全局变量
const DEBUG = true;
let playerStatus = {}; // 标记玩家分配到的循环任务id "uuid": taskid
const defaultInterval = 50;
const loadingDots = ["▁", "▁", "▁", "▂", "▂", "▃", "▃", "▄", "▅", "▆", "▇", "█"];
const loadingDotsLength = loadingDots.length;
let taskid = null;
let remainTime = new Map();
let time = '10000'; // 无敌的时间(ms)

// 命令注册
// todo

// 检测玩家是否在领地内
setInterval(() => {
    const players = mc.getOnlinePlayers();
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (!(player.gameMode == 0 || player.gameMode == 2)) break;
        const name = player.realName;
        const xuid = player.xuid;
        const landId = posGetLand(player.pos);
        if (player.canFly) {
            if (landId == -1) { // 能飞行 && 不在领地
                const timeout = 4000;
                const interval = 50;
                let leftTime = timeout;
                
                if (!playerStatus[xuid]) { // 玩家没有在离开领地
                    playerStatus[xuid] = true;
                    if (DEBUG) log(`玩家 ${name} 离开了领地。PlayerStatus: ${Object.keys(playerStatus)}`);

                    const intervalTaskid = setInterval(() => {
                        
                        leftTime -= interval;

                        if (!player) { // 玩家下线
                            delete playerStatus[xuid];
                            clearInterval(intervalTaskid);
                            if (DEBUG) log(`玩家 ${name} 下线。PlayerStatus: ${Object.keys(playerStatus)}`);
                        }

                        if (leftTime <= 0) { // 超时
                            setTimeout(() => { player.setTitle("[" + Format.Red + "■" + Format.Clear + "] 领地飞行已关闭", 4, 1, 3, 1); }, 150);
                            delete playerStatus[xuid];

                            player.setAbility(10, false);
                            pushPlayer(player, time);

                            clearInterval(intervalTaskid);
                            if (DEBUG) log(`玩家 ${name} 领地飞行已关闭。PlayerStatus: ${Object.keys(playerStatus)}`);
                        }

                        if (ableToFly(posGetLand(player.pos), xuid)) { // 回到了领地
                            if (player.isFlying) setTimeout(() => { player.setTitle("[" + Format.Green + "■" + Format.Clear + "] 回到了领地", 4, 1, 3, 1); }, 150);
                            delete playerStatus[xuid];
                            clearInterval(intervalTaskid);
                            if (DEBUG) log(`玩家 ${name} 回到了领地。PlayerStatus: ${Object.keys(playerStatus)}`);
                        }

                        const loadingDotsIndex = (leftTime / timeout * (loadingDotsLength - 1)).toFixed();
                        const color = (leftTime / timeout) > 0.7 ? Format.Green : (leftTime / timeout) > 0.35 ? Format.MinecoinGold : Format.Red;
                        if (player.isFlying) player.setTitle("[" + color + loadingDots[loadingDotsIndex] + Format.Clear + "] 已离开领地", 4, 1, 3, 1);

                    }, interval);

                }
            } else { // 能飞行 && 在领地
                delete playerStatus[xuid];
                if (DEBUG) log(`玩家 ${name} 回到了领地。PlayerStatus: ${Object.keys(playerStatus)}`);
            }
        } else {
            if (landId != -1) { // 不能飞 && 在领地
                if (ableToFly(landId, xuid)) {
                    if (playerStatus[xuid]) delete playerStatus[xuid];
                    player.setAbility(10, true);
                    pushPlayer(player, time);
                    player.setTitle("[" + Format.Green + "■" + Format.Clear + "] 领地飞行已开启", 4, 1, 3, 1);
                    if (DEBUG) log(`玩家 ${name} 领地飞行已开启。PlayerStatus: ${Object.keys(playerStatus)}`);
                }
            }
        }
    }
}, 500);

// 事件监听
mc.listen("onMobHurt", hurt);
mc.listen("onLeft", (pl) => {
    removePlayer(pl);
});

// 函数
function ableToFly(landId, xuid) {
    if (landId == -1) return false;
    return isLandOwner(landId, xuid) || isPlayerTrusted(landId, xuid) || getOwner(landId) == 'public';
}

function donthurt(pl) {
    pl.addTag('donthurt2');
    if (taskid == null) {
        taskid = setInterval(intervalCode, defaultInterval);
    }
}

function hurt(en, hurt, dam) {
    if (en.hasTag('donthurt2')) {
        en.stopFire();
        return false;
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
    if (remainTime.size == 0) {
        clearInterval(taskid);
        taskid = null;
    }
}

function addPlayer(pl) {
    remainTime.set(pl.xuid, time);
}

function setPlayerTime(pl, time) {
    remainTime.set(pl.xuid, time);
}

function removePlayer(pl) {
    remainTime.delete(pl.xuid);
}

function getPlayerTime(pl) {
    return remainTime.get(pl.xuid);
}

function pushPlayer(pl, time) {
    pl.addTag('donthurt2');
    remainTime.set(pl.xuid, time);
    if (taskid == null) {
        taskid = setInterval(intervalCode, defaultInterval);
    }
}