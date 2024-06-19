
ll.registerPlugin(
    /* name */ "ShowFormation",
    /* introduction */ "群系显示插件",
    /* version */[1, 0, 1],
    /* otherInformation */ "Ctrini"
);

const posGetLand = lxl.import('ILAPI_PosGetLand');

let pgsystem = {};
var groups = data.parseJson(File.readFrom('./plugins/Ctrini/showformation/gsystem.json'));

setInterval(gsystem,1000);
function gsystem(){
  let player_list = mc.getOnlinePlayers();
  for (var i = 0; i < player_list.length; i++) {
    var player = player_list[i];
    
    if (posGetLand(player.pos) != -1) continue; // 在领地内不显示群系

    let qunxi = player.getBiomeName();
    if (pgsystem[player.xuid] != qunxi) {
      if (groups[qunxi] !== undefined) {
        qunxi = groups[qunxi];
      }
      pgsystem[player.xuid] = player.getBiomeName();
      player.setTitle(` `,2);
      player.setTitle(`                       \n\n\n\n${qunxi}`,3);
    }
  }
};

mc.listen("onJoin", function (pl) {
    let onlineplayer = {};
    onlineplayer = mc.getOnlinePlayers();
    for (let i = 0; i < onlineplayer.length; i++) {
      pgsystem[onlineplayer[i].xuid] = "0";
    }
});

logger.info("群系显示插件加载成功 作者:Ctrini");