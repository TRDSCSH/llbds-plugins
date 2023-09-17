const protectPlayer = ll.import("donthurt", "pushPlayer");

const events = ["onRespawn", "onPlayerDie", "onChangeDim", "onJump", "onSneak", "onAttackEntity", "onAttackBlock", "onUseItem", "onUseItemOn", "onUseBucketPlace", "onUseBucketTake", "onDropItem", "onEat", "onConsumeTotem", "onStartDestroyBlock", "onDestroyBlock", "onPlaceBlock", "afterPlaceBlock", "onChangeSprinting", "onPlayerPullFishingHook", "onBedEnter"];
const dataFilePath = "plugins/afkDetect/data.json";
let dataFile = new JsonConfigFile(dataFilePath);
const tag = "AFK";
const defaultAfkTime = 300;
const informTime = 250;
let onlinePlayers = mc.getOnlinePlayers();
let taskid = null;
let onlinePlayerAfkTime = new Map();
let onlinePlayerCount = getOnlinePlayerCount();
// 当玩家对应的onlinePlayerAfkTime==300时，玩家会被判定为AFK，需要将他的onlinePlayerAfkTime设为-1，表示不再计算，同时需要为玩家添加一个tag，表示玩家AFK
// 当玩家触发事件时，onlinePlayerAfkTime会被重置为0，表示玩家不再AFK，同时需要将玩家的tag移除
// 当玩家退出游戏时，onlinePlayerAfkTime会被删除
// 配置文件格式 { "xuid": [[x, y, z, dimid], oriGamemode] } e.g. { "25352135468531102": [[0, 0, 0, 0], 0] }

taskid = setInterval(intervalCodes, 1000);

mc.regPlayerCmd("afk", "切换挂机状态", function (pl, args) {
    if (pl.hasTag(tag)) {
        setAsNotAfk(pl);
        pl.tell("§a你已不再挂机, 欢迎回来！");
    } else {
        setAsAfk(pl);
        pl.tell("§a你将自己设置为挂机状态");
    }
});

events.forEach(event => {
    mc.listen(event, function (player) {
        restoreAfkTime(player);
        if (player.hasTag(tag)) {
            player.removeTag(tag);
            player.tell("§a你已不再挂机, 欢迎回来！");
            restorePlayerData(player);
            protectPlayer(player, 10000);
        }
    });
});

mc.listen("onJoin", function (player) {
    restoreAfkTime(player);
    if (player.hasTag(tag)) {
        player.removeTag(tag);
        restorePlayerData(player);
        protectPlayer(player, 10000);
    }
    onlinePlayerCount++;
    onlinePlayers = mc.getOnlinePlayers();
    if (taskid === null) {
        taskid = setInterval(intervalCodes, 1000);
    }
});

mc.listen("onLeft", function (player) {
    removeAfkTime(player);
    onlinePlayerCount--;
    onlinePlayers = mc.getOnlinePlayers();
    if (onlinePlayerCount === 0) {
        clearInterval(taskid);
        taskid = null;
    }
});

function restoreAfkTime(player) {
    onlinePlayerAfkTime.set(player.xuid, 0);
}

function removeAfkTime(player) {
    onlinePlayerAfkTime.delete(player.xuid);
}

function setAsAfk(player) {
    onlinePlayerAfkTime.set(player.xuid, -1);
    player.addTag(tag);
    addPlayerData(player);
    player.setGameMode(6);
    protectPlayer(player, 0);
}

function setAsNotAfk(player) {
    player.removeTag(tag);
    restoreAfkTime(player);
    restorePlayerData(player);
    protectPlayer(player, 8000);
}

function getAfkTime(player) {
    return onlinePlayerAfkTime.get(player.xuid);
}

function addAfkTime(player) {
    let afkTime = onlinePlayerAfkTime.get(player.xuid);
    if (afkTime === undefined) {
        restoreAfkTime(player);
    } else {
        onlinePlayerAfkTime.set(player.xuid, afkTime + 1);
    }
}

function addPlayerData(player) {
    const playerPosition = [player.pos.x, player.pos.y, player.pos.z, player.pos.dimid];
    const playerGamemode = player.gameMode;
    dataFile.set(player.xuid, [playerPosition, playerGamemode]);
}

function getPlayerData(player) {
    return dataFile.get(player.xuid);
}

function restorePlayerData(player) {
    const playerData = getPlayerData(player);
    if (playerData != undefined) {
        player.teleport(playerData[0][0], playerData[0][1], playerData[0][2], playerData[0][3]);
        player.setGameMode(playerData[1]);
    }
}

function playerIsInAfkArea(player) {
    const pos = player.pos;
    const x = pos.x;
    const y = pos.y;
    const z = pos.z;
    const dimid = pos.dimid;
    const playerData = getPlayerData(player);
    if (playerData != undefined) {
        const playerPosition = playerData[0];
        const playerGamemode = playerData[1];
        if (playerPosition[3] === dimid) {
            if (Math.abs(playerPosition[0] - x) <= 5 && Math.abs(playerPosition[1] - y) <= 5 && Math.abs(playerPosition[2] - z) <= 5) {
                return true;
            }
            return false;
        }
        return false;
    }
    return false;
}

function intervalCodes() {
    onlinePlayerAfkTime.forEach((afkTime, xuid) => {
        if (afkTime === defaultAfkTime) {
            const player = mc.getPlayer(xuid);
            player.tell("§c你正在挂机");
            setAsAfk(player);
        } else if (afkTime > -1) {
            onlinePlayerAfkTime.set(xuid, afkTime + 1);
        } else {
            onlinePlayerAfkTime.set(xuid, afkTime - 1);
        }
    });
    onlinePlayers.forEach(player => {
        const afkTime = getAfkTime(player);
        if (afkTime > informTime || afkTime <= -1) {
            let content;
            if (player.hasTag(tag)) {
                content = `你正在挂机, 已经挂机了 ${-onlinePlayerAfkTime.get(player.xuid)} 秒`;
            } else {
                content = `距离挂机还有 ${defaultAfkTime - onlinePlayerAfkTime.get(player.xuid)} 秒`;
            }
            player.setTitle(content, 4, 0, 20, 0);
        }
        if (player.hasTag(tag) && !playerIsInAfkArea(player)) {
            setAsNotAfk(player);
            player.tell("§a你已不再挂机, 欢迎回来！");
        }
    });
}

function getOnlinePlayerCount() {
    return mc.getOnlinePlayers().length;
}