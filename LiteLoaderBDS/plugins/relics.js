ll.registerPlugin("遗物", "记录玩家死亡前的物品栏", [0, 0, 1]);

const conf = new JsonConfigFile("./plugins/relics/config.json");
var bagList = conf.init("main", {});
conf.close();

function createEmptyStrings(arr) {
    let result = new Array(arr.length).fill('');
    return result;

}

/**
* 检查遗物背包列表
*/
function checkBag(name) {
    const conf = new JsonConfigFile("./plugins/relics/config.json");
    let obj = JSON.parse(conf.read());
    let bagList = obj["main"][name]
    const timeKeys = Object.keys(bagList);
    conf.close();
    return timeKeys;
}

//执行命令的表单回调
function cmdCallBack(pl, id) {
    if (id === 0) {
        let onlinePl = mc.getOnlinePlayers();
        let plNameList = [];
        for (let i = 0; i < onlinePl.length; i++) {
            plNameList.push(onlinePl[i].realName)
        }


        pl.sendSimpleForm("在线玩家", `共有${onlinePl.length}名玩家`, plNameList, createEmptyStrings(plNameList), (pl, id) => {
            pl.sendSimpleForm("死亡记录", plNameList[id], checkBag(plNameList[id]), createEmptyStrings(checkBag(plNameList[id])), (pl, id1) => {
                if (id1 != undefined) {
                    const conf = new JsonConfigFile("./plugins/relics/config.json");
                    let obj = JSON.parse(conf.read());
                    let bagObj = obj["main"][plNameList[id]][checkBag(plNameList[id])[id1]];//返回物品栏SNBTobj
                    conf.close();

                    let checkPl = mc.getPlayer(plNameList[id]);
                    if (checkPl == undefined) {
                        pl.tall("玩家不存在或已下线");
                    }
                    else {
                        //副手直接返回物品对象
                        checkPl.getOffHand().set(mc.newItem(NBT.parseSNBT(bagObj["OffHand"][0])));
                        //容器对象处理

                        for (let i = 0; i < pl.getArmor().getAllItems().length; i++) {
                            checkPl.getArmor().getAllItems()[i].set(mc.newItem(NBT.parseSNBT(bagObj["Armor"][i])));
                        }
                        for (let i = 0; i < pl.getInventory().getAllItems().length; i++) {
                            checkPl.getInventory().getAllItems()[i].set(mc.newItem(NBT.parseSNBT(bagObj["Inventory"][i])));
                        }
                        checkPl.refreshItems()
                    }
                }
            });
        });
    }
    if (id === 1) {
        pl.tell("未完善")
    }
}

mc.regPlayerCmd("relics", "查看玩家死亡前背包", (pl, _args) => {
    pl.sendSimpleForm("菜单", "查看玩家死亡前背包", ["查询在线玩家", "搜索玩家"], ["", ""], cmdCallBack);

}, 1);

//物品记录实现
mc.listen("onMobHurt", (mob, _s, damage, _c) => {
    if (mob.isPlayer()) {
        let pl = mob.toPlayer();
        if ((pl.health - damage) <= 0) {
            let OffHand = [];
            let Armor = [];
            let Inventory = [];
            let plName = pl.realName;

            OffHand.push(pl.getOffHand().getNbt().toSNBT());//副手直接返回物品对象

            for (let i = 0; i < pl.getArmor().getAllItems().length; i++) {
                Armor.push(pl.getArmor().getAllItems()[i].getNbt().toSNBT());
            }
            for (let i = 0; i < pl.getInventory().getAllItems().length; i++) {
                Inventory.push(pl.getInventory().getAllItems()[i].getNbt().toSNBT());
            }

            let bag = {
                OffHand: OffHand,
                Armor: Armor,
                Inventory: Inventory
            }

            const conf = new JsonConfigFile("./plugins/relics/config.json");
            var obj = JSON.parse(conf.read());
            if (obj["main"][plName] == undefined) {
                obj["main"][plName] = {};
                obj["main"][plName][system.getTimeStr()] = {};
            }
            if (Object.keys(obj["main"][plName]).length >= 10) {
                let oldObj = obj["main"][plName];
                // 将属性转换为数组
                const propsArray = Object.entries(oldObj);
                // 删除第一个属性
                propsArray.shift();
                // 重新构建对象
                const newObj = Object.fromEntries(propsArray);
                newObj[system.getTimeStr()] = bag;
                //合并
                obj["main"][plName] = newObj;
            }
            else {
                obj["main"][plName][system.getTimeStr()] = bag;
            }
            obj = JSON.stringify(obj);
            conf.write(obj);
            //obj["main"][plName] = {};
            // let detaObj = limitObjectLength(obj["main"][plName]);
            // detaObj[system.getTimeStr()] = bag;
            // //detaObj.addProperty(system.getTimeStr(), bag);
            // obj["main"][plName] = detaObj;
            // obj = JSON.stringify(detaObj);
            conf.close();
        }
    }
});