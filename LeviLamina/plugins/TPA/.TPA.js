//作者：aabb
function sendtpaform(ori, out) {
	if (ori.type == 0) {
		var player = ori.player;
		if (player.isSimulatedPlayer()) {
			return;
		}
		let conf = new JsonConfigFile("./plugins/TPA/player.json");
		let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
		let needmoney = getconfig.get("单次传送的费用");
		let coinname = getconfig.get("货币名称");
		let bln = conf.get(player.realName)
		let tpa = mc.newCustomForm();
		tpa.setTitle(`§l§oTPA GUI §r(传送成功消耗 ${needmoney} ${coinname})`);
		let allplayer = getPlayerList();
		//logger.warn(allplayer)  //可能是空数组
		//logger.warn(allplayer.length)
	
		//以下是可修改表单中要显示的内容
		let fs = ["§l我传送到TA那里", "§lTA传送到我这里"];
		if (allplayer.length >= 1) {  //判断在线真人数量是否大于等于1
			tpa.addDropdown(`§b选择要传送的玩家  §d当前共有 §e${allplayer.length} §d个玩家在线.`, allplayer);
			tpa.addDropdown("§a请选择传送的方式", fs);
		} else if (allplayer.length <= 0) {
			tpa.addLabel("§a咋个事咋个事？咋没人捏？快召集你的小伙伴上线叭~喵喵喵~")
		}
		tpa.addStepSlider("§6被申请时的提醒强度", ["§r§l屏蔽", "§r§l仅聊天框", "§r§l弹窗和聊天框"], bln)
		//以上是可修改表单中要显示的内容
		player.sendForm(tpa, function (player, data) {
			dispose(player, data, allplayer);
		});
		if (getconfig.get("经济类型(填写llmoney或计分板名称)") != "llmoney") {
			mc.runcmdEx(`scoreboard players add @a ${getconfig.get("经济类型(填写llmoney或计分板名称)")} 0`)
		}
	} else {
			out.error("TPA-只允许玩家使用此命令！")
	}
}

function main (ori) {
	var player = ori.player;
	if (player.isSimulatedPlayer()) {
		return;
	}
	let conf = new JsonConfigFile("./plugins/TPA/player.json");
	let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
	let needmoney = getconfig.get("单次传送的费用");
	let coinname = getconfig.get("货币名称");
	let bln = conf.get(player.realName)
	let tpa = mc.newCustomForm();
	tpa.setTitle(`§o§lTPA GUI §r(传送成功消耗 ${needmoney} ${coinname})`);
	let allplayer = getPlayerList();
	//logger.warn(allplayer)  //可能是空数组
	//logger.warn(allplayer.length)

	//以下是可修改表单中要显示的内容
	let fs = ["§l我传送到TA那里", "§lTA传送到我这里"];
	if (allplayer.length >= 1) {  //判断在线真人数量是否大于等于1
		tpa.addDropdown(`§b选择要传送的玩家  §d当前共有 §e${allplayer.length} §d个玩家在线.`, allplayer);
		tpa.addDropdown("§a请选择传送的方式", fs);
	} else if (allplayer.length <= 0) {
		tpa.addLabel("§a咋个事咋个事？咋没人捏？快召集你的小伙伴上线叭~喵喵喵~")
	}
	tpa.addStepSlider("§6被申请时的提醒强度", ["§r§l屏蔽", "§r§l仅聊天框", "§r§l弹窗和聊天框"], bln)
	//以上是可修改表单中要显示的内容
	player.sendForm(tpa, function (player, data) {
		dispose(player, data, allplayer);
	});
	if (getconfig.get("经济类型(填写llmoney或计分板名称)") != "llmoney") {
		mc.runcmdEx(`scoreboard players add @a ${getconfig.get("经济类型(填写llmoney或计分板名称)")} 0`)
	}
}

function sendform2(player, data, allplayer) {
	let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
	let alldata = new JsonConfigFile("./plugins/TPA/watting.json");
	let maxtime = getconfig.get("申请最长存在时间");
	let timestamp = ((alldata.get(player.realName)).split(", "))[2];
	let checktimesize = gettimestamp(system.getTimeStr()) - timestamp;
	if (checktimesize < maxtime) {
		let fm = mc.newSimpleForm()
		fm.setTitle('§e§oTPA GUI')
		fm.setContent('§6你有一条§c未受理§6的TPA申请！')
		fm.addButton('§l继续等待')
		fm.addButton('§l取消等待')
		player.sendForm(fm, dispose2)
	} else {
		alldata.set(player.realName, `0, false, ${timestamp}, 0`);
		dispose(player, data, allplayer)
	}
}

function dispose2(player, data) {
	let alldata = new JsonConfigFile("./plugins/TPA/watting.json");
	let otherxuid = ((alldata.get(player.realName)).split(", "))[0];
	let otherinfo = mc.getPlayer(otherxuid);
	let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
	let maxtime = getconfig.get("申请最长存在时间");
	let timestamp = ((alldata.get(player.realName)).split(", "))[2];
	let checktimesize = gettimestamp(system.getTimeStr()) - timestamp;
	if (data == 0 || data == null) {
		if (checktimesize > maxtime) {
			player.tell("§d§lTPA §7§l>> §r§c该申请已过期！");
			alldata.set(player.realName, `0, false, ${timestamp}, 0`);

		} else {
			player.tell('§d§lTPA §7§l>> §e你已选择继续等待！')
		}
	} else {
		if (checktimesize > maxtime) {
			player.tell("§d§lTPA §7§l>> §r§c该申请已过期！");
			alldata.set(player.realName, `0, false, ${timestamp}, 0`);

		} else {
			player.tell('§d§lTPA §7§l>> §e你已取消等待，重新发起申请即可！')
			alldata.set(player.realName, `0, false, ${timestamp}, 0`);
			alldata.set(otherinfo.name, `0, true, ${timestamp}, 0`);
		}
	}
}

function dispose(player, data, allplayer) {
	if (player.isSimulatedPlayer()) {
		return;
	}
	if (data == null) {
		//不想关表单后提示表单已放弃就删掉下面这行
		player.tell("§d§lTPA §7§l>> §r§b表单已放弃.");
		//player.removeTag(`TpaFilt`)  //关闭表单删除玩家过滤标签
		return;
	}
	var playerto = data[0];
	var playerway = data[1];
	var playerset = data[2];
	var playertoname = allplayer[playerto];
	let conf = new JsonConfigFile("./plugins/TPA/player.json");
	let bln = conf.get(player.realName)
	if (playerset != bln) {
		if (playerset == 0) {
			player.tell("§d§lTPA §7§l>> §r§a提醒强度已设置为§e屏蔽");
			conf.set(player.realName, 0)
		} else {
			if (playerset == 1) {
				player.tell("§d§lTPA §7§l>> §r§a提醒强度已设置为§e仅聊天框");
				conf.set(player.realName, 1)
			} else {
				player.tell("§d§lTPA §7§l>> §r§a提醒强度已设置为§e弹窗和聊天框");
				conf.set(player.realName, 2)
			}
		}
	} else {
		if (player.realName == playertoname) {
			player.tell("§d§lTPA §7§l>> §r§c你不能传送你自己！");
		} else {

			if (playertoname == null) {
				player.tell(`§d§lTPA §7§l>> §r§c目标玩家不存在或已离线！`);
				return;
			} else if (playertoname !== null) {
				var checkplayeronline = mc.getPlayer(playertoname);
			}
			if (checkplayeronline == null) {
				player.tell("§d§lTPA §7§l>> §r§c目标玩家不存在或已离线！");
				return;
			} else {
				let conf2 = new JsonConfigFile("./plugins/TPA/watting.json");
				let playertpainfo = ((conf2.get(player.realName)).split(", "))[1];
				//获取玩家上次请求的时间戳 数据结构[对方的uid, 请求方向判定, 请求时的时间戳, TP方式]
				let compute = gettimestamp(system.getTimeStr()) - ((conf2.get(player.realName)).split(", "))[2];
				let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
				let needmoney = getconfig.get("单次传送的费用");
				let cd = getconfig.get("传送后的冷却时间");
				let coinname = getconfig.get("货币名称");
				let showcd = cd - compute;
				let tpaform = mc.newSimpleForm()
				tpaform.setTitle("§e§oTPA GUI")
				tpaform.addButton("§a▇§r 同意")
				tpaform.addButton("§c▇§r 拒绝")
				let playertoinfo = mc.getPlayer(playertoname);
				if (playertpainfo == "false") {
					//对申请方进行处理
					if (!aaa(player)) {
						sendform2(player, data, allplayer)
					} else {
						if (compute < cd) {
							player.tell(`§d§lTPA §7§l>> §r§l§c请求过于频繁，你还需要等待${showcd}秒.`);
						} else {
							//经济模式为llmoney运行
							if (getconfig.get("经济类型(填写llmoney或计分板名称)") == "llmoney") {
								if (money.get(player.xuid) < needmoney) {
									let needmoney2 = needmoney - money.get(player.xuid);
									player.tell(`§d§lTPA §7§l>> §r§l你的${coinname}不足，还需 ${needmoney2} ${coinname}`);
								} else {
									if (conf.get(playertoinfo.name) == 0) {
										player.tell("§d§lTPA §7§l>> §r§c对方已设置自动屏蔽TPA申请.")
									} else {
										if (aaa(player)) {
											//判断传送方式
											if (playerway == 0) {
												b(conf2, player, playertoinfo, playerway, playertoname, tpaform)
												conf2.set(player.realName, `${playertoinfo.xuid}, false, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
											} else {
												a(conf2, player, playertoinfo, playerway, playertoname, tpaform);
												conf2.set(player.realName, `${playertoinfo.xuid}, false, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
											}
										} else {
											sendform2(player, data, allplayer)
										}
									}
								}
							} else {
								//经济模式为计分板运行
								if (mc.getScoreObjective(getconfig.get("经济类型(填写llmoney或计分板名称)")) == null) {
									player.tell('§d§lTPA §7§l>> §cTPA插件经济类型配置错误，没有找到对应的计分板！')
									logger.error(`没有找到名为${conf.get("经济类型(填写llmoney或计分板名称)")}的计分板！请检查计分板名拼写是否有误！`);
								} else {
									let scoremoney = mc.getScoreObjective(getconfig.get("经济类型(填写llmoney或计分板名称)"));
									let needmoney3 = needmoney - scoremoney.getScore(player);
									if (scoremoney.getScore(player) < needmoney) {
										player.tell(`§d§lTPA §7§l>> §r§l你的${coinname}不足，还需 ${needmoney3} ${coinname}`);
									} else {
										if (aaa(player)) {
											if (conf.get(playertoinfo.name) == 0) {
												player.tell("§d§lTPA §7§l>> §r§c对方已设置自动屏蔽TPA申请.")
											} else {
												//判断传送方式
												if (playerway == 1) {
													a(conf2, player, playertoinfo, playerway, playertoname, tpaform)
													conf2.set(player.realName, `${playertoinfo.xuid}, false, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
												} else {
													b(conf2, player, playertoinfo, playerway, playertoname, tpaform);
													conf2.set(player.realName, `${playertoinfo.xuid}, false, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
												}
											}
										} else {
											sendform2(player, data, allplayer)
										}
									}
								}
							}
						}
					}
				} else {
					//对被申请方进行处理
					//llmoney
					if (!aaa(player)) {
						sendform3(player)
					} else {
						if (getconfig.get("经济类型(填写llmoney或计分板名称)") == "llmoney") {
							if (money.get(player.xuid) < needmoney) {
								let needmoney2 = needmoney - money.get(player.xuid);
								player.tell(`§d§lTPA §7§l>> §r§l你的${coinname}不足，还需 ${needmoney2} ${coinname}`);
							} else {
								if (aaa(player)) {
									if (conf.get(playertoinfo.name) == 0) {
										player.tell("§d§lTPA §7§l>> §r§c对方已设置自动屏蔽TPA申请.")
									} else {
										if (playerway == 0) {
											b(conf2, player, playertoinfo, playerway, playertoname, tpaform)
										} else {
											a(conf2, player, playertoinfo, playerway, playertoname, tpaform);
										}
									}
								} else {
									sendform2(player, data, allplayer)
								}
							}
						} else {
							//score
							if (mc.getScoreObjective(getconfig.get("经济类型(填写llmoney或计分板名称)")) == null) {
								player.tell('§d§lTPA §7§l>> §cTPA插件经济类型配置错误，没有找到对应的计分板！')
								logger.error(`没有找到名为${conf.get("经济类型(填写llmoney或计分板名称)")}的计分板！请检查计分板名拼写是否有误！`);
							} else {
								let scoremoney = mc.getScoreObjective(getconfig.get("经济类型(填写llmoney或计分板名称)"));
								let needmoney3 = needmoney - scoremoney.getScore(player);
								if (scoremoney.getScore(player) < needmoney) {
									player.tell(`§d§lTPA §7§l>> §r§l你的${coinname}不足，还需 ${needmoney3} ${coinname}`);
								} else {
									if (aaa(player)) {
										if (conf.get(playertoinfo.name) == 0) {
											player.tell("§d§lTPA §7§l>> §r§c对方已设置自动屏蔽TPA申请.")
										} else {
											if (playerway == 1) {
												a(conf2, player, playertoinfo, playerway, playertoname, tpaform)
											} else {
												b(conf2, player, playertoinfo, playerway, playertoname, tpaform);
											}
										}
									} else {
										sendform2(player, data, allplayer)
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

function sendform3 (player) {
	let alldata = new JsonConfigFile("./plugins/TPA/watting.json");
	let tpway = ((alldata.get(player.realName)).split(", "))[3];
	let otherxuid = ((alldata.get(player.realName)).split(", "))[0];
	let otherinfo = mc.getPlayer(otherxuid);
	let tpaform = mc.newSimpleForm()
	tpaform.setTitle("§o§lTPA GUI")
	tpaform.addButton("§a§l同意")
	tpaform.addButton("§c§l拒绝")
	if (tpway == 0) {
		tpaform.setContent(`§6你有一条§e未处理§6的申请！\n§b玩家 §e${otherinfo.realName}§b§l 想要你传送到TA那里\n\n`);
		player.sendForm(tpaform, tpdis);
	} else {
		tpaform.setContent(`§6你有一条§e未处理§6的申请！\n§b玩家 §e${otherinfo.realName}§b§l 想要传送到你这里\n\n`);
		player.sendForm(tpaform, tpdis);
	}
}

function aaa (player) {
	let conf2 = new JsonConfigFile("./plugins/TPA/watting.json");
	let ttt = Number(((conf2.get(player.realName)).split(", "))[0])
	if (ttt == 0) {
		return true;
	} else {
		return false
	}
}

function mustsend0(playertoinfo, player) {
	if (player.isSimulatedPlayer()) {
		return;
	}
	playertoinfo.tell(`§d§lTPA §7§l>> §r§l你有一条来自§r§e${player.realName}§r§l的TPA申请 §b[TA§7>>§b你]§e /tpay - 同意 §7|§e /tpan - 拒绝`);
	mc.runcmdEx(`playsound random.toast "${playertoinfo.name}"`);
}

function mustsend1(playertoinfo, player) {
	if (player.isSimulatedPlayer()) {
		return;
	}
	playertoinfo.tell(`§d§lTPA §7§l>> §r§l你有一条来自§r§e${player.realName}§r§l的TPA申请 §b[你§7>>§bTA]§e /tpay - 同意 §7|§e /tpan - 拒绝`);
	mc.runcmdEx(`playsound random.toast "${playertoinfo.name}"`);
}

function a(conf2, player, playertoinfo, playerway, playertoname, tpaform) {
	if (player.isSimulatedPlayer()) {
		return;
	}
	conf2.set(player.realName, `${playertoinfo.xuid}, false, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
	conf2.set(playertoname, `${player.xuid}, true, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
	player.tell("§d§lTPA §7§l>> §r§a申请已发送！");
	if ((new JsonConfigFile("./plugins/TPA/player.json")).get(playertoname) == 2) {
		mustsend1(playertoinfo, player)
		tpaform.setContent(`\n§b玩家§e${player.realName}§b§l想要你传送到TA那里\n\n`);
		playertoinfo.sendForm(tpaform, tp);
	} else {
		if ((new JsonConfigFile("./plugins/TPA/player.json")).get(playertoname) == 1) {
			mustsend1(playertoinfo, player)
		}
	}
}

function b(conf2, player, playertoinfo, playerway, playertoname, tpaform) {
	if (player.isSimulatedPlayer()) {
		return;
	}
	conf2.set(player.realName, `${playertoinfo.xuid}, false, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
	conf2.set(playertoname, `${player.xuid}, true, ${gettimestamp(system.getTimeStr())}, ${playerway}`);
	player.tell("§d§lTPA §7§l>> §r§a申请已发送！");
	if ((new JsonConfigFile("./plugins/TPA/player.json")).get(playertoname) == 2) {
		mustsend0(playertoinfo, player)
		tpaform.setContent(`\n§b玩家§e${player.realName}§b§l想要传送到你这里\n\n`);
		playertoinfo.sendForm(tpaform, tp);
	} else {
		if ((new JsonConfigFile("./plugins/TPA/player.json")).get(playertoname) == 1) {
			mustsend0(playertoinfo, player)
		}
	}
}

function tp(player, data) {
	if (player.isSimulatedPlayer()) {
		return;
	}
	//[0]为同意[1]为拒绝
	let alldata = new JsonConfigFile("./plugins/TPA/watting.json");
	let otherxuid = ((alldata.get(player.realName)).split(", "))[0];
	let otherinfo = mc.getPlayer(otherxuid);
	let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
	let maxtime = getconfig.get("申请最长存在时间");
	let timestamp = ((alldata.get(player.realName)).split(", "))[2];
	let checktimesize = gettimestamp(system.getTimeStr()) - timestamp;
	if (otherinfo == null) {
		player.tell("§d§lTPA §7§l>> §r§c对方已离线！");
		alldata.set(player.realName, `0, true, ${timestamp}, 0`);
	} else {
		if (data == null) {
			otherinfo.tell(`§d§lTPA §7§l>> §r§6对方关闭了TPA确认表单，可能已打开背包或其它UI界面，请提醒TA确认，§e${maxtime}秒后过期`)
		} else {
			tpdis(player, data)
		}
	}
}

function tpdis(player, data) {
    // 小于则没过期
	let alldata = new JsonConfigFile("./plugins/TPA/watting.json");
	let otherxuid = ((alldata.get(player.realName)).split(", "))[0];
	let otherinfo = mc.getPlayer(otherxuid);
	let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
	let maxtime = getconfig.get("申请最长存在时间");
	let timestamp = ((alldata.get(player.realName)).split(", "))[2];
	let checktimesize = gettimestamp(system.getTimeStr()) - timestamp;
    if (checktimesize > maxtime) {
        alldata.set(player.realName, `0, true, ${timestamp}, 0`);
        alldata.set(otherinfo.name, `0, false, ${timestamp}, 0`);
        player.tell("§d§lTPA §7§l>> §r§c该申请已过期！");
    } else {
        if (data == 0) {
            let tpway = ((alldata.get(player.realName)).split(", "))[3];
            let moneyway = getconfig.get("经济类型(填写llmoney或计分板名称)");
            let reducemoney = getconfig.get("单次传送的费用");
            if (tpway == 0) {
                otherinfo.teleport(player.pos);
                otherinfo.tell(`§d§lTPA §7§l>> §r§l你已传送至§r§e${player.realName}`);
                alldata.set(player.realName, `0, true, ${timestamp}, 0`);
                alldata.set(otherinfo.name, `0, false, ${timestamp}, 0`);
                // 经济类型
                if (moneyway == "llmoney") {
                    money.reduce(otherxuid, reducemoney);
                } else {
                    mc.runcmdEx(`scoreboard players add "${otherinfo.name}" ${moneyway} -${reducemoney}`);
                }
            } else {
                player.teleport(otherinfo.pos);
                player.tell(`§d§lTPA §7§l>> §r§l你已传送至§r§e${otherinfo.name}`);
                if (moneyway == "llmoney") {
                    money.reduce(otherxuid, reducemoney);
                } else {
                    mc.runcmdEx(`scoreboard players add "${otherinfo.name}" ${moneyway} -${reducemoney}`);
                }
            }
        } else {
			if (data == 1) {
				if (checktimesize < maxtime) {
					player.tell("§d§lTPA §7§l>> §r§a你已拒绝对方的申请.");
					otherinfo.tell("§d§lTPA §7§l>> §r§c§l对方拒绝了你的请求！");
					alldata.set(player.realName, `0, true, ${timestamp}, 0`);
					alldata.set(otherinfo.name, `0, false, ${timestamp}, 0`);
				} else {
					player.tell("§d§lTPA §7§l>> §r§c该申请已过期！");
				}
			} else {
				player.tell("§d§lTPA §7§l>> §r§b表单已放弃.");
			}
        }
    }
}

//timestamp
function gettimestamp(timeStr) {
	const str = timeStr,
		regex = /\d+/g,
		numbers = str.match(regex),
		month = numbers[1],
		day = numbers[2],
		hour = numbers[3],
		minute = numbers[4],
		second = numbers[5],
		timestamp = month * 259200 + day * 86400 + hour * 3600 + minute * 60 + second;
	return timestamp.toString();
}

function tpar(ori, out) {
	if (ori.type == 0) {
		var player = ori.player;
		if (player.isSimulatedPlayer()) {
			return;
		}
		let alldata = new JsonConfigFile("./plugins/TPA/watting.json");
		let otherxuid = ((alldata.get(player.realName)).split(", "))[0];
		let rprbug = ((alldata.get(player.realName)).split(", "))[1];
		let otherinfo = mc.getPlayer(otherxuid);
		let timestamp = ((alldata.get(player.realName)).split(", "))[2];

		if (otherxuid == "0") {
			player.tell("§d§lTPA §7§l>> §r§c当前没有需要处理的申请.");
		} else {
			if (rprbug == "false") {
				player.tell("§d§lTPA §7§l>> §r§c当前没有需要处理的申请.");
			} else {
				if (otherinfo == null) {
					player.tell("§d§lTPA §7§l>> §r§c对方已离线！");
					alldata.set(player.realName, `0, true, ${timestamp}, 0`);
				} else {
					player.tell("§d§lTPA §7§l>> §r§a你已拒绝对方的申请.");
					otherinfo.tell("§d§lTPA §7§l>> §r§c§l对方拒绝了你的请求！");
					alldata.set(player.realName, `0, true, ${timestamp}, 0`);
					alldata.set(otherinfo.name, `0, false, ${timestamp}, 0`);
				}
			}
		}
	} else {
		out.error("TPA-只允许玩家使用此命令！")
	}
}

function tpaa(ori, out) {
	if (ori.type == 0) {
		var player = ori.player;
		if (player.isSimulatedPlayer()) {
			return;
		}
		let alldata = new JsonConfigFile("./plugins/TPA/watting.json");
		let otherxuid = ((alldata.get(player.realName)).split(", "))[0];
		let rprbug = ((alldata.get(player.realName)).split(", "))[1];
		let otherinfo = mc.getPlayer(otherxuid);
		let getconfig = new JsonConfigFile("./plugins/TPA/config.json");
		let maxtime = getconfig.get("申请最长存在时间");
		let timestamp = ((alldata.get(player.realName)).split(", "))[2];
		let checktimesize = gettimestamp(system.getTimeStr()) - timestamp;
		let tpway = ((alldata.get(player.realName)).split(", "))[3]
		let moneyway = getconfig.get("经济类型(填写llmoney或计分板名称)");
		let reducemoney = getconfig.get("单次传送的费用");
		if (otherxuid == "0") {
			player.tell("§d§lTPA §7§l>> §r§c当前没有需要处理的申请.");
		} else {
			if (rprbug == "false") {
				player.tell("§d§lTPA §7§l>> §r§c当前没有需要处理的申请.");
			} else {
				if (checktimesize < maxtime) {
					if (otherinfo == null) {
						player.tell("§d§lTPA §7§l>> §r§c对方已离线！");
						alldata.set(player.realName, `0, true, ${timestamp}, 0`);
					} else {
						if (tpway == 0) {
							otherinfo.teleport(player.pos);
							otherinfo.tell(`§d§lTPA §7§l>> §r§l你已传送至§r§e${player.realName}`);
							alldata.set(player.realName, `0, true, ${timestamp}, 0`);
							alldata.set(otherinfo.name, `0, false, ${timestamp}, 0`);
							//经济类型
							if (moneyway == "llmoney") {
								money.reduce(otherxuid, reducemoney);
							} else {
								mc.runcmdEx(`scoreboard players add "${otherinfo.name}" ${moneyway} -${reducemoney}`);
							}
						} else {
							player.teleport(otherinfo.pos);
							player.tell(`§d§lTPA §7§l>> §r§l你已传送至§r§e${otherinfo.name}`);
							if (moneyway == "llmoney") {
								money.reduce(otherxuid, reducemoney);
							} else {
								mc.runcmdEx(`scoreboard players add "${otherinfo.name}" ${moneyway} -${reducemoney}`);
							}
						}
					}
				} else {
					player.tell("§d§lTPA §7§l>> §r§c该申请已过期！")
					alldata.set(player.realName, `0, true, ${timestamp}, 0`);
				}
			}
		}
	} else {
		out.error("TPA-只允许玩家使用此命令！")
	}
}

function creatcmd() {
	try {
		const commands = [
			{ name: "tpa", description: "打开TPA菜单", callback: sendtpaform },
			{ name: "tpay", description: "同意TPA申请", callback: tpaa },
			{ name: "tpan", description: "拒绝TPA申请", callback: tpar }
		];
		commands.forEach((command) => {
			const cmd = mc.newCommand(command.name, command.description, PermType.Any);
			cmd.setCallback((_cmd, ori, out, _res) => {
				command.callback(ori, out);
			});
			cmd.overload([]);
			cmd.setup();
		});
	} catch (error) {
		logger.error("命令注册失败！请查看是否有其它插件占用TPA命令！错误信息：" + error);
	}
}

function checkfile() {
	let checkbln = File.exists("./plugins/TPA/config.json");
	if (checkbln == true) {
		logger.info("配置文件已加载");
		let conf = new JsonConfigFile("./plugins/TPA/config.json");
		let setname = conf.get("经济类型(填写llmoney或计分板名称)");
		if (setname != "llmoney") {
			let check = mc.getScoreObjective(setname);
			if (check == null) {
				logger.error(`没有找到名为${conf.get("经济类型(填写llmoney或计分板名称)")}的计分板！请检查计分板名拼写是否有误！`);
			}
		}
	} else {
		logger.info("已自动生成相关文件");
		new JsonConfigFile("./plugins/TPA/player.json");
		new JsonConfigFile("./plugins/TPA/watting.json");
		let conf = new JsonConfigFile("./plugins/TPA/config.json");
		//勿动预释放配置文件否则将无法运行
		conf.init("经济类型(填写llmoney或计分板名称)", "money");
		conf.init("传送后的冷却时间", 30);
		conf.init("申请最长存在时间", 60);
		conf.init("单次传送的费用", 10);
		conf.init("货币名称", "金币");
	}
}

function getPlayerList() {
	//player.addTag('TpaFilt');  // 为玩家添加过滤标签
	let onlinePlayers = mc.getOnlinePlayers();
	let realPlayerList = onlinePlayers.filter(p => !p.isSimulatedPlayer() /*&& !p.hasTag('TpaFilt')*/);
	let playerNames = realPlayerList.map(p => p.realName);
	return playerNames;
}

mc.listen("onJoin", (player) => {
	if (player.isSimulatedPlayer()) {
		return;
	}
	let conf2 = new JsonConfigFile("./plugins/TPA/watting.json");
	let conf = new JsonConfigFile("./plugins/TPA/player.json");
	let pname = player.realName;
	conf.init(pname, 2)
	conf2.init(pname, "0, false, 0, 0")
});


mc.listen("onServerStarted", () => {
	checkfile();
	try {
		creatcmd();
		logger.info("TPA插件加载成功  https://www.minebbs.com/resources/tpa-gui.7221/ 作者:aabb 抖音:MInecraft铁镐君");
	} catch (error) {
		logger.error("TPA插件加载失败！错误信息：" + error);
	}
});
