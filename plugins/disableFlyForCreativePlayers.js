const blockList = [];

// 循环检测玩家是否在创造模式
mc.listen("onJump", function (player) {
    setTimeout(function () {
        if (player.isFlying && blockList.indexOf(player.realName) != -1) {
            player.setGameMode(0);
            player.addEffect(11, 600, 4, false);
            mc.spawnParticle(player.pos.x, player.pos.y, player.pos.z, player.pos.dimid, "minecraft:knockback_roar_particle");
            player.tell("§c你不被允许飞行！");
        }
    }, 512);
});