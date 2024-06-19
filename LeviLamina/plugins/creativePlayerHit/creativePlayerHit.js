mc.listen("onAttackEntity", (pl, en, da) => {
    if (pl.gameMode == 1) {
        if (en.isPlayer()) {
            en.heal(1);
            en.toPlayer().setHungry(20);
            mc.spawnParticle(en.pos.x, en.pos.y, en.pos.z, en.pos.dimid, "minecraft:totem_particle");
            mc.runcmdEx(`playsound random.anvil_land \"${pl.realName}\"`);
            return false;
        }
    } else {
        if (en.isPlayer()) {
            if (en.toPlayer().gameMode != 1) return true;
            pl.heal(1);
            pl.setHungry(20);
            mc.spawnParticle(pl.pos.x, pl.pos.y, pl.pos.z, pl.pos.dimid, "minecraft:totem_particle");
            mc.runcmdEx(`playsound random.anvil_land \"${pl.realName}\"`);
            return false;
        }
    }
});