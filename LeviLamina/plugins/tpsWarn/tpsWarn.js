const getTps = ll.imports('TPS', 'getTps');

const maxCount = 5;
const recentTps = new Array;
const startTime = new Date().getTime();
let count = 0;
let counter = 0;
let canBroadcast = true;

if (getTps) {
    const curTps = getTps();
    for (let i = 0; i < maxCount; i++) {
        recentTps.push(curTps);
    }

    listenTps();
} else {
    log(Format.Red + '远程函数 getTps 未成功导入, 插件运行结束');
}

setInterval(() => {
    canBroadcast = true;
}, 24000);

function listenTps() {
    recentTps.splice(0,1);
    recentTps.push(getTps());

    if (canBroadcast) {
        const tps = avgTps();
        if (tps <= 8) {
            mc.broadcast(Format.Red + '服务端正在经历严重卡顿(TPS=' + tps.toFixed(2) + ')');
            log(`严重卡顿(${++counter})`);
            canBroadcast = false;
        }
        // else if (tps <= 14) {
        //     mc.broadcast(Format.Yellow + '服务端正在经历卡顿(TPS=' + tps.toFixed(2) + ')');
        //     log(`卡顿(${++counter})`);
        //     canBroadcast = false;
        // }
    }

    count++;
    const offset = new Date().getTime() - (startTime + count * 1000);
    let nextTime = 1000 - offset;
    if (nextTime < 0) nextTime = 0;
    setTimeout(listenTps, nextTime);
}

function avgTps() {
    return recentTps.reduce((a, b) => a + b) / recentTps.length;
}