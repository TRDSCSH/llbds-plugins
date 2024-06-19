// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\YeJi\Documents/dts/HelperLib-master/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "LandColorBox",
    /* introduction */ "修护领地可以打开彩色潜影盒",
    /* version */ [0,0,1],
    /* otherInformation */ {"author":"PHEyeji"}
); 

let trust = lxl.import('ILAPI_IsPlayerTrusted')
let landowner = lxl.import('ILAPI_IsLandOwner')
let landop = lxl.import('ILAPI_IsLandOperator')
let GetLand = lxl.import('ILAPI_PosGetLand')
let Set = lxl.import('ILAPI_CheckSetting')

mc.listen("onOpenContainer",(pl,bl)=>{
    let landId = GetLand(bl.pos)
    if(landId == -1) return
    if(Set(landId,"use_shulker_box")) return
    if(trust(landId,pl.xuid) || landowner(landId,pl.xuid) || landop(pl.xuid)) return
    if(!bl.name.includes("shulker")) return
    return false
})

