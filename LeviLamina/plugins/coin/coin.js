setInterval(() => {
    const allPlayers = mc.getOnlinePlayers();
    // log(allPlayers)
    for (let i = 0; i < allPlayers.length; i++) {
        const pl = allPlayers[i];
        if (pl.isSimulatedPlayer()) continue;
        const xuid = pl.xuid;
        money.set(xuid, money.get(xuid) + 1);
    }
}, 2000);