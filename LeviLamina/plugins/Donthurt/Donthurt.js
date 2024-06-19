ll.exports(pushPlayer, "donthurt", "pushPlayer");

logger.setConsole(true, 4);
logger.setTitle('无敌状态');

var VERSION = '0.0.2';

let taskid = null;
const defaultInterval = 50;
let remainTime = new Map();

var time = '12000'; // 自定义无敌的时间(ms)
var JoinGame = 'true'; // 是否开启入服无敌状态
var Respawn = 'true'; // 是否开启重生无敌状态
var Dimchose = 'true'; // 是否开启维度切换无敌状态

function donthurt(pl) {
    pl.addTag('donthurt');
    // pl.tell('§a您已获得' + time + 's无敌时间', 5)
    // setTimeout(() => {
    //     pl.removeTag('donthurt');
    // }, time);
    if (taskid == null) {
        taskid = setInterval(intervalCode, defaultInterval);
        // log('开始计时器');
    }
}

mc.listen("onMobHurt", hurt);
mc.listen("onJoin", join);
mc.listen("onChangeDim", dim);
mc.listen("onRespawn", resp);
mc.listen("onLeft", (pl) => {
    removePlayer(pl);
});

function hurt(en, hurt, dam) {
    if (en.hasTag('donthurt')) {
        // if (hurt != null) {
        //     if (hurt.toPlayer() != null) {
        //         hurt.toPlayer().tell('§c对方处在无敌状态!', 5)
        //     }
        // }
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
                showToast(pl, getPlayerTime(pl));
            } else {
                removePlayer(pl);
                pl.removeTag('donthurt');
                pl.setTitle('保护已解除 §7:)§r', 4, 1, 3, 1);
            }
        }
    });
    if (remainTime.size == 0) {
        clearInterval(taskid);
        taskid = null;
        // log('无人被保护，停止计时器');
    }
}

function sendToastToPlayerWithTag() {
    let players = mc.getOnlinePlayers();
    players.forEach(function (pl) {
        if (pl.hasTag('donthurt')) {
            showToast(pl, getPlayerTime);
        }
    });
}

function showToast(pl, time) {
    pl.setTitle(`保护中 §7${(Math.floor(time / 100) / 10).toFixed(1)}s§r`, 4, 1, 3, 1);
}

function join(pl) {
    addPlayer(pl);
    if (JoinGame == 'true') {
        donthurt(pl);
    }
    else return;
}


function dim(pl) {
    addPlayer(pl);
    if (Dimchose == 'true') {
        donthurt(pl);
    }
    else return;
}


function resp(pl) {
    addPlayer(pl);
    if (Respawn == 'true') {
        donthurt(pl);
    }
    else return;
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
    pl.addTag('donthurt');
    remainTime.set(pl.xuid, time);
    if (taskid == null) {
        taskid = setInterval(intervalCode, defaultInterval);
        // log('开始计时器#pushPlayer');
    }
}