let timeout = 0;
let savedEntities = [];
let savedEntitiesSnbt = [];

mc.listen("onServerStarted", () => {
    let cmd = mc.newCommand("getenbt", "获取实体的nbt");
    cmd.setEnum("timeoutAction", ["timeout"]);
    cmd.setEnum("entityTypeAction", ["type"]);
    cmd.setEnum("numberAction", ["num"]);
    cmd.setEnum("getallAction", ["listall"]);
    cmd.mandatory("action", ParamType.Enum, "timeoutAction", 1);
    cmd.mandatory("action", ParamType.Enum, "entityTypeAction", 1);
    cmd.mandatory("action", ParamType.Enum, "numberAction", 1);
    cmd.mandatory("action", ParamType.Enum, "getallAction", 1);
    cmd.optional("type", ParamType.String);
    cmd.optional("num", ParamType.Int);
    cmd.optional("time", ParamType.Int);
    cmd.overload(["entityTypeAction", "type"]);
    cmd.overload(["numberAction", "num"]);
    cmd.overload(["timeoutAction", "time"]);
    cmd.overload(["getallAction"]);
    cmd.setCallback((cmd, origin, output, results) => {
        if (origin.type != 0) return;
        const pl = origin.player;
        const action = results.action;
        // log(action)
        if (action == "listall") {
            pl.tell(`正在获取实体, 请等待 §6${timeout}§r 秒`);
            setTimeout(() => {
                let entitiesNames = [];
                let entities = mc.getAllEntities();
                for (let i = 0; i < entities.length; i++) {
                    let entity = entities[i];
                    let name = entity.type;
                    if (entitiesNames.indexOf(name) == -1) {
                        entitiesNames.push(name);
                    }
                }
                pl.tell("§a可用的实体类型:");
                for (let i = 0; i < entitiesNames.length; i++) {
                    pl.tell(` §7-§r [§e${i}§r] §a${entitiesNames[i]}`);
                }
            }, timeout * 1000);
        } else if (action == "timeout") {
            const time = results.time;
            timeout = time;
            pl.tell(`已设置超时时间为 §6${time}§r 秒`);
        } else if (action == "type") {
            pl.tell(`正在保存实体, 请等待 §6${timeout}§r 秒`);
            setTimeout(() => {
                const type = "minecraft:" + results.type;
                // pl.tell(`正在获取实体类型为 §6${type}§r 的实体`)
                let entities = mc.getAllEntities();
                let entity;
                savedEntities = [];
                for (let i = 0; i < entities.length; i++) {
                    entity = entities[i];
                    // pl.tell(`${entity.type} ${entity.type != type}`);
                    if (entity.type == type) {
                        savedEntities.push(entity);
                        savedEntitiesSnbt.push(entity.getNbt().toSNBT(2));
                    }
                }
                if (savedEntities.length == 0) {
                    pl.tell(`§c没有找到类型为 §6${type}§r 的实体`);
                } else if (savedEntities.length == 1) {
                    log(`Snbt:\n${savedEntitiesSnbt[0]}`);
                    pl.tell(`已保存并输出 1 个实体的 Snbt`);
                } else {
                    pl.tell(`已保存 ${savedEntities.length} 个实体, \n输入 §6/getenbt num <num>§r 获取实体 snbt`);
                    for (let i = 0; i < savedEntities.length; i++) {
                        pl.tell(` §7-§r [§e${i}§r] §a${savedEntities[i].pos}`);
                    }
                }
            }, timeout * 1000);
        } else if (action == "num") {
            const num = results.num;
            if (savedEntities.length == 0) {
                pl.tell("请先输入 §6/getenbt type <type>§r 保存实体");
                return;
            }
            if (num >= savedEntities.length) {
                pl.tell("§c没有保存这么多实体");
                return;
            }
            const entitySnbt = savedEntitiesSnbt[num];
            log(`Snbt:\n${entitySnbt}`);
            pl.tell(`已在控制台输出实体 §6${num}§r 的 snbt`);
        }
    });
    cmd.setup();
});