ll.exports(stopServer, "stopdelay", "stopServer");

const DELAY = 5000;

let stop_status = false;
mc.listen("onConsoleCmd", (cmd) => {
    if (cmd != "stop" || stop_status) return;
    logger.info("收到关服指令，服务器将在" + (DELAY / 1000).toString() + "秒内关闭。")
    stop();
})
mc.listen("onPreJoin", (player) => {
    if (stop_status) player.disconnect("服务器正在关闭")
})
function stop(player = null) {
    setTimeout(() => {
        mc.runcmdEx("stop");
    }, DELAY)
    kickPlayers(1, player);
    return false;
}
function kickPlayers(i, player) {
    if (i >= 5) {
        if (player != null) player.disconnect("服务器即将关闭, 预计完成时间: 01:30")
        return;
    }
    stop_status = true;
    mc.getOnlinePlayers().forEach((currentPlayer) => {
        if (currentPlayer === player)
            currentPlayer.disconnect("服务器已关闭");
    })
    // setTimeout(() => { kickPlayers(i + 1, player); }, 55)
}
function stopServer() {
    const allPlayers = mc.getOnlinePlayers();
    allPlayers.forEach((currentPlayer) => {
        currentPlayer.sendToast("收到关服指令", "服务器将在 " + (DELAY / 1000).toString() + " 秒内关闭。");
    });
    mc.getOnlinePlayers().forEach((currentPlayer) => {
        currentPlayer.disconnect("服务器已关闭, 预计完成时间: 01:30");
    })
    setTimeout(() => {
        mc.runcmdEx("stop");
    }, DELAY)
}

// //线上关服
// mc.listen("onPlayerCmd", (player, cmd) => {
//     if (!player.isOP() || cmd != "stop" || stop_status) return;
//     stopServer();
//     return false;
// })

ll.registerPlugin("stopdelay", "关服延迟与线上关服", [1, 0, 0, Version.Release], { Author: "Minimouse" })