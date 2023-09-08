// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\Administrator\.vscode/dts/HelperLib-master/src/index.d.ts"/>

ll.registerPlugin(
  /* name */ "Giveop",
  /* introduction */ "给予op",
  /* version */ [0, 1, 0],
  /* otherInformation */ { 作者: "xianyubb" }
);

let opid = new JsonConfigFile("plugins/Giveop/config.json");
opid.init("Key", ["Your_key"]);

mc.listen("onServerStarted", () => {
  const key = mc.newCommand("key", "通过输入 Key 来获取操作员权限", PermType.Any, 0x80);
  key.mandatory("keys", ParamType.RawText);
  key.overload(["keys"]);
  key.setCallback((_cmd, _ori, out, res) => {
    opid = new JsonConfigFile("plugins/Giveop/config.json");
    if (isKey(res.keys)) {
      mc.runcmd(`op "${_ori.player.name}"`);
      _ori.player.tell("OK");
    } else {
      _ori.player.tell("无效的 Key");
    }
  });
  key.setup();
});

function isKey(txt) {
  if (txt == "") return;
  let keys = opid.get("Key");
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] == txt) return 1;
  }
  return 0;
}