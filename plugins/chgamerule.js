//命令注册
mc.regPlayerCmd("chgamerule", "§r修改游戏规则", chGamerule, 1);

function chGamerule(pl) {
    let grForm = mc.newSimpleForm();
    const gameruleStr = (mc.runcmdEx("gamerule")).output;
    const greenPrefix = "[§a▇§r] ";
    const greyPrefix = "[§7▇§r] ";
    const gameruleObj = stringToObjectGameRule(gameruleStr);
    // 将 gameruleObj 每个对象的键转换为字符串，存入一个名为 gameruleNameStr 的数组中
    const gameruleNameStr = Object.keys(gameruleObj);
    const gameruleNameTranslated = gameruleNameStr.map(key => gamerules[key]);

    grForm.setTitle("游戏规则");
    grForm.setContent("点击按钮来切换对应的游戏规则");    // 点击按钮后将会切换对应的游戏规则，并重新发送这个表单
    // 使用 for 循环遍历 obj 对象，并输出键名，如果值为false，前面加上灰色的方块，如果值为true，前面加上绿色的方块
    for (let key in gameruleObj) {
        const gameruleName = gamerules[key] || key;
        if (gameruleObj[key] === false) {
            grForm.addButton(greyPrefix + gameruleName);
        } else if (gameruleObj[key] === true) {
            grForm.addButton(greenPrefix + gameruleName);
        } else {
            grForm.addButton(key + " = " + gameruleObj[key]);
        }
    }

    // 发送表单
    pl.sendForm(grForm, (pl, id) => {
        if (id != null) {
            // 通过 id 获取到点击的按钮的文本
            const gameruleName = gameruleNameStr[id];
            // 通过 id 获取到点击的按钮的文本，然后去掉前面的绿色或者灰色的方块，然后将这个字符串作为键名，获取到对应的值
            const gameruleValue = gameruleObj[gameruleName];
            if (typeof gameruleValue === "boolean") {
                // 通过键名和值来切换游戏规则
                mc.runcmdEx(`gamerule ${gameruleName} ${!gameruleValue}`);
            }
            // 重新发送这个表单
            chGamerule(pl);
        }
    });
}

function stringToObjectGameRule(str) {
    const obj = {};
    const pairs = str.split(','); // 将字符串按逗号分隔成键值对数组

    pairs.forEach(pair => {
        const [key, value] = pair.trim().split('='); // 将键值对字符串按等号分隔成键和值
        obj[key.trim()] = value.trim() === 'true' ? true : value.trim() === 'false' ? false : value.trim(); // 将值转换为 boolean 或字符串并存储到对象中
    });

    return obj;
}

const gamerules = {
    commandblockoutput: "命令方块输出",
    dodaylightcycle: "日夜循环",
    doentitydrops: "实体掉落",
    dofiretick: "火焰蔓延",
    domobloot: "生物掉落",
    domobspawning: "生物生成",
    dotiledrops: "方块掉落",
    doweathercycle: "天气循环",
    drowningdamage: "溺水伤害",
    falldamage: "坠落伤害",
    firedamage: "火焰伤害",
    keepinventory: "保留物品栏",
    mobgriefing: "生物破坏方块",
    pvp: "误伤玩家",
    showcoordinates: "显示坐标",
    naturalregeneration: "自然回血",
    tntexplodes: "TNT爆炸",
    sendcommandfeedback: "命令反馈",
    maxcommandchainlength: "命令链长度",
    doinsomnia: "幻翼生成",
    commandblocksenabled: "启用命令方块",
    randomtickspeed: "随机刻频率",
    doimmediaterespawn: "立即重生",
    showdeathmessages: "显示死亡信息",
    functioncommandlimit: "函数命令限制",
    spawnradius: "生成半径",
    showtags: "显示标签",
    freezedamage: "冻伤伤害",
    respawnblocksexplode: "重生方块爆炸",
    showbordereffect: "边界是否发出红色粒子"
}