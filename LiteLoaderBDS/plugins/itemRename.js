mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("rename", "重命名手中的物品", PermType.Any);
    cmd.mandatory("name", ParamType.RawText);
    cmd.overload(["name"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        if (_ori.type == 0) {
            if (res.name.length > 512) {
                _ori.player.tell("名称过长");
                return;
            }
            _ori.player.getHand().setDisplayName(res.name);
            _ori.player.refreshItems();
        }
    });
    cmd.setup();
});

