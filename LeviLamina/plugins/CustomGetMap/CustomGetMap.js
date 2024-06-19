/* jshint esversion: 11 */
/*jshint -W069 */
let sizeOf_npm;
//"use strict";
const INFO = {
    name: "CustomGetMap",
    intro: "插件CustomMap自定义地图画的辅助插件",
    version: [0, 6, 1],
    other: {
        auth: "Wn1027",

    }
};
ll.registerPlugin(INFO.name, INFO.intro, INFO.version, INFO.other);
/* 
0.5.2 刷新upload文件夹

0.5.3 修复未加机器人自动上传情况下，无法获取图片的bug,适配sparkBridge的png上传, 修复无法删除图片的报错

0.6.0 适配LL3
0.6.1 缓存图片尺寸, 提升表单载入速度 isSaveOriImg配置
*/

let DIR = "./plugins/CustomGetMap"; // 插件目录
let CUSTOMMAP;
//let userCutMap = {}; // 缓存 储存玩家是否正在运行cutMap.exe
let img2binTemp = {};
let yoyorobot = false; 
let upload_config;
let uploadAll;
let isSaveOriImg = true;
//###########################################################
// 默认配置文件:
let CONFIG_CONF= new JsonConfigFile(`${DIR}/config.json`, JSON.stringify({
    CONFIG: "此为CustomGetMap的配置文件 | by Wn1027",
    onlyOP: false,     // 命令权限 false：所有人可用 | true：仅管理员
    onlyMyMap: true,   // 是否限制玩家仅能获取自己上传的地图画 （Yoyo机器人地图画上传扩展功能）
    tips: true,        // 玩家提示&报错信息开关
    setInterval: 50,   // 地图自动放置时间间隔（单位：ms）
    isSaveOriImg: false,  // 保留原始图片
    maxMapNum: 400,    // 限制单个图片的地图数量, 如果生成的地图太多会阻止获取, 并提示需要缩放裁剪
    imgGetSize: 'imgGetSize_stb.exe',  // 'imgGetSize_stb.exe' 或 'imgGetSize.ps1' 或 'imgGetSize.py' 或 'image-size.js'(仅限作为Nodejs插件) 选择获取图片尺寸的程序。
    img2bin: 'img2bin_stb.exe',        // 'img2bin_stb.exe' 或'img2bin.ps1' 或 'img2bin.py' 或 'img2bin.exe'  选择图片解析程序, exe版不支持透明图片。
    imgResize: 'imgResize_stb.exe',    // 'imgResize_stb.exe' 或'imgResize.ps1' 或 'imgResize.py' 或 'imgResize.exe' 选择图片缩放程序。
    python: "python"   // 填写python解释器地址(python.exe), 填写"python"则使用全局解释器。
                       // 若img2bin或imgResize采用py文件, 并采用_cv2.bat创建的venv环境, 此项应改为 "./plugins/CustomGetMap/_cv2/Scripts/python.exe"
}));
//###########################################################
let SIZETMP_json = new JsonConfigFile(`${DIR}/sizeTemp.json`);
// 配置重载
function reload(){
    if (File.exists(`${DIR}/upload.json`)){
        // && (File.exists(`./plugins/nodejs/yoyorobot`) || File.exists(`./plugins/nodejs/sparkbridge/plugins/spark.custmap`)
        yoyorobot = true;
        upload_config = new JsonConfigFile(`${DIR}/upload.json`);
        uploadAll = JSON.parse(upload_config.read());
    }
    isSaveOriImg = CONFIG_CONF.get('isSaveOriImg');
    // 新建存放.jpg.png.jpeg的目录
    File.createDir(`${DIR}/.img/`);
    if (isSaveOriImg){
        File.createDir(`${DIR}/.img-ori/`);
    }
    File.createDir(`${DIR}/tempData/`);
    return true;
}
reload();

if (CONFIG_CONF.get('imgGetSize') == 'image-size.js'){
    sizeOf_npm = require('image-size');
    if (sizeOf_npm == null){
        logger.error('image-size库导入失败');
    }
}

//let MAPUUID_DATA = new JsonConfigFile(`${DIR}/mapuuid.json`); 
let MAPUUID_DATA = new KVDatabase(`${DIR}/MAPUUID`); // 记录图片的mapuuid, 以后删除备用

mc.listen("onServerStarted",function(){
    colorLog("cyan",`CustomGetMap.js ver${INFO.version} 已加载| by Wn1027`);
    if (ll.hasExported('CustomMap', 'delMap')) {
        CUSTOMMAP = {
            delMap: ll.import('CustomMap', 'delMap'),
            addMap:  ll.import("CustomMap", "addMap"),
            getMapList: ll.import('CustomMap', 'getMapList'),
        };
        if (ll.hasExported('CustomMap', "addMapNoAlpha")){
            CUSTOMMAP.addMapNoAlpha = ll.import("CustomMap", "addMapNoAlpha");
        }
    }else{
        logger.error(`CustomMap API 未导入, 本插件会运行错误, 请检查是否安装CustomMap`);
    }
    resgisterCmd();
    //checkImg();
});

let executeOri;
if (CONFIG_CONF.get('onlyOP') == 1){
    executeOri = PermType.GameMasters;
}else{
    executeOri = PermType.Any;
}

// 注册命令
function resgisterCmd(){
    let cmd = mc.newCommand("getmap", "§e获取地图画§7 <图片名(带后缀名)> [<裁剪图片:cut> | <删除图片:delete>]", executeOri);
    cmd.setEnum("CutAction", ["cut"]);
    cmd.setEnum("otherAction", ["all", "delete", "clear"]);
    cmd.setEnum("CurlAction", ["curl"]);

    //res.参数名
    cmd.mandatory("action", ParamType.Enum, "otherAction", 1);
    cmd.mandatory("action", ParamType.Enum, "CutAction", 1);
    cmd.mandatory("action", ParamType.Enum, "CurlAction", 1);
    cmd.mandatory("fileName", ParamType.String);
    cmd.mandatory("url", ParamType.String);

    //命令参数组合，三种命令
    cmd.overload([]);
    cmd.overload(["fileName"]);
    cmd.overload(["fileName", "otherAction"]);
    cmd.overload(["fileName", "CutAction"]);
    cmd.overload(["fileName", "CurlAction", "url"]);
    cmd.setCallback(cmdCallback);
    function cmdCallback(_cmd, _ori, out, res){
        var pl = _ori.player;
        // if (res.reload == 'reload'){
        //     if (!(pl == null || pl.isOP() == true)){
        //         out.error('此命令仅管理员可执行');
        //         return;
        //     }
        //     if (reload()){
        //         return out.succes('CustomGetMap配置重载成功');
        //     }else{
        //         return out.error('CustomGetMap配置重载失败');
        //     }
        // }

        // 检查管理员
        if (CONFIG_CONF.get('onlyOP') == 1){
            if(pl.isOP() == false){
                return out.error(`[CustomGetMap] 此命令只能由管理员执行`);
            }
        }

        if (upload_config != undefined){
            upload_config.reload();
            uploadAll = JSON.parse(upload_config.read());
        }

        // 主菜单
        if (res.fileName == undefined){
            // 检查执行主体
            if (pl == null){
                return out.error(`[CustomGetMap] 该命令只能由玩家执行`);
            }

            mainForm(pl);
                
            return out.success("");
        }

        // 图片名
        let imgFileName = res.fileName;  // 图片文件名
        let suffix = imgFileName.substring(imgFileName.lastIndexOf(".")); // 后缀名
        let imgname = imgFileName.substring(0, imgFileName.lastIndexOf(".")); //无后缀图片名

        // 检查输入是否为图片名
        if (suffix != ".jpeg" && suffix != ".png" && suffix != ".jpg" ){
            return out.error("[CustomGetMap] 请加后缀名 | 只支持.jpeg .jpg .png的图片格式");
        }

        let result;

        if (res.action == 'curl'){
            if (!(pl == null || pl.isOP() == true)){
                return out.error('此命令仅管理员可执行');
            }
            if (!/[a-zA-z]+:\/\/[^\s]*/.test(res.url)){
                return out.error('无效的URL');
            }
            system.newProcess(`PowerShell.exe -file "${DIR}/tools/imgDownload.ps1" "${DIR}/.img/${res.fileName}" "${res.url}"`, (_exitcode, _output)=>{
                if (_exitcode == 0){
                    let size = Number(_output);
                    if (size < 300){
                        File.delete(`${DIR}/.img/${res.fileName}`);
                        logger.info(`下载失败: ${res.fileName} | ${size}字节`);
                        if (pl != null){
                            mc.broadcast(`§c下载失败: ${res.fileName} | ${size}字节`);
                        }
                    }else{
                        logger.info(`下载完成: ${res.fileName} | ${(size/1024).toFixed(2)}KB`);
                        if (pl != null){
                            mc.broadcast(`§a下载完成: ${res.fileName} | ${(size/1024).toFixed(2)}KB`);
                        }
                    }
                    return;
                }else{
                    logger.error(`下载失败:\n${_output}`);
                    if (pl != null){
                    mc.broadcast(`§c下载失败:\n${_output}`);
                    }
                    return;
                }
            }, 120000);
            // system.cmd(`curl -o "${DIR}/.img/${res.fileName}" -L "${res.url}"`, (_exitcode, _output)=>{
            //     log(_exitcode, _output)
            //     if (_exitcode == 0){
            //         let size = File.getFileSize(`${DIR}/.img/${res.fileName}`);
            //         if (size < 300){
            //             File.delete(`${DIR}/.img/${res.fileName}`);
            //             logger.info(`下载失败: ${res.fileName} | ${size}字节`);
            //             mc.broadcast(`§c下载失败: ${res.fileName} | ${size}字节`);
            //         }else{
            //             logger.info(`下载完成: ${res.fileName} | ${(size/1024).toFixed(2)}KB`);
            //             mc.broadcast(`§a下载完成: ${res.fileName} | ${(size/1024).toFixed(2)}KB`);
            //         }
            //         return;
            //     }else{
            //         mc.broadcast(`§c下载失败:\n${_output}`);
            //         logger.error(`下载失败:\n${_output}`);
            //         return;
            //     }
            // }, 120000);
            out.success(`开始下载 ${res.fileName}`);
            return;
        }

        // 删除地图画（可后台执行）(内置检测是否上传过图片)
        if (res.action == 'delete'){
            // 检查执行主体
            if (pl == null){
                result = deleteMap(true, 'server', imgFileName, imgname);
            }else{
                result = deleteMap(pl.isOP(), pl.realName, imgFileName, imgname);
            }
            if (result.success){
                return out.success(result.output);
            }else{
                return out.error(result.output);
            }
        }

        if (res.action == 'clear'){
            if (isSaveOriImg){
                SIZETMP_json.delete(`${DIR}/.img-ori/${imgFileName}`);
            }
            SIZETMP_json.delete(`${DIR}/.img/${imgFileName}`);
            return out.success(`清除 ${imgFileName} 的图片缓存 ${File.delete(`${DIR}/tempData/${imgname}`)}`);
        }

        // 以下命令只能由玩家执行
        if (pl == null){
            return out.error(`[CustomGetMap] 该命令只能由玩家执行`);
        }

        // 如果使用了机器人扩展, 则检查该玩家是否上传过该图片
        if (yoyorobot && (!pl.isOP()) && CONFIG_CONF.get('onlyMyMap') == true){
            if (!confirmUpload(pl, imgname)){
                return out.error(`[CustomGetMap] 你没有上传过 ${imgFileName}`);
            }
        }

        // 压缩裁剪图片
        if (res.action == 'cut'){
            cutMap(pl, imgFileName, imgname);
            result = {success:true,output:""};
        }

        // 获取地图画
        if (res.action == undefined || res.action == 'all'){
            result = img2bin(pl, imgFileName, imgname, res.action);
        }

        if (result.success){
            return out.success(result.output);
        }else{
            return out.error(result.output);
        }
    }
    cmd.setup();
}

//----------------------------------
// 主菜单
async function mainForm(pl){
    // 获取图片
    let imgList;
    if (yoyorobot){
        let plData, plqq;
        for (let key in uploadAll){
            if (uploadAll[key].playerName == pl.realName){
                plData = uploadAll[key];
                plqq = key;
            }
        }
        if (plData == undefined){
            pl.tell(`§c你没有上传过地图画`);
            return;
        }
        let filelist = File.getFilesList(`${DIR}/.img/`);
        imgList = plData.imgname.map(imgname=> {
            let file = filelist.find(file => imgname == file.substring(0, file.lastIndexOf(".")));
            if (file == undefined){file = imgname+'.jpg';}
            return file;
        });
    }else{
        imgList = File.getFilesList(`${DIR}/.img/`).filter((filename, index, arr) => /(.*)(\.jpg)|(\.png)|(\.jpeg)$/i.test(filename));
        if (isSaveOriImg){
            let ori_imgList = File.getFilesList(`${DIR}/.img-ori/`).filter((filename, index, arr) => /(.*)(\.jpg)|(\.png)|(\.jpeg)$/i.test(filename));
            imgList = imgList.concat(ori_imgList.filter(v=> !(imgList.indexOf(v) > -1)));
        }
    }

    // 获取尺寸
    let sizeRes = await sizeOf(imgList.map(imgFileName=>`${DIR}/.img/${imgFileName}`).join(" "));
    let sizes = {};
    sizeRes.forEach((size, index, arr) =>{sizes[imgList[index]] = size;});

    async function setfm_mapList(imgList){
        let imgListStr = '\n';
        for (let i = 0; i < imgList.length; i ++){
            if(File.exists(`${DIR}/.img/${imgList[i]}`)){
                let shapes_ori = sizes[imgList[i]];
                imgListStr += `§小§d#${i+1} | §b${imgList[i]} §7规格: ${Math.ceil(shapes_ori.width/128)} × ${Math.ceil(shapes_ori.height/128)}\n`;
            }else{
                if (isSaveOriImg && File.exists(`${DIR}/.img-ori/${imgList[i]}`)){
                    imgListStr += `§小§d#${i+1} | §b${imgList[i]} §e需重新裁剪\n`;
                }else{
                    imgListStr += `§小§d#${i+1} | §b${imgList[i]} §c图片已删除\n`;
                }
            }
        }

        let fm_mapList = mc.newCustomForm()
        .setTitle("§c§l我上传的图片")
        .addLabel(imgListStr)
        .addDropdown('§e选择操作类型', ['获取地图画封装', '裁剪地图画', '获取全部地图画', '§e清除图片缓存', '§c删除地图画'])
        .addInput('§a请输入图片序号','',String(imgList.length));
        return fm_mapList;
    }

    try{
        let form = await setfm_mapList(imgList);
        if (pl == null){return;}
        pl.sendForm(form, (pl, args)=>{return mapList_run(pl, args, imgList);});
    }catch(e){
        logger.error(e);
    }
    
    async function mapList_run(pl, args, imgList){
        if (args == null){return;}
        let imgIndex = args[2];
        let mode = args[1];
        if (imgIndex == ''){return menu_end_run(pl, '§c§l我上传的图片', '§cERROR 不能为空', await setfm_mapList(imgList), (pl, args)=>{return mapList_run(pl, args, imgList);});}
        if (!(/(^[1-9]\d*$)/.test(imgIndex))){
            return menu_end_run(pl, '§c§l我上传的图片', '§cERROR 请输入正整数', await setfm_mapList(imgList), (pl, args)=>{return mapList_run(pl, args, imgList);});
        }
        imgIndex = Number(imgIndex);
        if (imgIndex > imgList.length){
            return menu_end_run(pl, '§c§l我上传的图片', '§cERROR 没有此序号对应的图片', await setfm_mapList(imgList), (pl, args)=>{return mapList_run(pl, args, imgList);});
        }

        let imgFileName = imgList[imgIndex - 1];
        let imgname = imgFileName.substring(0, imgFileName.lastIndexOf("."));

        if (mode == 0){
            let res = img2bin(pl, imgFileName, imgname, undefined);
            return pl.tell(res.output);
        }

        if (mode == 1){
            let res = await cutMap(pl, imgFileName, imgname);
            if (pl == null){return;}
            if (!res.success){
                pl.tell(res.output);
            }
            return;
        }

        if (mode == 2){
            let res = img2bin(pl, imgFileName, imgname, 'all');
            return pl.tell(res.output);
        }

        if (mode == 3){
            if (isSaveOriImg){
                SIZETMP_json.delete(`${DIR}/.img-ori/${imgFileName}`);
            }
            SIZETMP_json.delete(`${DIR}/.img/${imgFileName}`);
            return pl.tell(`§6清除 ${imgFileName} 的图片缓存 ${File.delete(`${DIR}/tempData/${imgname}`)}`);
        }

        if (mode == 4){
            pl.sendModalForm(`§c§l删除 ${imgFileName}`, `§c确认删除: ${imgFileName}`, '§c§l确认', '§7§l取消',(pl, confirm)=>{
                if (confirm){
                    let res = deleteMap(pl.isOP(), pl.realName, imgFileName, imgname);
                    return pl.tell(res.output);
                }else{
                    return pl.sendForm(setfm_mapList(imgList), (pl, args)=>{return mapList_run(pl, args, imgList);});
                }
            });
        }
    }
    return;
}

// 裁剪地图画
async function cutMap(pl, imgFileName, imgname){
    let exeFile = `${DIR}/tools/${CONFIG_CONF.get("imgResize")}`;
    if (!File.exists(exeFile)){
        return {success: false, output: `[CustomGetMap] 管理员未启用图片裁剪功能`};
    }
    if (CONFIG_CONF.get("imgResize") == 'imgResize.py'){
        exeFile = `${CONFIG_CONF.get("python")} ` + exeFile;
    }
    if (CONFIG_CONF.get("imgResize") == 'imgResize.ps1'){
        exeFile = 'PowerShell -file ' + exeFile;
    }

    // 检查.img下图片存在
    if (isSaveOriImg){
        if (!(File.exists(`${DIR}/.img/${imgFileName}`) || File.exists(`${DIR}/.img-ori/${imgFileName}`))){
            return {success: false, output: `[CustomGetMap] ${DIR}/.img/ 目录下没有名为 <${imgFileName}> 的图片`};
        }
    }else{
        if (!(File.exists(`${DIR}/.img/${imgFileName}`))){
            return {success: false, output: `[CustomGetMap] ${DIR}/.img/ 目录下没有名为 <${imgFileName}> 的图片`};
        }
    }
    
    
    // 获取尺寸
    let shapes_ori = await sizeOf(isSaveOriImg && File.exists(`${DIR}/.img-ori/${imgFileName}`) ? `${DIR}/.img-ori/${imgFileName}` : `${DIR}/.img/${imgFileName}`);
    if (pl == null){return {success: true, output: `[cutMap] 玩家下线`};}
    let shape = [shapes_ori[0].width, shapes_ori[0].height];
    if (isNaN(shapes_ori[0].width) || isNaN(shapes_ori[0].height)){
        return {success: false, output: `[CustomGetMap] 获取图片 <${imgFileName}> 的尺寸失败, 可能未配置裁剪功能。`};
    }
    let shapes = getFitShapes(Number(shape[0]), Number(shape[1]));
    
    // if ((Number(shape[0]) <= 128) || (Number(shape[1]) <= 128)){
    //     return {success: false, output: `[cutMap] §c该尺寸已经很小: §7(${shape[0]} × ${shape[1]}) §c, 无需处理`};
    // }

    let shapeListStr = `\n§a原始尺寸: ${shape[0]} × ${shape[1]}\n`;
    for (let i = 0; i < shapes.length; i++){
        shapeListStr += `§d# ${i+1} | §7${shapes[i][0]*128} × ${shapes[i][1]*128} | ${shapes[i][0]} × ${shapes[i][1]} = ${shapes[i][0]*shapes[i][1]} 张地图\n`;
    }

    let fm_cutMap = mc.newCustomForm()
    .setTitle(`§c§l裁剪图片 ${imgFileName}`)
    .addLabel(shapeListStr)
    .addInput('§a输入序号:');
    pl.sendForm(fm_cutMap, cutMap_run);
    function cutMap_run(pl, args){
        if (args == null){return;}
        let index = args[1];
        if (index == ''){return menu_end_run(pl, `§c§l裁剪图片 ${imgFileName}`, `§cERROR 不能为空`, fm_cutMap, cutMap_run);}
        if (!(/(^[1-9]\d*$)/.test( index ))){
            return menu_end_run(pl, `§c§l裁剪图片 ${imgFileName}`, `§cERROR 请输入正整数`, fm_cutMap, cutMap_run);
        }
        if (index > shapes.length){
            return menu_end_run(pl, `§c§l裁剪图片 ${imgFileName}`, `§cERROR 没有此序号对应的尺寸`, fm_cutMap, cutMap_run);
        }
        index = Number(index);
        let new_width = shapes[index-1][0]*128;
        let new_height = shapes[index-1][1]*128;

        pl.sendModalForm(`§c§l裁剪图片 ${imgFileName}`, `§e确认将 ${imgFileName} 裁剪为: §b${new_width} × ${new_height}`, '§2§l确认', '§7§l取消',(pl, confirm)=>{
            if (confirm){
                if (isSaveOriImg && File.exists(`${DIR}/.img-ori/${imgFileName}`)){
                    if (File.exists(`${DIR}/.img/${imgFileName}`)){
                        File.delete(`${DIR}/.img/${imgFileName}`);
                    } 
                    File.move(`${DIR}/.img-ori/${imgFileName}`, `${DIR}/.img/`);
                }           
                let cutcmd = `${exeFile} ${DIR}/.img/${imgFileName} ${new_width} ${new_height}`;
                system.newProcess(cutcmd, function(_exitcode, _output){
                    if (_exitcode == 0){
                        if (isSaveOriImg){
                            File.move(`${DIR}/.img/${imgFileName}`, `${DIR}/.img-ori/`); // 备份原图
                        }else{
                            File.delete(`${DIR}/.img/${imgFileName}`); // 删除原图
                        }
                        File.rename(`${DIR}/.img/r-${imgFileName}`, `${DIR}/.img/${imgFileName}`); // 重命名为原图名字
                        //pl.sendText(`§e已选尺寸: §a${new_width} × ${new_height} | ${new_width/128} × ${new_height/128} = ${new_width/128*new_height/128} 张地图`);
                        SIZETMP_json.set(`${DIR}/.img/${imgFileName}`, {width: new_width, height: new_height});
                        let example = ``;
                        if (new_width/128 < 10 && new_height/128 < 10){
                            example = `§7`;
                            for (let i = 0; i < new_height/128; i++){
                                example += '  ';
                                for (let i = 0; i < new_width/128; i++){
                                    example += '❀ ';
                                }
                                example += '\n';
                            }
                            //pl.sendText(example);
                        }

                        //删除旧的二进制文件（新裁剪会覆盖旧裁剪）
                        if ((File.exists(`${DIR}/tempData/${imgname}`))){
                            File.delete(`${DIR}/tempData/${imgname}`);
                        }

                        pl.sendModalForm(`§c§l裁剪完成 ${imgFileName}`, `§e裁剪完成: §b${new_width} × ${new_height}\n\n§6是否获取地图画 ${imgFileName}？\n\n${example}`, '§2§l获取', '§7§l取消',(pl, confirm)=>{
                            if (confirm){
                                img2bin(pl, imgFileName, imgname, undefined);
                            }else{
                                img2bin(pl, imgFileName, imgname, '');
                            }
                        });
                        //pl.sendText(`[CustomGetMap] §b<${imgFileName}> §a裁剪完成 §7| 获取图片: /getmap ${imgFileName}`);
                    }else{
                        pl.sendText(`[cutMap.exe] §c裁剪失败: ${_output}`);
                    }
                },20000);
            }else{
                return pl.sendForm(fm_cutMap, cutMap_run);
            }
        });
    }
    return {success: true, output: `[cutMap] §a获取图片尺寸中`};
}

// 二进制解析
function img2bin(pl, imgFileName, imgname, mode){
    // 生成二进制文件
    if (img2binTemp[imgname] == true){
        return {success: false, output: `[CustomGetMap] 正在解析 <${imgFileName}>..`};
    }
    let binlist = findbin(imgname);
    if (binlist[0].length != 0){
        let res = getMap(pl, imgFileName, imgname, mode, binlist);
        return {success: res.success, output: res.output};
    }

    // 检查.img下图片存在
    if (!(File.exists(`${DIR}/.img/${imgFileName}`))){
        return {success: false, output: `[CustomGetMap] ${DIR}/.img/ 目录下没有名为 <${imgFileName}> 的图片`};
    }

    //检查img2bin存在
    let exeFile = `${DIR}/tools/${CONFIG_CONF.get("img2bin")}`;
    if (!File.exists(exeFile)){
        return {success: false, output: `[CustomGetMap] \n§c请将 ${CONFIG_CONF.get('img2bin')} 放入${DIR}/tools/下, \n或将 go-img2bin.exe 改名为 img2bin.exe`};
    }
    if (CONFIG_CONF.get("img2bin") == 'img2bin.py'){
        exeFile = `${CONFIG_CONF.get("python")} ` + exeFile;
    }
    if (CONFIG_CONF.get("img2bin") == 'img2bin.ps1'){
        exeFile = 'PowerShell -file ' + exeFile;
    }
    
    //检查重复生成
    if (File.exists(`${DIR}/tempData/${imgname})`)){
        File.delete(`${DIR}/tempData/${imgname})`);
        pl.sendText(`[CustomGetMap] §e重新解析 <${imgFileName}>..`);
    }

    //调用 img2bin.exe 生成二进制文件
    
    File.createDir(`${DIR}/tempData/${imgname}/`);
    let batcmd;
    if (CONFIG_CONF.get('img2bin') == 'img2bin.exe'){
        batcmd = `${exeFile} -in "${DIR}/.img/${imgFileName}" -out "${DIR}/tempData/${imgname}/${imgname}"`;
    }else{
        batcmd = `${exeFile} -f "${DIR}/.img/${imgFileName}" -d "${DIR}/tempData/${imgname}" `;
    }

    //img2binTemp[imgname] = true;
    system.newProcess(batcmd, function(_exitcode, _output){
        if (_exitcode == 0){
            if(CONFIG_CONF.get('tips') == true){
                var binlist_1 = findbin(imgname);
                pl.sendText(`[CustomGetMap] §a解析图片完成 | §6地图数量 §a${binlist_1[0].length} §6张`);
                let res = getMap(pl, imgFileName, imgname, mode, binlist_1);
                pl.tell(res.output);
                //pl.sendText(`[CustomGetMap] §e空出主手, 再次执行此命令以获取地图画`);
            }
            delete img2binTemp[imgname];
            return;
        }else{
            if(CONFIG_CONF.get('tips') == true){
                pl.sendText(`§c[img2bin] ERROR \n${_output}`);
                pl.sendText(`§c[img2bin] img2bin转换失败`);
            }
            delete img2binTemp[imgname];
            return;                
        }
    },60000);
    return {success: true, output: `[CustomGetMap] 正在解析 <${imgFileName}>..`};
}

// 获取地图画(二进制解析->获取封装或地图)
function getMap(pl, imgFileName, imgname, mode, binlist){
    // 限制地图画数量
    if (binlist[1] * binlist[2] > CONFIG_CONF.get('maxMapNum') && !pl.isOP()){
        return {success: false, output: `[CustomGetMap] 获取失败: §b<${imgFileName}>\n§r规格: ${binlist[1]} × ${binlist[2]} = ${binlist[1] * binlist[2]} 大于 ${CONFIG_CONF.get('maxMapNum')} 张, 请裁切图片。`};
    }

    // 获取地图画封装
    if (mode == undefined){
        generateNewNbt(pl, `§d地图画封装§b(${imgFileName})`, `§e${imgFileName}`, `§7${binlist[1]} × ${binlist[2]}`);
        return {success: true, output: `[CustomGetMap] §a获得地图画封装: §b<${imgFileName}§r§b>\n§r§e规格: §r${binlist[1]} × ${binlist[2]}`};

    }

    // 获取全部地图画
    if (mode == 'all'){
        getAllMap(pl, imgFileName, imgname, binlist); 
        return {success: true, output: `[CustomGetMap] 正在获取全部地图 §b<${imgFileName}> ..`};
    }

    return {success: true, output: ``};
}

// 获取全部地图
async function getAllMap(pl, imgFileName, imgname, binlist){
    let mapuuid_list = MAPUUID_DATA.get(imgname);
    if (mapuuid_list == null){
        MAPUUID_DATA.set(imgname, []);
        mapuuid_list = [];
    }

    let mainhand = pl.getHand();
    if (!mainhand.isNull()){
        mc.spawnItem(mainhand, pl.blockPos);
    }
    mainhand.setNull();
    pl.refreshItems();
    await sleep(50);
    if (pl == null){return;}
    
    let width = binlist[1];
    let height = binlist[2];

    for (let h = 0; h < height; h++){
        for (let w = 0; w < width; w++){
            let mainhand = pl.getHand();
            let newFilledmap = mc.newItem("minecraft:filled_map",1);
            // log(newFilledmap.getNbt().toSNBT(4));
            mainhand.set(newFilledmap);
            pl.refreshItems();
            await sleep(50);
            if (pl == null){return;}
            //CuStomMap核心命令 更换手中的地图
            // var cmdResult = mc.runcmdEx(`/execute as "${pl.realName}" run map "${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}" true`);
            // if (cmdResult.success == false){
            //     cmdResult = mc.runcmdEx(`/execute "${pl.realName}" ~~~ map "${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}" true`);
            //     if (cmdResult.success == false){
            //         if(CONFIG_CONF.get('tips') == true){
            //             pl.sendText("[CustomGetMap] §c/map 命令执行失败\n请检查是否安装 CustomMap.dll 插件");
            //         }
            //         return;
            //     }
            // }
            // await sleep(50); 
            // pl.refreshItems();

            let mainHandNbt = mainhand.getNbt();
            let tagNbt = mainHandNbt.getTag("tag");
            let mapuuid;
            if (CONFIG_CONF.get("img2bin") == 'img2bin.exe'){
                if (CUSTOMMAP.addMapNoAlpha == undefined){
                    mainhand.setNull();
                    pl.refreshItems();
                    pl.tell(`§c不支持img2bin.exe解析的图片, 请调整配置`);
                    return false;
                }
                mapuuid = CUSTOMMAP.addMapNoAlpha(`${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}`);
            }else{
                mapuuid = CUSTOMMAP.addMap(`${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}`);
            }
            tagNbt =new NbtCompound({
                "map_uuid": new NbtLong(mapuuid)
            });
            mainHandNbt = mainHandNbt.setTag("tag", tagNbt);
            mainhand.setNbt(mainHandNbt);
            pl.refreshItems();
            //await sleep(1000); 

            //记录mapuuid
            mapuuid = mainhand.getNbt().getTag("tag").getData("map_uuid");
            if (!mapuuid_list.includes(mapuuid)){
                mapuuid_list.push(mapuuid);
            }

            mc.spawnItem(mainhand, pl.blockPos);

            // 清除手中地图
            pl.getHand().setNull(); 
        }
    }
    await sleep(50);
    if (pl == null){return;}
    pl.refreshItems();

    MAPUUID_DATA.set(imgname, mapuuid_list);
    if(CONFIG_CONF.get('tips') == true){
        pl.sendText(`[CustomGetMap] §a成功获取所有地图画 §b<${imgFileName}>`); 
    }
    
    return true;
}

// 给予地图画封装
function generateNewNbt(pl, name, imgFileName, size) {
    let nbt1 = new NbtCompound({
        "Damage": new NbtInt(0),
        "RepairCost": new NbtInt(1),
        "display": new NbtCompound({
            "Name": new NbtString(name),
            "Lore": new NbtList([
                new NbtString(imgFileName),
                new NbtString(size),
                new NbtString("§7点击展示框释放地图画")
            ])
        }),
        "ench": new NbtList([]),
        // "addon": new NbtCompound({
        //     "type": new NbtString(type),
        //     "lvl": new NbtInt(lvl)
        // })
    });
    let nItem = mc.newItem("minecraft:field_masoned_banner_pattern", 1);
    let nbt = nItem.getNbt();
    nbt.setTag("tag", nbt1);
    nItem.setNbt(nbt);

    let mainhand = pl.getHand();
    if (!mainhand.isNull()){
        mc.spawnItem(mainhand, pl.blockPos);
    }
    mainhand.set(nItem);
    pl.refreshItems();
    return nbt;
}

// 点击展示框
var tmp = {};
mc.listen("onUseItemOn", UseItemOn);
function UseItemOn(pl, it, bl, side, pos){
    let xuid = pl.xuid;
    if (!tmp[xuid]) {
        tmp[xuid] = true;
        setTimeout(function () {
            delete tmp[xuid];
        }, 300);
        if (bl.type != "minecraft:frame" && bl.type != 'minecraft:glow_frame'){return;}
        if (it.type != 'minecraft:field_masoned_banner_pattern'){return;}
        if (it.lore[0].slice(0,2) != '§e'){return;}
        let imgFileName = it.lore[0].slice(2);
        var imgname = imgFileName.substring(0, imgFileName.lastIndexOf(".")); //无后缀图片名

        var binlist = findbin(imgname);
        if (binlist[0].length == 0){
            pl.sendText(`§c图片数据已被删除, 请先执行命令 /getmap ${imgFileName} 生成二进制文件`);
            return false;
        }

        // let width = Number(/§7(\d*)\s×\s(\d*)/.exec(it.lore[1])[1]);
        // let height = Number(/§7(\d*)\s×\s(\d*)/.exec(it.lore[1])[2]);
        //log(`imgFileName: ${imgFileName} | ${width}, ${height}`);

        let width = binlist[1];
        let height = binlist[2];
        let checkFrameResult = checkFrame(pl, bl, side, width, height);

        //展示框不够
        if (checkFrameResult.success == false){
            pl.sendText(checkFrameResult.output);
            return false;
        }

        yieldImg(pl, imgname, binlist, checkFrameResult.minPos, checkFrameResult.next, checkFrameResult.rotation);
        return false;
    }
}

// 在展示框生成图片
async function yieldImg(pl, imgname, binlist, minPos, next, rotation){
    let mapuuid_list = MAPUUID_DATA.get(imgname);
    if (mapuuid_list == null){
        MAPUUID_DATA.set(imgname, []);
        mapuuid_list = [];
    }

    let width = binlist[1];
    let height = binlist[2];
    //let pos = JSON.parse(JSON.stringify(minPos));
    let mainhand = pl.getHand();
    mainhand.setNull(); // 清除封装
    pl.refreshItems();
    //await sleep(CONFIG_CONF.get('setInterval'));
    
    for (let h = 0; h < height; h++){
        for (let w = 0; w < width; w++){
            mainhand = pl.getHand();
            let filledmap = mc.newItem("minecraft:filled_map",1);
            mainhand.set(filledmap);
            pl.refreshItems();
            await sleep(50); 

            //CuStomMap核心命令 更换手中的地图
            // var cmdResult = mc.runcmdEx(`/execute as "${pl.realName}" run map "${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}" true`);
            // if (cmdResult.success == false){
            //     cmdResult = mc.runcmdEx(`/execute "${pl.realName}" ~~~ map "${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}" true`);
            //     if (cmdResult.success == false){
            //         if(CONFIG_CONF.get('tips') == true){
            //             pl.sendText("[CustomGetMap] §c/map 命令执行失败\n请检查是否安装 CustomMap.dll 插件");
            //         }
            //         return;
            //     }
            // }
            // await sleep(50); 
            // pl.refreshItems();

            let mainHandNbt = mainhand.getNbt();
            let tagNbt = mainHandNbt.getTag("tag");
            let mapuuid;
            if (CONFIG_CONF.get("img2bin") == 'img2bin.exe'){
                if (CUSTOMMAP.addMapNoAlpha == undefined){
                    mainhand.setNull();
                    pl.refreshItems();
                    pl.tell(`§c不支持img2bin.exe解析的图片, 请调整配置`);
                    return false;
                }
                mapuuid = CUSTOMMAP.addMapNoAlpha(`${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}`);
            }else{
                mapuuid = CUSTOMMAP.addMap(`${DIR}/tempData/${imgname}/${imgname}-${w}_${height-1-h}`);
            }
            tagNbt = new NbtCompound({
                "map_uuid": new NbtLong(mapuuid)
            });
            mainHandNbt = mainHandNbt.setTag("tag", tagNbt);
            mainhand.setNbt(mainHandNbt);
            pl.refreshItems();
            //await sleep(1000); 
            
            if (!fillFrameImg(pl.getHand(), mc.getBlock(minPos.x, minPos.y, minPos.z, minPos.dimid), rotation)){
                pl.sendText(`§c向展示框放置地图失败(${minPos.x}, ${minPos.y}, ${minPos.z})`);
            }
            await sleep(CONFIG_CONF.get('setInterval')); 
            if (pl == null){return;}
            //log(`放置地图: ${minPos.x}, ${minPos.y}, ${minPos.z}`);

            //记录mapuuid
            mapuuid = mainhand.getNbt().getTag("tag").getData("map_uuid");
            if (!mapuuid_list.includes(mapuuid)){
                mapuuid_list.push(mapuuid);
            }

            // 清除手中地图
            mainhand.setNull();
            pl.refreshItems();
            next.width(minPos);
        }
        next.width(minPos, -width);
        next.height(minPos);
    }

    MAPUUID_DATA.set(imgname, mapuuid_list);
    if(CONFIG_CONF.get('tips') == true){
        pl.sendText(`[CustomGetMap] §a成功释放地图画 §b<${imgname}>`); 
    }
}

// 删除地图画
function deleteMap(isOP, playerName, imgFileName, imgname){
    function delMapData(imgFileName, imgname){
        // 删除存档地图数据
        let mapuuid_list = MAPUUID_DATA.get(imgname);
        if (mapuuid_list != null){
            for (let uuid of mapuuid_list){
                CUSTOMMAP.delMap(uuid);
            }
            MAPUUID_DATA.delete(imgname);
        }
        // 删除图片和缓存
        if (isSaveOriImg){
            SIZETMP_json.delete(`${DIR}/.img-ori/${imgFileName}`);
        }
        SIZETMP_json.delete(`${DIR}/.img/${imgFileName}`);
        File.delete(`${DIR}/.img-ori/${imgFileName}`);
        File.delete(`${DIR}/.img/${imgFileName}`);
        File.delete(`${DIR}/tempData/${imgname}`);
        return true;
    }
    if (isSaveOriImg){
        if (!(File.exists(`${DIR}/.img-ori/${imgFileName}`) || File.exists(`${DIR}/.img/${imgFileName}`) || File.exists(`${DIR}/tempData/${imgname}`))){
            return {success: true, output: `图片库中无此图片: ${imgFileName}`};
        }
    }else{
        if (!(File.exists(`${DIR}/.img/${imgFileName}`) || File.exists(`${DIR}/tempData/${imgname}`))){
            return {success: true, output: `图片库中无此图片: ${imgFileName}`};
        }
    }
    

    // 未安装机器人上传的情况
    if (!yoyorobot){
        //&& (File.exists(`./plugins/nodejs/yoyorobot`) || File.exists(`./plugins/nodejs/sparkbridge/plugins/spark.custmap`))
        if (isOP){
            delMapData(imgFileName, imgname);
            logger.info(`管理员 ${playerName} 删除地图画: ${imgFileName}`);
            return {success: true, output: `已删除地图画: ${imgFileName}`};
        }else{
            return {success: false, output: `仅管理员可删除图片`};
        }
    }

    // 安装了机器人上传的情况
    if (isOP){
        // 删除图片和缓存
        let uper = '匿名'; 
        for (let key in uploadAll){
            let user_imgs = uploadAll[key];
            if (user_imgs.imgname.includes(imgname)){
                user_imgs.imgname.splice(user_imgs.imgname.indexOf(imgname), 1);
                upload_config.set(key, user_imgs);
                uper = user_imgs.playerName;
            }
        }
        
        delMapData(imgFileName, imgname);
        logger.info(`管理员 ${playerName} 删除地图画: ${imgFileName}`);
        return {success: true, output: `已删除地图画: ${imgFileName}| 上传者: ${uper}`};
    }else{
        //玩家删除
        let user_imgs;
        let user_id;
        for (let key in uploadAll){
            if (uploadAll[key].playerName == playerName){
                user_imgs = uploadAll[key];
                user_id = key;
                break;
            }
        }
        if (user_imgs == null){
            return {success: false, output: `你没有上传过该图片`};
        }

        if (user_imgs.imgname.includes(imgname)){
            delMapData(imgFileName, imgname);
            user_imgs.imgname.splice(user_imgs.imgname.indexOf(imgname), 1);
            upload_config.set(user_id, user_imgs);
            logger.info(`${playerName} 删除地图画: ${imgFileName}`);
            return {success: true, output: `已删除地图画: ${imgFileName}`};
        }else{
            return {success: false, output: `你没有上传过该图片`};
        }
    }
}

// 服主删除文件则清除上传记录
function checkImg(){
    if (!yoyorobot){return;}
    let filelist = File.getFilesList(`${DIR}/.img/`);
    for (let key in uploadAll){
        //let tmp = JSON.parse(JSON.stringify(uploadAll[key].imgname));
        uploadAll[key].imgname = uploadAll[key].imgname.filter(
            imgname=>{
                let exitsFile = filelist.find(file => {
                    let file_imgname = file.substring(0, file.lastIndexOf("."));
                    if (imgname == file_imgname){
                        return true;
                    }else{
                        return false;
                    }
                });
                if (exitsFile){
                    return true;
                }else{
                    logger.info(`图片文件已被服主删除 <${imgname}> | 上传者: ${uploadAll[key].playerName}`);
                    return false;
                }
            }
        );
        //uploadAll[key].imgname.splice(index, 1);
        upload_config.set(key, uploadAll[key]);
    }
}

//----------------------------------
// 寻找处理后的二进制文件名 返回文件名列表
function findbin(imgname){
    var regular = /.*-([0-9]*)_([0-9]*)/;
    var mapflname =  File.getFilesList(`${DIR}/tempData/${imgname}/`);
    //log("imgname ",imgname," mapflname ",mapflname);
    var result =[];
    let width= 0, height= 0;
    for (let i=0;i<mapflname.length;i++){
        // if (mapflname[i].indexOf(imgname) != -1){
        if (mapflname[i].indexOf(imgname) != -1 && regular.test(mapflname[i])){
            result.push(mapflname[i]);
            let reRes = regular.exec(mapflname[i]);
            if(Number(reRes[1]) > width)( width = Number(reRes[1]) );
            if(Number(reRes[2]) > height)( height = Number(reRes[2]) );
        }
    }
    width++;
    height++;
    return [result, width, height];
}

async function sizeOf(path){
    // 读取缓存
    let pathList = path.split(" ");
    let res = [];
    let needGetPath = [];
    let needGetIndex = [];
    pathList.forEach((p, i)=>{
        let size = SIZETMP_json.get(p);
        if (size == null){
            needGetPath.push(p);
            needGetIndex.push(i);
            res.push({width:NaN,height: NaN});
        }else{
            res.push(size);
        }
    });
    if (needGetPath.length == 0){
        return res;
    }

    // 未设置获取尺寸程序
    if (CONFIG_CONF.get('imgGetSize') == undefined){
        let len = path.split(" ").length;
        resolve(new Array(len).fill({width:NaN,height: NaN}));
        return new Array(len).fill({width:NaN,height: NaN});
    }

    // nodejs sizeof库
    if (CONFIG_CONF.get('imgGetSize') == 'image-size.js'){
        let getres = [];
        needGetPath.forEach(p => {
            let npmres = sizeOf_npm(p);
            getres.push({width:npmres.width, height: npmres.height});
        });
        needGetPath.forEach((p, i) => {
            if (!(isNaN(getres[i].width) || isNaN(getres[i].height))){
                SIZETMP_json.set(p, getres[i]);
                res[needGetIndex[i]] = getres[i];
            }
        });
        return res;
    }

    // 调用外部
    let exeFile = `${DIR}/tools/${CONFIG_CONF.get('imgGetSize')}`;
    if (CONFIG_CONF.get('imgGetSize') == 'imgGetSize.ps1'){
        exeFile = `PowerShell.exe -file ` + exeFile;
    }
    if (CONFIG_CONF.get('imgGetSize') == 'imgGetSize.py'){
        exeFile = `${CONFIG_CONF.get("python")} ` + exeFile;
    }
    let cutcmd = `${exeFile} ${needGetPath.join(" ")}`;
    return new Promise((resolve, reject) => {
        system.newProcess(cutcmd, function(_exitcode, _output){
            if (_exitcode == 0){
                let getres = _output.split(",").map(str=>{
                    let l = str.split("x").map(n=>Number(n));
                    return {
                        width:  l[0], 
                        height: l[1]
                    };
                });
                needGetPath.forEach((p, i) => {
                    if (!(isNaN(getres[i].width) || isNaN(getres[i].height))){
                        SIZETMP_json.set(p, getres[i]);
                        res[needGetIndex[i]] = getres[i];
                    }
                });
                resolve(res);
            }else{
                logger.warn(_output);
                resolve(res);
            }
        });
    });
    // let cutcmd = `${DIR}/imgMagicConvert.exe "${path}" -identify`;
    // return new Promise((resolve, reject) => {
    //     system.newProcess(cutcmd, function(_exitcode, _output){
    //         if (_exitcode == 0){
    //             let res = /Geometry: (\d*)x(\d*)/.exec(_output);
    //             resolve({width: res[1], height:res[2]});
    //         }else{
    //             logger.error(_output);
    //             resolve(null);
    //         }
    //     });
    // });
}

// 确认玩家是否上传过该地图画（配合Yoyo机器人扩展）
function confirmUpload(pl, imgname){
    var upload_config = new JsonConfigFile(`${DIR}/upload.json`);
    var upload_data = JSON.parse(upload_config.read());
    for (let key in upload_data){
        if (upload_data[key].playerName == pl.realName){
            for (let i = 0; i< upload_data[key]["imgname"].length; i++){
                if (imgname ==  upload_data[key]["imgname"][i] || imgname ==  "r-"+upload_data[key]["imgname"][i]){
                    return true;
                }
            }
        }
    }
    return false;
}

// 展示框放置地图
function fillFrameImg(it, bl, rotation){
    if (it.type != "minecraft:filled_map"){return false;}
    if (bl.type != "minecraft:frame" && bl.type != 'minecraft:glow_frame'){return false;}
    let blNBT = bl.getNbt();
    let stateNBT = bl.getNbt().getTag("states").setByte("item_frame_map_bit", 1);
    blNBT.setTag("states", stateNBT);
    //log(blNBT.toSNBT(4));
    mc.setBlock(bl.pos, blNBT);

    let be = bl.getBlockEntity();
    let beNbt = be.getNbt();
    beNbt.setTag("Item", it.getNbt());
    beNbt.setTag("ItemRotation", new NbtFloat(rotation));
    // "ItemRotation": 0f,
    // "ItemRotation": 45f,
    // "ItemRotation": 90f,
    // "ItemRotation": 135f,
    // "ItemRotation": 180f,
    // "ItemRotation": 225f,
    // "ItemRotation": 270f,
    // "ItemRotation": 315f,
    
    if (be.setNbt(beNbt)){return true;}
}

function checkFrame(pl, bl, side, width, height){
    let w = 0;
    let h = 0;
    let mapWidth, mapHeight;
    let max = {up: 0, down: 0, right:0, left:0};
    let maxlock = {up: true, down: true, right:true, left:true};
    let radius = Math.max(width, height); //搜寻半径
    //let max = {up: Math.ceil(height/2), down: Math.ceil(-height/2), left: Math.ceil(-width/2), right: Math.ceil(width/2)};
    let r = axisSort(bl.pos, side);
    //log("面: "+r);
    let newPos = r[3];
    let pos_1;

    for (let i =0; i< radius*4; i++){
        if (i % 4 == 0){maxlock.up = false; max.up++;}
        if (i % 4 == 1){maxlock.down = false; max.down--;}
        if (i % 4 == 2){maxlock.right = false; max.right++;}
        if (i % 4 == 3){maxlock.left  = false; max.left--;}

        if (!maxlock.down){
            for (let m = max.left; m <= max.right; m++){
                let n = max.down;
                pos_1 = {[r[0]]: newPos[r[0]]+m, [r[1]]: newPos[r[1]]+n, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                let isframe = isEmptyFrameFunc(pos_1.x, pos_1.y, pos_1.z, pos_1.dimid);
                if(!isframe){
                    max.down++; 
                    //log(`${i}| ${m} ${n} | ${pos_1.x}, ${pos_1.y}, ${pos_1.z} | downlock: ${max.down}`);
                    break;
                }
            }
        }
        
        if (!maxlock.up){
            for (let m = max.left; m <= max.right; m++){
                let n = max.up;
                pos_1 = {[r[0]]: newPos[r[0]]+m, [r[1]]: newPos[r[1]]+n, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                let isframe = isEmptyFrameFunc(pos_1.x, pos_1.y, pos_1.z, pos_1.dimid);
                if(!isframe){
                    max.up--; 
                    //log(`${i}| ${m} ${n} | ${pos_1.x}, ${pos_1.y}, ${pos_1.z} | uplock: ${max.up}`);
                    break;
                }
            }
        }
        
        if (!maxlock.left){
            for (let n = max.down; n <= max.up; n++){
                let m = max.left;
                pos_1 = {[r[0]]: newPos[r[0]]+m, [r[1]]: newPos[r[1]]+n, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                let isframe = isEmptyFrameFunc(pos_1.x, pos_1.y, pos_1.z, pos_1.dimid);
                if(!isframe){
                    max.left++; 
                    //log(`${i}| ${m} ${n} | ${pos_1.x}, ${pos_1.y}, ${pos_1.z} | leftlock: ${max.left}`);
                    break;
                }
            }
        }
        
        if (!maxlock.right){
            for (let n = max.down; n <= max.up; n++){
                let m = max.right;
                pos_1 = {[r[0]]: newPos[r[0]]+m, [r[1]]: newPos[r[1]]+n, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                let isframe = isEmptyFrameFunc(pos_1.x, pos_1.y, pos_1.z, pos_1.dimid);
                if(!isframe){
                    max.right--; 
                    //log(`${i}| ${m} ${n} | ${pos_1.x}, ${pos_1.y}, ${pos_1.z} | rightlock: ${max.right}`);
                    break;
                }
            }
        }
        mapWidth = Math.abs(max.left - max.right ) + 1;
        mapHeight = Math.abs(max.up - max.down ) + 1;
        if (mapWidth >= width && mapHeight >= height){
            break;
        }
        if (maxlock.up && maxlock.down && maxlock.right && maxlock.left){
            break;
        }
        maxlock.up = true;
        maxlock.down = true;
        maxlock.left = true;
        maxlock.right = true;
    }

    //log(`final max R${max.right} U${max.up} L${max.left} D${max.down}`);
    mapWidth = Math.abs(max.left - max.right ) + 1;
    mapHeight = Math.abs(max.up - max.down ) + 1;
    let minPos, next, rotation;
    minPos = {[r[0]]: newPos[r[0]]+max.left, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
    if (side == 0 || side == 1){
        switch (pl.direction.toFacing()){
            case 3: 
                if (side == 1){
                    minPos = {[r[0]]: newPos[r[0]]+max.left, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.z+=value;}, height(pos, value=1){pos.x+=value;}};
                    rotation = 45;
                }else{
                    minPos = {[r[0]]: newPos[r[0]]+max.left, [r[1]]: newPos[r[1]]+max.up, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.z+=value;}, height(pos, value=1){pos.x-=value;}};
                    rotation = 135;
                }
                break;
            case 0:
                if (side == 1){
                    minPos = {[r[0]]: newPos[r[0]]+max.left, [r[1]]: newPos[r[1]]+max.up, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.x-=value;}, height(pos, value=1){pos.z+=value;}};
                    rotation = 90;
                    [mapWidth, mapHeight] = [mapHeight, mapWidth];
                }else{
                    minPos = {[r[0]]: newPos[r[0]]+max.right, [r[1]]: newPos[r[1]]+max.up, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.x-=value;}, height(pos, value=1){pos.z-=value;}};
                    rotation = 90;
                    [mapWidth, mapHeight] = [mapHeight, mapWidth];
                }
                break;
            case 1:
                if (side == 1){
                    minPos = {[r[0]]: newPos[r[0]]+max.right, [r[1]]: newPos[r[1]]+max.up, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.z-=value;}, height(pos, value=1){pos.x-=value;}};
                    rotation = 135;
                }else{
                    minPos = {[r[0]]: newPos[r[0]]+max.right, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.z-=value;}, height(pos, value=1){pos.x+=value;}};
                    rotation = 45;
                }
                break;
            case 2:
                if (side == 1){
                    minPos = {[r[0]]: newPos[r[0]]+max.right, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.x+=value;}, height(pos, value=1){pos.z-=value;}};
                    rotation = 0;
                    [mapWidth, mapHeight] = [mapHeight, mapWidth];
                }else{
                    minPos = {[r[0]]: newPos[r[0]]+max.left, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                    next = {width(pos, value=1){pos.x+=value;}, height(pos, value=1){pos.z+=value;}};
                    rotation = 0;
                    [mapWidth, mapHeight] = [mapHeight, mapWidth];
                }
                break;
        }
    }else{
        switch (side){
            case 2:
                minPos = {[r[0]]: newPos[r[0]]+max.right, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                next = {width(pos, value=1){pos.x-=value;}, height(pos, value=1){pos.y+=value;}};
                rotation = 0;
                break;
            case 3:
                minPos = {[r[0]]: newPos[r[0]]+max.left, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                next = {width(pos, value=1){pos.x+=value;}, height(pos, value=1){pos.y+=value;}};
                rotation = 0;
                break;
            case 4:
                minPos = {[r[0]]: newPos[r[0]]+max.left, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                next = {width(pos, value=1){pos.z+=value;}, height(pos, value=1){pos.y+=value;}};
                rotation = 0;
                break;
            case 5:
                minPos = {[r[0]]: newPos[r[0]]+max.right, [r[1]]: newPos[r[1]]+max.down, [r[2]]: newPos[r[2]], dimid: newPos.dimid};
                next = {width(pos, value=1){pos.z-=value;}, height(pos, value=1){pos.y+=value;}};
                rotation = 0;
                break;
        }
    }
    //log(`frame: ${mapWidth} * ${mapHeight} | minpos ${minPos.x}, ${minPos.y}, ${minPos.z}`);
    if (mapWidth == 1 && mapHeight == 1){
        if (isEmptyFrameFunc(bl.pos.x, bl.pos.y, bl.pos.z, bl.pos.dimid) == false){
            return {
                success: false,
                output: `§c该位置已有一幅地图画`
            };
        }
    }
    if (mapWidth < width || mapHeight < height){
        return {
            success: false,
            output: `§c该地图画至少需要 ${width} * ${height} 个展示框\n你的框架仅有 ${mapWidth} * ${mapHeight} (宽*高)`
        };
    }else{
        return {
            success: true,
            minPos: minPos,
            next: next,
            rotation: rotation
        };
    }
}

function isEmptyFrameFunc(x, y, z, dimid){
    let bl = mc.getBlock(x, y, z, dimid);
    if ((bl ==null) || (bl.type != 'minecraft:frame' && bl.type != 'minecraft:glow_frame' )){return false;}
    return bl.getBlockEntity().getNbt().getTag("Item") == null;
}

function axisSort(pos, side){
    let result;
    switch (side){
        case 0:
            result = ["z", "x", "y", pos];
            break;
        case 1:
            result = ["z", "x", "y", pos];
            break;
        case 2:
            result = ["x", "y", "z", pos];
            break;
        case 3:
            result = ["x", "y", "z", pos];
            break;
        case 4:
            result = ["z", "y", "x", pos];
            break;
        case 5:
            result = ["z", "y", "x", pos];
            break;
    }
    return result;
}

// 计算裁剪的尺寸
function getFitShapes(w, h){
    let n, m, order;
    if (h < w){
        order = false;
        n = h;
        m = w;
    }else{
        order = true;
        n = w;
        m = h;
    }
    let result = [];
    let n_share = Math.floor(n/128);
    let m_share = Math.floor(m/128);
    let ratio = n / m;

    let n_new, m_new;
    for (let i = 0; i< n_share; i++){
        n_new = n_share - i;
        m_new = Math.floor((n_share - i) /  ratio );
        if (order == true){
            result.push([n_new, m_new]);
        }else{
            result.push([m_new, n_new]);
        }
    }
    return result;
}

// 延迟
async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

// 结束菜单
function menu_end_run(pl, title, endmsg, lastForm, lastForm_run){
    var menu_end = mc.newSimpleForm();
    menu_end.setTitle(title);
    menu_end.setContent('\n\n'+endmsg+'\n\n\n\n');
    menu_end.addButton('§6§l退出菜单');
    if (lastForm != undefined && lastForm_run != undefined){
        menu_end.addButton('§l返回上一页');
    }
        
    pl.sendForm(menu_end,function(pl,id){
        if (id == null){return;}
        if (id == 1){
            return pl.sendForm(lastForm,lastForm_run);
        }
    });
}