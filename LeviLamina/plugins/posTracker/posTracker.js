// 常量与全局变量
let taskId = null;
let playersUsageData = {};
let plPosData = {};
/*
示例数据
{
    "<playerXuid>": [
        "<victim1Xuid>",
        "<victim2Xuid>"
    ]
}
*/

// 命令注册
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("postrk", "玩家坐标跟踪", PermType.GameMasters);
    cmd.setEnum("TrackAction", ["track"]);
    cmd.setEnum("TrackAllAction", ["all"]);
    cmd.setEnum("GuiAction", ["gui"]);
    cmd.mandatory("action", ParamType.Enum, "TrackAction", 1);
    cmd.mandatory("victim", ParamType.Player);
    cmd.mandatory("action", ParamType.Enum, "TrackAllAction", 1);
    cmd.mandatory("action", ParamType.Enum, "GuiAction", 1);
    cmd.overload(["TrackAction", "victim"]);
    cmd.overload(["TrackAllAction"]);
    cmd.overload(["GuiAction"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        const pl = _ori.player;
        // pl.tell(`${Object.keys(res).join(", ")}`)
        // pl.tell(`${res.victim}`)
        if (res.action == "track") {
            const victims = res.victim;
            for (let i = 0; i < victims.length; i++) {
                const victim = victims[i];
                trackStart(pl, victim);
            }
        } else if (res.action == "all") {
            const onlinePlayers = mc.getOnlinePlayers();
            for (let i = 0; i < onlinePlayers.length; i++) {
                const victim = onlinePlayers[i];
                trackStart(pl, victim);
            }
        } else if (res.action == "gui") {
            showGui(pl);
        }
    });
    cmd.setup();
});

// mc.regPlayerCmd("postracker", "玩家坐标跟踪", (pl, args) => {
//     const xuid = pl.xuid;
//     if (args.length == 0) {
//         pl.tell("用法: §6/postracker <玩家名>§r");
//         return;
//     }
//     const victim = mc.getPlayer(args[0]);
//     if (victim == null) {
//         pl.tell("[§c▇§r] 玩家不存在");
//         return;
//     }
//     const victimXuid = victim.xuid;
//     const victimName = victim.realName;
//     if (playersUsageData[xuid] == null) {
//         playersUsageData[xuid] = [];
//     }
//     if (playersUsageData[xuid].includes(victimXuid)) {
//         playersUsageData[xuid].splice(playersUsageData[pl.xuid].indexOf(victimXuid), 1);
//         pl.tell("[§a▇§r] 已取消跟踪玩家 " + victimName);
//         if (playersUsageData[xuid].length == 0) {
//             delete playersUsageData[xuid];
//         }
//         return;
//     }
//     playersUsageData[xuid].push(victimXuid);
//     pl.tell("[§a▇§r] 已开始跟踪玩家 " + victimName);
//     if (taskId == null) {
//         taskId = setInterval(trackPlayerPos, 200);
//     }
// }, 1);

// 函数
function showGui(pl) {
    const gui = mc.newSimpleForm();
    gui.setTitle("玩家坐标跟踪");
    gui.setContent("请选择要跟踪的玩家");
    const onlinePlayers = mc.getOnlinePlayers();
    for (let i = 0; i < onlinePlayers.length; i++) {
        const victim = onlinePlayers[i];
        const color = playersUsageData[pl.xuid] != null && playersUsageData[pl.xuid].includes(victim.xuid) ? "§a" : "§7";
        gui.addButton(`§r[${color}▇§r] ${victim.realName}`);
    }
    gui.addButton("§0[ 反选 ]");
    pl.sendForm(gui, (pl, id) => {
        if (id != null) {
            if (id == onlinePlayers.length) {
                for (let i = 0; i < onlinePlayers.length; i++) {
                    const victim = onlinePlayers[i];
                    trackStart(pl, victim);
                }
                showGui(pl);
                return;
            }
            const victim = onlinePlayers[id];
            trackStart(pl, victim);
            showGui(pl);
        }
    });
}

function trackStart(pl, victim) {
    const xuid = pl.xuid;
    if (victim == null) {
        pl.tell("[§c▇§r] 玩家不存在");
        return;
    }
    const victimXuid = victim.xuid;
    const victimName = victim.realName;
    if (playersUsageData[xuid] == null) {
        playersUsageData[xuid] = [];
    }
    if (playersUsageData[xuid].includes(victimXuid)) {
        playersUsageData[xuid].splice(playersUsageData[pl.xuid].indexOf(victimXuid), 1);
        pl.tell("[§a▇§r] 已取消跟踪玩家 " + victimName);
        if (playersUsageData[xuid].length == 0) {
            delete playersUsageData[xuid];
        }
        return;
    }
    playersUsageData[xuid].push(victimXuid);
    pl.tell("[§a▇§r] 已开始跟踪玩家 " + victimName);
    if (taskId == null) {
        taskId = setInterval(trackPlayerPos, 200);
    }
}

function trackPlayerPos() {
    let text = "";
    if (Object.keys(playersUsageData).length == 0) {
        clearInterval(taskId);
        taskId = null;
        log("No player is tracked");
        return;
    }
    for (let xuid in playersUsageData) {
        const observer = mc.getPlayer(xuid);
        if (observer == null) {
            delete playersUsageData[xuid];
            continue;
        }
        let victims = playersUsageData[xuid];
        if (victims.length == 0) {
            delete playersUsageData[xuid];
            continue;
        }
        for (let i = 0; i < victims.length; i++) {
            const victimXuid = victims[i];
            const victim = mc.getPlayer(victimXuid);
            if (victim == null) {
                victims.splice(i, 1);
                log(i.toString() + " is deleted");
                if (victims.length == 0) {
                    delete playersUsageData[xuid];
                    break;
                }
                i--;
                continue;
            }
            const pos = victim.pos;
            const lastPos = plPosData[victimXuid];
            let color = [];
            if (lastPos != null) {
                color[0] = getColor(pos.x, lastPos[0]);
                color[1] = getColor(pos.y, lastPos[1]);
                color[2] = getColor(pos.z, lastPos[2]);
            } else {
                color = ["", "", ""];
            }
            text += `(${color[0]}${pos.x.toFixed(0)}§7, §r${color[1]}${pos.y.toFixed(0)}§7, §r${color[2]}${pos.z.toFixed(0)}§r) §7${pos.dimid} 丨 §o${victim.realName}§r`;
            plPosData[victimXuid] = [pos.x, pos.y, pos.z];
            if (i != victims.length - 1) text += "\n";
        }
        observer.setTitle(text, 4);
        text = "";
    }
}

function getColor(a, b) {
    if (a == b) return "";
    if (a < b) return "§c";
    return "§a";
}