let ok = false;

mc.regPlayerCmd("piston", "切换活塞推动启用状态", (pl) => {
    ok = !ok;
    pl.tell("活塞推动启用状态: " + ok);
});

mc.listen("onPistonTryPush", () => {
    return ok;
});