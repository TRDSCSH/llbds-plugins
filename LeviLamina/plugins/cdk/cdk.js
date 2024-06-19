const cdkFilePath = "plugins/cdk/cdk.json";
const usedCdkFilePath = "plugins/cdk/usedCdk.json";
const titleFilePath = "plugins/playerTitle/ch.json";

function main(pl, content, cdk) {
    const mainForm = mc.newCustomForm();
    mainForm.setTitle("兑换");
    mainForm.addInput(content || "输入你的兑换码", "在这里输入 CDK", cdk || "");
    pl.sendForm(mainForm, (pl, data) => {
        if (data != null) {
            const cdk = data[0];
            if (cdk == "") {
                main(pl, "请在下面输入框中输入你的兑换码后提交", "");
                return;
            }
            redeem(pl, cdk);
        }
    })
}

/*
    plugins/cdk/cdk.json
    {
        "1234": [
            "这是示例兑换码，这句话将会在兑换成功后显示",
            {
                "type": 0,  // 0: 称号   1: coin   2: item
                "value": "到此一游"
            },
            {
                "type": 1,
                "value": 100
            },
            {
                "type": 2,
                "value": "<itemSnbt>" // 示例：'{"Count":1b,"Damage":0s,"Name":"minecraft:stick","WasPickedUp":0b,"tag":{"display":{"Name":"§l§gNbt Stick§r"},"ench":[{"id":0s,"lvl":0s}]}}'
            }
        ]
    }

    plugins/cdk/usedCdk.json
    {
        "1234": [
            "playerXuid"
        ]
    }
*/

function redeem(player, cdk) {
    const codes = new JsonConfigFile(cdkFilePath);
    const used = new JsonConfigFile(usedCdkFilePath);
    const cdkData = codes.get(cdk);
    if (cdkData) {
        let usedPlayers = used.get(cdk);
        if (usedPlayers) {
            if (usedPlayers.includes(player.xuid)) {
                main(player, "§c你已经使用过这个兑换码了§r", cdk);
                return;
            }
        }
        const len = cdkData.length;
        let resultText = `§a兑换成功！§r\n\n得到了以下的 ${len - 1} 个奖励:\n`;
        for (let i = 1; i < len; i++) {
            const type = cdkData[i].type;
            const value = cdkData[i].value;
            if (type == 0) { // 0: 称号    1: coin    2: item
                const chData = new JsonConfigFile(titleFilePath);
                if (chData.get(player.realName) == undefined) {
                    chData.set(player.realName, [1, "", value]);
                } else {
                    let titleArr = chData.get(player.realName);
                    const len = titleArr.length;
                    if (titleArr.indexOf(value) == -1) {
                        titleArr[len] = value;
                        chData.set(player.realName, titleArr);
                    }
                }
                resultText += `  §7${i}. [称号]§r ${value}\n`;
            } else if (type == 1) {
                money.add(player.xuid, value);
                resultText += `  §7${i}. §7[§6金币§7]§r ${value}\n`;
            } else if (type == 2) {
                const itemNbt = NBT.parseSNBT(value);
                const item = mc.newItem(itemNbt);
                const name = itemNbt.getTag("tag") ? (itemNbt.getTag("tag").getTag("display") ? (itemNbt.getTag("tag").getTag("display").getTag("Name") ? (itemNbt.getTag("tag").getTag("display").getTag("Name").get()) : null) : null) : null;
                const type = itemNbt.getTag("Name").get().replace("minecraft:", "");
                const count = itemNbt.getTag("Count").get();
                player.giveItem(item);
                // resultText += `  §7${i}. [物品]§r`
                resultText += `  §7${i}.§r §7[物品]§r ${(name ? name + "§7(" + type + ")§r" : name) || type} * ${count}\n`;
            }
        }
        resultText += "\n\n§r" + cdkData[0];
        markAsUsed(cdk, player.xuid);
        main(player, resultText, null);
    } else {
        main(player, "§c兑换码无效§r", cdk);
    }
}

function markAsUsed(cdk, xuid) {
    const used = new JsonConfigFile(usedCdkFilePath);
    let usedCdkPlayers = used.get(cdk);
    if (usedCdkPlayers != null) {
        usedCdkPlayers.push(xuid);
    } else {
        usedCdkPlayers = [xuid];
    }
    used.set(cdk, usedCdkPlayers);
}

// 命令注册
mc.listen("onServerStarted", () => {
    let cdkCmd = mc.newCommand("cdk", "兑换一些东西", PermType.Any);
    cdkCmd.optional("cdk", ParamType.String);
    cdkCmd.overload(["cdk"]);
    cdkCmd.setCallback((cmd, origin, output, results) => {
        switch (origin.type) {
            case 0:
                main(origin.player, null, results.cdk || null);
                break;
        }
    });
    cdkCmd.setup();
});

