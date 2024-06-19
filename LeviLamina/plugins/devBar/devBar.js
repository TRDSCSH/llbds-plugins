let devs = [];
let taskid = null;
const defaultUid = 114514;
const defaultInterval = 100;

mc.listen("onServerStarted", () => {
    mc.regPlayerCmd("devbar", "§r显示用于辅助开发的 BossBar", toggle);

    function showBar() {
        const pls = mc.getOnlinePlayers();
        for (let i = 0; i < pls.length; i++) {
            if (devs.indexOf(pls[i].realName) == -1) {
                continue;
            }
            const pl = pls[i];
            const hand = pl.getHand() ? pl.getHand().type.slice(10) : '';
            const en = pl.getEntityFromViewVector(100.0);
            const enType = en ? en.type : '';
            const bl = pl.getBlockFromViewVector(false, false, 100.0, false);
            const blType = bl ? bl.type : '';
            const content = `${hand}${enType ? (" " + enType) : ''}${blType ? (" " + blType) : ""}`
            const title = `${content ? content : 'DevBar'}`;
            pl.setBossBar(defaultUid, title, 100, 0);
        }
    }

    function toggle(pl) {
        if (devs.indexOf(pl.realName) == -1) {
            devs.push(pl.realName);
            if (taskid == null) {
                taskid = setInterval(showBar, defaultInterval);
            }
            pl.tell("已显示");
        } else {
            devs.splice(devs.indexOf(pl.realName), 1);
            pl.removeBossBar(defaultUid);
            if (devs.length == 0) {
                clearInterval(taskid);
                taskid = null;
            }
            pl.tell("已隐藏");
        }
    }
});