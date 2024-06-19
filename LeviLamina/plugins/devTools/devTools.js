mc.listen("onServerStarted", () => {
    mc.regPlayerCmd("testserver", "前往测试服(可能不可用)", (pl) => {
        pl.transServer('example.com', 19132);
        mc.broadcast(`${pl.realName} -> 测试服务器`);
        log(`${pl.realName} -> 测试服务器`);
    });
});