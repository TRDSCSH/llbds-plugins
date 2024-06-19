//命令注册
mc.regPlayerCmd("chpsp", "§r设置跳过夜晚所需的入睡玩家所占百分比", chpsp);

//函数实现
function chpsp(pl, args) {
    if (args.length == 0) {
        let form = mc.newCustomForm();
        const percentage = getCurrentPercentage();
        form.setTitle("修改");
        form.addLabel(`§7设置跳过夜晚所需的入睡玩家所占百分比\n当前值: ${percentage}%§r`);
        form.addStepSlider("修改为", getStepSliderItems(), percentage >= 100 ? 100 : percentage < 0 ? 0 : percentage);
        pl.sendForm(form, (pl, id) => {
            if (id != null) {
                // pl.tell(`${id[1]}`);
                const onlinePlayersCount = mc.getOnlinePlayers().length;
                mc.runcmdEx(`gamerule playersSleepingPercentage ${id[1]}`);
                broadcast(`${pl.realName} 修改了一项游戏设置\n§a现在跳过夜晚需要 ${(id[1] > 0) ? ((id[1] < 100) ? Math.ceil(onlinePlayersCount * id[1] / 100) : onlinePlayersCount) : 1} 位玩家睡觉 §7(${id[1]}%)§r`); //
            }
        });
    } else if (args.length == 1) {
        // pl.tell(`value: ${args[0]}\ntype: ${typeof args[0]}`);
        const arg = parseInt(args[0]);
        if (arg >= 0 && arg <= 100) {
            const onlinePlayersCount = mc.getOnlinePlayers().length;
            mc.runcmdEx(`gamerule playersSleepingPercentage ${arg}`);
            broadcast(`${pl.realName} 修改了一项游戏设置\n§a现在跳过夜晚需要 ${(arg > 0) ? ((arg < 100) ? Math.ceil(onlinePlayersCount * arg / 100) : onlinePlayersCount) : 1} 位玩家睡觉 §7(${arg}%)§r`); //
        } else {
            pl.tell("§c参数不在范围内");
        }
    } else {
        pl.tell("§c参数过多");
    }
}

function getStepSliderItems() {
    let items = [];
    const onlinePlayersCount = mc.getOnlinePlayers().length;
    for (let i = 0; i <= 100; i++) {
        items.push(`${i}%  §7需要${(i > 0) ? ((i < 100) ? Math.ceil(onlinePlayersCount * i / 100) : "所有") : 1}人入睡`);
    }
    return items;
}

function getCurrentPercentage() {
    const str = (mc.runcmdEx("gamerule playersSleepingPercentage")).output;
    // log(str) // playersSleepingPercentage = 1
    // log(str.trim().split('=')) // [playersSleepingPercentage , 1]
    const percentage = parseInt(str.trim().split('=')[1]);
    return percentage;
}

function broadcast(msg) {
    const onlinePlayers = mc.getOnlinePlayers();
    onlinePlayers.forEach(player => {
        player.tell(msg);
    });
}