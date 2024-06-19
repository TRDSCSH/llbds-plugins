// 命令注册
mc.regPlayerCmd("rss", "获取 RSS Feeds", mainMenu);

// 常量与全局变量
const { parse } = require('rss-to-json');
const playerDataPath = "plugins/rss-reader/playerData.json";
const elementLabelMap = {
    title: "标题",
    description: "描述",
    created: "创建时间",
    published: "发布时间",
    link: "链接",
    content: "内容",
    content_encoded: "内容（编码）",
    category: "分类",
    enclosures: "附件",
    media: "媒体",
    id: "ID",
    author: "作者"
};
const defaultLabelFormat = "§7［§r %% §7］§r\n";
const defaultContentFormat = "%%";
const defaultIndent = 2;
const redFont = "§c";
const greenFont = "§a";
const grayFont = "§7";
const loadingDots = ["▁", "▂", "▃", "▄", "▄", "▅", "▅", "▆", "▆", "▇", "█", "█", "█", "█", "█", "▇", "▆", "▅", "▄", "▃", "▃", "▂", "▂", "▁", "▁", "▁"];
const itemCountLimit = 80;
let loadingDotsIndex = 0;
let timerIsUsing = 0;
let timerID = null;

// 界面函数
function mainMenu(pl, text) {
    let funcData = [Array.from(arguments), arguments.callee.name];
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(pl.xuid);
    if (myData == null) {
        myData = new Array();
        playerData.set(pl.xuid, myData);
    }
    if (text == null) text = "";
    let rssCount = myData.length;
    let content = (text == "") ? ((rssCount != 0) ? `已添加 ${rssCount} 个订阅\n` : "还没有添加任何 RSS 订阅") : `${text}`;

    let form = mc.newSimpleForm()
        .setTitle("RSS 订阅")
        .setContent(content)
        .addButton("§r[ 添加 RSS ]"); // id: 0

    
    if (myData.length != 0) form.addButton("§r[ 管理 RSS ]"); // id: 1

    for (let i = 0; i < rssCount; i++) {
        form.addButton(myData[i]["title"]); // id: 2 ~ 2 + rssCount - 1
    }

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            switch (data) {
                case 0:
                    addSource(pl, "", "", funcData);
                    break;
                case 1:
                    manageRss(pl);
                    break;
                default:
                    getRssFeedFromURL(pl, myData[data - 2]["url"], (rss) => {
                        viewRss(pl, rss, data - 2, null, funcData);
                    }, funcData);
            }
        } else {

        }
    });
}

function manageRss(pl) {
    let form = mc.newSimpleForm()
        .setTitle("管理 RSS")
        .setContent(`管理 ${pl.realName} 的 RSS 订阅`)
        .addButton("§r[ < 返回 ]") // id: 0
        .addButton("§r[ 删除 RSS ]") // id: 1
        .addButton("§r[ 修改 RSS 显示格式 ]"); // id: 2

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            switch (data) {
                case 0:
                    mainMenu(pl);
                    break;
                case 1:
                    deleteSource(pl);
                    break;
                case 2:
                    selectRSS(pl, pl.xuid);
            }
        } else {
            mainMenu(pl);
        }
    });
}

function selectRSS(pl, xuid) {
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(xuid);
    let rssCount = myData.length;
    let form = mc.newSimpleForm()
        .setTitle("修改 RSS")
        .setContent(`选择将要修改的 RSS 订阅`)
        .addButton("§r[ < 返回 ]"); // id: 0

    for (let i = 0; i < rssCount; i++) {
        form.addButton(myData[i]["title"]); // id: 1 ~ rssCount
    }

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            switch (data) {
                case 0:
                    manageRss(pl);
                    break;
                default:
                    modifyElementVisibility(pl, xuid, data - 1);
            }
        } else {
            mainMenu(pl);
        }
    });
}

function modifyElementVisibility(pl, xuid, rssIndex, text) {
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(xuid);
    let helElement = myData[rssIndex]["hel"];
    let headerElement = new Array();
    let ielElement = myData[rssIndex]["iel"];
    let itemElement = new Array();
    if (text == null) text = "";
    for (let i = 0; i < myData[rssIndex]["hef"].length; i++) headerElement.push(myData[rssIndex]["hef"][i][0]);
    for (let i = 0; i < myData[rssIndex]["itf"].length; i++) itemElement.push(myData[rssIndex]["itf"][i][0]);
    for (let i = 0; i < helElement.length; i++) { // 合并 hel 和 hef 的元素，并去除重复元素
        if (headerElement.indexOf(helElement[i]) == -1) {
            headerElement.push(helElement[i]);
        }
    }
    for (let i = 0; i < ielElement.length; i++) {
        if (itemElement.indexOf(ielElement[i]) == -1) {
            itemElement.push(ielElement[i]);
        }
    }

    let form = mc.newCustomForm()
        .setTitle(`编辑 “${myData[rssIndex]["title"]}” 的显示元素`);

    form.addLabel("[ 开头元素 ]"); // id: 0
    let startH = 1, endH = headerElement.length + 1;
    let startI = endH + 1, endI = startI + itemElement.length;
    let sliderId = endI;
    for (let i = 0; i < headerElement.length; i++) { // id: 1 ~ headerElement.length
        form.addSwitch(headerElement[i], myData[rssIndex]["hel"].indexOf(headerElement[i]) == -1/* 在数组hel中能否找到元素名称 */);
    }
    form.addLabel("[ 内容元素 ]"); // id: headerElement.length + 1
    for (let i = 0; i < itemElement.length; i++) { // id: headerElement.length + 2 ~ headerElement.length + 2 + itemElement.length - 1
        form.addSwitch(itemElement[i], myData[rssIndex]["iel"].indexOf(itemElement[i]) == -1);
    }
    form.addStepSlider(text + "\n\n点击“提交”按钮后", ["保存设置", "跳转到显示格式设置", "保存设置并跳转到显示格式设置"]); // id: headerElement.length + 2 + itemElement.length

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            // 将开头元素与内容元素的改变过的到同一个数组中
            let changedList = [[new Array(), new Array()], [new Array(), new Array()]];
            let isFoundinExclusionList = false;
            for (let i = startH; i < endH; i++) {
                isFoundinExclusionList = myData[rssIndex]["hel"].indexOf(headerElement[i - startH]) != -1;
                if (data[i] == isFoundinExclusionList) { // 判定元素是否被改变
                    if (data[i] == true) { // 需要从排除列表中移除
                        changedList[0][0].push(headerElement[i - startH]);
                    } else { // 需要添加到排除列表中
                        changedList[0][1].push(headerElement[i - startH]);
                    }
                }
            }
            for (let i = startI; i < endI; i++) {
                isFoundinExclusionList = myData[rssIndex]["iel"].indexOf(itemElement[i - startI]) != -1;
                if (data[i] == isFoundinExclusionList) {
                    if (data[i] == true) {
                        changedList[1][0].push(itemElement[i - startI]);
                    } else {
                        changedList[1][1].push(itemElement[i - startI]);
                    }
                }
            }
            switch (data[sliderId]) {
                case 0:
                    saveList(pl, xuid, rssIndex, changedList, false);
                    break;
                case 1:
                    modifyElementFormat(pl, xuid, rssIndex);
                    break;
                case 2:
                    saveList(pl, xuid, rssIndex, changedList, true);
            }
        } else {
            selectRSS(pl, xuid);
        }
    });
}

function modifyElementFormat(pl, xuid, rssIndex, message, dropdownData, switchStatus, input1, input2) {
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(xuid);
    if (dropdownData == null) dropdownData = 0;
    if (message == null) message = "";
    if (switchStatus == null) switchStatus = true;
    if (input1 == null) input1 = "";
    if (input2 == null) input2 = "";
    let allElement = new Array();
    for (let i = 0; i < myData[rssIndex]["hef"].length; i++) allElement.push("[开头元素] " + myData[rssIndex]["hef"][i][0]);
    for (let i = 0; i < myData[rssIndex]["itf"].length; i++) allElement.push("[Items元素] " + myData[rssIndex]["itf"][i][0]);

    let form = mc.newCustomForm()
        .setTitle(`编辑 “${myData[rssIndex]["title"]}” 的显示格式`)
        .addDropdown("请选择要编辑的元素", allElement, dropdownData) // id: 0
        .addSwitch("显示标签", switchStatus) // id: 1
        .addInput("标签格式", `使用'%%%%'代替标签名称，留空则使用默认格式`, input1) // id: 2
        .addInput("内容格式", `使用'%%%%'代替内容，留空则使用默认格式`, input2) // id: 3
        .addStepSlider(message + "\n\n点击“提交”按钮后", ["保存设置", "跳转到显示元素设置", "保存设置并跳转到显示元素设置"]); // id: 4

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            let index = data[0];
            let isHeader = index < myData[rssIndex]["hef"].length;
            let element = isHeader ? myData[rssIndex]["hef"][index][0] : myData[rssIndex]["itf"][index - myData[rssIndex]["hef"].length][0];
            let itemIndex = isHeader ? index : index - myData[rssIndex]["hef"].length;
            let isShowLabel = data[1];
            let labelFormat = replaceNewLine(data[2]);
            let contentFormat = replaceNewLine(data[3]);
            if (labelFormat == "") labelFormat = null;
            if (contentFormat == "") contentFormat = null;
            switch (data[4]) {
                case 0:
                    saveFormat(pl, xuid, rssIndex, itemIndex, isHeader, isShowLabel, labelFormat, contentFormat);
                    modifyElementFormat(pl, xuid, rssIndex, "[提示] §a保存成功§r", data[0], isShowLabel, labelFormat, contentFormat);
                    break;
                case 1:
                    modifyElementVisibility(pl, xuid, rssIndex);
                    break;
                case 2:
                    saveFormat(pl, xuid, rssIndex, itemIndex, isHeader, isShowLabel, labelFormat, contentFormat);
                    modifyElementVisibility(pl, xuid, rssIndex, "[提示] §a保存成功§r");
            }
        } else {
            selectRSS(pl, xuid);
        }
    });
}

function deleteSource(pl, message) {
    if (message == null) message = "§7请将要删除订阅源的开关切换为开启, 然后点击“提交”按钮以删除选中的订阅";
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(pl.xuid);
    let rssCount = myData.length;
    let form = mc.newCustomForm()
        .setTitle("删除 RSS")
        .addLabel(`删除 ${pl.realName} 的 RSS 订阅\n\n${message}`)

    for (let i = 0; i < rssCount; i++) {
        form.addSwitch(myData[i]["title"]); // id: 1 ~ rssCount
    }

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            let deleteList = new Array();
            for (let i = 0; i < rssCount; i++) {
                if (data[i + 1] == true) {
                    deleteList.push(i);
                }
            }
            if (deleteList.length == 0) {
                deleteSource(pl);
                return;
            }
            deleteSourceConfirm(pl, pl.xuid, deleteList);
        } else {
            manageRss(pl);
        }
    });
}

function deleteSourceConfirm(pl, xuid, deleteList) { // deleteList: [数组]存储需要删除的序号
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(xuid);
    let nameListString = "";
    for (let i = 0; i < deleteList.length; i++) {
        nameListString += `§7[#${deleteList[i]}]§r ${myData[deleteList[i]]["title"]}\n`;
    }
    let form = mc.newSimpleForm()
        .setTitle("删除确认")
        .setContent(`确认删除以下订阅源吗？\n\n${nameListString}`)
        .addButton("[ 返回 ]") // id: 0
        .addButton(redFont + "[ 确认 ]"); // id: 1

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            switch (data) {
                case 0:
                    deleteSource(pl);
                    break;
                case 1:
                    for (let i = deleteList.length - 1; i >= 0; i--) {
                        myData.splice(deleteList[i], 1);
                    }
                    playerData.set(xuid, myData);
                    if (myData.length == 0) {
                        mainMenu(pl, "[提示] 已删除所有订阅");
                    } else {
                        deleteSource(pl, `[提示] 已删除 ${deleteList.length} 个订阅`);
                    }
            }
        } else {
            deleteSource(pl);
        }
    });
}

function jumpToPage(prevFuncData) { // 跳转到指定页码，适用于 viewRss 函数
    if (prevFuncData[1] != "viewRss") return;
    let maxPage = Math.ceil(prevFuncData[0][1].items.length / itemCountLimit);
    let pl = prevFuncData[0][0];

    let form = mc.newCustomForm()
        .setTitle("页码跳转")
        .addSlider(`滑动下方滑块以选择将要跳转的页码\n\n页码`, 1, maxPage, 1, 1);

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            viewRss(pl, prevFuncData[0][1], prevFuncData[0][2], data[0], prevFuncData);
        } else {
            if (prevFuncData[1] == "viewRss") {
                viewRss(pl, prevFuncData[0][1], prevFuncData[0][2], prevFuncData[0][3], prevFuncData[0][4]);
            }
        }
    });
}

function viewRss(pl, rss, index, page, prevFuncData) {
    let funcData = [Array.from(arguments), arguments.callee.name];
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(pl.xuid);
    let hel = myData[index]["hel"];
    let hef = myData[index]["hef"];
    let allContent = "";
    let form = mc.newSimpleForm()
        .setTitle(`${rss.title}`)
        .addButton("§r[ < 返回 ]"); // id: 0

    if (page == null) page = 1;
    let maxPage = Math.ceil(rss.items.length / itemCountLimit);
    if (page > maxPage) page = maxPage;
    let start = (page - 1) * itemCountLimit;
    let end = page * itemCountLimit;
    if (end > rss.items.length) end = rss.items.length;
    if (maxPage > 1) form.addButton(`§r[ 页码 ${page} / ${maxPage} ]`); // (id: 1)
    arguments[3] = page;
    for (let i = start; i < end; i++) {
        form.addButton(`${rss.items[i].title}`);
    }

    for (let i = 0; i < hef.length; i++) { // 先判断hef[i]是否存在于排除列表hel中，再判断是否显示
        elementName = hef[i][0];
        if (hel.indexOf(elementName) == -1) { // 获取配置
            showLabel = hef[i][1];
            labelFormat = hef[i][2];
            contentFormat = hef[i][3];
            if (showLabel == null) showLabel = 1;
            if (contentFormat == null) contentFormat = defaultContentFormat;

            content = rss[elementName];
            content = stringifyContent(content); // 将数组或对象转换为字符串
            if (elementName == "created" || elementName == "updated" || elementName == "published") { // 时间戳转换
                content = timestampToLocalString(content);
            }
            content = replaceBetweenPercentSigns(contentFormat, content);

            if (showLabel) {
                if (labelFormat == null) labelFormat = defaultLabelFormat;
                if (elementLabelMap[elementName]) elementName = elementLabelMap[elementName];
                label = replaceBetweenPercentSigns(labelFormat, elementName);
                allContent += label + content + "\n\n";
            } else {
                allContent += content + "\n\n";
            }
        }
    }
    form.setContent(allContent);

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            switch (data) {
                case 0:
                    mainMenu(pl, null);
                    break;
                default:
                    if (maxPage > 1) { // 存在"跳转页码"按钮
                        if (data == 1) {
                            jumpToPage(funcData);
                            return;
                        } else {
                            viewRssItem(pl, rss.items[start + data - 2], funcData);
                        }
                    } else {
                        viewRssItem(pl, rss.items[start + data - 1], funcData);
                    }
            }
        } else {
            mainMenu(pl, null);
        }
    });
}

function viewRssItem(pl, item, prevFuncData) {
    let form = mc.newCustomForm()
        .setTitle(prevFuncData[0][1].title + " - 详细内容")

    // 根据json文件中的设置来显示内容
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(pl.xuid);
    let index = prevFuncData[0][2];
    let iel = myData[index]["iel"];
    let itf = myData[index]["itf"];
    let elementName, showLabel, labelFormat, contentFormat, label, content;
    
    for (let i = 0; i < itf.length; i++) { // 先判断itf[i]是否存在于排除列表iel中，再判断是否显示
        elementName = itf[i][0];
        if (iel.indexOf(elementName) == -1) {
            // 获取配置
            showLabel = itf[i][1];
            labelFormat = itf[i][2];
            contentFormat = itf[i][3];
            if (showLabel == null) showLabel = 1;
            if (contentFormat == null) contentFormat = defaultContentFormat;

            content = item[elementName];
            content = stringifyContent(content);
            if (elementName == "created" || elementName == "updated" || elementName == "published") {
                content = timestampToLocalString(content);
            }
            content = replaceBetweenPercentSigns(contentFormat, content);

            if (showLabel) {
                if (labelFormat == null) labelFormat = defaultLabelFormat;
                if (elementLabelMap[elementName]) elementName = elementLabelMap[elementName];
                label = replaceBetweenPercentSigns(labelFormat, elementName);
                form.addLabel(label + content);
            } else {
                form.addLabel(content);
            }
        }
    }

    pl.sendForm(form, (pl, data) => {
        viewRss(pl, prevFuncData[0][1], index, prevFuncData[0][3], prevFuncData);
    });
}

function addSource(pl, label, inputedText, prevFuncData) { // label: 提示信息 | inputedText: 输入框中的文本
    if (valueNotProvided(label)) label = arguments[1] = "";
    if (valueNotProvided(inputedText)) inputedText = arguments[2] = "";
    if (valueNotProvided(prevFuncData)) prevFuncData = arguments[3] = new Array();

    let form = mc.newCustomForm()
        .setTitle("添加 RSS")
        .addInput("在下面文本框中输入RSS地址", "链接过长？输入§l0§r然后点击“提交”按钮来分段输入", inputedText) // id: 0
        .addLabel(label);

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            inputedText = data[0];
            let funcData = [Array.from(arguments), arguments.callee.name];
            if (data[0] == "0") {
                selectInputCount(pl, funcData);
            } else if (isBlank(data[0])) {
                addSource(pl, "§c请输入RSS地址", "", prevFuncData);
            } else {
                var rss;
                getRssFeedFromURL(pl, data[0], (rss) => {
                    addSource(pl, '成功: ' + rss.title, data[0], funcData);
                    saveToFile(pl.xuid, rss, data[0]);
                }, funcData);
            }
        } else {
            mainMenu(pl);
        }
    });
}

function selectInputCount(pl, prevFuncData) {
    let form = mc.newCustomForm()
        .setTitle("自定义输入框数量")
        .addSlider("输入框数量", 2, 20, 1, 1); // id: 0

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            addMutiSource(pl, "", data[0], "", prevFuncData);
        } else {
            // todo: 玩家关闭了表单, 返回上一级
            if (prevFuncData[1] == "addSource") {
                addSource(pl, prevFuncData[0][1], prevFuncData[0][2], prevFuncData[0][3]);
            }
        }
    });
}

function addMutiSource(pl, label, inputCount, inputedText, prevFuncData) { // label: 提示信息 | inputCount: 文本框数量 | inputedText: [数组]输入框中的文本
    if (valueNotProvided(label)) label = arguments[1] = "";
    if (valueNotProvided(inputCount)) inputCount = arguments[2] = 2;
    if (valueNotProvided(inputedText)) {
        inputedText = arguments[3] = new Array(inputCount);
        for (let i = 0; i < inputCount; i++) {
            inputedText[i] = "";
        }
    }
    if (valueNotProvided(prevFuncData)) prevFuncData = arguments[4] = new Array();

    let form = mc.newCustomForm()
        .setTitle("添加 RSS")
        .addLabel("请在下面的输入框中分段输入 RSS 地址，每个输入框最多输入 §l100§r 个字符。"); // id: 0

    for (let i = 1; i <= inputCount; i++) {
        form.addInput(`${grayFont}[${i}]`, `第 ${i} 段`, inputedText[i - 1]); // id: 1 ~ inputCount
    }

    form.addLabel(label);

    pl.sendForm(form, (pl, data) => {
        if (data != null) {
            let rss, url = "";
            for (let i = 1; i <= inputCount; i++) {
                url += data[i];
            }
            if (!isBlank(url)) {
                for (let i = 1; i <= inputCount; i++) {
                    inputedText[i - 1] = data[i];
                }
                let funcData = [Array.from(arguments), arguments.callee.name];
                getRssFeedFromURL(pl, url, (rss) => {
                    addMutiSource(pl, '成功: ' + rss.title, inputCount, inputedText, funcData);
                    saveToFile(pl.xuid, rss, url);
                }, funcData);
            } else {
                addMutiSource(pl, "§c请输入RSS地址", inputCount, inputedText, prevFuncData);
            }
        } else {
            mainMenu(pl);
        }
    });
}

// 功能函数
async function getRssFeedFromURL(pl, url, callback, prevFuncData) {
    try {
        pl.addTag("isGettingRss");
        enableTimer();
        timerIsUsing++;
        let rss = await parse(url);
        if (isOnline(pl)) callback(rss);
        timerIsUsing--;
        disableTimer();
        pl.removeTag("isGettingRss");
    } catch (err) {
        timerIsUsing--;
        disableTimer();
        pl.removeTag("isGettingRss");
        if (prevFuncData[1] == "addSource") {
            addSource(pl, '获取 RSS 时发生错误: ' + redFont + err.code, prevFuncData[0][2], prevFuncData);
        } else if (prevFuncData[1] == "addMutiSource") {
            addMutiSource(pl, '获取 RSS 时发生错误: ' + redFont + err.code, prevFuncData[0][2], prevFuncData[0][3], prevFuncData);
        } else if (prevFuncData[1] == "mainMenu") {
            mainMenu(pl, '\n获取 RSS 时发生错误: ' + redFont + err.code, prevFuncData);
        }
    }
}

function isOnline(pl) {
    let onlinePlayers = mc.getOnlinePlayers();
    for (let i = 0; i < onlinePlayers.length; i++) {
        if (onlinePlayers[i].xuid == pl.xuid) return true;
    }
    return false;
}

function saveList(pl, xuid, rssIndex, changedList, jumpToFormat) {
    if (changedList == null || rssIndex == null) return;
    if (jumpToFormat == null) jumpToFormat = false;
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(xuid);
    if (rssIndex >= myData.length) return;

    for (let i = 0; i < changedList.length; i++) {
        for (let j = 0; j < changedList[i].length; j++) {
            for (let k = 0; k < changedList[i][j].length; k++) {
                if (j == 0) {
                    myData[rssIndex][i == 0 ? "hel" : "iel"].splice(myData[rssIndex][i == 0 ? "hel" : "iel"].indexOf(changedList[i][j][k]), 1);
                    // 判断 hef[i] 或 itf[i] 中是否有该元素，如果无则添加，如果有则不添加
                    for (let l = 0; l < myData[rssIndex][i == 0 ? "hef" : "itf"].length; l++) {
                        if (myData[rssIndex][i == 0 ? "hef" : "itf"][l][0] == changedList[i][j][k]) {
                            break;
                        } else if (l == myData[rssIndex][i == 0 ? "hef" : "itf"].length - 1) {
                            myData[rssIndex][i == 0 ? "hef" : "itf"].push([changedList[i][j][k], 1, null, null]);
                        }
                    }
                } else {
                    // 将元素添加到排除列表中，并将 hef[i] 或 itf[i] 中的该元素所在的数组移到最后
                    myData[rssIndex][i == 0 ? "hel" : "iel"].push(changedList[i][j][k]);
                    for (let l = 0; l < myData[rssIndex][i == 0 ? "hef" : "itf"].length; l++) {
                        if (myData[rssIndex][i == 0 ? "hef" : "itf"][l][0] == changedList[i][j][k]) {
                            myData[rssIndex][i == 0 ? "hef" : "itf"].push(myData[rssIndex][i == 0 ? "hef" : "itf"].splice(l, 1)[0]);
                            break;
                        }
                    }
                }
            }
        }
    }

    playerData.set(xuid, myData);

    if (jumpToFormat) {
        modifyElementFormat(pl, xuid, rssIndex, "[提示] §a保存成功§r");
    } else {
        modifyElementVisibility(pl, xuid, rssIndex, "[提示] §a保存成功§r");
    }
}

function saveFormat(pl, xuid, rssIndex, itemIndex, isHeader, isShowLabel, labelFormat, contentFormat) {
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(xuid);
    myData[rssIndex][isHeader ? "hef" : "itf"][itemIndex][1] = isShowLabel;
    myData[rssIndex][isHeader ? "hef" : "itf"][itemIndex][2] = labelFormat;
    myData[rssIndex][isHeader ? "hef" : "itf"][itemIndex][3] = contentFormat;
    playerData.set(xuid, myData);
}

function replaceNewLine(str) {
    return str.replace(/\\n/g, "\n");
}

function saveToFile(xuid, rss, url) {
    let playerData = new JsonConfigFile(playerDataPath);
    let myData = playerData.get(xuid);
    if (myData == null) myData = new Array();
    let rssCount = myData.length;
    let rssIndex = -1;

    for (let i = 0; i < rssCount; i++) { // 遍历myData数组，寻找是否已经存在该RSS
        if (myData[i]["url"] == url) {
            rssIndex = i;
            break;
        }
    }

    if (rssIndex != -1) { // 存在该订阅时仅更新标题
        if (myData[rssIndex]["title"] != rss.title) myData[rssIndex]["title"] = rss.title;
    } else {
        let hel = new Array(); // hel: 开头元素排除列表
        let iel = new Array(); // iel: Items元素排除列表
        let hef = new Array(); // hef: 开头元素显示格式
        let itf = new Array(); // itf: Items元素显示格式

        for (let key in rss) {
            if (key != "description") {
                hel.push(key);
            } else {
                let showLabel = 1;
                let labelFormat = null; // null: 使用默认格式
                let contentFormat = null;
                if (key == "title" || key == "description") showLabel = 0;
                if (key == "title") contentFormat = "§l%%§r";

                hef.push([key, showLabel, labelFormat, contentFormat]);
            }
        }

        let rssItems = rss["items"][0];
        for (let key in rssItems) {
            if (key != "title" && key != "description" && key != "link" && key != "published") {
                iel.push(key);
            } else {
                let showLabel = 1;
                let labelFormat = null;
                let contentFormat = null;
                if (key == "title" || key == "description") showLabel = 0;
                if (key == "title") contentFormat = "§l%%§r";

                itf.push([key, showLabel, labelFormat, contentFormat]);
            }
        }

        myData.push({
            "title": rss.title,
            "url": url,
            "hel": hel,
            "hef": hef,
            "iel": iel,
            "itf": itf
        });
    }

    playerData.set(xuid, myData);
}

function wrapTags(str) {
    return str.replace(/<[^>]+>/g, function (match) {
        return '§7' + match + '§r';
    });
}

function stringifyContent(content) {
    let type = varType(content);
    if (type == "string") {
        return wrapTags(content);
    } else if (type == "array") {
        return wrapTags(greyOut(JSON.stringify(content, null, defaultIndent)));
    } else if (type == "object") {
        return wrapTags(greyOut(JSON.stringify(content, null, defaultIndent)));
    } else {
        return content;
    }
}

function greyOut(str) {
    str = str.replace(/[\{\}\[\],"]/g, function (match) {
        switch (match) {
            case '{':
                return '§7{§r';
            case '}':
                return '§7}§r';
            case '[':
                return '§7[§r';
            case ']':
                return '§7]§r';
            case ',':
                return '§7,§r';
            case '"':
                return '§7"§r';
            default:
                return match;
        }
    });
    return str;
}

function varType(varName) {
    if (typeof (varName) == "string") {
        return "string";
    } else if (typeof (varName) == "object") {
        if (varName instanceof Array) {
            return "array";
        } else if (varName instanceof Object) {
            return "object";
        } else {
            return "other";
        }
    } else {
        return "other";
    }
}

function replaceBetweenPercentSigns(format, content) { /* 替换字符串中所有百分号之间的内容 */
    return format.replace(/%.*?%/g, content);
}

function timestampToLocalString(timestamp) { /* 时间戳转换为本地时间并格式化输出 */
    // 创建一个Date对象
    let date = new Date(timestamp);
    let result = "";
    // 获取本地日期字符串
    let dateString = date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    // 获取本地时间字符串
    let timeString = date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
    // 拼接并返回结果
    result = dateString + " " + timeString;
    if (result == "Invalid Date Invalid Date") result = timestamp;
    return result;
}

function valueNotProvided(varible) { /* 判断值是否未提供 */
    return varible == null || varible == undefined || varible.length == 0;
}

function isBlank(str) {
    if (typeof str !== "string") return false;
    for (let i = 0; i < str.length; i++) if (str[i] !== " ") return false;
    return true;
}

function showLoadingInfo() {
    mc.runcmdEx("title @a[tag=isGettingRss] actionbar " + loadingDots[loadingDotsIndex] + " 正在获取RSS");
}

function timer() {
    loadingDotsIndex++;
    if (loadingDotsIndex >= loadingDots.length) loadingDotsIndex = 0;
    showLoadingInfo()
}

function enableTimer() {
    if (timerID == null) timerID = setInterval(timer, 50);
}

function disableTimer() {
    if (timerID != null && timerIsUsing == 0) {
        clearInterval(timerID);
        timerID = null;
    }
}