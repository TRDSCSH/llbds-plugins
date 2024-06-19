// 常量与全局变量
// const DEBUG = true;
const PLUGIN_NAME = 'xp2money';
const xp2moneyRate = 5;

const invalidXpFilePath = 'plugins/' + PLUGIN_NAME + '/invalidXp.json';
const playerMonitor = new Object;

// 命令注册
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("xp2money", "经验转金币", PermType.Any);
    cmd.setAlias("x2m");
    cmd.mandatory("amount", ParamType.Int);
    cmd.overload([]);
    cmd.overload(["amount"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        if (_ori.type != 0) {
            out.error('这个命令只能由玩家执行');
            return;
        }
        const pl = _ori.player;
        if (pl.isOP() || pl.gameMode == 1) {
            pl.tell(Format.Red + '此功能对创造模式玩家和管理员禁用');
            return;
        }
        const amount = res.amount;
        if (amount) {
            const result = xp2money(pl, amount);
            if (result == 0) {
                pl.tell(Format.Green + '成功: ' + amount + 'XP -> $' + Math.floor(xp2moneyRate * amount));
            } else if (result > 0) {
                pl.tell(Format.Red + '经验不足， 还缺少 ' + result);
            } else if (result == -1)  {
                pl.tell(Format.Red + '请输入正整数');
            } else if (result == -2)  {
                pl.tell(Format.Red + '你正在获取经验, 请稍后再试');
            }
        } else {
            sendXp2MoneyForm(pl);
        }
    });
    cmd.setup();

    const cmd2 = mc.newCommand("money2xp", "金币转经验", PermType.Any);
    cmd2.setAlias("m2x");
    cmd2.mandatory("amount", ParamType.Int);
    cmd2.overload([]);
    cmd2.overload(["amount"]);
    cmd2.setCallback((_cmd, _ori, out, res) => {
        if (_ori.type != 0) {
            out.error('这个命令只能由玩家执行');
            return;
        }
        const pl = _ori.player;
        if (pl.isOP() || pl.gameMode == 1) {
            pl.tell(Format.Red + '此功能对创造模式玩家和管理员禁用');
            return;
        }
        const amount = res.amount;
        if (amount) {
            const result = money2xp(pl, amount);
            if (result == 0) {
                pl.tell(Format.Green + '成功: $' + amount + ' -> ' + Math.floor(amount / xp2moneyRate) + 'XP');
            } else if (result > 0) {
                pl.tell(Format.Red + '金币不足， 还缺少 ' + result);
            } else {
                pl.tell(Format.Red + '请输入正整数');
            }
        } else {
            sendMoney2XpForm(pl);
        }
    });
    cmd2.setup();
});

// 事件监听
mc.listen("onExperienceAdd", (pl, exp) => {
    if (exp <= 0) return;
    // if (DEBUG) pl.tell(`${exp}`)

    const uuid = pl.uuid;
    playerMonitorHandler(uuid);
    
    const curTime = Date.now();
    if (isPlayerMonitored(uuid)) {
        playerMonitor[uuid]["last"] = curTime;
        playerMonitor[uuid]["counter"]++;
        playerMonitor[uuid]["totalXp"] += exp;
    } else {
        playerMonitor[uuid] = {
            "first": curTime,
            "last": curTime,
            "counter": 1,
            "totalXp": exp
        };
    }
    // if (DEBUG) pl.setTitle(`${playerMonitor[uuid]["counter"]}次 ${playerMonitor[uuid]["totalXp"]}Exp ${(playerMonitor[uuid]["last"] - playerMonitor[uuid]["first"]) / 1000}s`);
});

// 间隔检测
setInterval(() => { // 如果玩家消耗无效经验（不可用于转换为金币的经验），则降低无效经验值
    const invalidXpFile = new JsonConfigFile(invalidXpFilePath);
    const players = mc.getOnlinePlayers();
    players.forEach((pl) => {
        const currentInvalidXpValue = invalidXpFile.get(pl.uuid) ? invalidXpFile.get(pl.uuid) : 0;
        if (!currentInvalidXpValue) return;
        const currentXp = pl.getTotalExperience();
        // if (DEBUG) log(`${currentXp} ${currentInvalidXpValue}`);
        if (currentXp < currentInvalidXpValue) {
            setInvalidXp(pl.uuid, currentXp);
        }
    });
}, 10000);

setInterval(() => {
    const players = mc.getOnlinePlayers();
    players.forEach((pl) => {
        const uuid = pl.uuid;
        playerMonitorHandler(uuid);
    });
}, 5000);

// 函数定义
function playerMonitorHandler(uuid) {
    if (isPlayerMonitored(uuid)) {
        // 判断获取的经验是否为有效经验
        const startTime = playerMonitor[uuid]['first'];
        const lastTime = playerMonitor[uuid]['last'];
        const counter = playerMonitor[uuid]['counter'];
        if (lastTime - startTime >= Math.floor(Math.random() * 25 + 35) * 1000 && counter >= 128) { // 无效经验
            increaseInvalidXp(uuid, playerMonitor[uuid]['totalXp']);
            delete playerMonitor[uuid];
        } else {
            // 如果玩家5秒内没有获得经验，则判断是否在刷经验，然后清除监听记录
            const curTime = Date.now();
            if (curTime - lastTime >= 5000) {
                if (counter >= 128) {
                    increaseInvalidXp(uuid, playerMonitor[uuid]['totalXp']);
                }
                delete playerMonitor[uuid];
            }
        }
    }
}

function isPlayerMonitored(uuid) {
    return playerMonitor[uuid] ? true : false;
}

function getInvalidXp(uuid) {
    const invalidXpFile = new JsonConfigFile(invalidXpFilePath);
    return invalidXpFile.get(uuid) ? invalidXpFile.get(uuid) : 0;
}

function increaseInvalidXp(uuid, amount) {
    if (amount <= 0) return;
    const invalidXpFile = new JsonConfigFile(invalidXpFilePath);
    const playerInvalidXp = invalidXpFile.get(uuid) ? invalidXpFile.get(uuid) : 0;
    // if (DEBUG) log(`${amount} ${playerInvalidXp}`);
    invalidXpFile.set(uuid, playerInvalidXp + amount);
}

function setInvalidXp(uuid, amount) {
    const invalidXpFile = new JsonConfigFile(invalidXpFilePath);
    if (amount <= 0) {
        invalidXpFile.delete(uuid);
    } else {
        invalidXpFile.set(uuid, amount);
    }
}

function sendXp2MoneyForm(pl, prompt) {
    const fm = mc.newCustomForm();
    const invalidXp = getInvalidXp(pl.uuid);
    fm.setTitle('经验 -> 金币');
    fm.addLabel(`可用经验: ${pl.getTotalExperience() - invalidXp}  金币: ${pl.getMoney()}\n当前汇率: 1 经验 = ${xp2moneyRate} 金币${invalidXp ? Format.Gray + '\n不可用于兑换的经验: ' + invalidXp : ''}`); // 0
    fm.addLabel(prompt ? prompt : ''); // 1
    fm.addInput('转换数量', '在这里输入需要转换的经验数量'); // 2
    pl.sendForm(fm, (pl, data) => {
        if (!data) return;
        const input = parseInt(data[2].trim());
        if (isNaN(input)) {
            sendXp2MoneyForm(pl, Format.Red + '无效的输入');
            return;
        }
        if (input > 0) {
            const result = xp2money(pl, input);
            if (result == 0) {
                sendXp2MoneyForm(pl, Format.Green + '成功');
            } else if (result > 0) {
                sendXp2MoneyForm(pl, Format.Red + '经验不足, 还缺少 ' + result);
            } else if (result == -2) {
                sendXp2MoneyForm(pl, Format.Red + '你正在获取经验, 请稍后再试');
            } else if (result == -1) {
                sendXp2MoneyForm(pl, Format.Red + '???');
            }
        } else {
            sendXp2MoneyForm(pl, Format.Red + '请输入正整数');
        }
    });
}

function sendMoney2XpForm(pl, prompt) {
    const fm = mc.newCustomForm();
    fm.setTitle('金币 -> 经验');
    fm.addLabel(`金币: ${pl.getMoney()}  经验: ${pl.getTotalExperience()}\n当前汇率: 1 经验 = ${xp2moneyRate} 金币`); // 0
    fm.addLabel(prompt ? prompt : ''); // 1
    fm.addInput('转换数量', '在这里输入需要转换的金币数量'); // 2
    pl.sendForm(fm, (pl, data) => {
        if (!data) return;
        const input = parseInt(data[2].trim());
        if (isNaN(input)) {
            sendMoney2XpForm(pl, Format.Red + '无效的输入');
            return;
        }
        if (input > 0) {
            const result = money2xp(pl, input);
            if (result == 0) {
                sendMoney2XpForm(pl, Format.Green + '成功');
            } else if (result > 0) {
                sendMoney2XpForm(pl, Format.Red + '金币不足， 还缺少 ' + result);
            } else {
                sendMoney2XpForm(pl, Format.Red + '???');
            }
        } else {
            sendMoney2XpForm(pl, Format.Red + '请输入正整数');
        }
    });
}

/**
 * 对玩家进行经验转金币
 * @param {Player} pl 玩家对象
 * @param {Number} amount 经验数量（正整数）
 * @returns 缺少的经验数量。如果为-1，则输入不是正整数
 */
function xp2money(pl, amount) {
    if (isPlayerMonitored(pl.uuid)) return -2;
    if (amount <= 0) return -1;
    const invalidXp = getInvalidXp(pl.uuid);
    const allxp = pl.getTotalExperience() - invalidXp;
    // if (DEBUG) log(`${allxp} ${amount} ${allxp - amount}`);
    if (allxp >= amount) {
        const exp = allxp - amount + invalidXp;
        pl.setTotalExperience(exp);
        pl.addMoney(Math.floor(amount * xp2moneyRate));
        setTimeout(() => {
            playerMonitor[pl.uuid]['totalXp'] -= exp;
            const count = --playerMonitor[pl.uuid]['counter'];
            if (count == 0) delete playerMonitor[pl.uuid];
        }, 100);
        return 0;
    } else {
        return amount - allxp;
    }
}

/**
 * 对玩家进行金币转经验
 * @param {Player} pl 玩家对象
 * @param {Number} amount 金币数量（正整数）
 * @returns 缺少的金币数量。如果为-1，则输入不是正整数
 */
function money2xp(pl, amount) {
    if (amount <= 0) return -1;
    const allmoney = pl.getMoney();
    if (allmoney >= amount) {
        pl.reduceMoney(amount);
        const exp = Math.floor(pl.getTotalExperience() + (amount / xp2moneyRate));
        pl.setTotalExperience(exp);
        setTimeout(() => {
            playerMonitor[pl.uuid]['totalXp'] -= exp;
            const count = --playerMonitor[pl.uuid]['counter'];
            if (count == 0) delete playerMonitor[pl.uuid];
        }, 100);
        return 0;
    } else {
        return amount - allmoney;
    }
}