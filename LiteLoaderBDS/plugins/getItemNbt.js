mc.regPlayerCmd("getnbt", "§r获取手中物品的 NBT ， 并将 SNBT 输出到终端", getNbt);
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("getitem", "通过 SNBT 来获取物品", PermType.GameMasters);
    cmd.mandatory("snbt", ParamType.RawText);
    cmd.overload(["snbt"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        try {
            let input = res.snbt;
            let nbt = NBT.parseSNBT(input);
            if (nbt == null) {
                _ori.player.tell("§c§lSNBT 解析失败");
            } else {
                let item = mc.newItem(nbt);
                if (item == null) {
                    _ori.player.tell("§c§l物品获取失败");
                } else {
                    _ori.player.giveItem(item);
                    _ori.player.tell("物品获取成功");
                }
            }
        } catch (error) {
            _ori.player.tell("错误细节:\n" + error);
        }
    });
    cmd.setup();
});

function getNbt(pl) {
    let nbt = pl.getHand().getNbt();
    let snbt = nbt.toSNBT();
    log(snbt);
    pl.tell(snbt);
}