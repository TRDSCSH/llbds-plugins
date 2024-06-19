ll.registerPlugin("雪碧的连锁采集", "雪碧的连锁采集", [1,0,0], { author: "雪碧桑" })

let config = JSON.parse(File.readFrom('plugins/Sprite\'s_Chain_Gather/config.json'));

const IsPlayerTrusted = ll.import('ILAPI_IsPlayerTrusted'); // landId - string 领地ID | xuid - string 玩家XUID
const PosGetLand = ll.import('ILAPI_PosGetLand'); // 通过坐标查询领地 param: ( Vec4: {x, y, z, dimid}, noAccessCache: bool ) return: landId - string
const afterDestroyLapisOre = ll.imports('ME', 'afterDestroyLapisOre');

mc.listen("onStartDestroyBlock", (player, block) => {
    if (canStartChainGather(player, block)) {
        const itemType = player.getHand().type;
        const blockType = block.type;
        if (itemType && config[0].tools.indexOf(itemType) != -1) {
            if (config[0].blocks.indexOf(blockType) != -1) {
                player.setTitle('连锁采集已准备', 4, 0, 20, 0)
            }
        }
    }
});

mc.listen("onDestroyBlock", (player, block) => {
    if (!canStartChainGather(player, block))
        return;
    let item = player.getHand()
    let enchs = []
    if(item.isEnchanted) {
        let nbtEnchs = item.getNbt().getTag('tag').getTag('ench')
        for(let index = 0; index < nbtEnchs.getSize(); index++) {
            let nbtEnch = nbtEnchs.getTag(index)
            enchs.push({
                id: nbtEnch.getData("id"),
                level: nbtEnch.getData("lvl")
            })
        }
    }
    for(let subConfigIndex in config) {
        let subConfig = config[subConfigIndex]
        if(!subConfig.enable) {
            continue
        }
        for(let toolIndex in subConfig.tools) {
            let tool = subConfig.tools[toolIndex]
            if(tool === item.type) {
                for(let blockIndex in subConfig.blocks) {
                    let blockStr = subConfig.blocks[blockIndex]
                    if(blockStr === block.type) {
                        setTimeout(()=>{
                            chainGather(block, block.pos, subConfig.maxX, subConfig.maxY, subConfig.maxZ, subConfig.destroyDelay, item, player, enchs)
                        }, subConfig.destroyDelay)
                        break;
                    }
                }
                break;
            }
        }
    }
})

function chainGather(block, sourcePos, maxX, maxY, maxZ, destroyDelay, item, player, enchs) {
    const blockPosX = block.pos.x;
    const blockPosY = block.pos.y;
    const blockPosZ = block.pos.z;
    const dimid = block.pos.dimid;
    let poses = [
        new IntPos(blockPosX+1,blockPosY,blockPosZ,dimid),
        new IntPos(blockPosX-1,blockPosY,blockPosZ,dimid),
        new IntPos(blockPosX,blockPosY+1,blockPosZ,dimid),
        new IntPos(blockPosX,blockPosY-1,blockPosZ,dimid),
        new IntPos(blockPosX,blockPosY,blockPosZ+1,dimid),
        new IntPos(blockPosX,blockPosY,blockPosZ-1,dimid),
        new IntPos(blockPosX+1,blockPosY+1,blockPosZ,dimid),
        new IntPos(blockPosX+1,blockPosY-1,blockPosZ,dimid),
        new IntPos(blockPosX+1,blockPosY,blockPosZ+1,dimid),
        new IntPos(blockPosX+1,blockPosY,blockPosZ-1,dimid),
        new IntPos(blockPosX-1,blockPosY+1,blockPosZ,dimid),
        new IntPos(blockPosX-1,blockPosY-1,blockPosZ,dimid),
        new IntPos(blockPosX-1,blockPosY,blockPosZ+1,dimid),
        new IntPos(blockPosX-1,blockPosY,blockPosZ-1,dimid),
        new IntPos(blockPosX,blockPosY+1,blockPosZ+1,dimid),
        new IntPos(blockPosX,blockPosY+1,blockPosZ-1,dimid),
        new IntPos(blockPosX,blockPosY-1,blockPosZ+1,dimid),
        new IntPos(blockPosX,blockPosY-1,blockPosZ-1,dimid),
        new IntPos(blockPosX+1,blockPosY+1,blockPosZ+1,dimid),
        new IntPos(blockPosX+1,blockPosY+1,blockPosZ-1,dimid),
        new IntPos(blockPosX+1,blockPosY-1,blockPosZ+1,dimid),
        new IntPos(blockPosX+1,blockPosY-1,blockPosZ-1,dimid),
        new IntPos(blockPosX-1,blockPosY+1,blockPosZ+1,dimid),
        new IntPos(blockPosX-1,blockPosY+1,blockPosZ-1,dimid),
        new IntPos(blockPosX-1,blockPosY-1,blockPosZ+1,dimid),
        new IntPos(blockPosX-1,blockPosY-1,blockPosZ-1,dimid)]

    for(let posIndex in poses) {
        let pos = poses[posIndex]
        let targetBlock = mc.getBlock(pos)
        if(targetBlock.type === block.type) {
            if(item.damage != item.maxDamage) {
                let unbreaking = 0
                for(let index in enchs) {
                    let ench = enchs[index]
                    if(ench.id === 17) {
                        unbreaking = ench.level
                        break
                    }
                }
                if(!player.isCreative && Math.random() < 1/(unbreaking+1)) {
                    item.setDamage(item.damage + 1)
                }
                player.refreshItems()
                if (landId(pos) == -1) { // 领地内禁用连锁采集
                    targetBlock.destroy(!player.isCreative);
                    // if (afterDestroyLapisOre) afterDestroyLapisOre(player, targetBlock);
                } else {
                    break;
                }
                if(Math.abs(pos.x - sourcePos.x) < maxX && Math.abs(pos.y - sourcePos.y) < maxY && Math.abs(pos.z - sourcePos.z) < maxZ) {
                    setTimeout(()=>{
                        chainGather(targetBlock, sourcePos, maxX, maxY, maxZ, destroyDelay, item, player, enchs)
                    }, destroyDelay)
                }
            } else {
                break;
            }
        }
    }
}

function canStartChainGather(pl, bl) {
    const landid = landId(bl.pos);
    return pl.isSneaking && pl.gameMode != 1 && (landid == -1 || IsPlayerTrusted(landid, pl.xuid));
}

function landId(pos) {
    let result = -1;
    
    result = PosGetLand(buildRawPosVec4(pos.x, pos.y, pos.z, pos.dimid));
    if (result == -1) {
        result = PosGetLand(buildRawPosVec4(pos.x, pos.y, pos.z - 1, pos.dimid));
        if (result == -1) {
            result = PosGetLand(buildRawPosVec4(pos.x, pos.y - 1, pos.z, pos.dimid));
            if (result == -1) {
                result = PosGetLand(buildRawPosVec4(pos.x - 1, pos.y, pos.z, pos.dimid));
                if (result == -1) {
                    result = PosGetLand(buildRawPosVec4(pos.x, pos.y, pos.z + 1, pos.dimid));
                    if (result == -1) {
                        result = PosGetLand(buildRawPosVec4(pos.x, pos.y + 1, pos.z, pos.dimid));
                        if (result == -1) result = PosGetLand(buildRawPosVec4(pos.x + 1, pos.y, pos.z, pos.dimid));
                    }
                }
            }
        }
    }
    
    return result;
}

function buildRawPosVec4(x, y, z, dimid) {
    return {
        x: x,
        y: y,
        z: z,
        dimid: dimid
    };
}