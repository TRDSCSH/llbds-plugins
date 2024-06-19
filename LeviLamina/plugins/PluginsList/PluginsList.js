const plugins = ll.listPlugins();
const SHOW_TABLE = true;

const pluginsInfo = {
    "chatBackup": {
        "name": "聊天记录备份"
    },
    "checkin": {
        "name": "签到"
    },
    "afkDetect": {
        "name": "挂机"
    },
    "cdk": {
        "name": "兑换码"
    },
    "Sprite's_ShowHealth_Lite_Release_1.0.0": {
        "name": "血量显示 - 显示最后一次攻击的生物血量",
        "author": "sprite(52030@minebbs)",
        "link": "???"
    },
    "back": {
        "name": "回到死亡点"
    },
    "DynamicMaxPlayers": {
        "name": "动态最大玩家数",
        "author": "源域开发组(SourceLandDev@github)",
        "link": "https://github.com/SourceLandDev/Scripts"
    },
    "publicLands": {
        "name": "公共领地"
    },
    "Bazaar": {
        "name": "集市",
        "author": "源域开发组",
        "link": "https://github.com/SourceLandDev/Scripts"
    },
    "home": {
        "name": "家"
    },
    "BehaviorLog": {
        "name": "行为日志记录",
        "author": "yqs112358(14760@minebbs)",
        "link": "https://www.minebbs.com/resources/behaviorlog.2795/"
    },
    "post": {
        "name": "帖子"
    },
    "chdifficulty": {
        "name": "更改难度"
    },
    "menu": {
        "name": "菜单"
    },
    "chgamerule": {
        "name": "更改游戏规则"
    },
    "chplayersleepingpercentage": {
        "name": "更改睡觉百分比"
    },
    "Shop": {
        "name": "商店",
        "author": "予纾(Yuisyuu@github)",
        "link": "https://github.com/Yuisyuu/lseScripts"
    },
    "Donthurt": {
        "name": "玩家保护",
        "author": "xiaoyucrapt(31240@minebbs)",
        "link": "https://www.minebbs.com/resources/donthurt-ta.5158/"
    },
    "effectShop": {
        "name": "药水商店"
    },
    "emptyXp": {
        "name": "清空经验"
    },
    "playerTitle": {
        "name": "玩家称号"
    },
    "Express": {
        "name": "快递",
        "author": "源域开发组",
        "link": "https://github.com/SourceLandDev/Scripts"
    },
    "serverTips": {
        "name": "服务器提示"
    },
    "ilandFly": {
        "name": "领地飞行",
    },
    "Transfer": {
        "name": "转账",
        "author": "源域开发组",
        "link": "https://github.com/SourceLandDev/Scripts"
    },
    "itemRename": {
        "name": "物品重命名"
    },
    "LandColorBox": {
        "name": "iLand领地修护: 彩色潜影盒",
        "author": "PHEyeji(25333@minebbs)",
        "link": "https://www.minebbs.com/resources/iland.6618/"
    },
    "publicTp": {
        "name": "公共传送"
    },
    "soha": {
        "name": "梭哈"
    },
    "WitherHeal": {
        "name": "击败凋零回血",
        "author": "予纾",
        "link": "https://github.com/Yuisyuu/lseScripts"
    },
    "leaveMsgForOfflinePlayers": {
        "name": "离线玩家留言"
    },
    "setSpawnPoint": {
        "name": "设置重生点"
    },
    "TPA": {
        "name": "玩家传送",
        "author": "aabb(8602@minebbs)",
        "link": "https://www.minebbs.com/resources/7221/"
    },
    "motd": {
        "name": "服务器信息"
    },
    "nameDisplay": {
        "name": "玩家名字显示"
    },
    "onlineTime": {
        "name": "在线时间记录和排名"
    },
    "PlayerStatsTracker": {
        "name": "玩家统计信息",
        "author": "FtyLollipop(6723@minebbs)",
        "link": "https://www.minebbs.com/resources/playerstatstracker.5863/"
    },
    "preventDangerousOperations": {
        "name": "防止危险操作"
    },
    "relics": {
        "name": "遗物 - 记录玩家死亡前背包",
        "author": "xinchenXPC(22795@minebbs)",
        "link": "https://www.minebbs.com/threads/relics.19343/"
    },
    "stopdelay": {
        "name": "关服延迟与线上关服",
        "author": "小鼠同学(41460@minebbs)",
        "link": "https://www.minebbs.com/threads/stopdelay.18768/"
    },
    "tpsTest": {
        "name": "TPS测试",
        "author": "KING(4060@minebbs)",
        "link": "https://www.minebbs.com/resources/tpstest-tps.3977/"
    },
    "vote": {
        "name": "简易投票"
    },
    "NBSPlayer": {
        "name": "NBS播放器",
        "author": "lgc2333(4310@minebbs)",
        "link": "https://www.minebbs.com/resources/nbsplayer-bds-nbs.4479/"
    },
    "TPSWarn": {
        "name": "卡顿警告",
        "author": "予纾",
        "link": "???"
    },
    "HubInfo": {
        "name": "信息栏",
        "author": "源域开发组",
        "link": "https://github.com/SourceLandDev/Scripts"
    },
    "CustomGetMap": {
        "name": "CustomGetMap",
        "author": "10_27(10809@minebbs)",
        "link": "https://www.minebbs.com/resources/4050/"
    }
};

// 命令注册
mc.regPlayerCmd("plugins", "§r显示服务器插件信息", (pl, args) => {
    showForm(pl);
});

// 运行代码
if (SHOW_TABLE) {
    showTable();
}

// 函数
function showTable() {
    let content = "|ID|名称|作者|链接|\n|-|-|-|-|\n";
    for (const plugin in plugins) {
        if (plugins.hasOwnProperty(plugin)) {
            const pluginName = plugins[plugin];
            if (pluginsInfo[pluginName]) {
                const pluginInfo = pluginsInfo[pluginName];
                content += `|${plugin}|${pluginInfo.name}|${pluginInfo.author || "#"}|${pluginInfo.link ? '[Link](' + pluginInfo.link + ')' : "#"}|\n`;
            } else {
                content += `|${plugin}|${pluginName}|#|#|\n`;
            }
        }
    }
    content += "\n共 " + plugins.length + " 个插件";
    log(content);
}

function showForm(pl) {
    let content = "";
    for (const plugin in plugins) {
        if (plugins.hasOwnProperty(plugin)) {
            const pluginName = plugins[plugin];
            if (pluginsInfo[pluginName]) {
                const pluginInfo = pluginsInfo[pluginName];
                content += `${plugin}. ${Format.MinecoinGold}${plugins[plugin]}§r\n`;
                if (pluginInfo.name) {
                    content += `   ${Format.DarkAqua}[名称]§r ${pluginInfo.name}\n`;
                }
                if (pluginInfo.author) {
                    content += `   §7[作者] ${pluginInfo.author}\n§r`;
                }
                if (pluginInfo.link) {
                    content += `   §7[链接] ${pluginInfo.link}\n§r`;
                }
                content += "\n";
            } else {
                content += `${plugin}. ${Format.MinecoinGold}${pluginName}§r\n\n`;
            }
        }
    }
    content += "\n§7共 " + plugins.length + " 个插件§r";

    const fm = mc.newSimpleForm();
    fm.setTitle("服务器插件信息");
    fm.setContent(content);
    fm.addButton("主菜单");
    fm.addButton("关闭");
    
    pl.sendForm(fm, (pl, id) => {
        if (id == null) return;
        if (id == 0) {
            pl.runcmd("menu");
        }
    });
}