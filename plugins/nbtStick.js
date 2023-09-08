let nbtStickSNBT = '{"Count":1b,"Damage":0s,"Name":"minecraft:stick","WasPickedUp":0b,"tag":{"display":{"Name":"§l§gNbt Stick§r"},"ench":[{"id":0s,"lvl":0s}]}}';
// {"Count":1b,"Damage":0s,"Name":"minecraft:stick","WasPickedUp":0b,"tag":{"display":{"Name":"§l§gRide§r"},"ench":[{"id":0s,"lvl":0s}]}}
// {"Count":1b,"Damage":0s,"Name":"minecraft:stick","WasPickedUp":0b,"tag":{"display":{"Name":"§l§gItemDropChance -> 0§r"},"ench":[{"id":0s,"lvl":0s}]}}

let nbtStickItem = NBT.parseSNBT(nbtStickSNBT);

mc.listen("onAttackEntity", (pl, en, da) => {
    let it = pl.getHand();
    if (!it) return;
    let itemType = it.getNbt().getTag("Name") ? it.getNbt().getTag("Name").toString() : null;
    let itemTag = it.getNbt().getTag("tag") ? it.getNbt().getTag("tag").toString() : null;
    if (itemType == "minecraft:stick" && itemTag == '{"display":{"Name":"§l§gNbt Stick§r"},"ench":[{"id":0,"lvl":0}]}') {
        let nbt = en.getNbt();
        let snbt = nbt.toSNBT();
        let entityName = nbt.getTag("identifier");
        log(snbt);
        pl.tell(`§g${entityName}§r`);
        return false;
    } else if (itemType == "minecraft:stick" && itemTag == '{"display":{"Name":"§l§gRide§r"},"ench":[{"id":0,"lvl":0}]}') {
        let plNbt = pl.getNbt(), enNbt = en.getNbt();
        let enUniId = enNbt.getTag("UniqueID"), plUniId = plNbt.getTag("UniqueID");
        plNbt.setTag("OnGround", new NbtByte(0));
        plNbt.setTag("RideID", enUniId);

        // let nbts = new NbtCompound({
        //     "entityID": plUniId,
        //     "linkID": new NbtByte(0)
        // });
        // let linksTag = new NbtList([nbts]);

        // let nbts2 = new NbtCompound({
        //     "id": new NbtString("minecraft:skeleton")
        // });
        // let linksTag2 = new NbtList([nbts2]);

        // log(linksTag2.toString());

        // enNbt.setTag("LinksTag", linksTag);
        // enNbt.setTag("Passengers", linksTag2);

        // en.setNbt(enNbt);
        pl.setNbt(plNbt);

        return false;
    }
});

mc.listen("onAttackBlock", (pl, bl, it) => {
    if (!it) return;
    let itemType = it.getNbt().getTag("Name") ? it.getNbt().getTag("Name").toString() : null;
    let itemTag = it.getNbt().getTag("tag") ? it.getNbt().getTag("tag").toString() : null;
    // log(itemTag);
    if (itemType == "minecraft:stick" && itemTag == '{"display":{"Name":"§l§gNbt Stick§r"},"ench":[{"id":0,"lvl":0}]}') {
        // let blNbt = bl.getNbt();
        let be = bl.getBlockEntity();
        if (be) {
            let beNbt = be.getNbt();
            log(beNbt.toString());
            pl.tell(`${beNbt.toString()}`);
        }
        return false;
    } else if (itemType == "minecraft:stick" && itemTag == '{"display":{"Name":"§l§gItemDropChance -> 0§r"},"ench":[{"id":0,"lvl":0}]}') {
        let be = bl.getBlockEntity();
        if (be) {
            let beNbt = be.getNbt();
            // beNbt.setTag("ItemDropChance", new NbtFloat(0));
            let angle = Math.floor(Math.random() * 360);
            beNbt.setTag("ItemRotation", new NbtFloat(angle));
            be.setNbt(beNbt);
            pl.tell(`ItemRotation -> ${angle}`);
        }
        return false;
    }
});