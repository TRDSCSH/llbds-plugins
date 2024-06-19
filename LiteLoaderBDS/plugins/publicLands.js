// 插件注册
ll.registerPlugin("publicLands", "公共领地", [1, 0, 0, Version.Dev]);

// 导入功能
let PosGetLand = lxl.import('ILAPI_PosGetLand'); // 通过坐标查询领地 param: ( Vec4: {x, y, z, dimid}, noAccessCache: bool ) return: landId - string
let GetName = lxl.import('ILAPI_GetName'); // 获取领地昵称 param: ( landId: 领地ID ) return: string
let GetOwner = lxl.import('ILAPI_GetOwner');
let CreateLand = lxl.import('ILAPI_CreateLand');
let DeleteLand = lxl.import('ILAPI_DeleteLand');
let GetPlayerLands = lxl.import('ILAPI_GetPlayerLands');
let IsLandOperator = lxl.import('ILAPI_IsLandOperator');
let UpdatePermission = lxl.import('ILAPI_UpdatePermission'); // 更新领地权限
let UpdateSetting = lxl.import('ILAPI_UpdateSetting');
let SetOwner = lxl.import('ILAPI_SetOwner');
let GetRange = lxl.import('ILAPI_GetRange');
let AddTrust = lxl.import('ILAPI_AddTrust');

// 常量与全局变量
const configFilePath = 'plugins/publicLands/config.json';
const config = new JsonConfigFile(configFilePath, '{ "op": [] }');
const maxParticleCount = 1000;
const pageMaxCount = 20;
const titleInterval = 1000;
const defaultParticle = 'minecraft:villager_happy';
const publicLandsOwnerName = 'PUBLIC';
const publicLandsOwnerXuid = 'public';
if (IsLandOperator(publicLandsOwnerXuid) == false) { /* 如果公共领地的操作员不存在, 则创建 */
    mc.runcmdEx('iland op ' + publicLandsOwnerName);
}
let playersCreatingLand = {}; // 正在创建领地的玩家 ex: { xuid: { startPos: [x, y, z], endPos: [x, y, z], dimid: 0/1/2 } } 注意: dimid 的一致性

// 命令注册
/* 
    终端命令（7）
    + plands op <PlayerName> - 设置玩家为公共领地操作员
    + plands deop <PlayerName> - 取消玩家的公共领地操作员权限
    + plands listop - 列出所有公共领地操作员

    玩家命令（0）
    + plands add <StartPos>(<x> <y> <z>) <EndPos>(<x> <y> <z>) [LandName]- 创建公共领地
    + plands del <LandId> - 删除公共领地
    + plands delcurrent - 删除当前所在的公共领地
    + plands list [page] - 列出所有公共领地(序号/ID/坐标/名称)

    + plands new - 创建公共领地(交互式)
    + plands set - 设置公共领地起始点或结束点 - 当玩家正在创建公共领地时使用
    + plands adjust - 调整公共领地起始点或结束点(GUI) - 当玩家正在创建公共领地时并且起始点或结束点已被设置时使用
    + plands ok - 确认创建公共领地 - 当玩家正在创建公共领地时并且起始点和结束点已被设置时使用
*/
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("plands", "设置公共领地");
    cmd.setEnum("op", ["op"]);
    cmd.setEnum("deop", ["deop"]);
    cmd.setEnum("listop", ["listop"]);
    cmd.setEnum("add", ["add"]);
    cmd.setEnum("del", ["del"]);
    cmd.setEnum("list", ["list"]);
    cmd.setEnum("new", ["new"]);
    cmd.setEnum("set", ["set"]);
    cmd.setEnum("adjust", ["adjust"]);
    cmd.setEnum("ok", ["ok"]);
    cmd.mandatory("terminalAction", ParamType.Enum, "op", 1);
    cmd.mandatory("terminalAction", ParamType.Enum, "deop", 1);
    cmd.mandatory("playerName", ParamType.String);
    cmd.mandatory("terminalAction", ParamType.Enum, "listop", 1);
    cmd.mandatory("action", ParamType.Enum, "add", 1);
    cmd.mandatory("StartPos", ParamType.BlockPos);
    cmd.mandatory("EndPos", ParamType.BlockPos);
    cmd.optional("landName", ParamType.String);
    cmd.mandatory("action", ParamType.Enum, "del", 1);
    cmd.mandatory("LandId", ParamType.String);
    cmd.mandatory("action", ParamType.Enum, "list", 1);
    cmd.optional("page", ParamType.Int);
    cmd.mandatory("action", ParamType.Enum, "new", 1);
    cmd.mandatory("action", ParamType.Enum, "set", 1);
    cmd.mandatory("action", ParamType.Enum, "adjust", 1);
    cmd.mandatory("action", ParamType.Enum, "ok", 1);
    cmd.overload(["op", "playerName"]);
    cmd.overload(["deop", "playerName"]);
    cmd.overload(["listop"]);
    cmd.overload(["add", "StartPos", "EndPos", "landName"]);
    cmd.overload(["del", "LandId"]);
    cmd.overload(["list", "page"]);
    cmd.overload(["new"]);
    cmd.overload(["set"]);
    cmd.overload(["adjust"]);
    cmd.overload(["ok"]);
    cmd.setCallback((cmd, origin, output, results) => {
        const terminalAction = results.terminalAction;  // 终端命令部分
        if (origin.type == 7) { 
            if (terminalAction) {
                const playerName = results.playerName;
                const configData = new JsonConfigFile(configFilePath);
                const opList = configData.get('op');
                if (terminalAction == 'op') {
                    if (isLandOperator(playerName)) {
                        log('玩家 ' + playerName + ' 已经是公共领地管理员了');
                    } else {
                        opList.push(playerName);
                        configData.set('op', opList);
                        log('已将玩家 ' + playerName + ' 设置为领地管理员');
                    }
                } else if (terminalAction == 'deop') {
                    if (isLandOperator(playerName)) {
                        const index = opList.indexOf(playerName);
                        opList.splice(index, 1);
                        configData.set('op', opList);
                        log('已将玩家 ' + playerName + ' 从公共领地管理员列表中移除');
                    } else {
                        log('玩家 ' + playerName + ' 不是公共领地管理员');
                    }
                } else if (terminalAction == 'listop') {
                    if (opList.length == 0) {
                        log('公共领地管理员列表为空');
                    } else {
                        log('公共领地管理员列表:');
                        for (let i = 0; i < opList.length; i++) {
                            log(' - ' + opList[i]);
                        }
                    }
                } else {
                    log("未知终端命令");
                }
            } else {
                log("这不是终端命令");
            }
            return;
        }

        const action = results.action; // 玩家命令部分
        const pl = origin.player;
        const plName = pl.realName;
        const plXuid = pl.xuid;
        if (!isLandOperator(plName)) {
            pl.tell('§7[§c■§7]§r 你不在公共领地管理员列表，没有权限使用这个命令');
            return;
        }
        if (action == "add") {
            const startPos = results.StartPos;
            const endPos = results.EndPos;
            const landName = results.landName ? results.landName : '公共领地#' + GetPlayerLands(publicLandsOwnerXuid).length;
            const landId = CreateLand(publicLandsOwnerXuid, posToVec3(startPos), posToVec3(endPos), pl.pos.dimid, landName);
            if (landId == -1) {
                pl.tell('§7[§c■§7]§r 创建公共领地失败');
            } else {
                pl.tell('§7[§a■§7]§r 成功创建公共领地 ' + landId);
                AddTrust(landId, plXuid);
            }
        } else if (action == 'del') {
            const landId = results.LandId;
            const result = DeleteLand(landId);
            if (result == -1) {
                pl.tell('§7[§c■§7]§r 删除公共领地失败');
            } else {
                pl.tell('§7[§a■§7]§r 成功删除公共领地 ' + landId);
            }
        } else if (action == 'list') {
            let page = results.page ? results.page : 1;
            let text = '';
            const lands = GetPlayerLands(publicLandsOwnerXuid);
            const maxPage = Math.ceil(lands.length / pageMaxCount);
            if (maxPage == 0) {
                pl.tell('§7[§6■§7]§r 没有公共领地');
                return;
            }
            if (page > maxPage) {
                page = maxPage;
            } else if (page < 1) {
                page = 1;
            }
            pl.tell('§7[§a■§7]§r 公共领地列表 §7( 第 ' + page + ' 页, 共 ' + maxPage + ' 页 )');
            for (let i = (page - 1) * pageMaxCount; i < page * pageMaxCount && i < lands.length; i++) {
                const landId = lands[i];
                const landName = GetName(landId);
                const AABB = GetRange(landId);
                const startPos = AABB.posA;
                const endPos = AABB.posB;
                const dimid = AABB.dimid;
                const dim = dimid == 0 ? '主世界' : dimid == 1 ? '§4下界§r' : dimid == 2 ? '§5末地§r' : '§7未知§r';
                text += `§7[#${i + 1}]§r ${landId} ${landName} (§c${startPos.x}§r, §2${startPos.y}§r, §3${startPos.z}§r) -> (§c${endPos.x}§r, §2${endPos.y}§r, §3${endPos.z}§r) ${dim}\n`;
            }
            pl.tell(text);
        } else {
            pl.tell('§7[§6■§7]§r 功能未完成');
        }
    });
    cmd.setup();
});

// log(CreateLand("public", buildRawPosVec3(-250, 60, -250), buildRawPosVec3(-240, 120, -240), 0));
// log(GetPlayerLands("public"));
// log(PosGetLand(buildRawPosVec4(-19, 65, -19, 0)));

// 函数
function isCreatingLand(xuid) {
    return playersCreatingLand[xuid] != undefined;
}

function posIsSeted(xuid) {
    if (!isCreatingLand(xuid)) return false;
    if (playersCreatingLand[xuid].dimid == null) return false;
    return playersCreatingLand[xuid].startPos != undefined && playersCreatingLand[xuid].endPos != undefined;
}

function isLandOperator(playerName) {
    const configData = new JsonConfigFile(configFilePath);
    const opList = configData.get('op');
    return opList.indexOf(playerName) != -1;
}

function posToVec3(pos) {
    return {
        x: pos.x,
        y: pos.y,
        z: pos.z
    };
}

function buildRawPosVec3(x, y, z) {
    return {
        x: x,
        y: y,
        z: z
    };
}

function buildRawPosVec4(x, y, z, dimid) {
    return {
        x: x,
        y: y,
        z: z,
        dimid: dimid
    };
}

function toRawPos(pos) {
    return {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        dimid: pos.dimid
    };
}

function GetLand(pos) {
    return PosGetLand(toRawPos(pos));
}

function title(pl, title, subtitle) {
    pl.setTitle(title, 2, 0, 20, 0);
    pl.setTitle(subtitle, 3, 0, 20, 0);
}

function titleActionBar(pl, text) {
    pl.setTitle(text, 4, 0, 20, 0);
}

// mc.listen('onDestroyBlock', function (player, block) {
//     let land = GetLand(player.blockPos);
//     if (land != -1) {
//         let owner = data.xuid2name(GetOwner(land));
//         player.sendText('你在 ' + owner + ' 的领地里破坏了方块！');
//     }
// });