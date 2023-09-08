// 导入函数
const getFormattedLevel = ll.import('nameDisplay', 'getFormattedLevel');
const getFormattedExp = ll.import('nameDisplay', 'getFormattedExp');
const getExpBar = ll.import('nameDisplay', 'getExpBar');
const getLevelExp = ll.import('nameDisplay', 'getLevelExp');
const getLevel = ll.import('nameDisplay', 'getLevel');
const getExp = ll.import('nameDisplay', 'getExp');
const isMaxLevel = ll.import('nameDisplay', 'isMaxLevel');

// 配置
const menuConfig = [
    {
        "type": "command",
        "id": "landfuncmenu",
        "level": 0,
        "label": "领地功能",
        "command": "lands",
        "showarrow": true,
        "image": "textures/ui/icon_recipe_nature",
        "permission": "all"
    },
    {
        "type": "menu",
        "id": "tpfuncmenu",
        "level": 1,
        "title": "传送功能",
        "content": "",
        "showarrow": true,
        "image": "textures/items/ender_pearl",
        "permission": "all",
        "options": [
            {
                "type": "command",
                "id": "lands tp",
                "level": 0,
                "label": "领地传送",
                "command": "lands tp",
                "showarrow": true,
                "image": "textures/ui/icon_recipe_nature",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "publictp",
                "level": 2,
                "label": "公共传送点",
                "command": "publictp",
                "showarrow": true,
                "image": "textures/ui/enable_editor",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "tpa",
                "level": 2,
                "label": "玩家传送",
                "command": "tpa",
                "showarrow": true,
                "image": "textures/ui/multiplayer_glyph_color",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "back",
                "level": 2,
                "label": "回到死亡点",
                "command": "back",
                "showarrow": false,
                "image": "textures/items/record_11",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "home",
                "level": 2,
                "label": "回家",
                "command": "home",
                "showarrow": false,
                "image": "textures/ui/icon_recipe_item",
                "permission": "all"
            }
        ]
    },
    {
        "type": "menu",
        "id": "economyfuncmenu",
        "level": 2,
        "title": "经济",
        "content": "金币:<money>",
        "showarrow": true,
        "image": "textures/ui/icon_minecoin_9x9",
        "permission": "all",
        "options": [
            {
                "type": "command",
                "id": "transfer",
                "level": 2,
                "label": "转账",
                "command": "transfer",
                "showarrow": true,
                "image": "textures/ui/trade_icon",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "bazaar",
                "level": 3,
                "label": "物品集市",
                "command": "bazaar",
                "showarrow": true,
                "image": "textures/items/item_frame",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "shop",
                "level": 2,
                "label": "物品商店",
                "command": "shop",
                "showarrow": true,
                "image": "textures/items/minecart_chest",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "eshop",
                "level": 4,
                "label": "药水效果商店",
                "command": "eshop",
                "showarrow": true,
                "image": "textures/items/potion_bottle_heal",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "soha gui",
                "level": 5,
                "label": "梭哈",
                "command": "soha gui",
                "showarrow": true,
                "image": "textures/items/map_mansion",
                "permission": "all"
            }
        ]
    },
    {
        "type": "command",
        "id": "pack",
        "level": 2,
        "label": "多背包",
        "command": "pack",
        "showarrow": true,
        "image": "textures/ui/icon_blackfriday",
        "permission": "all"
    },
    {
        "type": "menu",
        "id": "playerfuncmenu",
        "level": 1,
        "title": "玩家互动",
        "content": "",
        "showarrow": true,
        "image": "textures/ui/icon_multiplayer",
        "permission": "all",
        "options": [
            {
                "type": "command",
                "id": "tpa",
                "level": 2,
                "label": "玩家传送",
                "command": "tpa",
                "showarrow": true,
                "image": "textures/ui/multiplayer_glyph_color",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "express",
                "level": 1,
                "label": "发送物品",
                "command": "express",
                "showarrow": true,
                "image": "",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "liuyan",
                "level": 3,
                "label": "离线留言",
                "command": "liuyan",
                "showarrow": true,
                "image": "textures/ui/invite_base",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "post",
                "level": 3,
                "label": "玩家动态",
                "command": "post",
                "showarrow": true,
                "image": "textures/ui/comment",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "vote",
                "level": 2,
                "label": "查看当前投票",
                "command": "vote",
                "showarrow": false,
                "image": "textures/ui/saleribbon",
                "permission": "all"
            }
        ]
    },
    {
        "type": "menu",
        "id": "displaymgrmenu",
        "level": 3,
        "title": "界面显示",
        "content": "",
        "showarrow": true,
        "image": "textures/ui/video_glyph_color",
        "permission": "all",
        "options": [
            {
                "type": "command",
                "id": "mytitle",
                "level": 3,
                "label": "称号",
                "command": "mytitle",
                "showarrow": true,
                "image": "textures/ui/permissions_op_crown",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "namedisplay",
                "level": 3,
                "label": "头部名称",
                "command": "namedisplay",
                "showarrow": true,
                "image": "textures/items/name_tag",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "hubinfo",
                "level": 3,
                "label": "侧边信息栏",
                "command": "hubinfo",
                "showarrow": false,
                "image": "textures/items/banner_pattern",
                "permission": "all"
            }
        ]
    },
    {
        "type": "menu",
        "id": "otherfuncmenu",
        "level": 0,
        "title": "附加功能",
        "content": "",
        "showarrow": true,
        "image": "textures/items/magma_cream",
        "permission": "all",
        "options": [
            {
                "type": "command",
                "id": "post",
                "level": 3,
                "label": "玩家动态",
                "command": "post",
                "showarrow": true,
                "image": "textures/ui/comment",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "rss",
                "level": 4,
                "label": "RSS订阅",
                "command": "rss",
                "showarrow": true,
                "image": "textures/ui/broadcast_glyph_color",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "yacgm",
                "level": 5,
                "label": "地图画",
                "command": "yacgm",
                "showarrow": true,
                "image": "",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "nbs",
                "level": 2,
                "label": "音乐",
                "command": "nbs",
                "showarrow": true,
                "image": "textures/blocks/noteblock",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "stats",
                "level": 3,
                "label": "游戏数据",
                "command": "stats",
                "showarrow": true,
                "image": "textures/ui/subscription_glyph_color",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "checkin",
                "level": 0,
                "label": "签到",
                "command": "checkin",
                "showarrow": true,
                "image": "textures/ui/icon_sign",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "cdk",
                "level": 0,
                "label": "兑换码",
                "command": "cdk",
                "showarrow": true,
                "image": "textures/ui/promo_gift_small_pink",
                "permission": "all"
            }
        ]
    },
    {
        "type": "command",
        "id": "setspawn",
        "level": 6,
        "label": "设为出生点",
        "command": "setspawn",
        "showarrow": false,
        "image": "",
        "permission": "all"
    },
    {
        "type": "command",
        "id": "chdifficulty",
        "level": 6,
        "label": "难度",
        "command": "chdifficulty",
        "showarrow": true,
        "image": "textures/ui/controller_glyph_color",
        "permission": "all"
    },
    {
        "type": "menu",
        "id": "aboutmenu",
        "level": 0,
        "title": "关于本服",
        "content": "开服时间: 2022年7月\n到期: 2024年11月底\n配置: 4核 4G 8M\n每天备份 | 保持更新 | 可获得成就 | 生存",
        "showarrow": true,
        "image": "textures/ui/tiny_agnes",
        "permission": "all",
        "options": [
            {
                "type": "command",
                "id": "joingroup",
                "level": 0,
                "label": "加入群组",
                "command": "joingroup",
                "showarrow": true,
                "image": "textures/ui/FriendsIcon",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "levellink",
                "level": 0,
                "label": "游戏存档",
                "command": "levellink",
                "showarrow": true,
                "image": "textures/ui/cloud_only_storage",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "serverrules",
                "level": 0,
                "label": "服务器规则",
                "command": "serverrules",
                "showarrow": true,
                "image": "textures/ui/copy",
                "permission": "all"
            }
        ]
    },
    {
        "type": "menu",
        "id": "devfuncmenu",
        "level": 5,
        "title": "开发者功能",
        "content": "",
        "showarrow": true,
        "image": "textures/ui/debug_glyph_color",
        "permission": "all",
        "options": [
            {
                "type": "command",
                "id": "devbar",
                "level": 5,
                "label": "DevBar",
                "command": "devbar",
                "showarrow": false,
                "image": "textures/ui/enchanting_active_background_with_hover_text",
                "permission": "all"
            },
            {
                "type": "command",
                "id": "peffect",
                "level": 5,
                "label": "粒子特效",
                "command": "peffect",
                "showarrow": true,
                "image": "",
                "permission": "all"
            }
        ]
    },
    {
        "type": "menu",
        "id": "opfuncmenu",
        "level": 0,
        "title": "管理员功能",
        "content": "",
        "showarrow": true,
        "image": "textures/ui/permissions_op_crown",
        "permission": "op",
        "options": [
            {
                "type": "command",
                "id": "chgamerule",
                "level": 5,
                "label": "游戏规则",
                "command": "chgamerule",
                "showarrow": true,
                "image": "textures/ui/sign",
                "permission": "op"
            },
            {
                "type": "command",
                "id": "relics",
                "level": 5,
                "label": "恢复玩家背包",
                "command": "relics",
                "showarrow": true,
                "image": "textures/blocks/chest_front",
                "permission": "op"
            },
            {
                "type": "command",
                "id": "postrk gui",
                "level": 5,
                "label": "玩家坐标追踪",
                "command": "postrk gui",
                "showarrow": true,
                "image": "",
                "permission": "op"
            },
            {
                "type": "command",
                "id": "emptyxp",
                "level": 0,
                "label": "清空经验",
                "command": "emptyxp",
                "showarrow": false,
                "image": "",
                "permission": "op"
            }
        ]
    }
];
// type = menu: title / content / options 子菜单
// type = command: label / command 运行指令

// 导入功能
let PosGetLand = lxl.import('ILAPI_PosGetLand'); // 通过坐标查询领地 param: ( Vec4: {x, y, z, dimid}, noAccessCache: bool ) return: landId - string
let GetName = lxl.import('ILAPI_GetName'); // 获取领地昵称 param: ( landId: 领地ID ) return: string
let GetOwner = lxl.import('ILAPI_GetOwner');

// 常量
const itemType = "minecraft:clock";
// const itemSnbt = ""; // todo
const defaultImage = "textures/items/paper";
const lockedImage = "textures/ui/icon_lock";
const usageStatsDataPath = "plugins/menu/usageStats.json";

// 命令注册
mc.regPlayerCmd("menu", "§r显示菜单", (pl, args) => {
    showMenu(pl, menuConfig, "菜单", "<mainmenu-content>");
});

// 事件注册
mc.listen("onUseItem", (pl, it) => {
    if (it.type == itemType) {
        showMenu(pl, menuConfig, "菜单", "<mainmenu-content>");
    }
});

// 显示菜单
function showMenu(pl, config, title, content) {
    if (!config) config = menuConfig;
    if (!title) title = "菜单";
    if (!content) content = "";
    pl.sendForm(newMenu(config, title, trContent(content, pl), pl.isOP(), getLevel(pl)), (pl, id) => {
        if (id == null) return;
        const item = config[id];
        const isOP = pl.isOP();
        const level = getLevel(pl);
        const locked = ((item.level || 0) > level) && !isOP;
        if (locked) {
            showMenu(pl, config, title, content + "\n§6功能已锁定， 需要达到等级" + item.level + "以解锁§r");
            return;
        }
        if (item.type == "menu") {
            showMenu(pl, item.options, item.title, item.content);
        } else if (item.type == "command") {
            pl.runcmd(item.command);
        }
        if (item.id) {
            addOneFuncUsageStats(item.id);
        }
    });
}

function newMenu(config, title, content, isOP, level) {
    if (!content) content = "";
    const fm = mc.newSimpleForm();
    fm.setTitle(title);
    if (content != "") fm.setContent(content);
    for (let i = 0; i < config.length; i++) {
        const item = config[i];
        if (item.permission == "op" && !isOP) continue;
        if (item.level <= level || isOP) {
            const image = item.image != "" ? item.image : defaultImage;
            const label = item.label ? item.label : item.title;
            fm.addButton(label + (isOP ? (item.id ? "§0§o " + getFuncUsageStats(item.id)  + " §r" : "") : "") + (item.showarrow ? " >" : ""), image);
        } else {
            fm.addButton(`§0§o功能已锁定 (需要等级${item.level})`, lockedImage);
        }
    }
    return fm;
}

function trContent(content, pl) {
    return content
        .replace("<money>", pl.getMoney())
        .replace("<date&time>", getDateAndTimeStr())
        // .replace("<player-title>", getCurTitle(pl))
        .replace("<mainmenu-content>", mainMenuContent(pl));
}

function mainMenuContent(pl) {
    let content = "";
    content += "金币: " + pl.getMoney() + " | " + money.get("public");
    content += "    §7";
    content += getDateAndTimeStr() + "§r\n";
    content += "等级: " + getLevel(pl) + "  " + getExpBar(pl) + " " + getExp(pl) + `${isMaxLevel(pl) ? " §7§oMax§r" : "§7/" + getLevelExp(getLevel(pl)) + "§r"}`;
    const LANDID = landId(pl.pos);
    if (LANDID != -1) {
        content += "\n";
        content += "  §7·§r 位于"; // [§a■§r]
        const LAND_OWNER = GetOwner(LANDID);
        const LAND_NAME = GetName(LANDID);
        if (LAND_OWNER != pl.xuid) {
            if (LAND_OWNER == "public") {
                content += "公共";
            } else {
                content += " " + data.xuid2name(LAND_OWNER) + " 的";
            }
        }
        content += "领地";
        if (LAND_NAME != "") content += ": " + GetName(LANDID);
    }
    return content;
}

function getFuncUsageStats(funcId) {
    const usageStats = new JsonConfigFile(usageStatsDataPath);
    return usageStats.get(funcId) || 0;
}

function setFuncUsageStats(funcId, value) {
    const usageStats = new JsonConfigFile(usageStatsDataPath);
    usageStats.set(funcId, value);
}

function addOneFuncUsageStats(funcId) {
    const usageStats = new JsonConfigFile(usageStatsDataPath);
    const value = usageStats.get(funcId) || 0;
    usageStats.set(funcId, value + 1);
}

function landId(pos) {
    return PosGetLand(buildRawPosVec4(pos.x, pos.y, pos.z, pos.dimid));
}

function buildRawPosVec4(x, y, z, dimid) {
    return {
        x: x,
        y: y,
        z: z,
        dimid: dimid
    };
}

function getDateAndTimeStr() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = date.getDate();
    if (day < 10) day = "0" + day;
    var hour = date.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = date.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = date.getSeconds();
    if (second < 10) second = "0" + second;
    return month + "/" + day + " " + hour + ":" + minute;
}