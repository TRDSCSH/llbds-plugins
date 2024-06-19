mc.regPlayerCmd("setspawn", "§r将当前位置设置为出生点", (pl, args) => {
    setSpawnPoint(pl);
});

function setSpawnPoint(pl) {
    mc.runcmdEx(`spawnpoint "${pl.realName}" ${pl.pos.x} ${pl.pos.y} ${pl.pos.z}`);
    pl.tell("§a已将当前位置设置为出生点");
}