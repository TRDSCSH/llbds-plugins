const wsc = new WSClient();

mc.listen("onServerStarted", () => {
    connect();
});

function connect() {
    wsc.connectAsync("ws://localhost:8888", (success) => {
        if (success) {
            log("WS 已连接")
            mc.listen("onChat", (pl, msg) => {
                wsc.send(`[BE] <${pl.realName}> ${msg}`)
            })

            mc.listen("onLeft", (pl) => {
                const plname = pl.realName;
                setTimeout(() => {
                    wsc.send(`${plname} 离开了游戏\n当前在线 ${mc.getOnlinePlayers().length} 人`);
                }, 1000);
            });

            mc.listen("onJoin", (pl) => {
                const plname = pl.realName;
                setTimeout(() => {
                    wsc.send(`${plname} 加入了游戏\n当前在线 ${mc.getOnlinePlayers().length} 人`);
                }, 1000);
            });

            wsc.listen("onTextReceived", (msg) => {
                log(msg);
                mc.broadcast(`${msg}`);
            });

            wsc.listen("onError", (msg) => {
                log("WS 错误: " + msg);
            });

            wsc.listen("onLostConnection", (code) => {
                log("WS 连接丢失: " + code);
            });
        } else {
            log("WS 连接失败")
        }
    })
}