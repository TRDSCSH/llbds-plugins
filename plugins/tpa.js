//LiteLoaderScript Dev Helper
/// <reference path="E:\Server\LIB\dts\llaids\src\index.d.ts"/> 

const config = new JsonConfigFile("plugins/tpa/config.json");
config.init("economy", {
	type: "llmoney",
	object: "money",
	price: 0,
	name: "金币"
});
config.init("tpa", {
    timeout: 30,
    check_frequency:1000,
})
class gmoney {
	constructor(type, object) {
		this.type = type;
		this.object = object;
	}
	reduce(player, value) {
		if (this.type == "llmoney") {
			money.reduce(player.xuid, value);
		} else if (this.type == "scoreboard") {
			let scoreboard = mc.getScoreObjective(this.object);
			scoreboard.reduceScore(player, value)
		}
	}
	get(player) {
		switch (this.type) {
			case "scoreboard": {
				return player.getScore(this.object);
				break;
			}
			case "llmoney": {
				return money.get(player.xuid);
				break;
			}
		}
	}
}
var Money=new gmoney(config.get("economy").type,config.get("economy").object)
var tpaqueue=new Array

function ui_tpa(pl) {
    if(Money.get(pl)<config.get("economy").price && config.get("economy")!=0){pl.sendModalForm("错误", "余额不足"+config.get("economy").price+config.get("economy").name+",请求发送失败", "确认", "关闭", (pl, st) => {});return}
    let players=new Array
    for(let i of mc.getOnlinePlayers()) {
        // if (i.realName!=pl.realName){
        players[i.realName]=i
        // }
    }
    let pllist=Object.keys(players)

    let fm = mc.newCustomForm()
    fm.setTitle("TPA")
    fm.addDropdown("向玩家发起传送请求:", pllist)
    fm.addDropdown("传送模式:", ["TPA - 传送到玩家","TPAHERE - 传送玩家到自己"])
    pl.sendForm(fm, (pl, dt) => {
        if(dt == null) return
        let topl = players[pllist[dt[0]]]
        let mode=dt[1]
        let id=Date.now()
        tpaqueue[id]=[pl,topl,mode]
        ui_recv(id)
    })
}
function ui_recv(id){
    let frompl=tpaqueue[id][0]
    let topl=tpaqueue[id][1]
    let mode=tpaqueue[id][2]
    let msg=["TPA请求: ","TPAHERE请求: "][mode]+frompl.realName+[" 请求传送到你的位置"," 请求你传送到他的位置"][mode]
    topl.tell(msg)
    topl.sendSimpleForm(["TPA","TPAHERE"][mode],msg,["接受","拒绝","暂存"],["","",""],(pl,st)=>{
        if(st==0)manage(id,1)
        if(st==1)manage(id,0)
    })
}
function manage(id,operate){
    if(!tpaqueue[id]) return
    let frompl=tpaqueue[id][0]
    let topl=tpaqueue[id][1]
    let mode=tpaqueue[id][2]
    if(operate==0){
        frompl.tell(topl.realName+" 拒绝了你的 "+["TPA","TPAHERE"][mode]+" 请求")
    }
    if(operate==1){
        if(mode==0)frompl.teleport(topl.feetPos)
        if(mode==1)topl.teleport(frompl.feetPos)
        if(config.get("economy").price!=0)Money.reduce(frompl,config.get("economy").price)
    }
    if(operate==2){
        frompl.tell("你发送给 "+topl.realName+" 的 "+["TPA","TPAHERE"][mode]+" 请求已超时")
        topl.tell(topl.realName+" 发送给你的 "+["TPA","TPAHERE"][mode]+" 请求已超时")
    }
    delete tpaqueue[id]
}
function find_tpa(pl,type){
    for(let i in tpaqueue){
        if(tpaqueue[i][type].xuid==pl.xuid) return i
    }
    return false
}
setInterval(()=>{
    for(let i in tpaqueue){
        if(Date.now()-i>config.get("tpa").timeout*1000) manage(i,2)
    }
},config.get("tpa").check_frequency)
mc.regPlayerCmd("tpa", "传送到玩家", (pl)=>{
    let id=find_tpa(pl,1)
    if(id){
        ui_recv(id)
        return
    }
    id=find_tpa(pl,0)
    if(id) manage(tpaqueue[state],-1)
    ui_tpa(pl)
})
mc.regPlayerCmd("tpa ac", "接受传送请求", (pl)=>{
    let id=find_tpa(pl,1)
    if(id) manage(id,1)
    else pl.tell("没有收到 TPA 请求")
})
mc.regPlayerCmd("tpa deny", "拒绝传送请求", (pl)=>{
    let id=find_tpa(pl,1)
    if(id) manage(id,0)
    else pl.tell("没有收到 TPA 请求")
})