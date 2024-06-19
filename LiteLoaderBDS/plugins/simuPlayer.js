const dataFilePath = "plugins/simuPlayer/data.json";
const dataFile = new JsonConfigFile(dataFilePath);

mc.regPlayerCmd("summonsimu", "§r生成模拟玩家", (pl, args) => {
    const dataFile = new JsonConfigFile(dataFilePath);
    const date = new Date();
    const timestamp = date.getTime();
    let playerName = args[0] || "simu";
    let player = mc.spawnSimulatedPlayer(playerName, pl.pos);
    if (args[0] == undefined) {
        player.rename("uuid:" + player.uuid);
    }
    dataFile.set(playerName + "-" + timestamp, player.uuid);
});

mc.regPlayerCmd("removesimu", "§r删除模拟玩家", (pl, args) => {
    const playerName = args[0] || "simu";
    const onlinePlayers = mc.getOnlinePlayers();
    for (const player of onlinePlayers) {
        if (player.isSimulatedPlayer() && player.realName == playerName) {
            player.kick();
            break;
        }
    }
});

setInterval(() => {
    const onlinePlayers = mc.getOnlinePlayers();
    let playerNum = -1;
    for (let i = 0; i < onlinePlayers.length; i++) {
        if (!onlinePlayers[i].isSimulatedPlayer()) {
            playerNum = i;
            break;
        }
    }
    if (playerNum == -1) return;
    for (const player of onlinePlayers) {
        if (player.isSimulatedPlayer()) {
            player.simulateLookAt(onlinePlayers[playerNum].pos);
        }
    }
}, 500);