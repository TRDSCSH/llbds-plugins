//命令注册
mc.regPlayerCmd("chgamerule", "§r修改游戏规则", chGamerule);

function chGamerule(pl) {
    const grForm = mc.newSimpleForm();
    const gameruleStr = (mc.runcmdEx("gamerule")).output;
    const greenPrefix = "[§a▇§r] ";
    const greyPrefix = "[§7▇§r] ";
    const gameruleObj = stringToObjectGameRule(gameruleStr, pl.isOP());
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
                mc.broadcast(`§e${pl.realName} §r切换了游戏规则 §e${gamerules[gameruleName] || gameruleName} §r为 §e${!gameruleValue}`);
            }
            // 重新发送这个表单
            chGamerule(pl);
        }
    });
}

function stringToObjectGameRule(str, isOP = false) {
    const obj = {};
    const pairs = str.split(','); // 将字符串按逗号分隔成键值对数组

    pairs.forEach(pair => {
        const [key, value] = pair.trim().split('='); // 将键值对字符串按等号分隔成键和值
        if (!isOP && !allowEditByPlayer.includes(key.trim())) return;
        obj[key.trim()] = value.trim() === 'true' ? true : value.trim() === 'false' ? false : value.trim(); // 将值转换为 boolean 或字符串并存储到对象中
    });

    return obj;
}

// commandBlockOutput = false, doDayLightCycle = true, doEntityDrops = true, doFireTick = true, recipesUnlock = true, doLimitedCrafting = false, doMobLoot = true, doMobSpawning = true, doTileDrops = true, doWeatherCycle = true, drowningDamage = true, fallDamage = true, fireDamage = true, keepInventory = true, mobGriefing = true, pvp = true, showCoordinates = true, naturalRegeneration = true, tntExplodes = false, sendCommandFeedback = true, maxCommandChainLength = 65535, doInsomnia = true, commandBlocksEnabled = true, randomTickSpeed = 1, doImmediateRespawn = true, showDeathMessages = true, functionCommandLimit = 10000, spawnRadius = 5, showTags = true, freezeDamage = false, respawnBlocksExplode = false, showBorderEffect = true, showRecipeMessages = true, playersSleepingPercentage = 0, projectilesCanBreakBlocks = true

const gamerules = {
    commandBlockOutput: "命令方块输出",
    doDayLightCycle: "日夜循环",
    doEntityDrops: "实体掉落",
    doFireTick: "火焰蔓延",
    recipesUnlock: "配方解锁",
    doLimitedCrafting: "玩家只能使用已解锁的配方合成",
    doMobLoot: "生物掉落",
    doMobSpawning: "生物生成",
    doTileDrops: "方块掉落",
    doWeatherCycle: "天气循环",
    drowningDamage: "溺水伤害",
    fallDamage: "坠落伤害",
    fireDamage: "火焰伤害",
    keepInventory: "保留物品栏",
    mobGriefing: "生物破坏方块",
    pvp: "误伤玩家",
    showCoordinates: "显示坐标",
    naturalRegeneration: "自然回血",
    tntExplodes: "TNT爆炸",
    sendCommandFeedback: "命令反馈",
    maxCommandChainLength: "命令链长度",
    doInsomnia: "幻翼生成",
    commandBlocksEnabled: "启用命令方块",
    randomTickSpeed: "随机刻频率",
    doImmediateRespawn: "立即重生",
    showDeathMessages: "显示死亡信息",
    functionCommandLimit: "函数命令限制",
    spawnRadius: "生成半径",
    showTags: "显示标签",
    freezeDamage: "冻伤伤害",
    respawnBlocksExplode: "重生方块爆炸",
    showBorderEffect: "边界是否发出红色粒子",
    showRecipeMessages: "解锁新配方时显示消息",
    playersSleepingPercentage: "跳过夜晚所需入睡玩家百分比",
    projectilesCanBreakBlocks: "弹射物破坏方块"
}

const allowEditByPlayer = ["doWeatherCycle", "pvp", "doInsomnia", "doImmediateRespawn", "freezeDamage", "mobGriefing", "doFireTick"]