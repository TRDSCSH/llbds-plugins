// 插件注册
ll.registerPlugin("soha", "梭哈", [1, 0, 0, Version.Dev]);

// 常量定义
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const ERR_NO_MIN_AMOUNT = -1;
const ERR_MONEY_SET_FAILED = -2;
const ERR_NO_ENOUGH_MONEY = -3;
const OK_SUCCEED = 0;
const minAmount = 60;
const times = 3;
const helpMsg = "§e[ §b梭哈§e ]§r\n搏一搏，单车变摩托！\n投入金币下注后随机获得投入总量的正负" + times + "倍范围数量的金币, 最小投入金额为" + minAmount + "。\n§7使用 §6/soha put <金币数量> §7投入金币进行下注\n§7使用 §6/soha allin §7一键全投";

// 命令注册
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("soha", "投入金币进行梭哈", PermType.Any);
    cmd.setEnum("put", ["put"]);
    cmd.setEnum("gui", ["gui"]);
    cmd.setEnum("allin", ["allin"]);
    cmd.mandatory("action", ParamType.Enum, "put", 1);
    cmd.mandatory("amount", ParamType.Int, 0);
    cmd.mandatory("action", ParamType.Enum, "gui", 1);
    cmd.mandatory("action", ParamType.Enum, "allin", 1);
    cmd.overload([]);
    cmd.overload(["put", "amount"]);
    cmd.overload(["gui"]);
    cmd.overload(["allin"]);
    cmd.setCallback(async (_cmd, _ori, out, res) => {
        const type = _ori.type;
        if (type != 0) return;
        const pl = _ori.player;
        const plXuid = pl.xuid;
        const moneyAmount = money.get(plXuid);
        const action = res.action;
        if (!action) {
            pl.tell(helpMsg);
        } else if (action == "put") {
            const amount = res.amount;
            const resultData = startSoha(plXuid, moneyAmount, amount, false);
            await sendResult(pl, resultData, amount);
        } else if (action == "gui") {
            sendSohaForm(pl);
        } else if (action == "allin") {
            const amount = moneyAmount;
            const resultData = startSoha(plXuid, moneyAmount, amount, false);
            await sendResult(pl, resultData, amount);
        }
    });
    cmd.setup();
});

// 函数定义
function startSoha(xuid, moneyAmount, amount, isGUI) {
    if (!isGUI) isGUI = false;
    if (amount < minAmount) return [ERR_NO_MIN_AMOUNT, null, null, null, isGUI];
    if (moneyAmount < amount) return [ERR_NO_ENOUGH_MONEY, null, null, null, isGUI];
    const randomRate = Math.random() * times * 2 - times;
    const result = Math.floor(amount * randomRate);
    const resultAmount = (moneyAmount + result) > 0 ? (moneyAmount + result) : 0;
    if (money.set(xuid, resultAmount) == false) {
        return [ERR_MONEY_SET_FAILED, null, null, null, isGUI];
    }
    return [OK_SUCCEED, result, randomRate, resultAmount, isGUI];
}

async function sendResult(pl, resultData, amount) {
    let isGUI = resultData[4];
    if (!isGUI) isGUI = false;
    const returnValue = resultData[0];
    const result = resultData[1];
    const randomRate = resultData[2];
    const resultAmount = resultData[3];
    const color = randomRate > 0 ? "§a" : "§c";
    if (returnValue == ERR_NO_ENOUGH_MONEY) {
        pl.tell("§c下注失败： 您的金币不足！");
    } else if (returnValue == ERR_MONEY_SET_FAILED) {
        pl.tell("§c下注失败： 金币设置失败！");
    } else if (returnValue == ERR_NO_MIN_AMOUNT) {
        pl.tell(`§c下注失败： 最小下注金额为${minAmount}金币`);
    } else if (returnValue == OK_SUCCEED) {
        pl.tell("§a下注成功!");
        await sleep(500);
        pl.tell(`下注金币： ${amount}`);
        await sleep(1500);
        pl.tell(`抽到倍率： ${color}${result >= 0 ? '+' : ''}${parseFloat(randomRate.toFixed(2))}%%`);
        await sleep(1500);
        pl.tell(`梭哈结果： ${color}${result >= 0 ? '+' : ''}${result}`);
        await sleep(1500);
        pl.tell(`剩余金币： ${resultAmount}`);
        await sleep(500);
        pl.tell("欢迎再次下注！");
        await sleep(256);
        if (isGUI) sendSohaForm(pl, "上局梭哈结果: " + color + (result >= 0 ? '+' : '') + result);
    }
}

function sendSohaForm(pl, content) {
    const money = pl.getMoney();
    const arr = [];
    const step = 24;
    const stepMoney = Math.floor((money - minAmount + 1) / step);
    const hasEnoughMoney = money > minAmount;
    if (money - minAmount + 1 < step && hasEnoughMoney) {
        for (let i = 0; i < money - minAmount + 1; i++) {
            arr.push(i + minAmount);
        }
    } else {
        for (let i = 0; i < step; i++) {
            arr.push((stepMoney * i) + minAmount);
        }
        arr.push(money);
    }
    const fm = mc.newCustomForm();
    fm.setTitle("FUNNY WORLD · 娱 · 乐 · 梭 · 哈");
    fm.addLabel("§7投入金币下注后, 可以随机获得投入总量的正负 " + times + " 倍范围数量的金币, 最小投入数量为 " + minAmount);
    fm.addLabel(content ? content : "");
    if (!hasEnoughMoney) {
        fm.addLabel("§c您没有足够的金币进行梭哈！");
    } else {
        fm.addStepSlider("\n§7 * 滑动下面滑块以设置投入金币数量。§r\n投入数量", arr.map((v) => " " + v.toString()), 0);
    }
    pl.sendForm(fm, async(pl, id) => {
        if (id == null || !hasEnoughMoney) return;
        const sohaAmount = arr[id[2]];
        const resultData = startSoha(pl.xuid, money, sohaAmount, true);
        await sendResult(pl, resultData, sohaAmount);
    });
}