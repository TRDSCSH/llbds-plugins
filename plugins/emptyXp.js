// 命令注册
mc.regPlayerCmd("emptyxp", "清空经验", (pl, args) => {
    pl.setTotalExperience(0);
}, 1);