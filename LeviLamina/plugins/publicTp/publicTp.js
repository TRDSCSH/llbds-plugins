// IMPORTS
const protectPlayer = ll.imports("donthurt", "pushPlayer");

// 配置
const configJson = {
    "bigMenu": {
        "type": "menu",
        "permission": "all",
        "image": "",
        "showarrow": true,
        "name": "公共传送点",
        "desc": "请选择传送点",
        "owner": "public",
        "fee": 0,
        "options": [
            {
                "type": "tp",
                "permission": "all",
                "image": "",
                "showarrow": false,
                "name": "主城区",
                "pos": [3, 149, -4.5, 0]
            },
            {
                "type": "tp",
                "permission": "all",
                "image": "",
                "showarrow": false,
                "name": "开荒处",
                "pos": [375.5, 97, 925, 0]
            },
            {
                "type": "tp",
                "permission": "all",
                "image": "",
                "showarrow": false,
                "name": "城堡",
                "pos": [-760.5, 64.00, -295.5, 0]
            },
            {
                "type": "tp",
                "permission": "all",
                "image": "",
                "showarrow": false,
                "name": "方块博物馆",
                "pos": [34.0, 70.00, 863.0, 0]
            },
            {
                "type": "menu",
                "permission": "all",
                "image": "",
                "showarrow": true,
                "name": "公共传送点#2",
                "desc": "二级菜单示例",
                "owner": "playerxuid",
                "fee": 0,
                "options": [
                    {
                        "type": "tp",
                        "permission": "all",
                        "image": "",
                        "showarrow": false,
                        "name": "主城区#2",
                        "pos": [3, 149, -4.5, 0]
                    }
                ]
            }
        ]
    },
    "usageData": {
        "public": 0
    },
    "operators": ["playerxuid"],
    "trusted": ["playerxuid"]
};

let config = new JsonConfigFile("plugins/publicTp/config.json", JSON.stringify(configJson));

const defaultImage = "textures/items/paper";
const chargeFee = 50;
const chargeRate = 0.05;
const newChargeFee = 4999;
const maxPoint = 10;
let ownerCountData = getAllPlayerPointCount();

// 命令注册
mc.regPlayerCmd("publictp", "§r公共传送点", (pl, args) => {
    showTpMenu(pl, config.get("bigMenu"));
});

mc.regPlayerCmd("publictp mgr", "§r自设公共传送点管理", (pl, args) => {
    selfPointMgr(pl);
});

mc.regPlayerCmd("publictp new", "§r新建自设公共传送点", (pl, args) => {
    selfPointEditor(pl, "", "", null, new Object());
});

mc.regPlayerCmd("publictp op", "§r添加公共传送点管理员", (pl, args) => {
    if (!isTrusted(pl)) {
        pl.tell("§c你不在信任列表中，无法使用该命令\n§r在控制台使用 §6publictp trust add \"" + pl.realName + "\" §r添加你为信任玩家");
        return;
    }
    addXuid(args, "operators", pl);
});

mc.regPlayerCmd("publictp deop", "§r移除公共传送点管理员", (pl, args) => {
    if (!isTrusted(pl)) {
        pl.tell("§c你不在信任列表中，无法使用该命令\n§r在控制台使用 §6publictp trust add " + pl.realName + " §r添加你为信任玩家");
        return;
    }
    removeXuid(args, "operators", pl);
});

mc.regPlayerCmd("publictp help", "显示帮助", (pl) => {
    pl.tell("公共传送点插件帮助");
    pl.tell("publictp - 打开公共传送点菜单");
    pl.tell("publictp mgr - 自设公共传送点管理");
    pl.tell("publictp new - 新建自设公共传送点");
    pl.tell("§6publictp op <玩家名/XUID> - 添加公共传送点管理员");
    pl.tell("§6publictp deop <玩家名/XUID> - 移除公共传送点管理员");
    pl.tell("publictp help - 显示帮助");
});

mc.regConsoleCmd("publictp op", "添加公共传送点管理员", (args) => {
    addXuid(args, "operators");
});

mc.regConsoleCmd("publictp deop", "移除公共传送点管理员", (args) => {
    removeXuid(args, "operators");
});

mc.regConsoleCmd("publictp trust add", "添加公共传送点信任玩家", (args) => {
    addXuid(args, "trusted");
});

mc.regConsoleCmd("publictp trust remove", "移除公共传送点信任玩家", (args) => {
    removeXuid(args, "trusted");
});

mc.regConsoleCmd("publictp help", "显示帮助", () => {
    log("公共传送点插件帮助");
    log("publictp - 打开公共传送点菜单");
    log("publictp op <玩家名/XUID> - 添加公共传送点管理员");
    log("publictp deop <玩家名/XUID> - 移除公共传送点管理员");
    log("publictp trust add <玩家名/XUID> - 添加公共传送点信任玩家");
    log("publictp trust remove <玩家名/XUID> - 移除公共传送点信任玩家");
    log("publictp help - 显示帮助");
});

// FORM
function selfPointEditor(pl, name = "", hint = "", index = null, data = new Object()) {
    if (!data.pos) data.pos = [pl.pos.x, pl.pos.y, pl.pos.z, pl.pos.dimid];
    // money.add(pl.xuid, 666);
    if ((pl.getMoney() < newChargeFee) && (index == null) && !isTrusted(pl)) {
        selfPointMgr(pl, `§c你的余额不足: ${pl.getMoney()}/${newChargeFee}`);
        return;
    }
    if ((getPointCount(pl.xuid) >= maxPoint) && (index == null)) {
        selfPointMgr(pl, `§c你的传送点数量已达上限: ${getPointCount(pl.xuid)}/${maxPoint}`);
        return;
    }
    const fm = mc.newCustomForm();
    const label1 = `传送点位置: ${pl.pos}\n\n§6创建公共传送点需要花费 ${newChargeFee} 金币,\n创建成功后无法修改坐标\n\n§7在下方输入传送点名称后点击“提交”按钮即可创建`;
    const label2 = `传送点位置: (${data.pos[0].toFixed(2)}, ${data.pos[1].toFixed(2)}, ${data.pos[2].toFixed(2)}) ${data.pos[3]}\n\n§7在下方编辑传送点名称后点击“提交”按钮即可更改`;
    fm.setTitle("自设公共传送点");
    fm.addLabel(index == null ? label1 : label2);
    fm.addInput("传送点名称", "为传送点起一个名字", name);
    fm.addLabel(hint);
    pl.sendForm(fm, (pl, id) => {
        if (id == null) return;
        const name = id[1];
        if (name == "") {
            selfPointEditor(pl, name, "§c传送点名称不能为空", index, data);
            return;
        }
        data.name = name;
        if (index != null) {
            editPoint(pl.xuid, index, data);
        } else {
            money.reduce(pl.xuid, newChargeFee);
            money.add("public", newChargeFee);
            addPoint(pl.xuid, data);
        }
        selfPointMgr(pl, "§6传送点已" + (index != null ? "修改" : "创建"));
    });
}

function selfPointMgr(pl, hint = "") {
    const fm = mc.newSimpleForm();
    const options = getSelfPoint(pl.xuid);
    const isEmptyHint = hint == "";
    if (options == null) {
        fm.setTitle("自设公共传送点管理");
        fm.setContent(isEmptyHint ? "你还没有自设公共传送点" : hint);
        fm.addButton("§0创建传送点", defaultImage);
    } else {
        const selfPointOptions = options.options;
        const count = selfPointOptions.length;
        fm.setTitle("自设公共传送点管理");
        fm.setContent(isEmptyHint ? "请选择操作" : hint);
        fm.addButton("§0创建传送点", defaultImage);
        fm.addButton("§0删除传送点", defaultImage);
        for (let i = 0; i < count; i++) {
            const item = selfPointOptions[i];
            fm.addButton(item.name, item.image != "" ? item.image : defaultImage);
        }
    }
    pl.sendForm(fm, (pl, id) => {
        if (id == null) return;
        if (options == null) {
            selfPointEditor(pl, "", "", null, new Object());
            return;
        } else {
            const selfPointOptions = options.options;
            const count = selfPointOptions.length;
            if (id == 0) {
                selfPointEditor(pl, "", "", null, new Object());
                return;
            } else if (id == 1) {
                if (count == 0) {
                    selfPointMgr(pl, "§c你还没有自设公共传送点");
                    return;
                }
                selfPointDelete(pl);
                return;
            } else {
                const item = selfPointOptions[id - 2];
                selfPointEditor(pl, item.name, "", id - 2, item);
            }
        }
    });
}

function selfPointDelete(pl, hint = "") {
    const fm = mc.newSimpleForm();
    const selfPoint = getSelfPoint(pl.xuid);
    if (selfPoint == null) {
        selfPointMgr(pl, "§c你还没有自设公共传送点");
        return;
    }
    const selfPointOptions = selfPoint.options;
    // log(selfPointOptions)
    const count = selfPointOptions.length;
    let names = [];
    fm.setTitle("删除自设公共传送点");
    fm.setContent(hint == "" ? "请选择要删除的传送点" : hint);
    for (let i = 0; i < count; i++) {
        const item = selfPointOptions[i];
        fm.addButton(item.name, item.image != "" ? item.image : defaultImage);
        names.push(item.name);
    }
    pl.sendForm(fm, (pl, id) => {
        if (id == null) return;
        selfPointDeleteConfirm(pl, id, names[id]);
    });
}

function selfPointDeleteConfirm(pl, index, name) {
    pl.sendModalForm("删除自设公共传送点", `你确定要删除传送点 ${name} 吗？`, "§c确定", "取消", (pl, result) => {
        if (result == null) selfPointDelete(pl);
        let resultMsg;
        if (result == true) {
            deletePoint(pl.xuid, index);
            resultMsg = "§6传送点已删除";
        } else {
            resultMsg = "";
        }
        // log(getPointCount(pl.xuid))
        getPointCount(pl.xuid) == 0 ? selfPointMgr(pl, "§6所有传送点已被删除") : selfPointDelete(pl, resultMsg);
    });
}

// 函数
function getAllPlayerPointCount() {
    let newMap = new Map();
    const options = config.get("bigMenu").options;
    for (let i = 0; i < options.length; i++) {
        const item = options[i];
        if (item.type == "menu") {
            newMap.set(item.owner, item.options.length);
        }
    }
    return newMap;
}

function getSelfPoint(xuid) {
    const options = config.get("bigMenu").options;
    for (let i = 0; i < options.length; i++) {
        const item = options[i];
        if (item.type == "menu" && item.owner == xuid) {
            return item;
        }
    }
    return null;
}

function getPointCount(xuid) {
    return ownerCountData.has(xuid) ? ownerCountData.get(xuid) : 0;
}

function addPoint(xuid, pointData) {
    let bigMenu = config.get("bigMenu");
    let options = bigMenu.options;
    let selfPoint;
    const count = getPointCount(xuid);
    if (count <= 0) {
        selfPoint = {
            "type": "menu",
            "permission": "all",
            "image": "",
            "showarrow": true,
            "name": `${data.xuid2name(xuid)} 的传送点`,
            "desc": "",
            "owner": xuid,
            // "created": Date.now(),
            // "renewed": Date.now(),
            "fee": chargeFee,
            "options": []
        };
        options.push(selfPoint);
    } else {
        for (let i = 0; i < options.length; i++) {
            const item = options[i];
            if (item.type == "menu" && item.owner == xuid) {
                selfPoint = item;
                break;
            }
        }
    }
    let selfPointOptions = selfPoint.options;
    const newPoint = {
        "type": "tp",
        "permission": "all",
        "image": "",
        "showarrow": false,
        "name": pointData.name,
        "pos": pointData.pos
    };
    selfPointOptions.push(newPoint);
    selfPoint.options = selfPointOptions;
    config.set("bigMenu", bigMenu);
    ownerCountData.set(xuid, count + 1); // 更新玩家传送点数量数据
    const usageData = config.get("usageData");
    usageData[xuid] = usageData[xuid] ? usageData[xuid] + 1 : 0;
    config.set("usageData", usageData);
    // log(`玩家 ${data.xuid2name(xuid)} 添加了传送点 ${name}`);
}

function editPoint(xuid, index, pointData) {
    let bigMenu = config.get("bigMenu");
    let options = bigMenu.options;
    for (let i = 0; i < options.length; i++) {
        const item = options[i];
        if (item.type == "menu" && item.owner == xuid) {
            let selfPointOptions = item.options;
            selfPointOptions[index] = pointData;
            break;
        }
    }
    config.set("bigMenu", bigMenu);
}

function deletePoint(xuid, index) {
    let bigMenu = config.get("bigMenu");
    let options = bigMenu.options;
    for (let i = 0; i < options.length; i++) {
        const item = options[i];
        if (item.type == "menu" && item.owner == xuid) {
            let selfPointOptions = item.options;
            selfPointOptions.splice(index, 1);
            if (selfPointOptions.length == 0) {
                options.splice(i, 1);
            }
            break;
        }
    }
    config.set("bigMenu", bigMenu);
    ownerCountData.set(xuid, getPointCount(xuid) - 1);
}

function showTpMenu(pl, menuConfig, hint = "") {
    const title = menuConfig.name == "" ? "公共传送点" : menuConfig.name;
    const desc = menuConfig.desc;
    const options = menuConfig.options;
    const fm = mc.newSimpleForm();
    fm.setTitle(title);
    fm.setContent(desc + (hint ? "\n\n" + hint : ""));
    for (let i = 0; i < options.length; i++) {
        const item = options[i];
        if (!checkPerm(pl, item.permission)) continue;
        const image = item.image != "" ? item.image : defaultImage;
        fm.addButton(item.name + (item.showarrow ? " >" : ""), image);
    }
    pl.sendForm(fm, (pl, id) => {
        if (id == null) return;
        refreshConfig();
        const item = options[id];
        if (item.type == "tp") {
            if (pl.getMoney() < item.fee) {
                showTpMenu(pl, menuConfig, "§c你的余额不足");
                return;
            }
            pl.teleport(item.pos[0], item.pos[1], item.pos[2], item.pos[3]);
            mc.spawnParticle(item.pos[0], item.pos[1], item.pos[2], item.pos[3], "minecraft:knockback_roar_particle");
            mc.spawnParticle(pl.pos.x, pl.pos.y, pl.pos.z, pl.pos.dimid, "minecraft:knockback_roar_particle");
            protectPlayer(pl, 10000);
            tpAnimation(pl);
            // if (item.owner != pl.xuid) {
            //     // money.trans(pl.xuid, "public", Math.floor(item.fee * chargeRate));
            //     // money.trans(pl.xuid, item.owner, item.fee - Math.floor(item.fee * chargeRate));
            // }
            const usageData = config.get("usageData");
            const ownerXuid = menuConfig.owner;
            usageData[ownerXuid] = usageData[ownerXuid] ? usageData[ownerXuid] + 1 : 1;
            config.set("usageData", usageData);

        } else if (item.type == "menu") {
            showTpMenu(pl, item);
        }
    });
}

function refreshConfig() {
    config = new JsonConfigFile("plugins/publicTp/config.json");
}

function checkPerm(pl, perm) {
    const opers = config.get("operators");
    if (perm == "op") return pl.isOP() && opers.indexOf(pl.xuid) != -1;
    if (perm == "all") return true;
    return false;
}

function isTrusted(pl) {
    const trusted = config.get("trusted");
    // log(trusted)
    // log(trusted.indexOf(pl.xuid))
    return trusted.indexOf(pl.xuid) != -1;
}

function addXuid(args, type, pl = null) {
    if (args.length == 0) {
        showResult("参数不足");
        return;
    }
    const typeStr = type == "operators" ? "公共传送点管理员" : "公共传送点信任玩家";
    // showResult(isNumber(args[0]))
    // showResult(data.name2xuid(args[0]))
    const xuid = isNumber(args[0]) ? args[0] : data.name2xuid(args[0]);
    if (xuid == "") {
        showResult("找不到该玩家");
        return;
    }
    const name = xuid ? (data.xuid2name(xuid) ? data.xuid2name(xuid) : xuid) : xuid;
    let opers = config.get(type);
    if (opers.indexOf(xuid) != -1) {
        showResult("该玩家已经是" + typeStr + "了");
        return;
    }
    opers.push(xuid);
    config.set(type, opers);
    showResult("已添加 " + name + " 为" + typeStr)

    function showResult(str) {
        if (pl != null) {
            pl.tell(str);
        } else {
            log(str);
        }
    }
}

function removeXuid(args, type, pl = null) {
    if (args.length == 0) {
        showResult("参数不足");
        return;
    }
    const typeStr = type == "operators" ? "管理员" : "信任玩家";
    const xuid = isNumber(args[0]) ? args[0] : data.name2xuid(args[0]);
    if (xuid == "") {
        showResult("找不到该玩家");
        return;
    }
    const name = xuid ? (data.xuid2name(xuid) ? data.xuid2name(xuid) : xuid) : xuid;
    let opers = config.get(type);
    const index = opers.indexOf(xuid);
    if (index == -1) {
        showResult("该玩家不是" + typeStr);
        return;
    }
    opers.splice(index, 1);
    config.set(type, opers);
    showResult("已移除 " + name + " 的" + typeStr + "权限")

    function showResult(str) {
        if (pl != null) {
            pl.tell(str);
        } else {
            log(str);
        }
    }
}

function tpAnimation(pl) {
    const name = pl.realName
    mc.runcmdEx(`camera ${name} fade time 0.1 0.7 0.5`);
    pl.setTitle("传送中" ,2);
}

// function tpProtect(pl) {
//     let name = pl.realName
//     mc.runcmdEx(`effect ${name} resistance 25 6 true`);
//     mc.runcmdEx(`effect ${name} Water_Breathing 15 6 true`);
// }

function isNumber(value) {
    return !Number.isNaN(Number(value))
}