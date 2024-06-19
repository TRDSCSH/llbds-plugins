// 命令注册
mc.regPlayerCmd("joingroup", "我们的群组", joinGroup);
mc.regPlayerCmd("levellink", "服务器存档", levelLink);
mc.regPlayerCmd("serverrules", "服务器规则", serverrules);

// 函数
function joinGroup(pl) {
    let tempForm = mc.newCustomForm();
    tempForm.setTitle(`我们的群组`);
    tempForm.addInput("交流群 §7[QQ]§r","啥，你把群号删完了？",".........");
    tempForm.addInput("群服消息互通群 §7[QQ]§r","啥，你把群号删完了？",".........");
    pl.sendForm(tempForm, (a) => {});
}

function levelLink(pl) {
    let tempForm = mc.newCustomForm();
    tempForm.setTitle(`服务器存档`);
    tempForm.addInput("服务器存档 §7[xxxxx]§r","啥，你把链接都删完了？","https://www.xxxxxx.com/x/xxxx-xxxxx.xxxx");
    pl.sendForm(tempForm, (a) => {});
}

function serverrules(pl) {
    const fm = mc.newSimpleForm();
    fm.setTitle("服务器规则");
    fm.setContent("§7§l#§r §9玩家规定§r\n§7§l##§r §9总述§r\n服务器游戏不同于单机游戏，在游玩时需要遵守一定的规则，以保证游戏的公平性和玩家的游戏体验。请记住：“自由的边界是人权”，在自由游玩的同时，请不要侵犯其他玩家的权益。本规定适用于所有玩家，包括管理员。\n\n§7§l##§r §9玩家权利§r\n§31.§r 在游戏中自由建造、聊天等。\n§32.§r 举报玩家的违规、滥权等行为。\n§33.§r 反馈服务器的问题。\n§34.§r 申请成为管理员。\n§35.§r 向服主索要服务器存档。\n§36.§r 申请发起对某个问题的投票。\n\n§7§l##§r §9玩家义务§r\n§31.§r 遵守游戏、聊天的规定。\n§32.§r 与其他玩家互相尊重，和平相处。\n\n§7§l##§r §9具体规定§r\n§7§l###§r §9一、游戏规定§r\n§31.§r 禁止大规模破坏地形或玩家建筑。\n§32.§r 禁止骚扰其他玩家、破坏其他玩家的游戏体验。\n§33.§r 禁止抢夺、偷窃、破坏其他玩家的游戏财产。\n§34.§r 建造养殖场、刷怪塔、红石机器等会导致服务器卡顿的建筑时，请注意规模，防止卡服。\n§35.§r 只将领地用于保护自己的建筑，不将公共生存区域设置为自己的领地。\n\n§7§l###§r §9二、聊天规定§r\n§31.§r 禁止使用任何形式的辱骂、侮辱、挑衅、歧视、人身攻击等言语。\n§32.§r 禁止讨论不适宜的话题，包括但不限于色情、暴力等。\n§33.§r 禁止刷屏。\n\n§7§l###§r §9三、其它规定§r\n§31.§r 遵守服务器所在地的法律法规。\n\n§7§l##§r §9违规处理§r\n一经发现玩家具有违规行为，将视情节轻重，对违规玩家进行警告、封禁等处理。\n\n§1>§r §7最后更新于2023年8月13日§r");
    pl.sendForm(fm, (pl, id) => {});
}