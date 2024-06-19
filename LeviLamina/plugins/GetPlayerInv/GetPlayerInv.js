// 命令注册
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("gpinv", "获取玩家背包物品", PermType.GameMasters);
    cmd.mandatory("playerName", ParamType.RawText);
    cmd.overload(["playerName"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        const realname = res["playerName"];
        const uuid = data.name2uuid(realname);

        if (!uuid) {
            log('uuid 未找到');
            return;
        }

        const onlinePlayers = mc.getOnlinePlayers();
        let pos;
        for (let i = 0; i < onlinePlayers.length; i++) {
            const player = onlinePlayers[i];
            if (player.realName == 'admin') {
                pos = player.pos;
            } else {
                continue;
            }
        }
        if (!pos) {
            log('没有找到 admin');
            return;
        }
        if (!mc.getBlock(pos).isAir) {
            log('方块非空气1');
            return;
        }
        pos.x += 1;
        if (!mc.getBlock(pos).isAir) {
            log('方块非空气2');
            return;
        }

        mc.setBlock(pos, 'minecraft:chest', 0);
        pos.x -= 1;
        mc.setBlock(pos, 'minecraft:chest', 0);

        const ct = mc.getBlock(pos).getContainer();
        
        const plNbt = mc.getPlayerNbt(uuid);
        if (!plNbt) {
            log('plNbt 为空');
            return;
        }

        const inv = plNbt.getTag('Inventory');
        const arm = plNbt.getTag('Armor');
        const off = plNbt.getTag('Offhand');
        const mai = plNbt.getTag('Mainhand');

        const items = [...nbtlist2items(inv), ...nbtlist2items(arm), ...nbtlist2items(off), ...nbtlist2items(mai)];

        for (let i = 0; i < items.length; i++) {
            ct.addItem(items[i]);
        }
    });
    cmd.setup();
});

function nbtlist2items(list) {
    const items = new Array;
    const listSize = list.getSize();
    for (let i = 0; i < listSize; i++) {
        items.push(mc.newItem(list.getTag(i)));
    }

    return items;
}