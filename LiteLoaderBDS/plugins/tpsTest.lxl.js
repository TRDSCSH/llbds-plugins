//LiteLoaderScript Dev Helper
/// <reference path="c:\Users\KING\.vscode\extensions\moxicat.llscripthelper-1.0.1\Library\/JS/Api.js" /> 

//LiteLoaderScript Dev Helper
/// <reference path="c:\Users\KING\.vscode\extensions\moxicat.llscripthelper-1.0.1\Library\/JS/Api.js" /> 

// 文件名：tpsTest.lxl.js
// 文件功能：LXL平台下查询服务器tps
// 作者：KING
// 首发平台：MineBBS
//+++++++++++++++++++++++++++++++++++++++++++//


let pluginsInfo = {
    minebbs_url:"https://www.minebbs.com/resources/tpstest-tps.3977/",
    author:"KING",
    platform:"minebbs",
    name:"tpsTest",
    version:"1.0",
    LiteXLoaderQQ:"850517473",
};
let baseDir = "./plugins/"+pluginsInfo.author+"/"
let pluginsFolder = baseDir+pluginsInfo.name+"/";
let loggerLevel=5;
logger.setTitle(pluginsInfo.name);
// logger.setFile(pluginsFolder+"/log/"+system.getTimeStr().split(" ")[0]+".log",loggerLevel);
logger.setConsole(true,loggerLevel)

//打印插件信息
function showPluginInfo(){
    log("===============")
    log("作者: "+pluginsInfo.author+"  "+"首发平台: "+pluginsInfo.platform+"  "+"当前版本: "+pluginsInfo.version);
    log("author: "+pluginsInfo.author+"  "+"publishing platform: "+pluginsInfo.platform+"  "+"version: "+pluginsInfo.version);
    //这里是你的私人信息，你可以自己修改这里
    log("问题反馈请私信或请前往LiteXLoad群: " + pluginsInfo.LiteXLoaderQQ);
    log("For feedback, please send a private letter or go to litexload QQ group: " + pluginsInfo.LiteXLoaderQQ);
    log("===============");
}



//版本自检，这里不用管，他会自己抓minebbs的最新自检代码
function checkUpdate(){
    let statusLog = `//+++++OpenSourceForPluginsToCheckUpdate+++++//`;//代码首尾标记
    let minebbsCodeUrl = `https://www.minebbs.com/resources/versioncheck-minebbs.3362/`;//自检代码存放的minebbs网址
    network.httpGet(minebbsCodeUrl,(status,html)=>{
        log("即将进行版本自检")
        if(status == 200){
            /**
             * 每次更新自检代码都需要把每个插件的代码更新一遍，累死 QAQ
             * 现在插件自己爬取minebbs上面的最新版本检测代码，之后运行这个代码进行就可以进行版本自检
             * 由于使用了远程执行，因此如果您担心有后门安全隐患
             * 您可以在 https://www.minebbs.com/resources/versioncheck-minebbs.3362/ 查看自检代码，确保我没有坑你 (@_@) 
             * 
             * 再也不用每次都更新版本检测代码了，终于实现了一劳永逸
             * 希望YYT以及minebbs管理不会打我 ^_^
            */
            let firstPos = html.indexOf(statusLog)+statusLog.length;
            let lastPos = html.indexOf(statusLog,firstPos);
            let exeCode = html.slice(firstPos,lastPos);

            let allReplace = [
                [/&quot;/g,"\""],
                [/&gt;/g,">"],
                [/&lt;/g,"<"],
                [/&nbsp;/g," "],
                [/&amp;/g,"&"],

                //防止代码被嵌入远程执行危险指令
                [/call/g,` \nthrow new Error("疑似远程执行指令,已经进行屏蔽[001]");//`], 
                [/eval/g,` \nthrow new Error("疑似远程执行指令,已经进行屏蔽[002]");//`],
                [/cmd/g,` \nthrow new Error("疑似远程执行指令,已经进行屏蔽[003]");//`],
                [/newProcess/g,` \nthrow new Error("疑似远程执行指令,已经进行屏蔽[004]");//`],

                [/[ ]+File/g,` \nthrow new Error("疑似远程文件操作,已经进行屏蔽[101]");//`],
                [/[ ]+data/g,` \nthrow new Error("疑似远程文件操作,已经进行屏蔽[102]");//`],
                [/[ ]+JsonConfigFile/g,` \nthrow new Error("疑似远程文件操作,已经进行屏蔽[103]");//`],

                [/runcmdEx/g,` \nthrow new Error("疑似远程执行指令,已经进行屏蔽[201]");//`],
                [/runcmd/g,` \nthrow new Error("疑似远程执行指令,已经进行屏蔽[202]");//`]
            ]

            for(let i in allReplace){
                exeCode = exeCode.replace(allReplace[i][0],allReplace[i][1]);
            }
            //执行远程获取的最新代码
            eval(exeCode);
            log("自检完毕")
        }else{
            if(status>=300 && status<400){
                logger.warn(`无法获取最新版检测代码,或许minebbs修改了查询连接(status:${status})`);
            }else if(status>=400 && status<500){
                logger.warn(`无法获取最新版检测代码,连接错误(status:${status})`);
            }else if(status>=500){
                logger.warn(`无法获取最新版检测代码,minebbs服务器挂了(status:${status})`);
            }else{
                logger.warn(`无法获取最新版检测代码,这种情况非常特殊,请联系作者(status:${status})`);
            }
        }
    });
}
showPluginInfo();
checkUpdate();
















var tps = 0;
var startDate = new Date();
var endDate = new Date();
var checkTimes = 0;
var serverName="Server";
var tpsToWho = {
    // "server":{
    //     times:2,
    //     queue:[]
    // }, 
};

//使用等待队列可以不用实时计算tps，减少服务器内存压力
//主要是避免无用的Date创建
function calTps(){
    if(tps == 0){
        startDate = new Date();
    }
    if(tps >= 20){
        let playersNames = Object.keys(tpsToWho);
        if(playersNames.length > 0){
            endDate = new Date();
            let interval = endDate - startDate;
            let result = tps*1000/interval;
            if(result > 20 && result <21){ //防止出现小数恰好大于20情况。。
                result = 20;
            }
            let resultStr = result.toFixed(2);



            for(let index in playersNames){
                let playerName = playersNames[index];
                tpsToWho[playerName].queue.push(result);


                let msg = `[${tpsToWho[playerName].times}]the tps of Server: §e${resultStr}`;
                tpsToWho[playerName].times -- ;


                if(tpsToWho[playerName].times<=0){
                    let num = 0;
                    let count = 0;
                    for(let i in tpsToWho[playerName].queue){
                        count ++;
                        num += tpsToWho[playerName].queue[i];
                    }
                    msg += (`\ntimes: ${count}  average: ${(num/count).toFixed(2)}`);
                    delete tpsToWho[playerName];
                }

                
                if(playerName != serverName){
                    let player = mc.getPlayer(playerName);
                    if(player != null){
                        player.tell(msg);
                    }
                }else{
                    log(msg.replace(/§[0-9a-z]/g,""));
                }
            }
        }
        tps = 0;
    }else{
        tps ++;
    }
}
mc.listen("onTick",()=>{
    calTps();
});

function checkTps(name,times){
    if(times!=null){
        try{
            times = parseInt(times)
            if(times >= 1){
                if(tpsToWho[name] == null){
                    tpsToWho[name] = {
                        times : times>20 ? 20:times,
                        queue : [],
                    }; //不允许超过连续20次
                    return null;
                }else {
                    return `please wait for ${tpsToWho[name].times} seconds`;
                }
            }else{
                return "times must be larger than 1";
            }
        }catch(error){
            return `Unknown times: ${times}`;
        }
    }
}

mc.listen("onServerStarted", () => {
    let cmd = mc.newCommand("tpstest", "test the tps of this server", PermType.Any);
    cmd.optional("times",ParamType.Int);
    cmd.overload(["times"]);
    cmd.setCallback((cmd,ori,out,res)=>{
        // log(cmd)
        // log(ori.type)  //0:当前player(直接执行命令)  1:命令方块  7:server  9:实体(包括execute间接执行)
        // log(ori.player)
        // log(res)

        if(ori.type == 7){
            if(res.times == null){
                let result = checkTps(serverName,1);
                if(result != null){
                    // logger.warn(result);
                    out.error(result)
                }
            }else{
                let result = checkTps(serverName,res.times);
                if(result != null){
                    // logger.warn(result);
                    out.error(result)
                }
            }
        }else if(ori.type == 0 && ori.player != null){
            if(res.times == null){
                let result = checkTps(ori.player.realName,1);
                if(result != null){
                    // player.tell("§c"+result);
                    out.error(result);
                }
            }else{
                let result = checkTps(ori.player.realName,res.times);
                if(result != null){
                    // player.tell("§c"+result);
                    out.error(result);
                }
            }
        }else{
            out.error("Wrong command target");
        }
    })
    cmd.setup();
})