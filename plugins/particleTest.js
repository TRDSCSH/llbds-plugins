let playerList, taskid = null, taskid2 = null, x, y, z, angle = 0;
let particleString = ["arrow_spell_emitter", "balloon_gas_particle", "basic_bubble_particle", "basic_bubble_particle_manual", "basic_crit_particle", "basic_flame_particle", "basic_portal_particle", "basic_smoke_particle", "bleach", "block_destruct", "block_slide", "breaking_item_icon", "breaking_item_terrain", "bubble_column_bubble", "bubble_column_down_particle", "bubble_column_up_particle", "camera_shoot_explosion", "campfire_smoke_particle", "campfire_tall_smoke_particle", "cauldron_bubble_particle", "cauldron_explosion_emitter", "cauldron_spell_emitter", "cauldron_splash_particle", "colored_flame_particle", "conduit_absorb_particle", "conduit_attack_emitter", "conduit_particle", "critical_hit_emitter", "death_explosion_emitter", "dolphin_move_particle", "dragon_breath_fire", "dragon_breath_lingering", "dragon_breath_trail", "dragon_death_explosion_emitter", "dragon_destroy_block", "dragon_dying_explosion", "egg_destroy_emitter", "electric_spark_particle", "elephant_tooth_paste_vapor_particle", "enchanting_table_particle", "end_chest", "endrod", "evocation_fang_particle", "evoker_spell", "explosion_manual", "explosion_particle", "eye_of_ender_bubble_particle", "eyeofender_death_explode_particle", "falling_border_dust_particle", "falling_dust", "falling_dust_concrete_powder_particle", "falling_dust_dragon_egg_particle", "falling_dust_gravel_particle", "falling_dust_red_sand_particle", "falling_dust_sand_particle", "falling_dust_scaffolding_particle", "falling_dust_top_snow_particle", "fish_hook_particle", "fish_pos_particle", "guardian_attack_particle", "guardian_water_move_particle", "heart_particle", "honey_drip_particle", "huge_explosion_emitter", "huge_explosion_lab_misc_emitter", "ice_evaporation_emitter", "ink_emitter", "knockback_roar_particle", "lab_table_heatblock_dust_particle", "lab_table_misc_mystical_particle", "large_explosion", "lava_drip_particle", "lava_particle", "llama_spit_smoke", "magnesium_salts_emitter", "misc_fire_vapor_particle", "mob_block_spawn_emitter", "mob_portal", "mobflame_emitter", "mobflame_single", "mobspell_emitter", "mycelium_dust_particle", "nectar_drip_particle", "note_particle", "obsidian_glow_dust_particle", "phantom_trail_particle", "portal_directional", "portal_east_west", "portal_north_south", "rain_splash_particle", "redstone_ore_dust_particle", "redstone_repeater_dust_particle", "redstone_torch_dust_particle", "redstone_wire_dust_particle", "rising_border_dust_particle", "sculk_sensor_redstone_particle", "shulker_bullet", "silverfish_grief_emitter", "snowflake_particle", "sparkler_emitter", "splash_spell_emitter", "sponge_absorb_water_particle", "spore_blossom_ambient_particle", "spore_blossom_shower_particle", "squid_flee_particle", "squid_ink_bubble", "squid_move_particle", "stunned_emitter", "terrain", "totem_manual", "totem_particle", "trackingemitter", "underwater_torch_particle", "vibration_signal", "villager_angry", "villager_happy", "water_drip_particle", "water_evaporation_actor_emitter", "water_evaporation_bucket_emitter", "water_evaporation_manual", "water_splash_particle", "water_splash_particle_manual", "water_wake_particle", "wax_particle", "witchspell", "wither_boss_invulnerable"];
let invaildParticleString = [];
let count = particleString.length;
let interval = 50;  // 粒子效果切换间隔
let interval2 = 4000; // 切换粒子效果名称的间隔
let leftTime = interval2 / 1000;
let particleNum = 0;
let testPlayer = [];
let defaultArr = [];
for (let i = 0; i < count; i++) defaultArr.push(0);
const jsonDataPath = "plugins/particle.json";
let jsonData = new JsonConfigFile(jsonDataPath);
jsonData.init("markedAsInvaild", defaultArr);
let voteItemSNBT = '{"Count":1b,"Damage":0s,"Name":"minecraft:bread","WasPickedUp":0b,"tag":{"display":{"Name":"标记粒子效果的可用性"},"ench":[{"id":0s,"lvl":0s}]}}';
let voteItem = itemFromSNBT(voteItemSNBT);
initInvaildParticleString();

mc.regPlayerCmd("ptest save", "§r保存可用的粒子名称", ptestSave);
mc.listen("onServerStarted", () => {
    let cmd = mc.newCommand("ptest", "§r粒子效果测试", PermType.Any);
    // cmd.setEnum("Pause", ["pause", "p"]);
    cmd.setEnum("Jump", ["jump", "j"]);
    // cmd.mandatory("action", ParamType.Enum, "Pause", 1);
    cmd.mandatory("action", ParamType.Enum, "Jump", 1);
    cmd.mandatory("id", ParamType.Int);
    cmd.overload([]);
    // cmd.overload(["Pause"]);
    cmd.overload(["Jump", "id"]);
    cmd.setCallback((cmd, origin, output, results) => {
        let action = results.action;
        switch (origin.type) {
            case 0:
                if (action == "jump" || action == "j") {
                    let id = results.id % count;
                    particleNum = id;
                    origin.player.tell(`§a${particleString[id]}§7[#${id}]`);
                } else {
                    // 检测玩家是否在测试名单中
                    let isTestPlayer = false;
                    for (let i = 0; i < testPlayer.length; i++) {
                        if (testPlayer[i] == origin.player.realName) {
                            isTestPlayer = true;
                            break;
                        }
                    }
                    if (!isTestPlayer) {
                        // 向数组中添加玩家名
                        testPlayer.push(origin.player.realName);
                        getItem(origin.player, voteItemSNBT);

                        if (taskid == null) {
                            taskid = setInterval(main, interval);
                            taskid2 = setInterval(() => {
                                particleNum = (particleNum + 1) % count;
                                leftTime = interval2 / 1000;
                            }, interval2);
                            log(`开启循环任务 ( taskid = ${taskid} )`);
                        }
                    } else {
                        // 从数组中删除玩家名
                        for (let i = 0; i < testPlayer.length; i++) {
                            if (testPlayer[i] == origin.player.realName) {
                                testPlayer.splice(i, 1);
                                break;
                            }
                        }
                        if (testPlayer.length == 0 && taskid != null) {
                            clearInterval(taskid);
                            clearInterval(taskid2);
                            log(`清除循环任务 ( taskid = ${taskid} )`);
                            taskid = null;
                        }
                    }
                }
        }
    });
    cmd.setup();
});

mc.listen("onUseItem", (pl, it) => {
    if (taskid == null) return;
    let itemType = it.getNbt().getTag("Name");
    let itemTag = it.getNbt().getTag("tag");
    if (itemType == "minecraft:bread" && itemTag == '{"display":{"Name":"标记粒子效果的可用性"},"ench":[{"id":0,"lvl":0}]}') {
        let jsonData = new JsonConfigFile(jsonDataPath);
        let dataArr = jsonData.get("markedAsInvaild");
        let label = " （ §c×§r ）";
        dataArr[particleNum] = 1 - dataArr[particleNum];
        if (dataArr[particleNum] == 0) label = " （ §a√§r ）";
        jsonData.set("markedAsInvaild", dataArr);
        // mc.runcmdEx(`execute at \"${pl.realName}\" run title \"${pl.realName}\" actionbar ${particleString[particleNum]}${label}`);
        pl.tell(`${particleString[particleNum]}§7[#${particleNum}]§r ${label}`);
    }
});

mc.listen("onLeft", (pl) => {
    for (let i = 0; i < testPlayer.length; i++) {
        if (testPlayer[i] == pl.realName) {
            log(`玩家 ${pl.realName} 离开游戏`);
            testPlayer.splice(i, 1);
            break;
        }
    }

    if (testPlayer.length == 0 && taskid != null) {
        clearInterval(taskid);
        clearInterval(taskid2);
        log(`清除循环任务 ( taskid = ${taskid} )`);
        taskid = null;
    }
});

function main() {
    // 获取在线玩家
    let playerList = mc.getOnlinePlayers();
    for (let i = 0; i < playerList.length; i++) {
        // 在测试玩家名单数组中查找玩家名
        for (let j = 0; j < testPlayer.length; j++) {
            if (testPlayer[j] == playerList[i].realName) {
                // 在线玩家在测试玩家名单中
                let player = playerList[i];
                let x = player.pos.x + Math.cos(angle * Math.PI) * 2;
                let y = player.pos.y;
                let z = player.pos.z + Math.sin(angle * Math.PI) * 2;
                angle += 0.05;
                showParticle(player, x, y, z, particleString[particleNum]);
                break;
            }
        }
    }
}

function ptestSave(pl) {
    let jsonData = new JsonConfigFile(jsonDataPath);
    let dataArr = jsonData.get("markedAsInvaild");
    let nameDataArr = [];
    for (let i = 0; i < dataArr.length; i++) {
        if (dataArr[i] == 0) nameDataArr.push(particleString[i]);
    }
    jsonData.set("particles", nameDataArr);
    pl.tell("§a保存成功");
}

function showParticle(pl, x, y, z, particleName) {
    jsonData = new JsonConfigFile(jsonDataPath);
    let label = " （ §a√§r ）";
    if (jsonData.get("markedAsInvaild")[particleNum] == 1) {
        label = " （ §c×§r ）";
    }
    leftTime = leftTime - interval / 1000;
    // mc.runcmdEx(`execute at \"${pl.realName}\" run title \"${pl.realName}\" actionbar ${particleName}${label} §7${leftTime.toFixed(1)}s`);
    // mc.runcmdEx(`execute at \"${pl.realName}\" run particle minecraft:${particleName} ${x} ${y} ${z}`);
    pl.setTitle(`${particleName}§7[#${particleNum}]§r ${label} §7${leftTime.toFixed(1)}s`, 4);
    mc.spawnParticle(x, y, z, pl.pos.dimid, "minecraft:" + particleName);
}

function initInvaildParticleString() {
    let jsonData = new JsonConfigFile(jsonDataPath);
    let dataArr = jsonData.get("markedAsInvaild");
    let nameDataArr = [];
    for (let i = 0; i < dataArr.length; i++) {
        if (dataArr[i] == 1) invaildParticleString.push(particleString[i]);
    }
    log(`invaildParticleString = ${invaildParticleString}`);
}

function getRandomInt(count) {
    return Math.floor(Math.random() * count);
}

function itemFromSNBT(snbt) {
    let nbt = NBT.parseSNBT(snbt);
    return mc.newItem(nbt);
}

function getItem(player, snbt) {
    let nbt = NBT.parseSNBT(snbt);
    if (nbt == null) {
        player.tell("§c§lSNBT 解析失败");
    } else {
        let item = mc.newItem(nbt);
        if (item == null) {
            player.tell("§c§l物品获取失败");
        } else {
            player.giveItem(item);
            player.tell("通过物品来标记粒子效果的可用性");
        }
    }
}

function getNbt(pl) {
    let nbt = pl.getHand().getNbt();
    let snbt = nbt.toSNBT();
    log(snbt);
    pl.tell(snbt);
}