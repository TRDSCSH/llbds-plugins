let particleString = ["egg_destroy_emitter", "ice_evaporation_emitter", "knockback_roar_particle"];

mc.listen("onAttackBlock", (pl, bl, it) => {
    // log(it.type);
    if (!it) return;
    if (it.type == "minecraft:stick" && it.name == "smoke") {
        // log("Stick was used.");
        let pos = bl.pos;
        pos.y += 2;
        mc.spawnParticle(pos, "minecraft:" + particleString[Math.floor(Math.random() * particleString.length)]);
    } else if (it.type == "minecraft:stick" && it.name == "heart") {
        let pos = bl.pos;
        pos.y += 2;
        mc.spawnParticle(pos, "minecraft:heart_particle");
    }
});