//LiteXLoader Dev Helper
/// <reference path="c:\Users\Yoyo\.vscode\extensions\moxicat.lxldevhelper-0.1.4/Library/JS/Api.js" /> 

/* 
插件名:多背包(packsack)
作者:Yoyo
版本: v0.0.9
*/

const CONFIG = new JsonConfigFile(".\\plugins\\Yoyo\\packsack\\config.json", JSON.stringify({
    price: 1000,
    currencyName: "金币",
    knapsackMax: 5,
    currency: {
        LLmoney: true,
        ScoringTtem: "记分项"
    },
    packsackBtnStr: [
        "返回",
        "切换",
        "删除"
    ]
}));

const DB = new KVDatabase(".\\plugins\\Yoyo\\packsack\\database");
var error;

[
    ["onJoin", onJoin],
    ["onServerStarted", onServerStarted],
    ["onLeft", onLeft],
    ["onInventoryChange", onInventoryChange]
].forEach(a => mc.listen(a[0], a[1]));

mc.regPlayerCmd("pack", "打开多背包", packsackGui);
mc.regPlayerCmd("packreload", "重载多背包配置文件", (player) => {
    CONFIG.reload();
    player.tell("§l§e[多背包] §7配置文件已重载!");
}, 1);
mc.regPlayerCmd("packcheck", "检查指定玩家背包", packcheck, 1);

function packsackGui(player) {
    let utw = mc.newSimpleForm();
    utw.setTitle("多背包");
    utw.addButton("切换背包");
    utw.addButton("新建背包");
    player.sendForm(utw, (player, id) => {
        if (id == null && id != 0) return;
        if (id == 0) {
            packsackSwitchover(player);
        } else {
            newPacksack(player);
        }
    });
}


function packsackSwitchover(player) {
    let PackSack = DB.get(player.xuid);
    let selectedPackSack = PackSack.index;
    let utw = mc.newCustomForm();
    utw.setTitle("§l§e我的背包");
    utw.addLabel(`当前选择: §5[§l§g${PackSack.pack[PackSack.index].name}§5]\n§r背包总数量:§5[ §l§g${PackSack.pack.length}/${CONFIG.get("knapsackMax")}§5 ]`);
    utw.addDropdown("select:", PackSack.pack.map(a => a.name), selectedPackSack);
    utw.addStepSlider("select", CONFIG.get("packsackBtnStr"), 1);
    player.sendForm(utw, (player, datas) => {
        if (datas == null) return;
        if (datas[2] == 0) {
            //返回
            packsackGui(player);
        } else if (datas[2] == 1) {
            //切换
            if (datas[1] == selectedPackSack) {
                player.tell("§l§e[多背包] §7你已经是当前背包,无法切换!");
                return;
            }
            switchTheBackpack(player, datas[1]);
        } else if (datas[2] == 2) {
            //删除
            player.sendModalForm("删除", "你确定要删除这个背包,它将无法恢复,包括它里面的物品!", "永久再见", "返回", (player, result) => {
                if (result == null) return;
                if (result == 1) {
                    if (PackSack.pack.length <= 1) {
                        utwMsg(player, `最后一个背包是不能删除的哦!`, packsackSwitchover);
                        return;
                    }

                    if (selectedPackSack == datas[1]) {
                        utwMsg(player, `你正在使用它!你无法删除它!`, packsackSwitchover);
                        return;
                    }
                    //switchTheBackpack(player,PackSack.index);//切换背包(没必要)
                    let PackSackItem = PackSack.pack[datas[1]].itemSnbt;
                    PackSack.pack.splice(datas[1], 1);
                    if (datas[1] < selectedPackSack) {
                        PackSack.index = selectedPackSack - 1;
                    }
                    DB.set(player.xuid, PackSack);
                    utwMsg(player, `删除成功,它永久消失了,Yoyo为你痛哭!`, packsackSwitchover);
                } else {
                    packsackSwitchover(player);
                }
            });
        }
    });
}

function newPacksack(player) {
    let PackSack = DB.get(player.xuid);
    let selectedPackSack = PackSack.index;
    let utw = mc.newCustomForm();
    utw.setTitle("§l§2新建背包");
    utw.addLabel(`§l§g背包总数: [§5${PackSack.pack.length}/${CONFIG.get("knapsackMax")}§g]\n新建价格: §2${CONFIG.get("price")} §g${CONFIG.get("currencyName")}`);
    utw.addInput("名称:[汉字,数字,字母组合1-10个]", "汉字,数字和字母哦[1-10]", `背包${PackSack.pack.length + 1}`);
    utw.addSwitch("返回 <==> 新建", true);
    player.sendForm(utw, (player, datas) => {
        if (datas == null) return;
        if (datas[2] == 0) {
            //返回
            packsackGui(player);
        } else {
            if (PackSack.pack.length >= CONFIG.get("knapsackMax")) {
                utwMsg(player, `当前最大支持拥有:${CONFIG.get("knapsackMax")}个背包!`, newPacksack);
                return;
            }
            if (/^[\u4e00-\u9fa5\w]{1,10}$/.test(datas[1])) {
                if (!ScoreOperation(player, CONFIG.get("price"), "subtract")) {
                    utwMsg(player, error, newPacksack);
                    return;
                }
                PackSack.pack.push({ name: datas[1], itemSnbt: '' });
                DB.set(player.xuid, PackSack);
                utwMsg(player, "创建新的背包成功", newPacksack);
            } else {
                utwMsg(player, "只能是汉字,英文字母,数字1-10个的组合", newPacksack);
            }
        }
    });
}

function utwMsg(player, txt, back) {
    player.sendModalForm("提示", txt, "返回", "退出", (player, result) => {
        if (result == null) return;
        if (result == 1) {
            back(player);
        } else {

        }
    });
}

function onJoin(player) {
    let PackSack = DB.get(player.xuid);
    if (typeof PackSack == "undefined" || PackSack == '') {
        let pNbt = player.getNbt();
        let Inventory = pNbt.getTag("Inventory");
        let newInventoryNbt = new NbtCompound({
            "Inventory": Inventory
        });
        let InventorySNBT = newInventoryNbt.toSNBT();
        PackSack = {
            index: 0,
            pack: [{ name: "主背包", itemSnbt: data.toBase64(InventorySNBT) }]
        };
        DB.set(player.xuid, PackSack);
    }
    updatepack(player, PackSack.pack[PackSack.index].itemSnbt);//同步背包
    //玩家列表记录
    let plList = DB.get("plList");

    if (typeof plList == "undefined") {
        plList = [];
    }
    if (!plList.includes(player.xuid)) {
        plList.push(player.xuid);
        DB.set("plList", plList);
    }
}



function switchTheBackpack(player, page) {
    let PackSack = DB.get(player.xuid);
    //保存当前背包
    let pNbt = player.getNbt();
    let Inventory = pNbt.getTag("Inventory");
    let newInventoryNbt = new NbtCompound({
        "Inventory": Inventory
    });
    let InventorySNBT = newInventoryNbt.toSNBT();
    PackSack.pack[PackSack.index].itemSnbt = data.toBase64(InventorySNBT);
    PackSack.index = page;
    let newpack = PackSack.pack[page].itemSnbt;
    if (newpack == '' || typeof newpack == "undefined") {
        newpack = 'eyJJbnZlbnRvcnkiOlt7IkNvdW50IjowYiwiRGFtYWdlIjowcywiTmFtZSI6IiIsIlNsb3QiOjBiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MWIsIldhc1BpY2tlZFVwIjowYn0seyJDb3VudCI6MGIsIkRhbWFnZSI6MHMsIk5hbWUiOiIiLCJTbG90IjoyYiwiV2FzUGlja2VkVXAiOjBifSx7IkNvdW50IjowYiwiRGFtYWdlIjowcywiTmFtZSI6IiIsIlNsb3QiOjNiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6NGIsIldhc1BpY2tlZFVwIjowYn0seyJDb3VudCI6MGIsIkRhbWFnZSI6MHMsIk5hbWUiOiIiLCJTbG90Ijo1YiwiV2FzUGlja2VkVXAiOjBifSx7IkNvdW50IjowYiwiRGFtYWdlIjowcywiTmFtZSI6IiIsIlNsb3QiOjZiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6N2IsIldhc1BpY2tlZFVwIjowYn0seyJDb3VudCI6MGIsIkRhbWFnZSI6MHMsIk5hbWUiOiIiLCJTbG90Ijo4YiwiV2FzUGlja2VkVXAiOjBifSx7IkNvdW50IjowYiwiRGFtYWdlIjowcywiTmFtZSI6IiIsIlNsb3QiOjliLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTBiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTFiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTJiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTNiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTRiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTViLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTZiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTdiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MThiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MTliLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjBiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjFiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjJiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjNiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjRiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjViLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjZiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjdiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjhiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MjliLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MzBiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MzFiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MzJiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MzNiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MzRiLCJXYXNQaWNrZWRVcCI6MGJ9LHsiQ291bnQiOjBiLCJEYW1hZ2UiOjBzLCJOYW1lIjoiIiwiU2xvdCI6MzViLCJXYXNQaWNrZWRVcCI6MGJ9XX0=';
        let NewSnbt = data.fromBase64(newpack);
        let NewNbt = NBT.parseSNBT(NewSnbt);
        let NewInventory = NewNbt.getTag("Inventory");
        pNbt.setTag("Inventory", NewInventory);
        player.setNbt(pNbt);
        player.refreshItems();
    } else {
        let NewSnbt = data.fromBase64(newpack);
        let NewNbt = NBT.parseSNBT(NewSnbt);
        let NewInventory = NewNbt.getTag("Inventory");
        pNbt.setTag("Inventory", NewInventory);
        player.setNbt(pNbt);
        player.refreshItems();
    }
    DB.set(player.xuid, PackSack);
    player.tell(`§l§e[多背包] §7已切换[§5${PackSack.pack[page].name}§7]背包!`);
}

function ScoreOperation(pl, sum, type = "add") {
    error = '';
    let scoreType = CONFIG.get("currency");

    if (scoreType.LLmoney) {
        if (type != "add" && money.get(pl.xuid) < sum) {
            error = `${CONFIG.get("currencyName")} 不够哦!`;
            return false;
        }
        error = `${CONFIG.get("currencyName")} 扣除失败!`;
        if (type == "add") {
            return money.add(pl.xuid, Math.abs(sum));
        } else {
            return money.reduce(pl.xuid, Math.abs(sum));
        }

    } else {
        if (!mc.getScoreObjective(scoreType.ScoringTtem)) {
            colorLog("red", "[packsack] 多背包的记分板不存在,请先创建它!")
            error = `记分板不存在,请先创建它!`;
            return false;
        }
        if (type != "add" && pl.getScore(scoreType.ScoringTtem) < sum) {
            error = `${CONFIG.get("currencyName")} 不够哦!`;
            return false;
        }
        error = `${CONFIG.get("currencyName")} 扣除失败!`;
        if (type == "add") {
            return pl.addScore(scoreType.ScoringTtem, Math.abs(sum));
        } else {
            return pl.reduceScore(scoreType.ScoringTtem, Math.abs(sum));
        }

    }
}

function packcheck(player) {
    let MypackcheckStatus = DB.get("packcheck_" + player.xuid);
    if (!MypackcheckStatus) {
        packCheckList(player);
    } else {
        closeCheck(player);
    }

}

function closeCheck(player) {
    let utw = mc.newSimpleForm();
    utw.setTitle("§5选择菜单");
    utw.addButton("§2结束查包!恢复自己背包");
    utw.addButton("§3当前的多背包§2=>§5被查的多背包");
    utw.addButton("§3当前的多背包§4<=§5被查的多背包");
    player.sendForm(utw, (player, id) => {
        if (id == null && id != 0) return;
        if (id == 0) {
            let Investigation = DB.get("backups_" + player.xuid);
            DB.set(player.xuid, Investigation);
            updatepack(player, Investigation.pack[Investigation.index].itemSnbt);//同步背包
            DB.set("packcheck_" + player.xuid, false);//更新查包中
            player.tell("§l§e[多背包] §2已还原背包!");
        } else if (id == 1) {
            savepack(player);//先保存自己的
            let bpl = DB.get("packcheck_pl_" + player.xuid);//获取被当前op查的玩家
            let ppll = mc.getPlayer(bpl);//看玩家在线不
            let Investigation = DB.get(player.xuid);
            DB.set(bpl, Investigation);//修改指定玩家背包
            if (ppll) {
                ppll.tell("§l§e[多背包] §2你的背包,被管理员更新了!");
                updatepack(ppll, Investigation.pack[Investigation.index].itemSnbt);//同步背包
            }
            player.tell("§l§e[多背包] §2已更新指定玩家背包!");
        } else if (id == 2) {
            let bpl = DB.get("packcheck_pl_" + player.xuid);//获取被当前op查的玩家
            let ppll = mc.getPlayer(bpl);
            if (ppll) {
                savepack(ppll);//在线就保存
            }
            let Investigation = DB.get(bpl);
            DB.set(player.xuid, Investigation);
            updatepack(player, Investigation.pack[Investigation.index].itemSnbt);//同步背包
            player.tell("§l§e[多背包] §7已同步对方背包!");
        }
    });
}

function packCheckList(player) {
    let plList = DB.get("plList");
    let utw = mc.newSimpleForm();
    utw.setTitle("选择需要查询的玩家");
    plList.forEach(v => utw.addButton(data.xuid2name(v)?data.xuid2name(v):"玩家未进服务器(这是以前老数据)"));
    player.sendForm(utw, (player, id) => {
        if (id == null && id != 0) return;
        //备份自己的
        let PackSack = DB.get(player.xuid);
        //保存当前背包
        let pNbt = player.getNbt();
        let Inventory = pNbt.getTag("Inventory");
        let newInventoryNbt = new NbtCompound({
            "Inventory": Inventory
        });
        let InventorySNBT = newInventoryNbt.toSNBT();
        PackSack.pack[PackSack.index].itemSnbt = data.toBase64(InventorySNBT);
        DB.set(player.xuid, PackSack);
        //开始备份
        DB.set("backups_" + player.xuid, PackSack);
        //同步另一个玩家
        // 先把对面背包保存
        let ppll = mc.getPlayer(plList[id]);
        if (ppll) {
            savepack(ppll);//在线就保存
        }
        let Investigation = DB.get(plList[id]);
        DB.set(player.xuid, Investigation);
        updatepack(player, Investigation.pack[Investigation.index].itemSnbt);//同步背包
        DB.set("packcheck_" + player.xuid, true);//更新查包中
        DB.set("packcheck_pl_" + player.xuid, plList[id]);//更新被当前op查的玩家
        player.tell("§l§e[多背包] §7已开始查包!请正常打开多背包!");
    });
}

function onLeft(player) {
    savepack(player);
}


function onServerStarted() {
    log("[packsack] 多背包加载完成!(v0.0.9)(Yoyo)")
}


function updatepack(player, newpack) {//直接获取背包
    if (newpack == '' || typeof newpack == "undefined") return;
    let pNbt = player.getNbt();
    let NewSnbt = data.fromBase64(newpack);
    let NewNbt = NBT.parseSNBT(NewSnbt);
    if(NewNbt == null){
        Log("red","[多背包] 出现严重错误 需要恢复的 snbt 无法转成nbt对象 目前是 Null 350 行 已拦截本次报错!");
        return;
    }
    let NewInventory = NewNbt.getTag("Inventory");
    pNbt.setTag("Inventory", NewInventory);
    player.setNbt(pNbt);
    player.refreshItems();
}

function savepack(player) {//直接保存背包
    let PackSack = DB.get(player.xuid);
    //保存当前背包
    let pNbt = player.getNbt();
    let Inventory = pNbt.getTag("Inventory");
    let newInventoryNbt = new NbtCompound({
        "Inventory": Inventory
    });
    let InventorySNBT = newInventoryNbt.toSNBT();
    PackSack.pack[PackSack.index].itemSnbt = data.toBase64(InventorySNBT);
    DB.set(player.xuid, PackSack);
}

/**
 * 实时储存(已更改为计数频率)
 */
function onInventoryChange(player, slotNum, oldItem, newItem) {
    let value = player.getExtraData("StorageFrequency");
    if (typeof value == "undefined" || value == null || value == '') {
        value = 0;
    }
    if (value >= 5) {
        savepack(player);
        value = 0;
    } else {
        value++
    }
    player.setExtraData("StorageFrequency", value);
}


/**
 * 设置指定玩家的多背包数据
 * @param {String} name 玩家名称
 * @param {object} object 物品栏对象
 */
function xfpl(name,object){
    let pl = mc.getPlayer(name);
    if(typeof object != "object"){
        log(398);
        return;
    }
    let plXuid = data.name2xuid(name);
    if(plXuid == null){
        log("403 玩家未进过服务器");
        return;
    }
    DB.set(plXuid, object);
    log("更新他的多背包成功");
    if(pl == null){
        //"该玩家不存在"
        log("409 玩家不在线 默认不直接设置 ");
        return;
    }
    updatepack(pl,object.pack[object.index].itemSnbt);
}

lxl.export(xfpl,"pack_xfpl");
