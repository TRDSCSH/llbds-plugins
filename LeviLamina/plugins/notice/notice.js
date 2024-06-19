mc.listen("onJoin", (pl) => {
    notice(pl);
});

const javaServerIP = "example.com";

function notice(pl) {
    const fm = mc.newCustomForm();
    fm.setTitle("服务器迁移公告");
    // fm.addLabel("嘿，你好！这里有一则重要消息：\n\n    这个服务器即将迁移到 Java 版！这意味着你将不仅不用再忍受基岩版服务端的抽象优化，而且还可以拥抱各种 Java 版的模组插件，是不是很令人振奋？\n    啥，为什么要这么做？一切的起源要从万恶的小公司微软开始说起：很久很久以前（1975年），微软成立了...好吧，扯远了，其实就在最近，微软移除了基岩版服务端的PDB调试文件，导致LeviLamina无法更新...啊？你不知道PDB是什么。没关系，你只要知道，没有它就没有我们现在的服务器。万恶的微软。\n    现在，是时候放弃由恶魔微软控制的基岩版，转而拥抱由社区驱动的 Java 版！不过不需要担心，不可思议的是，你在这里的建筑也可以一起转到 Java 版！而且以后，借助间歇泉的滋润，你仍然可以在基岩版上游玩新的服务器。向 Java 版出发！\n    接下来你可以做：\n      1. 继续游玩，等待服务器迁移\n      2. 使用 Amulet 迁移你的建筑到新存档");
    fm.addLabel("你好，这里有一则重要通知。(2024/06/16更新)\n\n    由于微软移除了后续版本的PDB调试文件，这个服务器无法再继续更新至1.21.10版本。现在，我们即将转移到Java版，在新的世界继续体验新版本的特色。为了迁移世界，我们需要经历两个阶段，在下面列出。\n\n## 第一阶段 建筑迁移（正在进行中）\n    在这一阶段，我们将要把这个世界的建筑搬到Java新存档。\n    新存档是一个全新生成的Java版(版本1.20.4)世界，借助投影模组(Litematica)，可以实现建筑迁移。如果你需要将你的建筑搬运到新存档，请掌握投影模组的用法，并进入Java服务器将你的建筑生成到新存档，你可以在底部链接部分找到Java服务器的地址。\n\n## 第二阶段 玩家物品迁移\n    在这个阶段，插件将会帮助你把所有的游戏物品导出，以备未来将你的物品导入到新存档。\n    如果你需要把这里的物品迁移到新存档，你需要借助物品迁移插件（开发中）来迁移你的物品。需要注意的是，由于跨存档的转换并不简单，所以你只能带走普通物品，一些特殊物品(比如带有附魔的剑)将无法迁移，请谅解。\n\n## 迁移之后\n    在上面两个阶段结束后，服务器将正式转到Java，到时候，这个基岩版服务端会关闭，最终存档将会发布，如果需要开服包，可以向我索要。你仍然可以继续通过基岩版游玩新服务器，但更建议使用Java版，以获取更好的支持。\n\n如果需要联系，请加入QQ群组。");
    fm.addInput("群组号码", "Easter Egg 0", "xxxxxxxxx");
    fm.addInput("Java服IP地址", "Easter Egg 1", javaServerIP);
    fm.addInput("基岩版存档链接", "Easter Egg 2", "https://example.com");
    fm.addInput("Amulet(将基岩版存档转换为Java版存档)", "Easter Egg 3", "https://www.amuletmc.com/");
    fm.addInput("PCL2最新正式版(密码:pcl2)", "Easter Egg 4", "https://ltcat.lanzouv.com/b0aj6gsid");
    fm.addInput("投影模组(Litematica)", "Easter Egg 5", "https://www.curseforge.com/minecraft/mc-mods/litematica");
    fm.addInput("投影模组使用教程(哔哩哔哩视频)", "Easter Egg 6", "https://www.bilibili.com/video/BV1qv4y1472R");
    pl.sendForm(fm, () => {
        pl.tell("这个服务器即将迁移到Java版，目前正在迁移这个服务器的建筑。如果需要迁移你的建筑，请进入Java服务器进行编辑，另外你可以加入QQ群以获取支持。\n - 群组号码(QQ群): xxxxxxxxx\n - Java服IP: " + javaServerIP);
    });
}