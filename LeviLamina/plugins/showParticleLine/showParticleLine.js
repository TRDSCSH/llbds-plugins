let defaultParticle = "villager_happy";
let displayRadius, highDetial, doubleSide, color;

mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("sl", "显示一条线段", PermType.Any);
    const cmd2 = mc.newCommand("slb", "方块边缘", PermType.Any);
    cmd.optional("particleName", ParamType.String);
    cmd.mandatory("x1", ParamType.Float);
    cmd.mandatory("y1", ParamType.Float);
    cmd.mandatory("z1", ParamType.Float);
    cmd.mandatory("x2", ParamType.Float);
    cmd.mandatory("y2", ParamType.Float);
    cmd.mandatory("z2", ParamType.Float);
    cmd2.optional("particleName", ParamType.String);
    cmd2.mandatory("x", ParamType.Int);
    cmd2.mandatory("y", ParamType.Int);
    cmd2.mandatory("z", ParamType.Int);
    cmd.overload([]);
    cmd.overload(["particleName"]);
    cmd.overload(["x1", "y1", "z1", "x2", "y2", "z2", "particleName"]);
    cmd2.overload([]);
    cmd2.overload(["particleName"]);
    cmd2.overload(["x", "y", "z", "particleName"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        log(`${_ori}`);
        const particleName = res.particleName || defaultParticle;
        let dimid = _ori.player ? _ori.player.pos.dimid : 0;
        let x1 = res.x1;
        let y1 = res.y1;
        let z1 = res.z1;
        let x2 = res.x2;
        let y2 = res.y2;
        let z2 = res.z2;
        // _ori.player.tell(`${x1} ${y1} ${z1} ${x2} ${y2} ${z2}`);
        if (x1 == undefined || y1 == undefined || z1 == undefined || x2 == undefined || y2 == undefined || z2 == undefined) {
            let player = _ori.player;
            let pos = player.pos;
            x1 = pos.x;
            y1 = pos.y - 1.5;
            z1 = pos.z;
            x2 = pos.x + 10;
            y2 = pos.y + 10;
            z2 = pos.z + 10;
            // _ori.player.tell(`${x1} ${y1} ${z1} ${x2} ${y2} ${z2}`);
        }
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const step = 0.1;
        const count = Math.ceil(len / step);
        const px = dx / count;
        const py = dy / count;
        const pz = dz / count;
        for (let i = 0; i < count; i++) {
            const x = x1 + px * i;
            const y = y1 + py * i;
            const z = z1 + pz * i;
            mc.spawnParticle(x, y, z, dimid, "minecraft:" + particleName);
        }
        if (_ori.player) _ori.player.tell("运行完成");
    });
    cmd2.setCallback((_cmd, _ori, out, res) => {
        const particleName = res.particleName || defaultParticle;
        const dimid = _ori.player ? _ori.player.pos.dimid : 0;
        let x = res.x;
        let y = res.y;
        let z = res.z;
        // _ori.player.tell(`${x1} ${y1} ${z1} ${x2} ${y2} ${z2}`);
        if (x == undefined || y == undefined || z == undefined) {
            const player = _ori.player;
            const bl = player.getBlockFromViewVector();
            if (bl) {
                x = bl.pos.x;
                y = bl.pos.y;
                z = bl.pos.z;
            } else {
                const pos = player.pos;
                x = pos.x;
                y = pos.y - 1.5;
                z = pos.z;
                // _ori.player.tell(`${x1} ${y1} ${z1} ${x2} ${y2} ${z2}`);
            }
        }
        const dx = 1;
        const dy = 1;
        const dz = 1;
        const len = 1;
        const step = 0.1;
        const count = Math.ceil(len / step);
        let px = dx / count;
        let py = dy / count;
        let pz = dz / count;
        let x1 = x;
        let y1 = y;
        let z1 = z;
        for (let i = 0; i < count; i++) {
            mc.spawnParticle(x1 + px, y1, z1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1 + px, y1 + 1, z1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1 + px, y1 + 1, z1 + 1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1 + px, y1, z1 + 1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1, y1 + py, z1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1 + 1, y1 + py, z1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1 + 1, y1 + py, z1 + 1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1, y1 + py, z1 + 1, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1, y1, z1 + pz, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1 + 1, y1, z1 + pz, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1 + 1, y1 + 1, z1 + pz, dimid, "minecraft:" + particleName);
            mc.spawnParticle(x1, y1 + 1, z1 + pz, dimid, "minecraft:" + particleName);
            px += step;
            py += step;
            pz += step;
        }
        if (_ori.player) {
            _ori.player.tell("运行完成");
            // let ps = mc.newParticleSpawner(displayRadius = 4294967295, highDetial = true, doubleSide = true)
            // ps.drawCuboid(_ori.player.pos, color = ParticleColor.White)
            // ps.drawNumber(_ori.player.pos, 1, color = ParticleColor.White)
        }
    });
    cmd.setup();
    cmd2.setup();
});

mc.listen("onMobSpawned", (en, pos) => {
    mc.spawnParticle(pos.x, pos.y, pos.z, pos.dimid, "minecraft:knockback_roar_particle");
});

mc.listen("onMobTrySpawn", () => {
    if (mc.getAllEntities().length >= 185 * mc.getOnlinePlayers().length) return false;
});