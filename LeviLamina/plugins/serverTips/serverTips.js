const tips = [
    "你可以通过输入 §6/cd§r 命令来查看菜单",
    "告示牌可以使用§b蜜脾§r涂蜡，涂蜡后的告示牌无法再进行编辑",
    "本服装载了 iLand 插件，你可以使用 §6/land new§r 命令来创建领地",
    "每2秒可以获得1个金币",
    "你可以使用 §6/rename§r 命令来重命名手上的物品",
    "你可以使用 §6/tpa§r 命令请求传送到其他玩家的位置",
    "使用 §6/back§r 命令可以回到上一次的死亡点",
    "使用 §6/home set [家的名称]§r 命令可以设置家",
    "使用 §6/liuyan§r 命令可以给离线的玩家留言",
    "拿着钟§6长按/右键§r即可显示菜单",
    "为好友添加领地信任后，即可让好友在你的领地内飞行"
];

mc.listen("onJoin", (pl) => {
    const id = Math.floor(Math.random() * tips.length);
    pl.tell(`§3§l[ TIP ]§r ` + tips[id]);
});

// 命令注册
mc.regPlayerCmd("tip", "§r获取一条建议", (pl, args) => {
    let tipIdList = [];
    if (args.length > 0) {
        for (let i = 0; i < args.length; i++) {
            const id = parseInt(args[i]);
            // log(typeof(id))
            // log(id)
            // if (typeof(id) === "number") {
            tipIdList.push(id);
            // }
        }
    }
    if (tipIdList.length === 0) {
        const id = Math.floor(Math.random() * tips.length);
        pl.tell(`§3[ 提示 ]§r ` + tips[id]);
    } else {
        pl.tell(`§3[ 提示 ]§r`); // 仅输出了这一行，下面的循环没有输出。原因：？？？
        for (let i = 0; i < tipIdList.length; i++) {
            const id = tipIdList[i];
            if (id >= 0 && id < tips.length) {
                pl.tell(`§7#${id}§r ` + tips[id]);
            }
        }
    }
});