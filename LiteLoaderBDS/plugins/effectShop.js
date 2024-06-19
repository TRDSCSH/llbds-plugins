//命令注册
mc.regPlayerCmd("eshop", "§r购买药水效果", showMenu);

// 配置
const defaultIcon = "textures/items/potion_bottle_drinkable";
const levels = ["I", "II", "III", "IV", "V"];
const effects = {
    "1": "迅捷",
    "2": "缓慢",
    "3": "挖掘加速",
    "4": "挖掘疲劳",
    "5": "力量",
    "6": "瞬间治疗",
    "7": "瞬间伤害",
    "8": "跳跃提升",
    "9": "反胃",
    "10": "生命恢复",
    "11": "抗性提升",
    "12": "抗火",
    "13": "水下呼吸",
    "14": "隐身",
    "15": "失明",
    "16": "夜视",
    "17": "饥饿",
    "18": "虚弱",
    "19": "中毒",
    "20": "凋零",
    "21": "生命提升",
    "22": "伤害吸收",
    "23": "饱和",
    "24": "漂浮",
    "25": "中毒（致命）",
    "26": "潮涌能量",
    "27": "缓降",
    "28": "不祥之兆",
    "29": "村庄英雄",
    "30": "黑暗"
};
const config = [
    {
        "label": "夜视",
        "id": 16,
        "level": 0,
        "time": 60 * 12 * 20,
        "icon": "textures/items/potion_bottle_nightVision",
        "price": 500
    },
    {
        "label": "水下呼吸",
        "id": 13,
        "level": 0,
        "time": 60 * 20 * 20,
        "icon": "textures/items/potion_bottle_waterBreathing",
        "price": 500
    },
    {
        "label": "抗火",
        "id": 12,
        "level": 0,
        "time": 60 * 20 * 20,
        "icon": "textures/items/potion_bottle_fireResistance",
        "price": 500
    },
    {
        "label": "抗性",
        "id": 11,
        "level": 0,
        "time": 60 * 5 * 20,
        "icon": "textures/items/potion_bottle_resistance",
        "price": 500
    },
    {
        "label": "抗性",
        "id": 11,
        "level": 1,
        "time": 60 * 5 * 20,
        "icon": "textures/items/potion_bottle_resistance",
        "price": 700
    },
    {
        "label": "抗性",
        "id": 11,
        "level": 4,
        "time": 60 * 5 * 20,
        "icon": "textures/items/potion_bottle_resistance",
        "price": 1500
    },
    {
        "label": "治疗",
        "id": 6,
        "level": 0,
        "time": 60 * 5 * 20,
        "icon": "textures/items/potion_bottle_heal",
        "price": 500
    },
    {
        "label": "治疗",
        "id": 6,
        "level": 1,
        "time": 60 * 5 * 20,
        "icon": "textures/items/potion_bottle_heal",
        "price": 700
    },
    {
        "label": "饱和",
        "id": 23,
        "level": 0,
        "time": 60 * 10 * 20,
        "icon": "textures/items/potion_bottle_saturation",
        "price": 500
    },
    {
        "label": "跳跃提升",
        "id": 8,
        "level": 0,
        "time": 60 * 10 * 20,
        "icon": "textures/items/potion_bottle_jump",
        "price": 500
    },
    {
        "label": "速度",
        "id": 1,
        "level": 0,
        "time": 60 * 10 * 20,
        "icon": "textures/items/potion_bottle_moveSpeed",
        "price": 500
    },
    {
        "label": "隐身",
        "id": 14,
        "level": 0,
        "time": 60 * 3 * 20,
        "icon": "textures/items/potion_bottle_invisibility",
        "price": 1500
    },
    {
        "label": "缓降",
        "id": 27,
        "level": 0,
        "time": 60 * 1 * 20,
        "icon": "textures/items/potion_bottle_slowFall",
        "price": 100
    }
];

// 菜单
function showMenu(pl, content, showall) {
    if (showall == null) showall = false;
    if (content == "") content = "点击下面的按钮即可立即购买相应的药水效果。";
    const playerEffects = pl.getAllEffects() == null ? [] : pl.getAllEffects();
    if (playerEffects.length > 0) {
        content += "\n\n当前效果:";
        for (let i = 0; i < playerEffects.length; i++) {
            content += ` ${effects[playerEffects[i]]} `;
            if (i < playerEffects.length - 1) content += "§7|§r";
        }
    }
    const fm = mc.newSimpleForm();
    let itemIds = [];
    fm.setTitle("药水效果商店");
    fm.setContent(content);
    for (let i = 0; i < config.length; i++) {
        const item = config[i];
        if (!playerEffects.includes(item.id) || showall) {
            fm.addButton(`${item.label} ${levels[item.level]} §o(${Math.floor(item.time / 20)}秒)§r [价格:${item.price}]`, item.icon);
            itemIds.push(i);
        }
    }
    if (itemIds.length < config.length) fm.addButton("显示所有项目");
    pl.sendForm(fm, (pl, id) => {
        if (id == null) return;
        if (id == itemIds.length) {
            showMenu(pl, "已显示所有药水效果", true);
            return;
        }
        const item = config[itemIds[id]];
        if (!item) return;
        if (pl.getMoney() < item.price) {
            showMenu(pl, `§c你的金币不足，无法购买§r`);
        } else {
            pl.addEffect(item.id, item.time, item.level, true);
            pl.setMoney(pl.getMoney() - item.price);
            showMenu(pl, `§a成功购买药水效果§r`);
        }
    });
}