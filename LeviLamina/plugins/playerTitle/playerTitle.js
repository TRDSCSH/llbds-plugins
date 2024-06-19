//命令注册
mc.regPlayerCmd("mytitle", "§r选择称号", titleOfPlayers);

//文件路径
const titleFilePath = "plugins/playerTitle/ch.json";

// 函数
function titleOfPlayers(player) {
    let chData = new JsonConfigFile(titleFilePath);
    let titleSelector = mc.newSimpleForm();
    titleSelector.setTitle("请选择称号");
    if (chData.get(player.realName) != undefined) {
        titleSelector.setContent(`当前有 ${chData.get(player.realName).length - 2} 个称号`);// 一个数字 一个留空
        for (var i = 1; i < chData.get(player.realName).length; i++) {
            let t = chData.get(player.realName)[i];
            if (t == "") {
                t = "(无称号)";
            }
            if (chData.get(player.realName)[0] == i) {
                t = `§e> §r§l ${t} §r§e <§r`;
            }
            titleSelector.addButton(t);
        }
        player.sendForm(titleSelector, (player, id) => {
            if (id != null) {
                let tempArr;
                switch (id) {
                    case id:
                        tempArr = chData.get(player.realName);
                        tempArr.splice(0, 1, id + 1);
                        chData.set(player.realName, tempArr);
                        player.tell(`称号已切换为 ${chData.get(player.realName)[id + 1]}`);
                    // tempArr.push("test");
                }
            }
        });
    } else {
        titleSelector.setContent("当前还没有称号");
        player.sendForm(titleSelector, (player) => {
            chData.set(player.realName, [1, "", "到此一游"]);    // 设置key
        });
    }
}