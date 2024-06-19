//命令注册
mc.regPlayerCmd("back", "§r回到上一个死亡点", backToDeathPos);

function backToDeathPos(pl) {
    tpProtect(pl);
    if (pl.lastDeathPos != null) {
        pl.teleport(pl.lastDeathPos);
        pl.tell(`您已被传送至 (${pl.lastDeathPos.x},${pl.lastDeathPos.y},${pl.lastDeathPos.z})`);
    } else {
        pl.tell("还没有你的死亡点记录");
    }
}

function tpProtect(pl) {
    let name = pl.realName
    mc.runcmdEx(`effect ${name} resistance 25 6 true`);
    mc.runcmdEx(`effect ${name} Water_Breathing 15 6 true`);
}