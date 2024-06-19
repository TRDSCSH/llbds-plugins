// LiteLoader-AIDS automatic generated
/// <reference path="d:\/dts/helperlib/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "SafePlayerBag",
    /* introduction */ "玩家安全背包",
    /* version */[2, 0, 5],
    /* otherInformation */ {
        '创意者': 'PHEyeji',
        '重构者': '子沐呀'
    }
);

/** 玩家存储数据目录 */
const DataDir = `./plugins/SafePlayerBag/PlayerData/{0}.snbt`;

/** 配置文件 */
const CONFIG = new JsonConfigFile(`./plugins/SafePlayerBag/config.json`,JSON.stringify({
    'version':[2,0,5],// 配置文件版本(勿动)
    'time':1,// 数据保存循环间隔时间
}));

/**
 * 比较版本号
 * @param {Number[]} a 版本号1
 * @param {Number[]} b 版本号2
 * @returns {1|0|-1} 结果
 */
function compareVersions(a, b) {  
    for (let i = 0; i < Math.max(a.length, b.length); i++) {  
        const numA = i < a.length ? a[i] : 0;  
        const numB = i < b.length ? b[i] : 0;  
  
        if (numA > numB) {  
            return 1; // A更大
        } else if (numA < numB) {  
            return -1; // B更大
        }  
    }  
  
    return 0; // 它们是相等的
}

/**
 * 转换数据,将旧数据转换成新数据
 */
function DataConvert_2_0_0() {
    // 以下为2,0,0版本
    if (File.exists(`./plugins/PHEyeji/SafePlayerBag`)) {
        colorLog('blue', `检测到旧数据库,即将开始转换!`);
        let OldData;
        try {
            OldData = new KVDatabase(`./plugins/PHEyeji/SafePlayerBag`);
            colorLog('blue', `共有 ${OldData.listKey().length} 条玩家数据!`);
        } catch {
            logger.warn(`旧数据库损坏!停止转换!`);
            return;
        }
        OldData.listKey().forEach(PlayerName => {
            try {
                File.writeTo(DataDir.replace(/\{0\}/g, data.name2uuid(PlayerName)), NBT.parseBinaryNBT(data.fromBase64(OldData.get(PlayerName), true)).toSNBT(4));
            } catch {
                logger.warn(`转换玩家 ${PlayerName} 数据失败!`);
            }
        });
        OldData.close();
        colorLog('blue', `数据转换结束!`);
        File.rename(`./plugins/PHEyeji/SafePlayerBag`, `./plugins/PHEyeji/SafePlayerBag_Bak`);
    }
}
function DataConvert() {
    // 以下是2,0,5版本
    if(compareVersions([2,0,5],CONFIG.get('version'))==1){
        colorLog('blue', `开始转换xuid为uuid！`);
        let i = 0;
        File.getFilesList(DataDir.replace(/\{0\}.snbt/g,'')).forEach(xuid_name => {
            if(!/^[0-9]+.snbt$/.test(xuid_name))return;
            let uuid_name = data.xuid2uuid(xuid_name.slice(0,-5));
            if(!uuid_name)return logger.error(`未搜索到xuid为 ${xuid_name.slice(0,-5)} 的uuid，无法迁移！`);
            File.rename(DataDir.replace(/\{0\}/g,xuid_name.slice(0,-5)),DataDir.replace(/\{0\}/g,uuid_name));
            i++;
        });
        colorLog('blue', `转换结束!共成功转换${i}条数据!`);
        CONFIG.set('version',[2,0,5]);
    }
}

/**
 * 玩家数据库操作类
 */
const DataUni = new class {
    /**
     * 修改玩家NBT
     * @param {String} Uuid 玩家Uuid
     * @param {NbtCompound} Nbt NBT
     * @returns {Boolean} 是否设置成功
     */
    set(Uuid, Nbt) {
        try {
            File.writeTo(DataDir.replace(/\{0\}/g, Uuid), Nbt.toSNBT(4));
            return true;
        } catch { return false }
    }
    /**
     * 读取玩家NBT
     * @param {String} Uuid 玩家Uuid
     * @returns {NbtCompound?} 玩家的NBT
     */
    get(Uuid) {
        try {
            return NBT.parseSNBT(File.readFrom(DataDir.replace(/\{0\}/g, Uuid)) ?? (() => { throw new Error() })());
        } catch { }
    }
    /**
     * 判断是否存在玩家数据
     * @param {String} Uuid 玩家Uuid
     * @returns {Boolean} 是否存在
     */
    exists(Uuid) {
        try {
            if (File.exists(DataDir.replace(/\{0\}/g, Uuid)) && NBT.parseSNBT(File.readFrom(DataDir.replace(/\{0\}/g, Uuid)) ?? '') != null) return true;
        } catch { return false }// 如果损坏也返回false
    }
    /**
     * 删除玩家NBT
     * @param {String} Uuid 玩家Uuid
     * @param {Boolean} Options 是否连同存档NBT一并删除
     */
    delete(Uuid, Options = false) {
        if (Options) {
            try { mc.getPlayer(data.getAllPlayerInfo().find(obj => obj.uuid == Uuid).xuid).kick(`§c您的玩家数据已被彻底删除!`) } catch { }// 先踢出去再删
            setTimeout(() => {
                mc.deletePlayerNbt(Uuid);
                File.delete(DataDir.replace(/\{0\}/g, Uuid));
            }, 1000);
        }
        File.delete(DataDir.replace(/\{0\}/g, Uuid));
    }
}
mc.listen('onServerStarted', ()=>{
    DataConvert_2_0_0();
    DataConvert()
});
mc.listen('onJoin', (Player) => {// 进服
    if (Player.isSimulatedPlayer()) return;
    if (DataUni.exists(Player.uuid)) {
        let DataNbt = DataUni.get(Player.uuid);
        if (!DataNbt) return;// 没数据,返回
        // 为啥这么写？不想影响其他nbt
        let PlayerNbt = Player.getNbt();
        ['Attributes', 'Armor', 'EnderChestInventory', 'Inventory', 'Mainhand', 'Offhand', 'PlayerUIItems'].forEach(NbtName => {
            PlayerNbt.setTag(NbtName, DataNbt.getTag(NbtName));
        });
        Player.setNbt(PlayerNbt);
        setTimeout(() => Player.refreshItems(), 500);
    }
});
mc.listen('onLeft', (Player) => DataUni.set(Player.uuid, Player.getNbt()));
setInterval(() => mc.getOnlinePlayers().forEach(Player => {
    if (Player.isLoading == null || Player.isSimulatedPlayer()) return;
    DataUni.set(Player.uuid, Player.getNbt())
}), CONFIG.get('time')*1000);// 定时保存
ll.exports(DataUni.delete, 'SafePlayerBag', 'DataUni.delete');
ll.exports(DataUni.exists, 'SafePlayerBag', 'DataUni.exists');
ll.exports(DataUni.get, 'SafePlayerBag', 'DataUni.get');
ll.exports(DataUni.set, 'SafePlayerBag', 'DataUni.set');