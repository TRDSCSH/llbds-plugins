//命令注册
mc.regPlayerCmd("chdifficulty", "§r修改游戏难度", chdifficulty);

//函数实现
function chdifficulty(pl, args) {
    if (args.length == 0) {
        let form = mc.newCustomForm();
        form.setTitle("世界难度");
        form.addStepSlider("将世界难度更改为", ["不更改","§l和平", "§l简单","§l普通","§l困难"]);
        pl.sendForm(form, (pl, id) => {
            if (id != null) {
                switch (id[0]) {
                    case 0:
                        break;
                    case 1:
                        mc.runcmdEx("difficulty 0");
                        mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l和平`);
                        break;
                    case 2:
                        mc.runcmdEx("difficulty 1");
                        mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l简单`);
                        break;
                    case 3:
                        mc.runcmdEx("difficulty 2");
                        mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l普通`);
                        break;
                    case 4:
                        mc.runcmdEx("difficulty 3");
                        mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l困难`);
                }
            }
        });
    } else if (args.length == 1) {
        switch (args[0]) {
            case "0":
            case "peaceful":
            case "和平":
                mc.runcmdEx("difficulty 0");
                mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l和平`);
                break;
            case "1":
            case "easy":
            case "简单":
                mc.runcmdEx("difficulty 1");
                mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l简单`);
                break;
            case "2":
            case "normal":
            case "普通":
                mc.runcmdEx("difficulty 2");
                mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l普通`);
                break;
            case "3":
            case "hard":
            case "困难":
                mc.runcmdEx("difficulty 3");
                mc.runcmdEx(`say 世界难度被${pl.realName}更改为: §l困难`);
                break;
            default:
                pl.tell("§c错误的参数");
        }
    } else {
        pl.tell("§c参数过多");
    }
}