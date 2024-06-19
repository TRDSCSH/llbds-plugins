ll.registerPlugin("血量显示", "显示最后一次攻击的生物血量", [0,0,1], { author: "sprite" })

let recordEntity = {}
let timers = {}

mc.listen("onMobHurt", (mob,source,damage,cause) => {
    if(recordEntity[mob.id.toString()] && Object.keys(recordEntity[mob.id.toString()]).length > 0) {
        Object.keys(recordEntity[mob.id.toString()]).forEach((item) => {
            let player = recordEntity[mob.id.toString()][item]
            let health = Math.max(0, mob.health - parseInt(damage));
            let healthColor = '§a'
            if((health / mob.maxHealth) <= 0.25)
                healthColor = '§c'
            player.sendText("§f" + mob.name + "\n" + healthColor + health + "§f/§a" + mob.maxHealth, 4)
        })
    }
    if(source && source.type === 'minecraft:player') {
        let player = source.toPlayer()
        if(!recordEntity[mob.id.toString()])
            recordEntity[mob.id.toString()] = {}
        if(timers[player.xuid]) {
            delete timers[player.xuid][player.xuid]
            delete timers[player.xuid]
        }
        let entityId = mob.id.toString()

        recordEntity[entityId][player.xuid] = player
        timers[player.xuid] = recordEntity[entityId]
        
        let health = Math.max(0, mob.health - parseInt(damage));
        let healthColor = '§a'
        if((health / mob.maxHealth) <= 0.25)
            healthColor = '§c'
        player.sendText("§f" + mob.name + "\n" + healthColor + health + "§f/§a" + mob.maxHealth, 4)
        setTimeout(() => {
            if(recordEntity[entityId] && recordEntity[entityId][player.xuid]) {
                delete recordEntity[entityId][player.xuid]
                delete timers[player.xuid]
            }
        }, 20000)
    }
})

mc.listen("onMobDie", (mob,source,cause) => {
    if(recordEntity[mob.id.toString()] && Object.keys(recordEntity[mob.id.toString()]).length > 0) {
        Object.keys(recordEntity[mob.id.toString()]).forEach((item) => {
            let player = recordEntity[mob.id.toString()][item]
            player.sendText("§l§c" + mob.name + "\n" + "已死亡", 4)
        })
        delete recordEntity[mob.id.toString()]
    }
})
