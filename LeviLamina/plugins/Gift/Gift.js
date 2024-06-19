// 常量和全局变量
const maxCount = 99999; // 最大触发事件数量
const maxTime = 12 * 60 * 60 * 1000; // 时间间隔
let counter = 0;
let lastTime = Date.now();

// 命令注册
mc.regPlayerCmd("gift", "礼物", (pl) => {
    if (canGetGift()) {
        sendGift(pl);
        reset();
        otherTasks(pl);
    } else {
        pl.tell(`当前不足以获取礼物:\n - 计数器: ${counter} / ${maxCount}\n - 倒计时: ${Math.floor((maxTime - (Date.now() - lastTime)) / 1000)}s`);
    }
});

// 事件监听
const EVENTS = ["onDestroyBlock", "onPlaceBlock"];
EVENTS.forEach(event => {
    mc.listen(event, () => {
        counter++;
    });
});

// 函数导入
const backup = ll.imports("EB", "backup");

// 函数导出
ll.exports(canGetGift, "GIFT", "canGetGift");

// 函数
function otherTasks(pl) {
    backup(pl);
}

function canGetGift() {
    let result = false;
    if (counter >= maxCount) result = true;
    const time = Date.now() - lastTime;
    if (time >= maxTime) result = true;
    return result;
}

function sendGift(pl) {
    const awardMoney = Math.floor(Math.random() * 3000) + 2333;
    pl.addMoney(awardMoney);
    pl.tell(Format.DarkAqua + '[神秘礼物]' + Format.Clear + ' 你获得了金币 * ' + Format.MinecoinGold + awardMoney);
}

function reset() {
    counter = 0;
    lastTime = Date.now();
}