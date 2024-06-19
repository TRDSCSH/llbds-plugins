let devs = [];
let taskid = null;
const defaultUid = 114514;
const defaultInterval = 100;

mc.regPlayerCmd("devbar", "§r显示用于辅助开发的 BossBar", toggle);

function showBar() {
    const pls = mc.getOnlinePlayers();
    for (let i = 0; i < pls.length; i++) {
        if (devs.indexOf(pls[i].realName) == -1) {
            continue;
        }
        const pl = pls[i];
        const title = `${pl.getHand() ? '主手物品:' + pl.getHand().type.slice(10) : ''}  ${pl.getBlockFromViewVector() ? '视线方块:' + pl.getBlockFromViewVector().type.slice(10) : ''}  ${pl.getEntityFromViewVector() ? '视线实体:' + pl.getEntityFromViewVector().type.slice(10) : ''}`;
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