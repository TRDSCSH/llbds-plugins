// 命令注册
mc.regPlayerCmd("peffect", "粒子特效", showGUI);

// 计时器
let players = [];
let timerId = []; // [Array]
let activeParticleEffects = []; // [Array]
let posData = new Array; // [Array]
let particleString = ["lavahalo", "waterhalo"];
let particleInterval = [90, 25];

log(`${posData}`)

// 显示界面
function showGUI(pl) {
    const fm = mc.newSimpleForm();
    let status = [];
    fm.setTitle("粒子特效");
    fm.setContent("选择一个粒子特效");
    for (let i = 0; i < particleString.length; i++) {
        const playerIndex = players.indexOf(pl.xuid);
        if (playerIndex == -1) {
            fm.addButton(particleString[i]);
        } else {
            if (activeParticleEffects[playerIndex].indexOf(particleString[i]) != -1) {
                fm.addButton("§a" + particleString[i] + "§r");
                status.push(true);
            } else {
                fm.addButton(particleString[i]);
                status.push(false);
            }
        }
    }
    pl.sendForm(fm, (pl, id) => {
        if (id != null) {
            if (status[id]) {
                removeActiveParticle(pl, particleString[id]);
                showGUI(pl);
                return;
            }
            addActiveParticle(pl.xuid, particleString[id]);
            showGUI(pl);
        }
    });
}



// 监听玩家离开游戏
mc.listen("onLeft", (pl) => {
    for (let i = 0; i < players.length; i++) {
        if (players[i] == pl.xuid) {
            for (let j = 0; j < activeParticleEffects[i].length; j++) {
                clearInterval(timerId[i][j]);
            }
            players.splice(i, 1);
            activeParticleEffects.splice(i, 1);
            timerId.splice(i, 1);
            posData.splice(i, 1);
            break;
        }
    }
});

// 函数
function addActiveParticle(plxuid, particleName) {
    const playerIndex = players.indexOf(plxuid);
    const interval = particleInterval[particleString.indexOf(particleName)];
    if (playerIndex == -1) {
        players.push(plxuid);
        activeParticleEffects.push([particleName]);
        timerId.push([setInterval(() => { particles(plxuid, particleName); }, interval)]);
        posData.push(new Array());
    } else {
        activeParticleEffects[playerIndex].push(particleName);
        timerId[playerIndex].push(setInterval(() => { particles(plxuid, particleName); }, interval));
        posData[playerIndex].push(new Array());
    }
}

function removeActiveParticle(pl, particleName) {
    for (let i = 0; i < players.length; i++) {
        if (players[i] == pl.xuid) {
            const particleIndex = activeParticleEffects[i].indexOf(particleName);
            if (particleIndex != -1) {
                activeParticleEffects[i].splice(particleIndex, 1);
                clearInterval(timerId[i][particleIndex]);
                timerId[i].splice(particleIndex, 1);
                posData[i].splice(particleIndex, 1);
            }
            break;
        }
    }
}

// 具体粒子特效
function particles(plxuid, particleName) {
    const pl = mc.getPlayer(plxuid);
    const playerIndex = players.indexOf(pl.xuid);
    const pos = pl.pos;
    const dimid = pos.dimid;
    let particlePosData = posData[playerIndex];
    let angle;
    switch (particleName) {
        case "lavahalo":
            if (particlePosData == "" || particlePosData == null) {
                // log(`ok`)
                particlePosData = new Array();
                // log(`${particlePosData}`)
                particlePosData[0] = 0.0;
                // log(`${particlePosData[0]}`)
                posData[playerIndex] = particlePosData;
            } else {
                // log(`${particlePosData}`)
                // log(`${particlePosData[0]}`)
                particlePosData[0] += 0.1;
            }
            angle = particlePosData[0];
            mc.spawnParticle(pos.x + Math.cos(angle * Math.PI) * 0.3, pos.y + 0.25, pos.z + Math.sin(angle * Math.PI) * 0.3, dimid, "minecraft:lava_drip_particle");
            break;

        case "waterhalo":
            if (particlePosData == "" || particlePosData == null) {
                particlePosData = new Array();
                particlePosData[0] = 0.0;
                posData[playerIndex] = particlePosData;
            } else {
                particlePosData[0] += 0.02;
            }
            angle = particlePosData[0];
            mc.spawnParticle(pos.x + Math.cos(angle * Math.PI) * 1, pos.y - 1.2, pos.z + Math.sin(angle * Math.PI) * 1, dimid, "minecraft:water_drip_particle");
            break;
    }
    // log(posData[playerIndex][0]);
    // log(`${playerIndex}`)
    // log(`${posData.flat()}`)
    // log(`plxuid = ${plxuid}, particleName = ${particleName}, typeof posData[playerIndex][0] = ${typeof posData[playerIndex][0]}`)
}