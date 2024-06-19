//命令注册
mc.regPlayerCmd("vote", "§r投票", showResult);
mc.regPlayerCmd("vote ok", "§r支持当前投票项", voteOk);
mc.regPlayerCmd("vote no", "§r反对当前投票项", voteNo);
mc.regPlayerCmd("vote clr", "§r取消对当前投票项的表态", voteClr);

// 常量与全局变量定义
let voteTime = 259200; // 投票时间(秒) 当剩余时间为0时,投票结束
let startCount = 0; // 开始计时(0:未开始,1:开始)
let voteOkCount; // 支持数
let voteNoCount; // 反对数
let timer1Id; // 计时器1的ID
let timer2Id; // 计时器2的ID
const TARGET_VOTE_NUM = 20; // 目标投票数(同意数与反对数总和达到这个值时开始计时)
const voteName = "实行《服务器土地管理法》"; // 投票标题
const sign1Pos = new IntPos(9, 89, -147, 0); // 投票信息牌1的位置
const sign2Pos = new IntPos(9, 88, -147, 0); // 投票信息牌2的位置
const okBlockPos = new IntPos(-17, 88, -147, 0); // 投票支持方块的位置 todo
const noBlockPos = new IntPos(-11, 88, -147, 0); // 投票反对方块的位置 todo
const clrBlockPos = new IntPos(-14, 88, -147, 0); // 投票取消投票方块的位置 todo
const voteDataPath = "plugins/vote/data.json"; // 投票数据文件路径
const data = new JsonConfigFile(voteDataPath, `{ "agreed":[], "disagreed": [], "leftTime":${voteTime} }`); // 投票数据文件
voteOkCount = data.get("agreed").length;
voteNoCount = data.get("disagreed").length;
voteTime = data.get("leftTime");
const redPrefix = "§c█§r";
const greenPrefix = "§a█§r";

// 监听事件
mc.listen("onDestroyBlock", (pl, bl) => {
    if (isSamePos(bl.pos, okBlockPos)) {
        voteOk(pl);
        return false;
    } else if (isSamePos(bl.pos, noBlockPos)) {
        voteNo(pl);
        return false;
    } else if (isSamePos(bl.pos, clrBlockPos)) {
        voteClr(pl);
        return false;
    }
});

function isSamePos(pos1, pos2) {
    // log(pos1.x + " " + pos1.y + " " + pos1.z + " " + pos1.dimid);
    // log(pos2.x + " " + pos2.y + " " + pos2.z + " " + pos2.dimid);
    return pos1.x == pos2.x && pos1.y == pos2.y && pos1.z == pos2.z && pos1.dimid == pos2.dimid;
}

// 命令处理函数
function showResult(pl) {
    let isEnd = (voteTime == 0);
    if (isEnd) {
        pl.tell("投票已结束，投票结果: " + (judge(voteOkCount, voteNoCount) ? greenPrefix + " 通过" : redPrefix + " 未通过"));
    }
    pl.tell("投票项: " + voteName);
    if (!isEnd && startCount) pl.tell("投票剩余时间: " + voteTime + "秒");
    pl.tell("支持数: " + voteOkCount);
    pl.tell("反对数: " + voteNoCount);
    if (!isEnd) pl.tell("输入“/vote ok”支持当前投票项");
    if (!isEnd) pl.tell("输入“/vote no”反对当前投票项");
    if (!isEnd) pl.tell("输入“/vote clr”取消对当前投票项的表态");
}

function voteOk(pl) {
    if (voteTime == 0) {
        showResult(pl);
        return;
    }
    const data = new JsonConfigFile(voteDataPath);
    let agreed = data.get("agreed");
    let disagreed = data.get("disagreed");
    if (agreed.indexOf(pl.realName) != -1) {
        pl.tell("§c你已经投过票了");
    } else if (disagreed.indexOf(pl.realName) != -1) {
        disagreed.splice(disagreed.indexOf(pl.realName), 1);
        agreed.push(pl.realName);
        data.set("disagreed", disagreed);
        data.set("agreed", agreed);
        voteOkCount++;
        voteNoCount--;
        pl.tell(greenPrefix + "你支持了: " + voteName + "\n感谢你的投票！" + "\n§7当前支持数: " + agreed.length + "\n当前反对数: " + disagreed.length);
    } else {
        agreed.push(pl.realName);
        data.set("agreed", agreed);
        voteOkCount++;
        pl.tell(greenPrefix + "你支持了: " + voteName + "\n感谢你的投票！" + "\n§7当前支持数: " + agreed.length + "\n当前反对数: " + disagreed.length);
    }
    if (startCount == 1) pl.tell("投票剩余时间: " + voteTime + "秒");
}

function voteNo(pl) {
    if (voteTime == 0) {
        showResult(pl);
        return;
    }
    const data = new JsonConfigFile(voteDataPath);
    let agreed = data.get("agreed");
    let disagreed = data.get("disagreed");
    if (disagreed.indexOf(pl.realName) != -1) {
        pl.tell("§c你已经投过票了");
    } else if (agreed.indexOf(pl.realName) != -1) {
        agreed.splice(agreed.indexOf(pl.realName), 1);
        disagreed.push(pl.realName);
        data.set("agreed", agreed);
        data.set("disagreed", disagreed);
        voteOkCount--;
        voteNoCount++;
        pl.tell(redPrefix + "你反对了: " + voteName + "\n感谢你的投票！" + "\n§7当前支持数: " + agreed.length + "\n当前反对数: " + disagreed.length);
    } else {
        disagreed.push(pl.realName);
        data.set("disagreed", disagreed);
        voteNoCount++;
        pl.tell(redPrefix + "你反对了: " + voteName + "\n感谢你的投票！" + "\n§7当前支持数: " + agreed.length + "\n当前反对数: " + disagreed.length);
    }
    if (startCount == 1) pl.tell("投票剩余时间: " + voteTime + "秒");
}

function voteClr(pl) {
    if (voteTime == 0) {
        showResult(pl);
        return;
    }
    const data = new JsonConfigFile(voteDataPath);
    let agreed = data.get("agreed");
    let disagreed = data.get("disagreed");
    if (agreed.indexOf(pl.realName) != -1) {
        agreed.splice(agreed.indexOf(pl.realName), 1);
        data.set("agreed", agreed);
        voteOkCount--;
        pl.tell("你取消了对“" + voteName + "”的投票");
    } else if (disagreed.indexOf(pl.realName) != -1) {
        disagreed.splice(disagreed.indexOf(pl.realName), 1);
        data.set("disagreed", disagreed);
        voteNoCount--;
        pl.tell("你取消了对“" + voteName + "”的投票");
    } else {
        pl.tell("你没有投过票");
    }
    if (startCount == 1) pl.tell("投票剩余时间: " + voteTime + "秒");
}

// 计时器
timer1Id = setInterval(() => {
    if (voteTime == 0) {
        clearInterval(timer1Id); // 停止计时器1
        return;
    }
    if (voteNoCount + voteOkCount >= TARGET_VOTE_NUM) {
        clearInterval(timer1Id); // 停止计时器1
        startCount = 1; // 开始计时
        timer2Id = setInterval(() => {
            const data = new JsonConfigFile(voteDataPath);
            if (voteTime > 0) {
                voteTime--;
                data.set("leftTime", voteTime);
                if (voteTime == 0) {
                    clearInterval(timer2Id); // 停止计时器2
                }
            }
        }, 1000); // 开始倒计时
    }
}, 1800000); // 每30分钟检查一次投票数是否达到目标值

function judge(voteOkCount, voteNoCount) {
    if ((voteNoCount + voteOkCount) * 2 / 3 > voteOkCount) {
        return false;
    } else {
        return true;
    }
}