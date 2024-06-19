mc.listen("onEntityExplode", (source,pos,radius,maxResistance,isDestroy,isFire) => {
    // log(`${source.type}`);
    if (isDestroy || isFire) return false;
});