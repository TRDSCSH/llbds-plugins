// TODO
// 待测试: 药水箭矢/药水/附魔书
// 焰火之星无法购买
// 相同type和aux 出售问题
// 盔甲和装备无法出售

// 常量与全局变量
const DEBUG = false;
const maxItemsCountInCart = 32;
const sellRate = 0.8;
const enableHot = true; // 启用「热度」
let taskid = null;

const itemsFilePath = 'plugins/Shop/items.json';
const shopFilePath = 'plugins/Shop/shop.json';
const reciptMapDatabasePath = 'plugins/Shop/ReciptMap';
const reciptsDatabasePath = 'plugins/Shop/Recipts';
const hotFilePath = 'plugins/Shop/hot.json';
const cartDatabasePath = 'plugins/Shop/Cart';
const avgPriceFilePath = 'plugins/Shop/avg_price.json';

const type2itemid = buildTypeItemidMap();
const name2itemid = buildNameItemidMap();
const allNamesAndTypes = [...Object.keys(type2itemid), ...Object.keys(name2itemid)];

dataFileInit();


// 类定义
class Price {
    constructor(currency, amount) {
        this.currency = currency;
        this.amount = amount;
    }

    format1() {
        return this.currency.symbol + this.amount;
    }

    format2() {
        return this.amount + " " + this.currency.name;
    }
}

class Currency {
    constructor(name, symbol) {
        this.name = name;
        this.symbol = symbol;
    }
}

const currency = new Currency('金币', '$');


// 命令注册
mc.regPlayerCmd("buy", "购买物品", sendBuyItemsForm);
mc.regPlayerCmd("shop", "购买物品", sendBuyItemsForm);
mc.regPlayerCmd("sell", "出售物品", sendSellItemsForm);
mc.regPlayerCmd("shop search", "搜索物品商店", sendSearchItemForm);
mc.regPlayerCmd("shop history", "物品购买历史", sendHistoryForm);
mc.regPlayerCmd("shop cart", "购物车", sendMyCartForm);

// 间隔任务
if (enableHot) {
    taskid = setInterval(coolDownAllItemsHot, 24 * 60 * 60 * 1000);
}

// 函数
function giveItem(pl, itemId, count) {
    const item = (new JsonConfigFile(itemsFilePath)).get(itemId);
    if (!item) return;
    const itemType = itemTypeJudge(item);
    if (itemType == 1) {
        pl.giveItem(getItem(itemId), count);
    } else if (itemType == 2) {
        for (let i = 0; i < count; i++) {
            pl.giveItem(getItem(itemId), 1);
        }
    }
}

function calculateAndSetAvgPrice(itemId, newPrice) {
    const avgPriceFile = new JsonConfigFile(avgPriceFilePath);
    const newAvgPrice = getAvgPrice(itemId) != -1 ? Math.floor((getAvgPrice(itemId) + newPrice) / 2) : newPrice;
    avgPriceFile.set(itemId, newAvgPrice);
}

function getAvgPrice(itemId) {
    const avgPriceFile = new JsonConfigFile(avgPriceFilePath);
    const avgPrice = avgPriceFile.get(itemId) ? avgPriceFile.get(itemId) : -1;
    return avgPrice;
}

function coolDownAllItemsHot() {
    const hotFile = new JsonConfigFile(hotFilePath);
    const hotData = hotFile.get('data');
    const decreaseRate = 0.33;
    for (let i in hotData) {
        hotData[i] = Math.floor(hotData[i] * (1 - decreaseRate));
        if (hotData[i] <= 0) delete hotData[i];
    }
    hotFile.set('data', hotData);
}

function calculatePrice(itemId, price) {
    return enableHot ? increaseItemPriceByHot(itemId, price) : price;
}

function increaseItemPriceByHot(itemId, price) {
    return Math.floor((1 + getItemHot(itemId) / 100) * price);
}

function getItemHot(itemId) {
    const hotFile = new JsonConfigFile(hotFilePath);
    const hotData = hotFile.get('data');
    const hot = hotData[itemId] ? hotData[itemId] : 0;
    return hot;
}

function increaseHot(itemId, value) {
    const hotFile = new JsonConfigFile(hotFilePath);
    const hotData = hotFile.get('data');
    let hotValue = hotData[itemId] ? hotData[itemId] : 0;
    hotValue += value;
    hotData[itemId] = hotValue;
    hotFile.set('data', hotData);
}

function decreaseHot(itemId, value) {
    const hotFile = new JsonConfigFile(hotFilePath);
    const hotData = hotFile.get('data');
    let hotValue = hotData[itemId];
    if (!hotValue) return;
    hotValue -= value;
    if (hotValue <= 0) {
        delete hotData[itemId];
    } else {
        hotData[itemId] = hotValue;
    }
    hotFile.set('data', hotData);
}

function sendAddedToCartForm(pl, data) {
    const items = new JsonConfigFile(itemsFilePath);

    const itemsToBeAddedToCart = data.itemsToBeAddedToCart ? data.itemsToBeAddedToCart : [];
    const itemsCount = itemsToBeAddedToCart.length;

    let content = '';
    const itemsAddedToCart = new Array;
    const itemsNotAddedToCart = new Array;
    if (itemsCount == 0) {
        content = Format.Red + '没有任何物品待加入到购物车' + Format.Clear;
    } else {
        for (let i = 0; i < itemsCount; i++) {
            const itemId = itemsToBeAddedToCart[i][0];
            const itemCount = itemsToBeAddedToCart[i][1];
            const result = addToCart(pl.uuid, itemId, itemCount);
            if (result) {
                itemsAddedToCart.push(itemsToBeAddedToCart[i]);
            } else {
                itemsNotAddedToCart.push(itemsToBeAddedToCart[i]);
            }
        }
        
        if (itemsAddedToCart.length != 0) {
            content += '以下物品加入到了购物车:\n';
            for (let i = 0; i < itemsAddedToCart.length; i++) {
                const item = items.get(itemsAddedToCart[i][0]);
                content += `  ${Format.Gray}${i+1}. ${Format.Yellow}${item.name_zh}${Format.Clear} * ${itemsAddedToCart[i][1]}\n`;
            }
        }
        if (itemsNotAddedToCart.length != 0) {
            content += content ? '\n' : '';
            content += '以下物品没有加入购物车:\n';
            for (let i = 0; i < itemsNotAddedToCart.length; i++) {
                const item = items.get(itemsNotAddedToCart[i][0]);
                content += `  ${Format.Gray}${i+1}. ${Format.Red}${item.name_zh}${Format.Clear} * ${itemsNotAddedToCart[i][1]}\n`;
            }
        }
        content += content ? '\n' : '';
        content += `${Format.Gray}购物车容量: ${getItemsCountInCart(pl.uuid)} / ${maxItemsCountInCart}${Format.Clear}`;
    }

    const fm = mc.newSimpleForm();
    fm.setTitle('商店 - 加入购物车');
    fm.setContent(content ? content : '' + data.prompt ? '\n\n' + data.prompt : '');
    fm.addButton('商店 >'); // 0
    fm.addButton('搜索物品 >'); // 1
    fm.addButton('购物车 >'); // 2
    fm.addButton('出售物品 >'); // 3
    fm.addButton('退出'); // 4

    pl.sendForm(fm, (pl, id) => {
        if (id == null) return;

        if (id == 2) {
            sendMyCartForm(pl, clearData(data));
        } else if (id == 0) {
            sendBuyItemsForm(pl, clearData(data));
        } else if (id == 1) {
            if (data.search) {
                sendSearchResultForm(pl, updateData(data, { 'delete': ['prompt'] }));
            } else {
                sendSearchItemForm(pl, clearData(data));
            }
        } else if (id == 3) {
            sendSellItemsForm(pl, clearData(data));
        } else if (id == 4) {
            return;
        }
    });
}

function sendMyCartForm(pl, data) {
    const cartData = new KVDatabase(cartDatabasePath);
    const playerCart = (cartData.get(pl.uuid) ? cartData.get(pl.uuid) : new Array);
    const items = new JsonConfigFile(itemsFilePath);
    const offset = 1;
    
    const fm = mc.newCustomForm();
    fm.setTitle('商店 - 购物车');

    let content;
    if (playerCart.length == 0) {
        content = '你的购物车十分干净!';
    } else {
        content = '你的购物车里面有以下物品:'
    }
    fm.addLabel(content); // 0

    for (let i = 0; i < playerCart.length; i++) {
        const itemId = playerCart[i][0];
        const itemName = items.get(itemId).name_zh;
        const itemPrice = calculatePrice(itemId, items.get(itemId).price); // todo itemid
        const count = playerCart[i][1];
        const options = new Array;
        for (let i = 0; i <= count; i++) {
            const totalCost = itemPrice * i;
            options.push(`${itemName} * ${i} - ${Format.MinecoinGold}${(new Price(currency, totalCost)).format1()}`);
        }
        fm.addStepSlider('选择', options, count); // offset to playerCart.length + offset - 1
    }

    fm.addLabel(data.prompt ? data.prompt : ''); // playerCart.length + offset or fmdata.length - 2

    const options = ['购买所选物品', '删除未选物品', '去往商店', '退出'];
    fm.addStepSlider('操作', options); // playerCart.length + offset + 1 or fmdata.length - 1

    pl.sendForm(fm, (pl, fmdata) => {
        if (fmdata == null) {
            cartData.close();
            return;
        }

        const operation = fmdata[fmdata.length - 1];
        if (operation == options.length - 1) {
            return;
        } else if (operation == 0) { // 购买所选物品
            let totalCost = 0;
            const playerMoney = pl.getMoney();
            for (let i = 0; i < playerCart.length; i++) {
                const formCtrlId = i + offset;
                
                const itemId = playerCart[i][0];
                const itemPrice = calculatePrice(itemId, items.get(itemId).price);
                const count = fmdata[formCtrlId];

                totalCost += itemPrice * count;
            }
            if (totalCost > playerMoney) {
                cartData.close();
                sendMyCartForm(pl, updateData(data, { 'prompt': Format.Red + '你没有这么多的经济来购买这些物品，还需要 $' + (totalCost - playerMoney) }));
            } else {
                // 数量检查
                let selected = false;
                for (let i = 0; i < playerCart.length; i++) {
                    const formCtrlId = i + offset;
                    if (fmdata[formCtrlId] != 0) selected = true;
                }
                if (!selected) {
                    cartData.close();
                    const prompt = playerCart.length ? '你还没有选择任何物品' : '你的购物车里面没有东西，\n去商店里面购买一些吧';
                    sendMyCartForm(pl, updateData(data, { 'prompt': Format.MinecoinGold + prompt }));
                    return;
                }

                // 发送物品给玩家并扣除经济 && 编辑玩家购物车
                const purchasedItems = new Array;
                const itemsToAddHot = new Array;
                let totalCost = 0;
                for (let i = 0; i < playerCart.length; i++) {
                    const formCtrlId = i + offset;
                    const itemId = playerCart[i][0];
                    const count = fmdata[formCtrlId];
                    if (count == 0) continue;
                    const itemPrice = calculatePrice(itemId, items.get(playerCart[i][0]).price);
                    const cost = itemPrice * count;
                    purchasedItems.push({ 'id': itemId, 'count': count, 'cost': cost });
                    giveItem(pl, itemId, count);
                    if (enableHot) itemsToAddHot.push([itemId, count]);
                    pl.reduceMoney(cost);
                    calculateAndSetAvgPrice(itemId, itemPrice);
                    totalCost += cost;
                    playerCart[i][1] -= count;
                }
                for (let i = 0; i < itemsToAddHot.length; i++) {
                    increaseHot(itemsToAddHot[i][0], itemsToAddHot[i][1]);
                }

                // 更新玩家购物车
                for (let i = playerCart.length - 1; i >= 0; i--) {
                    if (playerCart[i][1] <= 0) playerCart.splice(i, 1);
                }
                cartData.set(pl.uuid, playerCart);
                if (playerCart.length == 0) cartData.delete(pl.uuid);
                cartData.close();

                // 生成账单
                const reciptData = {
                    "items": purchasedItems,
                    "cost": totalCost,
                    "time": getCurrentTimestamp(),
                    "uuid": pl.uuid,
                    "ip": pl.getDevice().ip
                };

                const reciptId = generateRandomString(Math.floor(Math.random() * 8) + 10);
                setRecipt(reciptId, reciptData);
                addReciptMap(pl.uuid, reciptId);

                // 给玩家发送账单
                sendReciptForm(pl, updateData(data, { 'reciptId': reciptId, 'cart': true, 'delete': ['page'] }));
            }
        } else if (operation == 1) { // 删除未选物品
            let newPlayerCart = playerCart;
            for (let i = 0; i < playerCart.length; i++) { // 修改物品数量
                const formCtrlId = i + offset;
                const count = fmdata[formCtrlId];
                newPlayerCart[i][1] = count;
            }
            for (let i = playerCart.length - 1; i >= 0; i--) { // 清除数量为 0 的物品
                if (newPlayerCart[i][1] <= 0) newPlayerCart.splice(i, 1);
            }
            cartData.set(pl.uuid, playerCart);
            cartData.close();
            sendMyCartForm(pl, updateData(data, { 'prompt': Format.Green + '完成' }))
        } else if (operation == 2) { // 去往商店
            cartData.close();
            sendBuyItemsForm(pl, clearData(data));
        }
    });
}

function addToCart(uuid, itemId, count) {
    const cartData = new KVDatabase(cartDatabasePath);
    const playerCart = (cartData.get(uuid) ? cartData.get(uuid) : new Array);
    if (isCartFull(playerCart)) return false;

    playerCart.push([itemId, count]);
    cartData.set(uuid, playerCart);
    cartData.close();
    return true;
}

function getItemsCountInCart(uuid) {
    const cartData = new KVDatabase(cartDatabasePath);
    const playerCart = cartData.get(uuid) ? cartData.get(uuid) : [];
    cartData.close();
    return playerCart.length;
}

function isCartFull(cart) {
    if (cart == undefined) return false;
    if (cart.length >= maxItemsCountInCart) {
        return true;
    } else {
        return false;
    }
}

function sendHistoryForm(pl, data) {
    const reciptDatabase = new KVDatabase(reciptsDatabasePath);
    const reciptMapDatabase = new KVDatabase(reciptMapDatabasePath);
    const page = data.page ? data.page : 1; // 约定页数从 1 开始

    const playerRecipts = (reciptMapDatabase.get(pl.uuid) ? reciptMapDatabase.get(pl.uuid).reverse() : new Array);
    const playerReciptsCount = playerRecipts.length;

    const itemCountPerPage = 8;
    const pageCount = Math.floor((playerReciptsCount - 1) / 8) + 1;
    const startId = (page - 1) * itemCountPerPage; // 包含
    const endId = page * itemCountPerPage > playerReciptsCount ? playerReciptsCount : page * itemCountPerPage; // 不包含

    const fm = mc.newCustomForm();
    fm.setTitle('商店 - 购买历史记录');

    let content = '';
    const options = [Format.Green + '<上一页>']; // option: 0
    if (playerReciptsCount == 0) {
        content = '这里空空如也...\n在商店里买点东西再来看看吧 :)'
    } else {
        content = Format.Gray + '你好，下面是你的账单:\n' + Format.Clear;
        for (let i = startId; i < endId; i++) {
            const currentReciptId = `${playerRecipts[i]}`;
            // log(currentReciptId)
            const currentReciptIdCut = currentReciptId.length < 4 ? currentReciptId : currentReciptId.substring(0, 4);
            const currentRecipt = reciptDatabase.get(currentReciptId);
            const totalCost = currentRecipt.cost;
            const time = timestampToDateStr(currentRecipt.time);
            const itemCount = currentRecipt.items.length;
            content += `  ${Format.Gray}${i + 1}.${Format.Clear} ${itemCount} 个物品 ${Format.Gray}- ${Format.MinecoinGold}$${totalCost} ${Format.Gray}${time} #${currentReciptIdCut}${Format.Clear}\n`;
            options.push('查看账单: ' + '#' + currentReciptIdCut); // option: 1 to itemCountPerPage
        }
        content += `\n${Format.Gray} - 第 ${page} 页, 共 ${pageCount} 页 - ${Format.Clear}`;
    }
    options.push(Format.Green + '<退出>'); // option: options.length - 2
    options.push(Format.Green + '<下一页>'); // option: options.length - 1

    fm.addLabel(content); // 0
    fm.addLabel(data.prompt ? data.prompt : ''); // 1
    fm.addStepSlider('操作', options, 1); // 2

    reciptDatabase.close();
    reciptMapDatabase.close();

    pl.sendForm(fm, (pl, fmdata) => {
        if (fmdata == null) {
            if (data.shopPath) sendBuyItemsForm(pl, clearData(data));
            return;
        }

        const operation = fmdata[2];
        if (operation == options.length - 2) { // 退出
            return;
        } else if (operation == 0) { // 上一页
            if (page <= 1) {
                sendHistoryForm(pl, updateData(data, { 'prompt': Format.Yellow + '已经是第一页了' }));
            } else {
                sendHistoryForm(pl, updateData(data, { 'page': page - 1, 'delete': ['prompt'] }));
            }
        } else if (operation == options.length - 1) { // 下一页
            if (page >= pageCount) {
                sendHistoryForm(pl, updateData(data, { 'prompt': Format.Yellow + '已经是最后一页了' }));
            } else {
                sendHistoryForm(pl, updateData(data, { 'page': page + 1, 'delete': ['prompt'] }));
            }
        } else { // 查看账单详情
            const reciptId = playerRecipts[(operation - 1) + (page - 1) * itemCountPerPage];
            sendReciptForm(pl, updateData(data, { 'reciptId': reciptId, 'page': page, 'delete': ['search'] }));
        }
    });
}

function sendSellItemsForm(pl, data) {
    const items = new JsonConfigFile(itemsFilePath);

    const fm = mc.newCustomForm();
    fm.setTitle('商店 - 出售物品');
    fm.addLabel(Format.Gray + '选择你需要出售的物品及其数量，\n然后点击“提交”按钮以出售' + Format.Gray + '\n' + currency.name + ': ' + pl.getMoney()); // 0

    const offset = 1;

    const containers = [pl.getInventory(), pl.getArmor()]; // , pl.getEnderChest()
    containers.push({ getAllItems: () => [pl.getOffHand()] }); // 添加一个伪装的容器

    // 构建数据
    const ownedItems = new Array;
    containers.forEach(container => {
        const allItems = container.getAllItems();
        for (let i = 0; i < allItems.length; i++) {
            // 获取玩家物品
            const it = allItems[i];
            if (!it.type) continue;

            // 判断物品是否一致
            const itemAux = it.aux;
            const type2itemidKey = `${it.type}${itemAux ? '.' + itemAux : ''}`;
            const itemId = type2itemid[type2itemidKey];
            if (!itemId) {
                log(`[sendSellItemsForm] 找不到 ${type2itemidKey}, 请检查配置文件`);
                continue;
            } else {
                const itemObj = items.get(itemId);
                const itemType = itemTypeJudge(itemObj);
                let tmpItem;
                if (itemType == 1) { // 通过 type 创建物品
                    tmpItem = mc.newItem(itemObj.type, 1);
                } else if (itemType == 2) { // 通过 nbt 创建物品
                    tmpItem = mc.newItem(NBT.parseSNBT(itemObj.nbt));
                } else {
                    log(`[sendSellItemsForm] itemId = ${itemId} 存在问题，请检查配置文件`);
                    continue;
                }
                // todo 测试：潜影盒（装物品和没装物品）
                if (DEBUG) log(`[sendSellItemsForm] ${it.match(tmpItem) ? '同类物品' : '不同物品'} type=${it.type}`);
                if (!it.match(tmpItem)) {
                    continue;
                } else if (!showInSellShop(itemObj)) {
                    continue;
                }
            }

            // 构建物品信息
            let itemConfig = new Object;
            itemConfig.itemId = itemId;
            itemConfig.name = items.get(itemId).name_zh;
            itemConfig.count = it.count;
            itemConfig.price = calculatePrice(itemId, items.get(itemId).price);

            ownedItems.push(itemConfig);
        }
    });

    // 构建表单
    for (let i = 0; i < ownedItems.length; i++) {
        const itemConfig = ownedItems[i];
        const itemCount = itemConfig.count;
        const itemPrice = itemConfig.price;
        const itemNameZh = itemConfig.name;

        const options = new Array;
        for (let j = 0; j <= itemCount; j++) {
            const totalPrice = Math.floor(j * itemPrice * sellRate);
            options.push(`${Format.Yellow}${itemNameZh}${Format.Clear}\n数量: ${j} ${Format.Gray}-${Format.Clear} ${(new Price(currency, (totalPrice))).format1()}`);
        }
        
        fm.addStepSlider('物品', options, 0); // id + offset
    }

    fm.addLabel(data.prompt ? data.prompt : (ownedItems.length == 0 ? Format.Red + "你没有任何可以出售的物品" + Format.Clear : '')); // ownedItems.length + offset

    const options = ['确认出售', '购买物品', '退出'];
    fm.addStepSlider('操作', options, 0); // ownedItems.length + offset + 1

    pl.sendForm(fm, (pl, fmdata) => {
        if (fmdata == null) {
            if (data.shopPath) sendBuyItemsForm(pl, data);
            return null;
        }

        const operation = fmdata[ownedItems.length + offset + 1];
        if (operation == options.length - 1) { // 退出
            return;
        } else if (operation == 1) { // 购买物品
            sendBuyItemsForm(pl, data);
            return;
        } else if (operation == 0) {
            if (pl.isOP() || pl.gameMode == 1) {
                sendSellItemsForm(pl, updateData(data, { 'prompt': Format.Red + '此功能对创造模式玩家和管理员禁用' }));
                return;
            }
            // 构建数据
            const selledItems = new Array;
            const itemsFailedToSell = new Array;

            for (let i = 0; i < ownedItems.length; i++) {
                const sellCount = fmdata[i + offset];
                if (sellCount == 0) continue;

                // 清除物品 && 给予经济
                let currentItemData = ownedItems[i];
                const itemId = ownedItems[i].itemId;
                const item = getItem(itemId);
                if (item.isNull()) {
                    itemsFailedToSell.push(currentItemData);
                    log(`[sellItemsForm] itemId ${itemId} 不存在，请检查配置文件`);
                    continue;
                }
                const itemNbt = item.getNbt();
                const clearItemResult = clearItem(pl, itemNbt, sellCount);
                if (clearItemResult != 0) { // 出售失败：数量不足
                    itemsFailedToSell.push(currentItemData);
                } else { // 出售成功
                    const earn = Math.floor(sellCount * currentItemData.price);
                    pl.addMoney(earn);
                    if (enableHot) decreaseHot(itemId, sellCount);
                    currentItemData.sellCount = sellCount;
                    currentItemData.earn = earn;
                    selledItems.push(currentItemData);
                }
            }

            // 构建提示消息
            let prompt = '';
            let totalEarn = 0;
            const selledItemsCount = selledItems.length;
            if (selledItemsCount > 0) prompt += '已出售物品:\n';
            for (let i = 0; i < selledItemsCount; i++) {
                const name = selledItems[i].name;
                const count = selledItems[i].sellCount;
                const earn = selledItems[i].earn;
                totalEarn += earn;
                prompt += `  ${Format.Gray}${i+1}.${Format.Clear} ${name}${Format.Gray} * ${count} - ${Format.MinecoinGold}${(new Price(currency, earn)).format1()}${Format.Clear}\n`;
            }
            const itemsFailedToSellCount = itemsFailedToSell.length;
            if (itemsFailedToSellCount > 0) prompt += (prompt ? '\n' : '') + '出售失败的物品:\n';
            for (let i = 0; i < itemsFailedToSellCount; i++) {
                const name = itemsFailedToSell[i].name;
                prompt += `  ${Format.Gray}${i+1}.${Format.Red} ${name}${Format.Clear}\n`;
            }
            if (selledItemsCount > 0) prompt += (prompt ? '\n' : '') + '总赚取: ' + Format.MinecoinGold + (new Price(currency, totalEarn)).format1() + Format.Clear;
            if (selledItemsCount + itemsFailedToSellCount == 0) prompt = Format.Red + '你没有选择物品' + Format.Clear;

            sendSellItemsForm(pl, updateData(data, { 'prompt': prompt }));
        }
    });
}

/**
 * 清除指定数量的NBT物品
 * @param {Player} pl 玩家对象
 * @param {NBT} nbt 物品NBT
 * @param {Number} count 需要清除的数量
 * @returns 未清除的物品数量
 */
function clearItem(pl, nbt, count) {
    if (!count) return -1;

    const item = mc.newItem(nbt);
    const itemType = item.type;
    const itemAux = item.aux;

    const itemsWithSameAux = new Array;
    const sameItems = new Array;
    const itemsWithDifferentAux = new Array;

    const containers = [pl.getInventory(), pl.getArmor()];
    containers.push({ getAllItems: () => [pl.getOffHand()] }); // 添加一个伪装的容器
    
    containers.forEach(container => {
        const allItems = container.getAllItems();
        for (let i = 0; i < allItems.length; i++) {
            // 获取玩家物品
            const it = allItems[i];
            if (!it.type) continue;

            // 判断物品是否是目标类型
            if (it.type == itemType && it.aux == itemAux) {
                // log(`${it} ${allItems[i]} ${it === allItems[i]}`)
                if (it.match(mc.newItem(nbt))) {
                    sameItems.push(it.getNbt());
                } else {
                    itemsWithSameAux.push(it.getNbt());
                }
            } else if (it.type == itemType && it.aux != itemAux) {
                itemsWithDifferentAux.push(it.getNbt());
            }
        }
    });

    pl.clearItem(itemType, 64);
    // log(`[clearItem] 清除了所有物品`)

    let clearCount = count;
    for (let i = 0; i < sameItems.length; i++) {
        // log(mc.newItem(sameItems[i]).count)
        pl.giveItem(mc.newItem(sameItems[i]));
        // log(`[clearItem] 给予了相同物品`)
        if (clearCount > 0) {
            clearCount -= pl.clearItem(itemType, clearCount);
            // log(`[clearItem] 清除了相同物品, 还需要清除 ${clearCount} 个`)
        }
        // if (DEBUG) { log(`[clearCount] ${clearCount} i=${i}`); }
    }
    if (clearCount != 0) {
        for (let i = 0; i < sameItems.length; i++) {
            // log(mc.newItem(sameItems[i]).count)
            pl.giveItem(mc.newItem(sameItems[i]));
            // log(`[clearItem] 物品数量不足，退回所有相同物品`)
        }
        pl.tell('物品数量不足, 还需要 ' + (clearCount));
        clearCount = count;
    }

    for (let i = 0; i < itemsWithSameAux.length; i++) {
        pl.giveItem(mc.newItem(itemsWithSameAux[i]));
    }
    for (let i = 0; i < itemsWithDifferentAux.length; i++) {
        pl.giveItem(mc.newItem(itemsWithDifferentAux[i]));
    }

    pl.refreshItems();

    // if (DEBUG) log(`Result = ${!clearCount}`);
    return clearCount;
}

function sendSearchResultForm(pl, data) {
    const items = new JsonConfigFile(itemsFilePath);

    const itemsId = data.search; // itemId Array
    const searchResultCount = itemsId.length;

    const fm = mc.newSimpleForm();
    fm.setTitle('商店 - 搜索结果');
    fm.setContent(`共有 ${searchResultCount} 条搜索结果`);

    for (let i = 0; i < searchResultCount; i++) {
        const item = items.get(itemsId[i]);

        if (!item) {
            fm.addButton('???');
            log(`未找到 itemId 为 ${itemsId[i]} 的物品，请检查配置文件`);
            continue;
        }

        const itemNameZh = item.name_zh;
        const itemPrice = calculatePrice(itemsId[i], item.price);
        fm.addButton(`${itemNameZh}\n${(new Price(currency, itemPrice)).format1()}`, hasIcon(item) ? item.icon : 'textures/ui/sign');
    }
    fm.addButton('退出');

    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            sendSearchItemForm(pl, data);
            return;
        }

        if (id == searchResultCount) return;

        let item = items.get(itemsId[id]);
        item.itemId = itemsId[id];
        sendItemPurchaseForm(pl, updateData(data, { 'delete': ['prompt'], 'item': item }));
    });
}

function sendSearchItemForm(pl, data) {
    const fm = mc.newCustomForm();
    fm.setTitle('商店 - 搜索物品');
    fm.addInput('物品名称', '在这里填入物品名称，中文或英文皆可'); // 0

    fm.addLabel(data.prompt ? data.prompt : ''); // 1
    const options = ['查找', '购买物品', '出售物品', '退出'];
    fm.addStepSlider('操作', options, 0); // 2

    pl.sendForm(fm, (pl, fmdata) => {
        if (fmdata == null) {
            sendBuyItemsForm(pl, clearData(data));
            return;
        }

        const searchValue = fmdata[0];
        const operation = fmdata[2];

        if (operation == options.length - 1) return;

        if (operation == 0) {
            if (!searchValue) {
                sendSearchItemForm(pl, updateData(data, { 'prompt': Format.Red + '你没有输入任何内容！' }));
            } else {
                const allItems = findAllItemsWithString(searchValue);
                if (allItems.length == 0) {
                    sendSearchItemForm(pl, updateData(data, { 'prompt': Format.Red + '抱歉，没有找到任何名称带有 "' + searchValue + '" 的物品' }));
                } else {
                    sendSearchResultForm(pl, updateData(data, { 'search': allItems, 'delete': ['prompt'] }));
                }
            }
        } else if (operation == 1) {
            sendBuyItemsForm(pl, clearData(data));
        } else if (operation == 2) {
            sendSellItemsForm(pl, clearData(data));
        }
    });
}

function findAllItemsWithString(searchString) {
    const items = new JsonConfigFile(itemsFilePath);
    const arr = findStringsContaining(allNamesAndTypes, searchString);
    const itemidArr = new Array;
    for (let i = 0; i < arr.length; i++) {
        const itemid = type2itemid[arr[i]] ? type2itemid[arr[i]] : name2itemid[arr[i]];
        if (!itemid) {
            log(`[findAllItemsWithString] 没有找到 ${arr[i]} 对应的 itemId`);
            continue;
        }
        if (!itemidArr.includes(itemid)) {
            if (showInBuyShop(items.get(itemid))) itemidArr.push(itemid);
        }
    }
    return itemidArr;
}

function findStringsContaining(array, searchString) {
    return array.filter(function(element) {
        return element.includes(searchString);
    });
}

function sendOtherFuncForm(pl, data) {
    const fm = mc.newSimpleForm();
    fm.setTitle('商店 - 其它功能');
    fm.setContent('这里有其它功能' + (data.prompt ? ('\n' + data.prompt) : ''));

    const options = ['商店 >', '搜索物品 >', '购物车 >', '购买历史记录 >', '出售 >', '退出'];
    for (let i = 0; i < options.length; i++) {
        fm.addButton(options[i]);
    }

    pl.sendForm(fm, (pl, id) => {
        if (id == null || id == options.length - 1) {
            return;
        }

        if (id == 0) {
            sendBuyItemsForm(pl, clearData(data));
        } else if (id == 1) {
            sendSearchItemForm(pl, clearData(data));
        } else if (id == 2) {
            sendMyCartForm(pl, clearData(data));
        } else if (id == 3) {
            sendHistoryForm(pl, clearData(data));
        } else if (id == 4) {
            sendSellItemsForm(pl, clearData(data));
        }
    });
}

function sendReciptForm(pl, data) {
    // 判断来源
    const source = data.search ? 'searchResultForm' : (data.page ? 'historyForm' : (data.cart ? 'myCartForm' : 'buyItemsForm'));

    const reciptsDatabase = new KVDatabase(reciptsDatabasePath);
    const items = new JsonConfigFile(itemsFilePath);

    const reciptId = data.reciptId;
    const recipt = reciptsDatabase.get(reciptId);
    reciptsDatabase.close();

    const purchasedItems = recipt.items;
    const totalSpend = recipt.cost;
    const timestamp = recipt.time;

    let label = Format.Gray + '账单:\n' + Format.Clear;

    for (let i = 0; i < purchasedItems.length; i++) {
        const item = purchasedItems[i];
        const itemId = item['id'];
        const itemCount = item['count'];
        const itemCost = item['cost'];
        label += `  ${Format.Gray}${i+1}. ${Format.Yellow}${items.get(itemId)['name_zh']}${Format.Gray} * ${itemCount}  ${Format.Gold}$${itemCost}${Format.Clear}\n`;
    }
    label += '\n';
    label += `合计: ${Format.Gold}${(new Price(currency, totalSpend)).format1()}${Format.Clear}\n`;
    label += `${Format.Gray}时间: ${timestampToDateStr(timestamp)}${Format.Clear}\n`;
    label += `${Format.Gray}ID: ${reciptId}${Format.Clear}\n`;

    if (source != 'historyForm') label += `\n${Format.Green}购买成功，欢迎下次光临！`;

    const fm = mc.newSimpleForm();
    fm.setTitle("商店 - 收据");
    fm.setContent(label);

    const buttons = ['返回', '复购 >', '购物车 >', '所有账单 >', '退出'];
    for (let i = 0; i < buttons.length; i++) {
        fm.addButton(buttons[i]);
    }

    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            return;
        }

        if (id == buttons.length - 1) {
            return;
        } else if (id == 3) {
            sendHistoryForm(pl, updateData(data, { 'delete': ['prompt'] }));
        } else if (id == 2) {
            sendMyCartForm(pl, clearData(data));
        } else if (id == 1) {
            const itemsToBeAddedToCart = new Array;
            for (let i = 0; i < purchasedItems.length; i++) {
                itemsToBeAddedToCart.push([purchasedItems[i]['id'], purchasedItems[i]['count']]);
            }
            sendAddedToCartForm(pl, updateData(data, { 'delete': ['prompt'], 'itemsToBeAddedToCart': itemsToBeAddedToCart }));
        } else if (id == 0) {
            if (source == 'buyItemsForm') {
                sendBuyItemsForm(pl, clearData(data));
            } else if (source == 'searchResultForm') {
                sendSearchResultForm(pl, updateData(data, { 'delete': ['prompt'] }));
            } else if (source == 'historyForm') {
                sendHistoryForm(pl, updateData(data, { 'delete': ['prompt'] }));
            } else if (source == 'myCartForm') {
                sendMyCartForm(pl, clearData(data));
            }
        }
    });
}

function updateData(obj, newData) {
    for (let key in newData) {
        if (key == 'delete') { // array
            for (let i = 0; i < newData['delete'].length; i++) {
                delete obj[newData['delete'][i]];
            }
            continue;
        }
        obj[key] = newData[key];
    }

    return obj;
}

function clearData(obj) {
    for (let key in obj) {
        if (key != 'shopPath') {
            delete obj[key];
        }
    }

    return obj;
}

function sendItemPurchaseForm(pl, data) {
    // 判断来源
    const source = data.search ? 'searchResultForm' : 'buyItemsForm';

    const item = data['item'];
    const itemId = item.itemId;

    // 表单构建
    const fm = mc.newCustomForm();
    fm.setTitle('商店 - 物品购买');

    const price = calculatePrice(itemId, item.price);
    const maxStacking = item.max_stacking;
    
    let label = '';
    label += `名称: ${item.name_zh} ${item.nbt ? Format.Gray + '(+NBT)' + Format.Clear : ''}\n`;
    label += `${item.desc ? ('描述: ' + item.desc + '\n') : ''}`;
    label += `单价: ${Format.MinecoinGold}${(new Price(currency, price)).format1()}${Format.Clear}\n\n`;
    label += Format.Gray;
    label += `物品ID: ${item.type}\n`;
    label += `英文名: ${item.name}\n`;
    label += `最大堆叠: ${maxStacking}\n`;
    label += `ID: #${itemId}`
    fm.addLabel(label); // 0

    const prompt = data.prompt ? data.prompt : '';
    fm.addLabel(prompt); // 1

    const countAndPrice = [];
    const money = pl.getMoney();
    for (let i = 0; i <= maxStacking; i++) {
        if (i == 0) {
            countAndPrice.push('未选择');
        } else {
            const totalPrice = i * price;
            const priceDisplayColor = totalPrice > money ? Format.Red : Format.MinecoinGold;
            countAndPrice.push(`数量: ${i} ${Format.Gray}-${Format.Clear} ${priceDisplayColor}${(new Price(currency, (totalPrice))).format1()}${Format.Clear}`);
        }
    }
    fm.addStepSlider('购买', countAndPrice, 0); // 2

    const options = ['直接购买', '加入购物车', '退出商店', '返回商店'];
    fm.addStepSlider('操作', options, 0); // 3

    pl.sendForm(fm, (pl, fmdata) => {
        if (fmdata == null) {
            if (source == 'buyItemsForm') {
                sendBuyItemsForm(pl, clearData(data));
            } else if (source == 'searchResultForm') {
                sendSearchResultForm(pl, data);
            }
            return;
        }

        const count = fmdata[2];
        const operation = fmdata[3];

        if (count == 0 && (operation == 0 || operation == 1)) {
            sendItemPurchaseForm(pl, updateData(data, { 'prompt': Format.Red + '请选择购买数量' }));
        } else if (operation == 3) {
            if (source == 'buyItemsForm') {
                sendBuyItemsForm(pl, clearData(data));
            } else if (source == 'searchResultForm') {
                sendSearchResultForm(pl, data);
            }
        } else if (count != 0 && operation == 0) {
            const money = pl.getMoney();
            const need = count * price;
            if (money < need) {
                const prompt = Format.Red + `经济不足, 还需要 ${(new Price(currency, need - money)).format2()}` + Format.Clear;
                sendItemPurchaseForm(pl, updateData(data, { 'prompt': prompt }));
            } else {
                // 发送物品给玩家并扣除经济
                logCurrentTime('before giveItem') // 6502
                giveItem(pl, itemId, count);
                if (enableHot) increaseHot(itemId, count);
                logCurrentTime('giveItem done') // 9827
                pl.reduceMoney(need);
                calculateAndSetAvgPrice(itemId, price);

                // 生成账单
                const reciptData = {
                    "items": [
                        {
                            "id": itemId,
                            "count": count,
                            "cost": count * price
                        }
                    ],
                    "cost": count * price,
                    "time": getCurrentTimestamp(),
                    "uuid": pl.uuid,
                    "ip": pl.getDevice().ip
                };

                const reciptId = generateRandomString(Math.floor(Math.random() * 8) + 10);
                logCurrentTime('before setRecipt') // 9889
                setRecipt(reciptId, reciptData);
                logCurrentTime('before addReciptMap')
                addReciptMap(pl.uuid, reciptId);
                logCurrentTime('before sendReciptForm') // 9973

                // 给玩家发送账单
                sendReciptForm(pl, updateData(data, { 'reciptId': reciptId }));
                logCurrentTime('sendReciptForm done') // 101
            }
        } else if (count != 0 && operation == 1) {
            const itemsToBeAddedToCart = new Array;
            itemsToBeAddedToCart.push([itemId, count]);
            sendAddedToCartForm(pl, updateData(data, { 'delete': ['prompt'], 'itemsToBeAddedToCart': itemsToBeAddedToCart }));
        }
    });
}

function getItem(itemId) {
    const items = new JsonConfigFile(itemsFilePath);
    
    const itemConfig = items.get(itemId);
    if (!itemConfig) return null;

    let item;
    if (itemConfig.hasOwnProperty('nbt')) {
        item = mc.newItem(NBT.parseSNBT(itemConfig['nbt']));
    } else if (itemConfig.hasOwnProperty('type')) {
        item = mc.newItem(itemConfig['type'], 1);
    } else {
        return null;
    }

    return item;
}

function addReciptMap(uuid, reciptId) {
    const reciptMapDatabase = new KVDatabase(reciptMapDatabasePath);
    let recipts = reciptMapDatabase.get(uuid);
    if (recipts) {
        recipts.push(reciptId);
    } else {
        recipts = [reciptId];
    }
    reciptMapDatabase.set(uuid, recipts);
    reciptMapDatabase.close();
}

function setRecipt(id, data) {
    const reciptsDatabase = new KVDatabase(reciptsDatabasePath);
    if (DEBUG) log(`${id} ${data}`)
    reciptsDatabase.set(`${id}`, data);
    reciptsDatabase.close();
}

// function getReciptsCount() {
//     const reciptsFilePath = new JsonConfigFile(reciptsFilePath);
//     const recipts = JSON.parse(reciptsFilePath.read());
//     return Object.keys(recipts).length;
// }

function sendBuyItemsForm(pl, data) {
    if (data === undefined) data = {};
    if (DEBUG) log('[sendBuyItemsForm] [data] ' + Object.keys(data) + ' ' + Object.values(data))

    // 获取菜单数据
    const shopPath = data.shopPath ? data.shopPath : '';
    const prompt = data.prompt ? data.prompt : '';

    // 构建购买表单需要的数据对象
    const buyItemsFormData = {
        "money": pl.getMoney()
    }

    // 声明表单
    const fm = mc.newSimpleForm();
    const shop = getShop(shopPath);

    const items = shop ? (shop['items'] ? shop['items'] : []) : [];
    const formName = shop ? (shop['name'] ? shop['name'] : '') : '';
    const formDesc = shop ? (shop['desc'] ? shop['desc'] : '') : '';
    // const formId = shop ? (shop['id'] ? shop['id'] : '') : '';


    // 在配置对象中添加其它自定义按钮
    items.push({ // 其他功能
        'name': '其他功能',
        'showArrow': true,
        'fnid': 'otherfn',
        'fn': function (pl) {
            sendOtherFuncForm(pl, data);
        }
    });

    items.push({ // 退出
        'name': '退出',
        'showArrow': false,
        'fnid': 'exit',
        'fn': () => {}
    });


    // 表单构建
    fm.setTitle('商店' + (formName ? (' - ' + formName) : ''));
    fm.setContent(forcDescHandler(formDesc, buyItemsFormData) + (formDesc ? '\n' : '') + (prompt ? prompt : ''));

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // if (DEBUG) log(item)
        if (!item) {
            fm.addButton('???');
            continue;
        }

        const itemType = itemTypeJudge(item);
        // if (DEBUG) log(`[buyItemsForm] ${itemType}`);
        if (itemType == 0) {
            fm.addButton('???');
            continue;
        }

        let label;
        if (itemType == 1 || itemType == 2) {
            const price = calculatePrice(item.itemId, item.price);
            label = item.name_zh + "\n" + (new Price(currency, price)).format1() + " / 个";
            if (!showInBuyShop(item)) label += Format.Italics + " 仅展示"
            if (hasIcon(item)) {
                fm.addButton(label, getIcon(item));
            } else {
                fm.addButton(label, 'textures/ui/sign');
            }
        } else if (itemType == -1) {
            label = item.name + " >";
            fm.addButton(label);
        } else if (itemType == -2) {
            label = item.name + (item.showArrow ? ' >' : '');
            fm.addButton(label);
        }
    }

    pl.sendForm(fm, (pl, id) => { // id 与 items 数组下标对应
        if (id == null) {
            if (!shopPath) return;
            const shopPathArr = shopPath.split('>');
            shopPathArr.pop();
            const newShopPath = shopPathArr.join('>');
            sendBuyItemsForm(pl, updateData(data, { 'shopPath': newShopPath, 'delete': ['prompt'] }));
            return;
        }

        const item = items[id];
        // if (DEBUG) log(item);

        if (!showInBuyShop(item)) {
            const prompt = Format.Red + '这个物品无法被购买' + Format.Clear;
            sendBuyItemsForm(pl, updateData(data, { 'prompt': prompt }));
            return;
        }

        const itemType = itemTypeJudge(item);

        if (itemType == 1) { // 普通物品
            // if (DEBUG) log(`[itemType=1] ${item}`);
            sendItemPurchaseForm(pl, updateData(data, { 'item': item, 'delete': ['prompt'] }));
        } else if (itemType == 2) { // 带有 NBT 的物品
            // if (DEBUG) log(`[itemType=2] ${item}`);
            sendItemPurchaseForm(pl, updateData(data, { 'item': item, 'delete': ['prompt'] }));
        } else if (itemType == -1) { // 二级菜单
            const shopId = item.id;
            const oldShopPathArr = shopPath.split('>');
            if (oldShopPathArr[0] == '' && oldShopPathArr.length == 1) oldShopPathArr.pop();
            oldShopPathArr.push(shopId);
            const newShopPath = oldShopPathArr.join('>');
            // if (DEBUG) log('[newShopPath] ' + newShopPath)
            // if (DEBUG) log('[newData] ' + Object.keys(newData) + ' ' + Object.values(newData))
            sendBuyItemsForm(pl, updateData(data, { 'shopPath': newShopPath, 'delete': ['prompt'] }));
        } else if (itemType == -2) { // 功能按钮
            const fnid = item.fnid;
            if (fnid === 'otherfn') {
                item.fn(pl, data);
            } else if (fnid === 'exit') {
                item.fn();
            }
        } else if (itemType == 0) { // 未知物品或菜单
            const prompt = Format.Red + '这个物品不可用' + Format.Clear;
            sendBuyItemsForm(pl, updateData(data, { 'prompt': prompt }));
        }
    });
}

function forcDescHandler(desc, obj) {
    if (!obj) return desc;

    let result = desc;
    
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        result = result.replaceAll(`{${keys[i]}}`, obj[keys[i]])
    }
    
    return result;
    // return desc.replace(/{(.*?)}/g, (match, key) => obj[key.trim()]);
}

function getShop(shopPath) {
    return transformItemIdInShop(getShopConfig(shopPathHandler(shopPath)));
}

function transformItemIdInShop(shop) {
    // if (DEBUG) log(`[transformItemIdInShop] ${shop}`)

    // 参数有效性检查
    if (!shop) return null;

    const items = new JsonConfigFile(itemsFilePath);
    const itemsValue = shop['items'].map((itemId) => {
        if (typeof itemId !== 'object') {
            const tmpItem = items.get(itemId);
            const item = new Object;
            Object.assign(item, tmpItem);
            item['itemId'] = itemId;
            return item;
        } else {
            return itemId;
        }
    });
    
    shop['items'] = itemsValue;
    
    return shop;
}

function getShopConfig(arr) { // arr: ['blocks', 'fence'] or [] 遍历后依次读取
    // 参数有效性检查
    if (!Array.isArray(arr) && arr !== undefined) return null;

    const shopFile = new JsonConfigFile(shopFilePath);
    const items = shopFile.get('items');
    let shop;
    if (arr === undefined || arr.length === 0) return {
        'name': shopFile.get('name'),
        'id': shopFile.get('id'),
        'desc': shopFile.get('desc'),
        'items': items
    };

    // 继续遍历
    for (let i = 0; i < arr.length; i++) {
        // console.log(i)
        const length = shop ? shop.items.length : items.length;
        for (let j = 0; j < length; j++) {
            const item = shop ? shop.items[j] : items[j];
            // console.log(`item: ${item}`)
            
            if (typeof item === 'string') {
                continue;
            } else if (typeof item === 'object') {
                if (item.hasOwnProperty('id') && item.id === arr[i]) {
                    if (item.hasOwnProperty('items')) {
                        shop = item;
                        break;
                        // console.log('[shop]')
                        // console.log(shop)
                    }
                }
            }
        }

        if (!shop || shop.id !== arr[i]) {
            log(`[getShop] 找不到元素 ${arr[i]} 在路径 ${arr.join(' > ')}`);
            return null;
        }
    }
    
    return shop;
}

function shopPathHandler(path) { // path 形如: 'blocks > fence'
    if (!path) return [];

    return path.split('>').map((element) => {
        return element.trim();
    });
}

function itemTypeJudge(obj) {
    if (obj === undefined || typeof obj !== 'object') return 0; // 无法通过 ID 获得元素
    
    if (obj.hasOwnProperty('id')) {
        return -1; // 菜单对象
    } else if (obj.hasOwnProperty('fn')) {
        return -2; // 功能按钮
    } else if (obj.hasOwnProperty('nbt')) { // 包含物品NBT，需要通过NBT获取物品
        return 2;
    } else if (obj.hasOwnProperty('type')) {
        if (obj.hasOwnProperty('nbt')) { // 包含物品NBT，需要通过NBT获取物品
            return 2
        } else { // 包含物品类型,需要通过类型获取物品
            return 1;
        }
    } else { // 既没有类型，也没有NBT
        if (DEBUG) log(`${obj['name']} 无类型 无NBT`);
        return 0; // 错误的商品对象
    }
}

function showInBuyShop(obj) {
    const result = !obj.hasOwnProperty('buy') || obj.buy == undefined;
    // if (DEBUG) log(`[showInBuyShop] ${result}`);
    return result;
}

function showInSellShop(obj) {
    const result = !obj.hasOwnProperty('sell') || obj.sell == undefined;
    // if (DEBUG) log(`[showInSellShop] ${result}`);
    return result;
}

function hasIcon(obj) {
    return obj.hasOwnProperty('icon');
}

function getIcon(obj) {
    return obj.icon;
}

// function timestampToDateStr(timestamp) {
//     return new Date(timestamp);
// }

function timestampToDateStr(timestamp) {
    const date = new Date(timestamp);
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    const D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + h + m + s;
}

function getCurrentTimestamp() {
    return Date.now();
}

function dataFileInit() {
    new JsonConfigFile(itemsFilePath, '{}');
    new JsonConfigFile(shopFilePath, '{"name":"主菜单","id":"main","items":[{"name":"二级菜单","id":"items","items":[]}]}');
    new JsonConfigFile(hotFilePath, '{"data":{}}');
    new JsonConfigFile(avgPriceFilePath, '{}');
    // new JsonConfigFile(mapFilePath, '{"recipts":{}}');
    // new JsonConfigFile(reciptsFilePath, '{}');
    // new JsonConfigFile(cartFilePath, '{}');

    const db1 = new KVDatabase(reciptMapDatabasePath);
    const db2 = new KVDatabase(reciptsDatabasePath);
    const db3 = new KVDatabase(cartDatabasePath);
    db1.close();
    db2.close();
    db3.close();
}

function buildNameItemidMap() {
    const itemsFile = new JsonConfigFile(itemsFilePath);
    const items = JSON.parse(itemsFile.read());
    let name2itemid = new Object;

    for (let key in items) {
        const item = items[key];
        const itemName = item.name;
        const itemNameZh = item.name_zh;
        
        if (!name2itemid[itemName]) {
            name2itemid[itemName] = key;
        } else {
            name2itemid[`${itemName}.${key}`] = key;
        }

        if (!name2itemid[itemNameZh]) {
            name2itemid[itemNameZh] = key;
        } else {
            name2itemid[`${itemNameZh}.${key}`] = key;
        }
    }

    return name2itemid;
}

function buildTypeItemidMap() {
    const itemsFile = new JsonConfigFile(itemsFilePath);
    const items = JSON.parse(itemsFile.read());
    let type2itemid = new Object;

    for (let key in items) {
        const item = items[key];
        const itemType = item.type;
        const itemAux = item.aux;
        
        if (!type2itemid[itemType]) {
            type2itemid[itemType] = key; // "minecraft:apple": "10000"
        } else if (itemAux && !type2itemid[`${itemType}.${itemAux}`]) {
            type2itemid[`${itemType}.${itemAux}`] = key; // "minecraft:apple.2": "10000"
        } else {
            type2itemid[`${itemType}.${key}`] = key; // "minecraft:apple.10000": "10000"
        }
    }

    return type2itemid;
}

function generateRandomString(num) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < num; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function logCurrentTime(label) {
    log(`${label ? '[' + label + '] ' : ''}${Date.now() % 10000}`);
}