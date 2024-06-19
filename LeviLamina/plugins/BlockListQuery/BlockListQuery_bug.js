// 函数导出
ll.exports(isBlackBeBanned, 'BLQ', 'isBlackBeBanned');

// 命令注册
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("bbb", "查询玩家名是否在云黑名单中", PermType.GameMasters);
    cmd.mandatory("playerName", ParamType.RawText);
    cmd.overload(["playerName"]);
    cmd.setCallback(async (_cmd, _ori, out, res) => {
        const realname = res["playerName"];
        const result = await isBlackBeBanned(realname);
        // return out.success(`玩家 ${realname} ${result ? Format.Red + '在' + Format.Clear : '不在'}云黑列表中`);
        const msg = `玩家 ${realname} ${result ? Format.Red + '在' + Format.Clear : '不在'}云黑列表中`;
        if (_ori.type == 7) {
            log(msg);
        } else if (_ori.type == 0) {
            _ori.player.tell(msg);
        }
    });
    cmd.setup();
});

// 函数
async function isBlackBeBanned(realname) {
    // 代码来自：https://www.minebbs.com/resources/banpl-blackbe-mojangapi-geyserapi-gui.7131/
    // 云黑检查
    let BlackBeBanned = false;
    const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms, null));

    BlackBeBanned = await Promise.race([
        new Promise((resolve) => {
            network.httpGet("https://api.blackbe.work/openapi/v3/check/?name=" + encodeURIComponent(realname), (status, result) => {
                if(status === 200 && JSON.parse(result)
                    .status === 2000) {
                    resolve(true);
                } else {
                    resolve(false); // 如果状态不是200，立即解析为null
                }
            });
        }),
        timeout(5000) // 设置超时时间为5000ms（5秒）
    ]);

    return BlackBeBanned;
}