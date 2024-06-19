ll.registerPlugin('PlayerStatsTracker', 'Track player stats.', [1, 1, 0])

const defaultConfig = {
  language: 'zh_CN',
  timezone: {
    auto: true,
    offset: 8
  },
  backupLocation: './plugins/PlayerStatsTracker/backups',
  exportLocation: './plugins/PlayerStatsTracker/exports',
  databaseSaveInterval: 10000
}

const config = new JsonConfigFile('./plugins/PlayerStatsTracker/config.json', data.toJson(defaultConfig))
const language = config.get('language') || defaultConfig.language
const timezone = config.get('timezone') || defaultConfig.timezone
const autoTimezone = timezone?.auto || defaultConfig.timezone.auto
const timezoneOffset = timezone?.offset || defaultConfig.timezone.auto
const backupLocation = config.get('backupLocation') || defaultConfig.backupLocation
const exportLocation = config.get('exportLocation') || defaultConfig.exportLocation
const databaseSaveInterval = Math.floor(config.get('databaseSaveInterval')) || defaultConfig.databaseSaveInterval

const tStrings = {
  'zh_CN': {
    stats: '统计信息',
    ranking: '排行榜',
    playerName: '玩家名称',
    commands: {
      stats: {
        description: '查看统计信息',
        noPlayerData: '无此玩家数据',
        specifyPlayerName: '请指定玩家名',
        noPermissionQueryOther: '你无权查询其他玩家'
      },
      statsmodify: {
        description: '修改玩家统计信息',
        allPlayers: '所有可修改的玩家：',
        allNumbers: '可修改的统计信息编号：',
        noSuchPlayer: '无此玩家',
        noPlayerData: '无此玩家数据',
        noSuchNumber: '无此编号的统计信息',
        specifyPlayerName: '请指定玩家名',
        specifyOption: '请指定操作',
        success: '修改完成',
        deleteSuccess: '玩家数据删除完成',
        deleteFailed: '玩家数据删除失败',
        cannotBeNegative: '不能设为负数',
      },
      statsbackup: {
        description: '备份统计信息数据库',
        success: '数据库备份完成',
        failed: '数据库备份失败'
      },
      statsexport: {
        description: '导出统计信息',
        success: '统计信息导出完成',
        failed: '统计信息导出失败'
      },
      ranking: {
        description: '查看排行榜',
        useCommandToQuery: '请使用"ranking <编号>"来查询某一项统计数据的排行榜',
        noSuchNumber: '无此编号的排行榜'
      },
      statsmapping: {
        description: '统计信息映射到计分板',
        specifyOption: '请指定操作',
        noMapping: '当前不存在任何映射',
        existMapping: '已映射的计分项：',
        availableNumber: '可映射的编号：',
        objectiveMapped: '该计分项已存在映射',
        noSuchObjective: '该计分项不存在',
        noSuchNumber: '该编号不存在',
        addSuccess: '添加映射完成',
        addFailed: '添加映射失败',
        objectiveNotMapped: '该计分项不存在映射',
        removeSuccess: '删除映射完成',
        removeFailed: '删除映射失败',
        reloadSuccess: '映射重载完成',
        reloadFailed: '映射重载失败',
        formTitle: '统计信息映射到计分板',
        virtual: '虚拟',
        actual: '实际',
        virtualDescription: '当设为虚拟时，计分板分数将不会与玩家关联，而只是以玩家名记录。',
        listMapping: '查看映射',
        addMapping: '添加映射',
        removeMapping: '删除映射',
        reloadMapping: '重载映射',
        reloadAllMapping: '重载全部映射',
        existMappingTitle: '已映射的计分项',
        noObjectiveAvailable: '当前不存在未映射的计分项',
        objective: '计分项',
        stats: '统计信息',
        mapping: '映射',
        reloadDescription: '当映射到计分板的统计信息与实际统计信息不符时，您可以使用重载来修复。',
        reloadAllWarn: '当映射的计分项过多时，重载全部映射可能导致性能问题，确定要重载全部映射吗？',
        confirm: '确定',
        cancel: '取消'
      }
    },
    statsCategories: {
      baseinfo: '基础信息',
      combat: '战斗',
      mining: '挖矿',
      planting: '种植',
      fishing: '钓鱼'
    },
    statsStrings: {
      death: '死亡数',
      killed: '击杀数',
      damageTaken: '累计受到伤害',
      damageDealt: '累计造成伤害',
      destroyed: '破坏方块数',
      placed: '放置方块数',
      tilled: '耕地次数',
      planted: '种植次数',
      harvested: '收获次数',
      overworldMined: '主世界挖矿数',
      netherMined: '下界挖矿数',
      fished: '钓鱼次数',
      hooked: '钩实体次数',
      ate: '吃掉食物数',
      totem: '消耗不死图腾数',
      chat: '聊天次数',
      chatChars: '聊天字符数',
      jumped: '跳跃次数',
      expObtained: '累积获得经验',
      highestLevel: '最高等级',
      playTime: '游玩时间',
      lastOnline: '最后在线时间',
      loginDays: '登录天数',
      distanceMoved: '移动距离',
      subStats: {
        ate: {
          'minecraft:golden_apple': '金苹果',
          'minecraft:enchanted_golden_apple': '附魔金苹果'
        },
        killed: {
          'equus': '马属',
          'minecraft:horse': '马',
          'minecraft:skeleton_horse': '骷髅马',
          'minecraft:zombie_horse': '僵尸马',
          'minecraft:donkey': '驴',
          'minecraft:mule': '骡',
          'minecraft:wandering_trader': '流浪商人',
          'minecraft:trader_llama': '行商羊驼',
          'minecraft:iron_golem': '铁傀儡',
          'minecraft:warden': '监守者',
          'minecraft:wither': '凋灵',
          'minecraft:ender_dragon': '末影龙',
        },
        fished: {
          'fish': '鱼',
          'junk': '垃圾',
          'treasure': '宝藏'
        },
        planted: {
          'minecraft:wheat': '小麦种子',
          'minecraft:potatoes': '马铃薯',
          'minecraft:carrots': '胡萝卜',
          'minecraft:melon_stem': '西瓜种子',
          'minecraft:pumpkin_stem': '南瓜种子',
          'minecraft:beetroot': '甜菜种子',
          'minecraft:pitcher_crop': '瓶子草荚果',
          'minecraft:torchflower_crop': '火把花种子',
          'minecraft:nether_wart': '下界疣',
          'minecraft:cocoa': '可可豆'
        },
        harvested: {
          'minecraft:wheat': '小麦',
          'minecraft:potatoes': '马铃薯',
          'minecraft:carrots': '胡萝卜',
          'minecraft:beetroot': '甜菜根',
          'minecraft:pitcher_crop': '瓶子草',
          'minecraft:torchflower': '火把花',
          'minecraft:pumpkin': '南瓜',
          'minecraft:melon_block': '西瓜',
          'minecraft:nether_wart': '下界疣',
          'minecraft:cocoa': '可可果'
        },
        overworldMined: {
          'minecraft:coal_ore': '煤矿石',
          'minecraft:deepslate_coal_ore': '深层煤矿石',
          'minecraft:iron_ore': '铁矿石',
          'minecraft:deepslate_iron_ore': '深层铁矿石',
          'minecraft:copper_ore': '铜矿石',
          'minecraft:deepslate_copper_ore': '深层铜矿石',
          'minecraft:lapis_ore': '青金石矿石',
          'minecraft:deepslate_lapis_ore': '深层青金石矿石',
          'minecraft:gold_ore': '金矿石',
          'minecraft:deepslate_gold_ore': '深层金矿石',
          'minecraft:redstone_ore': '红石矿石',
          'minecraft:deepslate_redstone_ore': '深层红石矿石',
          'minecraft:diamond_ore': '钻石矿石',
          'minecraft:deepslate_diamond_ore': '深层钻石矿石',
          'minecraft:emerald_ore': '绿宝石矿石',
          'minecraft:deepslate_emerald_ore': '深层绿宝石矿石'
        },
        netherMined: {
          'minecraft:quartz_ore': '下界石英矿石',
          'minecraft:nether_gold_ore': '下界金矿石',
          'minecraft:ancient_debris': '远古残骸'
        },
        distanceMoved: {
          'aviate': '鞘翅飞行',
          'minecraft:boat': '乘船',
          'minecraft:chest_boat': '乘运输船',
          'minecraft:minecart': '乘矿车',
          'equus': '骑马属',
          'minecraft:horse': '骑马',
          'minecraft:skeleton_horse': '骑骷髅马',
          'minecraft:zombie_horse': '骑僵尸马',
          'minecraft:donkey': '骑驴',
          'minecraft:mule': '骑骡',
          'minecraft:pig': '骑猪',
          'minecraft:strider': '骑炽足兽'
        }
      }
    }
  },
  'en_US': {
    stats: 'Statistics',
    ranking: 'Ranking',
    playerName: 'Player Name',
    commands: {
      stats: {
        description: 'View statistics',
        noPlayerData: 'This player has no data.',
        specifyPlayerName: 'Please specify a player name.',
        noPermissionQueryOther: "You don't have permission to query other players."
      },
      statsdelete: {
        description: 'Delete player statistics',
        noPlayerData: 'This player has no data.',
        specifyPlayerName: 'Please specify a player name.'
      },
      statsmodify: {
        description: 'Modify player stats',
        allPlayers: 'All modifiable players:',
        allNumbers: 'Modifiable statistic numbers:',
        noSuchPlayer: 'No such player.',
        noPlayerData: 'This player has no data.',
        noSuchNumber: 'No statistic for this number.',
        specifyPlayerName: 'Please specify a player name.',
        specifyOption: 'Please specify the option.',
        success: 'Modify complete.',
        deleteSuccess: 'Delete player data complete.',
        deleteFailed: 'Delete player data failed.',
        cannotBeNegative: 'Cannot set to negative.',
      },
      statsbackup: {
        description: 'Backup statistics database',
        success: 'Database backup complete.',
        failed: 'Database backup failed.'
      },
      statsexport: {
        description: 'Export statistics',
        success: 'Statistics export complete.',
        failed: 'Statistics export failed.'
      },
      ranking: {
        description: 'View ranking',
        useCommandToQuery: 'Please use "ranking <number>" to query the ranking of a certain statistics:',
        noSuchNumber: 'No ranking item with this number.'
      },
      statsmapping: {
        description: 'Map statistics to scoreboard',
        specifyOption: 'Please specify the option.',
        noMapping: 'No mapping currently exists.',
        existMapping: 'Mapped objectives:',
        availableNumber: 'Mappable numbers:',
        objectiveMapped: 'This objective already has a mapping.',
        noSuchObjective: 'This objective does not exist.',
        noSuchNumber: 'This number does not exist',
        addSuccess: 'Add mapping complete.',
        addFailed: 'Add mapping failed.',
        virtual: 'Virtual',
        actual: 'Actual',
        virtualDescription: 'When set to virtual, the scoreboard score will not be associated with the player, but will only be recorded by the player\'s name.',
        objectiveNotMapped: 'There is no mapping for this objective.',
        removeSuccess: 'Remove mapping complete.',
        removeFailed: 'Remove mapping failed.',
        reloadSuccess: 'Reload mapping complete.',
        reloadFailed: 'Reload mapping failed.',
        formTitle: 'Map Statistics to Scoreboard',
        listMapping: 'View Mapping',
        addMapping: 'Add Mapping',
        removeMapping: 'Remove Mapping',
        reloadMapping: 'Reload Mapping',
        reloadAllMapping: 'Reload All Mappings',
        existMappingTitle: 'Mapped Objectives',
        noObjectiveAvailable: 'There are currently no unmapped objectives.',
        objective: 'Objective',
        stats: 'Statistics',
        mapping: 'Mapping',
        reloadDescription: 'When the statistics mapped to the scoreboard don\'t match the actual statistics, you can use reload to fix. ',
        reloadAllWarn: 'If there are too many mapped objectives, reloading all mappings may cause performance problems. Are you sure you want to reload all mappings?',
        confirm: 'Confirm',
        cancel: 'Cancel'
      }
    },
    statsCategories: {
      baseinfo: 'Basic info',
      combat: 'Combat',
      mining: 'Mining',
      planting: 'Planting',
      fishing: 'Fishing'
    },
    statsStrings: {
      death: 'Deaths',
      killed: 'Kills',
      damageTaken: 'Damage Taken',
      damageDealt: 'Damage Dealt',
      destroyed: 'Blocks Destroyed',
      placed: 'Blocks Placed',
      tilled: 'Farmlands Tilled',
      planted: 'Planted',
      harvested: 'Harvested',
      overworldMined: 'Overworld Mined',
      netherMined: 'Nether Mined',
      fished: 'Fished',
      hooked: 'Number of Hook Entities',
      ate: 'Food Eaten',
      totem: 'Totem of Undying Used',
      chat: 'Number of Chats',
      chatChars: 'Chat Characters',
      jumped: 'Jumps',
      expObtained: 'Experience Obtained',
      highestLevel: 'Highest Level',
      playTime: 'Time Played',
      lastOnline: 'Last Online',
      loginDays: 'Login Days',
      distanceMoved: 'Distance Moved',
      subStats: {
        ate: {
          'minecraft:golden_apple': 'Golden Apple',
          'minecraft:enchanted_golden_apple': 'Enchanted Golden Apple'
        },
        killed: {
          'equus': 'Equus',
          'minecraft:horse': 'Horse',
          'minecraft:skeleton_horse': 'Skeleton Horse',
          'minecraft:zombie_horse': 'Zombie Horse',
          'minecraft:donkey': 'Donkey',
          'minecraft:mule': 'Mule',
          'minecraft:wandering_trader': 'Wandering Trader',
          'minecraft:trader_llama': 'Trader Llama',
          'minecraft:iron_golem': 'Iron Golem',
          'minecraft:warden': 'Warden',
          'minecraft:wither': 'Wither',
          'minecraft:ender_dragon': 'Ender Dragon',
        },
        fished: {
          'fish': 'Fish',
          'junk': 'Junk',
          'treasure': 'Treasure'
        },
        planted: {
          'minecraft:wheat': 'Wheat Seeds',
          'minecraft:potatoes': 'Potato',
          'minecraft:carrots': 'Carrot',
          'minecraft:melon_stem': 'Melon Seeds',
          'minecraft:pumpkin_stem': 'Pumpkin Seeds',
          'minecraft:beetroot': 'Beetroot Seeds',
          'minecraft:pitcher_crop': 'Pitcher Pods',
          'minecraft:torchflower_crop': 'Torchflower Seeds',
          'minecraft:nether_wart': 'Nether Wart',
          'minecraft:cocoa': 'Cocoa Beans'
        },
        harvested: {
          'minecraft:wheat': 'Wheat',
          'minecraft:potatoes': 'Potatoes',
          'minecraft:carrots': 'Carrotes',
          'minecraft:beetroot': 'Beetroot',
          'minecraft:pitcher_crop': 'Pitcher',
          'minecraft:torchflower': 'Torchflower',
          'minecraft:pumpkin': 'Pumpkin',
          'minecraft:melon_block': 'Melon',
          'minecraft:nether_wart': 'Nether Wart',
          'minecraft:cocoa': 'Cocoa'
        },
        overworldMined: {
          'minecraft:coal_ore': 'Coal Ore',
          'minecraft:deepslate_coal_ore': 'Deepslate Coal Ore',
          'minecraft:iron_ore': 'Iron Ore',
          'minecraft:deepslate_iron_ore': 'Deepslate Iron Ore',
          'minecraft:copper_ore': 'Copper Ore',
          'minecraft:deepslate_copper_ore': 'Deepslate Copper Ore',
          'minecraft:lapis_ore': 'Lapis Ore',
          'minecraft:deepslate_lapis_ore': 'Deepslate Lapis Ore',
          'minecraft:gold_ore': 'Gold Ore',
          'minecraft:deepslate_gold_ore': 'Deepslate Gold Ore',
          'minecraft:redstone_ore': 'Redstone Ore',
          'minecraft:deepslate_redstone_ore': 'Deepslate Redstone Ore',
          'minecraft:diamond_ore': 'Diamond Ore',
          'minecraft:deepslate_diamond_ore': 'Deepslate Diamond Ore',
          'minecraft:emerald_ore': 'Emerald Ore',
          'minecraft:deepslate_emerald_ore': 'Deepslate Emerald Ore'
        },
        netherMined: {
          'minecraft:quartz_ore': 'Quartz Ore',
          'minecraft:nether_gold_ore': 'Nether Gold Ore',
          'minecraft:ancient_debris': 'Ancient Debris'
        },
        distanceMoved: {
          'aviate': 'By Elytra',
          'minecraft:boat': 'By Boat',
          'minecraft:chest_boat': 'By Chest Boat',
          'minecraft:minecart': 'By Minecart',
          'equus': 'By Equus',
          'minecraft:horse': 'By Horse',
          'minecraft:skeleton_horse': 'By Skeleton Horse',
          'minecraft:zombie_horse': 'By Zombie Horse',
          'minecraft:donkey': 'By Donkey',
          'minecraft:mule': 'By Mule',
          'minecraft:pig': 'By Pig',
          'minecraft:strider': 'By Strider'
        }
      }
    }
  }
}[language]

function statsToFormattedList(stats) {
  return [
    {
      title: tStrings.statsCategories.baseinfo,
      titleFormat: '§f§l',
      contents: [
        { title: tStrings.statsStrings.lastOnline, value: dateToString(new Date(stats.lastOnline)), key: 'lastOnline' },
        { title: tStrings.statsStrings.playTime, value: secToTime(stats.playTime), key: 'playTime' },
        { title: tStrings.statsStrings.loginDays, value: stats.loginDays, key: 'loginDays' },
        { title: tStrings.statsStrings.destroyed, value: stats.destroyed, key: 'destroyed' },
        { title: tStrings.statsStrings.placed, value: stats.placed, key: 'placed' },
        { title: tStrings.statsStrings.jumped, value: stats.jumped, key: 'jumped' },
        {
          title: tStrings.statsStrings.distanceMoved, value: stats.distanceMoved.toFixed(2), key: 'distanceMoved', subContents: [
            { title: tStrings.statsStrings.subStats.distanceMoved['minecraft:boat'], value: (stats.subStats.distanceMoved['minecraft:boat'] + stats.subStats.distanceMoved['minecraft:chest_boat']).toFixed(2), key: 'minecraft:boat' },
            { title: tStrings.statsStrings.subStats.distanceMoved['minecraft:minecart'], value: stats.subStats.distanceMoved['minecraft:minecart'].toFixed(2), key: 'minecraft:minecart' },
            { title: tStrings.statsStrings.subStats.distanceMoved['equus'], value: (stats.subStats.distanceMoved['minecraft:horse'] + stats.subStats.distanceMoved['minecraft:skeleton_horse'] + stats.subStats.distanceMoved['minecraft:zombie_horse'] + stats.subStats.distanceMoved['minecraft:donkey'] + stats.subStats.distanceMoved['minecraft:mule']).toFixed(2), key: 'equus' },
            { title: tStrings.statsStrings.subStats.distanceMoved['minecraft:pig'], value: stats.subStats.distanceMoved['minecraft:pig'].toFixed(2), key: 'minecraft:pig' },
            { title: tStrings.statsStrings.subStats.distanceMoved['minecraft:strider'], value: stats.subStats.distanceMoved['minecraft:strider'].toFixed(2), key: 'minecraft:strider' },
            { title: tStrings.statsStrings.subStats.distanceMoved['aviate'], value: stats.subStats.distanceMoved['aviate'].toFixed(2), key: 'aviate' }
          ]
        },
        { title: tStrings.statsStrings.totem, value: stats.totem, key: 'totem' },
        { title: tStrings.statsStrings.chat, value: stats.chat, key: 'chat' },
        { title: tStrings.statsStrings.chatChars, value: stats.chatChars, key: 'chatChars' },
        { title: tStrings.statsStrings.expObtained, value: stats.expObtained, key: 'expObtained' },
        { title: tStrings.statsStrings.highestLevel, value: stats.highestLevel, key: 'highestLevel' },
        {
          title: tStrings.statsStrings.ate, value: stats.ate, key: 'ate', subContents: [
            { title: tStrings.statsStrings.subStats.ate['minecraft:golden_apple'], value: stats.subStats.ate['minecraft:golden_apple'], key: 'minecraft:golden_apple' },
            { title: tStrings.statsStrings.subStats.ate['minecraft:enchanted_golden_apple'], value: stats.subStats.ate['minecraft:enchanted_golden_apple'], key: 'minecraft:enchanted_golden_apple' }
          ]
        }
      ]
    },
    {
      title: tStrings.statsCategories.combat,
      titleFormat: '§c§l',
      contents: [
        {
          title: tStrings.statsStrings.killed, value: stats.killed, key: 'killed', subContents: [
            { title: tStrings.statsStrings.subStats.killed['equus'], value: stats.subStats.killed['minecraft:horse'] + stats.subStats.killed['minecraft:skeleton_horse'] + stats.subStats.killed['minecraft:zombie_horse'] + stats.subStats.killed['minecraft:donkey'] + stats.subStats.killed['minecraft:mule'], key: 'equus' },
            { title: tStrings.statsStrings.subStats.killed['minecraft:wandering_trader'], value: stats.subStats.killed['minecraft:wandering_trader'], key: 'minecraft:wandering_trader' },
            { title: tStrings.statsStrings.subStats.killed['minecraft:trader_llama'], value: stats.subStats.killed['minecraft:trader_llama'], key: 'minecraft:trader_llama' },
            { title: tStrings.statsStrings.subStats.killed['minecraft:iron_golem'], value: stats.subStats.killed['minecraft:iron_golem'], key: 'minecraft:iron_golem' },
            { title: tStrings.statsStrings.subStats.killed['minecraft:warden'], value: stats.subStats.killed['minecraft:warden'], key: 'minecraft:warden' },
            { title: tStrings.statsStrings.subStats.killed['minecraft:wither'], value: stats.subStats.killed['minecraft:wither'], key: 'minecraft:wither' },
            { title: tStrings.statsStrings.subStats.killed['minecraft:ender_dragon'], value: stats.subStats.killed['minecraft:ender_dragon'], key: 'minecraft:ender_dragon' }
          ]
        },
        { title: tStrings.statsStrings.death, value: stats.death, key: 'death' },
        { title: tStrings.statsStrings.damageDealt, value: stats.damageDealt.toFixed(2), key: 'damageDealt' },
        { title: tStrings.statsStrings.damageTaken, value: stats.damageTaken.toFixed(2), key: 'damageTaken' }
      ]
    },
    {
      title: tStrings.statsCategories.mining,
      titleFormat: '§7§l',
      contents: [
        {
          title: tStrings.statsStrings.overworldMined, value: stats.overworldMined, key: 'overworldMined', subContents: [
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:coal_ore'], value: stats.subStats.overworldMined['minecraft:coal_ore'], key: 'minecraft:coal_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_coal_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_coal_ore'], key: 'minecraft:deepslate_coal_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:iron_ore'], value: stats.subStats.overworldMined['minecraft:iron_ore'], key: 'minecraft:iron_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_iron_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_iron_ore'], key: 'minecraft:deepslate_iron_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:copper_ore'], value: stats.subStats.overworldMined['minecraft:copper_ore'], key: 'minecraft:copper_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_copper_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_copper_ore'], key: 'minecraft:deepslate_copper_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:lapis_ore'], value: stats.subStats.overworldMined['minecraft:lapis_ore'], key: 'minecraft:lapis_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_lapis_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_lapis_ore'], key: 'minecraft:deepslate_lapis_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:gold_ore'], value: stats.subStats.overworldMined['minecraft:gold_ore'], key: 'minecraft:gold_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_gold_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_gold_ore'], key: 'minecraft:deepslate_gold_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:redstone_ore'], value: stats.subStats.overworldMined['minecraft:redstone_ore'], key: 'minecraft:redstone_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_redstone_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_redstone_ore'], key: 'minecraft:deepslate_redstone_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:diamond_ore'], value: stats.subStats.overworldMined['minecraft:diamond_ore'], key: 'minecraft:diamond_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_diamond_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_diamond_ore'], key: 'minecraft:deepslate_diamond_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:emerald_ore'], value: stats.subStats.overworldMined['minecraft:emerald_ore'], key: 'minecraft:emerald_ore' },
            { title: tStrings.statsStrings.subStats.overworldMined['minecraft:deepslate_emerald_ore'], value: stats.subStats.overworldMined['minecraft:deepslate_emerald_ore'], key: 'minecraft:deepslate_emerald_ore' }
          ]
        },
        {
          title: tStrings.statsStrings.netherMined, value: stats.netherMined, key: 'netherMined', subContents: [
            { title: tStrings.statsStrings.subStats.netherMined['minecraft:quartz_ore'], value: stats.subStats.netherMined['minecraft:quartz_ore'], key: 'minecraft:quartz_ore' },
            { title: tStrings.statsStrings.subStats.netherMined['minecraft:nether_gold_ore'], value: stats.subStats.netherMined['minecraft:nether_gold_ore'], key: 'minecraft:nether_gold_ore' },
            { title: tStrings.statsStrings.subStats.netherMined['minecraft:ancient_debris'], value: stats.subStats.netherMined['minecraft:ancient_debris'], key: 'minecraft:ancient_debris' }
          ]
        }
      ]
    },
    {
      title: tStrings.statsCategories.planting,
      titleFormat: '§2§l',
      contents: [
        { title: tStrings.statsStrings.tilled, value: stats.tilled },
        {
          title: tStrings.statsStrings.planted, value: stats.planted, key: 'planted', subContents: [
            { title: tStrings.statsStrings.subStats.planted['minecraft:wheat'], value: stats.subStats.planted['minecraft:wheat'], key: 'minecraft:wheat' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:beetroot'], value: stats.subStats.planted['minecraft:beetroot'], key: 'minecraft:beetroot' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:potatoes'], value: stats.subStats.planted['minecraft:potatoes'], key: 'minecraft:potatoes' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:carrots'], value: stats.subStats.planted['minecraft:carrots'], key: 'minecraft:carrots' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:melon_stem'], value: stats.subStats.planted['minecraft:melon_stem'], key: 'minecraft:melon_stem' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:pumpkin_stem'], value: stats.subStats.planted['minecraft:pumpkin_stem'], key: 'minecraft:pumpkin_stem' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:torchflower_crop'], value: stats.subStats.planted['minecraft:torchflower_crop'], key: 'minecraft:torchflower_crop' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:pitcher_crop'], value: stats.subStats.planted['minecraft:pitcher_crop'], key: 'minecraft:pitcher_crop' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:cocoa'], value: stats.subStats.planted['minecraft:cocoa'], key: 'minecraft:cocoa' },
            { title: tStrings.statsStrings.subStats.planted['minecraft:nether_wart'], value: stats.subStats.planted['minecraft:nether_wart'], key: 'minecraft:nether_wart' },
          ]
        },
        {
          title: tStrings.statsStrings.harvested, value: stats.harvested, key: 'harvested', subContents: [
            { title: tStrings.statsStrings.subStats.harvested['minecraft:wheat'], value: stats.subStats.harvested['minecraft:wheat'], key: 'minecraft:wheat' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:beetroot'], value: stats.subStats.harvested['minecraft:beetroot'], key: 'minecraft:beetroot' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:potatoes'], value: stats.subStats.harvested['minecraft:potatoes'], key: 'minecraft:potatoes' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:carrots'], value: stats.subStats.harvested['minecraft:carrots'], key: 'minecraft:carrots' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:melon_block'], value: stats.subStats.harvested['minecraft:melon_block'], key: 'minecraft:melon_block' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:pumpkin'], value: stats.subStats.harvested['minecraft:pumpkin'], key: 'minecraft:pumpkin' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:torchflower'], value: stats.subStats.harvested['minecraft:torchflower'], key: 'minecraft:torchflower' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:pitcher_crop'], value: stats.subStats.harvested['minecraft:pitcher_crop'], key: 'minecraft:pitcher_crop' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:cocoa'], value: stats.subStats.harvested['minecraft:cocoa'], key: 'minecraft:cocoa' },
            { title: tStrings.statsStrings.subStats.harvested['minecraft:nether_wart'], value: stats.subStats.harvested['minecraft:nether_wart'], key: 'minecraft:nether_wart' },
          ]
        }
      ]
    },
    {
      title: tStrings.statsCategories.fishing,
      titleFormat: '§3§l',
      contents: [
        {
          title: tStrings.statsStrings.fished, value: stats.fished, key: 'fished', subContents: [
            { title: tStrings.statsStrings.subStats.fished['fish'], value: stats.subStats.fished['fish'], key: 'fish' },
            { title: tStrings.statsStrings.subStats.fished['treasure'], value: stats.subStats.fished['treasure'], key: 'treasure' },
            { title: tStrings.statsStrings.subStats.fished['junk'], value: stats.subStats.fished['junk'], key: 'junk' }
          ]
        },
        { title: tStrings.statsStrings.hooked, value: stats.hooked, key: 'hooked' }
      ]
    }
  ]
}

const defaultPlayerData = {
  death: 0, // 死亡次数
  killed: 0, // 击杀数
  damageTaken: 0, // 受到的伤害
  damageDealt: 0, // 造成的伤害
  destroyed: 0, // 破坏方块数
  placed: 0, // 放置方块数
  tilled: 0, // 耕地数
  planted: 0, // 种植次数
  harvested: 0, // 收获次数
  overworldMined: 0, // 主世界挖矿数
  netherMined: 0, // 下界挖矿数
  fished: 0, // 钓鱼数
  hooked: 0, // 用钓鱼竿钩实体次数
  ate: 0, // 吃掉的食物数
  totem: 0, // 消耗的图腾数
  chat: 0, // 聊天消息条数
  chatChars: 0, // 聊天消息字符数
  jumped: 0, // 跳跃次数
  expObtained: 0, // 累计获得的经验数
  highestLevel: 0, // 最高到达的等级
  playTime: 0, // 游玩时间
  lastOnline: 0, // 最后在线时间
  loginDays: 0, // 登录天数
  distanceMoved: 0, // 移动距离
  subStats: {
    ate: { // 具体吃掉的食物数
      'minecraft:golden_apple': 0,
      'minecraft:enchanted_golden_apple': 0
    },
    killed: { // 具体击杀数
      'minecraft:horse': 0,
      'minecraft:skeleton_horse': 0,
      'minecraft:zombie_horse': 0,
      'minecraft:donkey': 0,
      'minecraft:mule': 0,
      'minecraft:wandering_trader': 0,
      'minecraft:trader_llama': 0,
      'minecraft:iron_golem': 0,
      'minecraft:warden': 0,
      'minecraft:wither': 0,
      'minecraft:ender_dragon': 0,
    },
    fished: { // 具体钓鱼数
      'fish': 0,
      'junk': 0,
      'treasure': 0
    },
    planted: { // 具体种植数
      'minecraft:wheat': 0,
      'minecraft:potatoes': 0,
      'minecraft:carrots': 0,
      'minecraft:melon_stem': 0,
      'minecraft:pumpkin_stem': 0,
      'minecraft:beetroot': 0,
      'minecraft:pitcher_crop': 0,
      'minecraft:torchflower_crop': 0,
      'minecraft:nether_wart': 0,
      'minecraft:cocoa': 0
    },
    harvested: { // 具体收获数
      'minecraft:wheat': 0,
      'minecraft:potatoes': 0,
      'minecraft:carrots': 0,
      'minecraft:beetroot': 0,
      'minecraft:pitcher_crop': 0,
      'minecraft:torchflower': 0,
      'minecraft:pumpkin': 0,
      'minecraft:melon_block': 0,
      'minecraft:nether_wart': 0,
      'minecraft:cocoa': 0
    },
    overworldMined: { // 具体主世界采矿数
      'minecraft:coal_ore': 0,
      'minecraft:deepslate_coal_ore': 0,
      'minecraft:iron_ore': 0,
      'minecraft:deepslate_iron_ore': 0,
      'minecraft:copper_ore': 0,
      'minecraft:deepslate_copper_ore': 0,
      'minecraft:lapis_ore': 0,
      'minecraft:deepslate_lapis_ore': 0,
      'minecraft:gold_ore': 0,
      'minecraft:deepslate_gold_ore': 0,
      'minecraft:redstone_ore': 0,
      'minecraft:deepslate_redstone_ore': 0,
      'minecraft:diamond_ore': 0,
      'minecraft:deepslate_diamond_ore': 0,
      'minecraft:emerald_ore': 0,
      'minecraft:deepslate_emerald_ore': 0
    },
    netherMined: { // 具体下界采矿数
      'minecraft:quartz_ore': 0,
      'minecraft:nether_gold_ore': 0,
      'minecraft:ancient_debris': 0
    },
    distanceMoved: {
      'aviate': 0,
      'minecraft:boat': 0,
      'minecraft:chest_boat': 0,
      'minecraft:minecart': 0,
      'minecraft:horse': 0,
      'minecraft:skeleton_horse': 0,
      'minecraft:zombie_horse': 0,
      'minecraft:donkey': 0,
      'minecraft:mule': 0,
      'minecraft:pig': 0,
      'minecraft:strider': 0
    }
  }
}

const defaultDataFormattedList = statsToFormattedList(defaultPlayerData)

const listenPlacedBlocks = [
  'minecraft:melon_block',
  'minecraft:pumpkin',
  'minecraft:coal_ore',
  'minecraft:deepslate_coal_ore',
  'minecraft:iron_ore',
  'minecraft:deepslate_iron_ore',
  'minecraft:copper_ore',
  'minecraft:deepslate_copper_ore',
  'minecraft:lapis_ore',
  'minecraft:deepslate_lapis_ore',
  'minecraft:gold_ore',
  'minecraft:deepslate_gold_ore',
  'minecraft:redstone_ore',
  'minecraft:deepslate_redstone_ore',
  'minecraft:lit_redstone_ore',
  'minecraft:lit_deepslate_redstone_ore',
  'minecraft:diamond_ore',
  'minecraft:deepslate_diamond_ore',
  'minecraft:emerald_ore',
  'minecraft:deepslate_emerald_ore',
  'minecraft:quartz_ore',
  'minecraft:nether_gold_ore',
  'minecraft:ancient_debris'
]

const listenMovePlacedBlocks = [
  'minecraft:coal_ore',
  'minecraft:deepslate_coal_ore',
  'minecraft:iron_ore',
  'minecraft:deepslate_iron_ore',
  'minecraft:copper_ore',
  'minecraft:deepslate_copper_ore',
  'minecraft:lapis_ore',
  'minecraft:deepslate_lapis_ore',
  'minecraft:gold_ore',
  'minecraft:deepslate_gold_ore',
  'minecraft:redstone_ore',
  'minecraft:deepslate_redstone_ore',
  'minecraft:lit_redstone_ore',
  'minecraft:lit_deepslate_redstone_ore',
  'minecraft:diamond_ore',
  'minecraft:deepslate_diamond_ore',
  'minecraft:emerald_ore',
  'minecraft:deepslate_emerald_ore',
  'minecraft:quartz_ore',
  'minecraft:nether_gold_ore',
  'minecraft:ancient_debris'
]

const redstoneOres = [
  'minecraft:redstone_ore',
  'minecraft:lit_redstone_ore',
]

const deepslateRedstoneOres = [
  'minecraft:deepslate_redstone_ore',
  'minecraft:lit_deepslate_redstone_ore',
]

const preFarmlandBlocks = [
  'minecraft:dirt',
  'minecraft:grass',
  'minecraft:grass_path'
]

const cakes = [
  'minecraft:cake',
  'minecraft:candle_cake',
  'minecraft:white_candle_cake',
  'minecraft:orange_candle_cake',
  'minecraft:magenta_candle_cake',
  'minecraft:light_blue_candle_cake',
  'minecraft:yellow_candle_cake',
  'minecraft:lime_candle_cake',
  'minecraft:pink_candle_cake',
  'minecraft:gray_candle_cake',
  'minecraft:light_gray_candle_cake',
  'minecraft:cyan_candle_cake',
  'minecraft:purple_candle_cake',
  'minecraft:blue_candle_cake',
  'minecraft:brown_candle_cake',
  'minecraft:green_candle_cake',
  'minecraft:red_candle_cake',
  'minecraft:black_candle_cake'
]

let fishingLootTable = {}

{
  let fish = new Set([
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/fish.json')).pools[0].entries.map(obj => obj.name),
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/jungle_fish.json')).pools[0].entries.map(obj => obj.name)
  ])
  fish.delete('minecraft:fish')
  fish.add('minecraft:cod')
  let junk = new Set([
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/junk.json')).pools[0].entries.map(obj => obj.name),
    ...data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/jungle_junk.json')).pools[0].entries.map(obj => obj.name)
  ])
  junk.delete('minecraft:dye')
  junk.add('minecraft:ink_sac')
  let treasure = new Set(data.parseJson(File.readFrom('./behavior_packs/vanilla/loot_tables/gameplay/fishing/treasure.json')).pools[0].entries.map(obj => obj.name))
  treasure.delete('minecraft:book')
  treasure.add('minecraft:enchanted_book')

  fishingLootTable = {
    fish: Array.from(fish),
    junk: Array.from(junk),
    treasure: Array.from(treasure)
  }
}

const rankingKeys = [
  {
    text: `§0${tStrings.statsCategories.baseinfo}§r`, keys: [
      { text: tStrings.statsStrings.playTime, key: 'playTime' },
      { text: tStrings.statsStrings.loginDays, key: 'loginDays' },
      { text: tStrings.statsStrings.destroyed, key: 'destroyed' },
      { text: tStrings.statsStrings.placed, key: 'placed' },
      { text: tStrings.statsStrings.jumped, key: 'jumped' },
      { text: tStrings.statsStrings.distanceMoved, key: 'distanceMoved' },
      { text: tStrings.statsStrings.totem, key: 'totem' },
      { text: tStrings.statsStrings.chat, key: 'chat' },
      { text: tStrings.statsStrings.chatChars, key: 'chatChars' },
      { text: tStrings.statsStrings.expObtained, key: 'expObtained' },
      { text: tStrings.statsStrings.highestLevel, key: 'highestLevel' },
      { text: tStrings.statsStrings.ate, key: 'ate' }
    ]
  },
  {
    text: `§c${tStrings.statsCategories.combat}§r`, keys: [
      { text: tStrings.statsStrings.killed, key: 'killed' },
      { text: tStrings.statsStrings.death, key: 'death' },
      { text: tStrings.statsStrings.damageDealt, key: 'damageDealt' },
      { text: tStrings.statsStrings.damageTaken, key: 'damageTaken' }
    ]
  },
  {
    text: `§8${tStrings.statsCategories.mining}§r`, keys: [
      { text: tStrings.statsStrings.overworldMined, key: 'overworldMined' },
      { text: tStrings.statsStrings.netherMined, key: 'netherMined' }
    ]
  },
  {
    text: `§2${tStrings.statsCategories.planting}§r`, keys: [
      { text: tStrings.statsStrings.tilled, key: 'tilled' },
      { text: tStrings.statsStrings.planted, key: 'planted' },
      { text: tStrings.statsStrings.harvested, key: 'harvested' }
    ]
  },
  {
    text: `§3${tStrings.statsCategories.fishing}§r`, keys: [
      { text: tStrings.statsStrings.fished, key: 'fished' },
      { text: tStrings.statsStrings.hooked, key: 'hooked' }
    ]
  }
]

let rankingKeyList = []

for (let i = 0; i < rankingKeys.length; i++) {
  rankingKeyList = rankingKeyList.concat(rankingKeys[i].keys)
}

const scoreboardMappingKeysExcept = ['lastOnline']
let scoreboardMappingKeys = []

for (let i = 0; i < rankingKeyList.length; i++) {
  if (!scoreboardMappingKeysExcept.includes(rankingKeyList[i])) {
    scoreboardMappingKeys.push(rankingKeyList[i])
  }
}

let statsKeyList = []
{
  let formattedList = statsToFormattedList(defaultPlayerData)
  for (let i = 0; i < formattedList.length; i++) {
    for (let j = 0; j < formattedList[i].contents.length; j++) {
      statsKeyList.push(formattedList[i].contents[j])
    }
  }
}

let db
let newFarmlands = new Set()
let cakesAten = new Set()
let listenMovePlacedBlocksQueue = []
// 服务器启动
mc.listen('onServerStarted', () => {
  // ↓ 命令注册 ======================================================================
  let command1 = mc.newCommand('stats', tStrings.commands.stats.description, PermType.Any)
  command1.optional('player', ParamType.String)
  command1.overload(['player'])
  command1.setCallback((cmd, origin, output, results) => {
    if (!origin.player) { // 控制台查询
      if (results.player) { // 控制台有参数
        if (db.hasPlayer(results.player)) {
          output.success(`${tStrings.stats} - ${results.player}\n${formatStats(db.getPlayer(results.player), false)}`)
        } else {
          output.error(tStrings.commands.stats.noPlayerData)
        }
      } else { // 控制台无参数
        output.error(tStrings.commands.stats.specifyPlayerName)
      }
    } else { // 玩家查询
      if (results.player) { // 玩家有参数
        if (origin.player.realName === results.player) { // 玩家有参数查自己
          showStats(origin.player, origin.player.realName)
        } else { // 玩家有参数查别人
          if (origin.player.isOP()) {
            if (db.hasPlayer(results.player)) {
              showStats(origin.player, results.player)
            } else {
              output.error(tStrings.commands.stats.noPlayerData)
            }
          } else {
            output.error(tStrings.commands.stats.noPermissionQueryOther)
          }
        }
      } else { // 玩家无参数
        showStats(origin.player, origin.player.realName)
      }
    }
  })
  command1.setup()

  let command2 = mc.newCommand('statsmodify', tStrings.commands.statsmodify.description, PermType.Console)
  command2.setEnum('option', ['set', 'add', 'reduce'])
  command2.setEnum('delete', ['delete'])
  command2.setEnum('list', ['list'])
  command2.setEnum('lists', ['players', 'numbers'])
  command2.mandatory('player', ParamType.String)
  command2.mandatory('value', ParamType.Float)
  command2.mandatory('number', ParamType.Int)
  command2.optional('subnumber', ParamType.Int)
  command2.mandatory('option', ParamType.Enum, 'option', 'option', 1)
  command2.mandatory('delete', ParamType.Enum, 'delete', 'delete')
  command2.mandatory('list', ParamType.Enum, 'list', 'list')
  command2.mandatory('lists', ParamType.Enum, 'lists', 'lists', 1)
  command2.overload(['list', 'lists'])
  command2.overload(['option', 'player', 'value', 'number', 'subnumber'])
  command2.overload(['delete', 'player'])
  command2.setCallback((cmd, origin, output, results) => {
    const playerList = Array.from(new Set([...data.getAllPlayerInfo().map(item => item.name), ...db.getPlayerList()]))
    if (!origin.player && !results.list && !results.option && !results.delete) {
      output.error(tStrings.commands.statsmodify.specifyOption)
    } else if (results.list) {
      if (results.lists === 'players') {
        let str = tStrings.commands.statsmodify.allPlayers
        for (let i = 0; i < playerList.length; i++) {
          str += `\n${playerList[i]}`
        }
        output.success(str)
      } else if (results.lists === 'numbers') {
        let str = tStrings.commands.statsmodify.allNumbers
        let numberCount = 0
        for (let i = 0; i < defaultDataFormattedList.length; i++) {
          for (let j = 0; j < defaultDataFormattedList[i].contents.length; j++) {
            str += `\n${numberCount}. ${defaultDataFormattedList[i].contents[j].title}`
            numberCount++
            if (defaultDataFormattedList[i].contents[j].hasOwnProperty('subContents')) {
              for (let k = 0; k < defaultDataFormattedList[i].contents[j].subContents.length; k++) {
                str += `\n  - ${k}. ${defaultDataFormattedList[i].contents[j].subContents[k].title}`
              }
            }
          }
        }
        output.success(str)
      }
    } else if (results.option) {
      if (!playerList.includes(results.player)) {
        output.error(tStrings.commands.statsmodify.noSuchPlayer)
        return
      }
      let numberCount = 0
      let key = null
      let subKey = null
      for (let i = 0; i < defaultDataFormattedList.length; i++) {
        for (let j = 0; j < defaultDataFormattedList[i].contents.length; j++) {
          if (numberCount === results.number) {
            key = defaultDataFormattedList[i].contents[j].key
            if (results.subnumber !== null) {
              if (defaultDataFormattedList[i].contents[j].hasOwnProperty('subContents')) {
                for (let k = 0; k < defaultDataFormattedList[i].contents[j].subContents.length; k++) {
                  if (results.subnumber === k) {
                    subKey = defaultDataFormattedList[i].contents[j].subContents[k].key
                    break
                  }
                }
              }
            }
          }
          numberCount++
        }
      }
      if (!key || (results.subnumber != null && !subKey)) {
        output.error(tStrings.commands.statsmodify.noSuchNumber)
      } else {
        if (results.option === 'set') {
          if (results.value < 0) {
            output.error(tStrings.commands.statsmodify.cannotBeNegative)
          } else {
            if (!subKey) {
              db.set(results.player, key, 'set', results.value)
            } else {
              db.setSub(results.player, key, subKey, 'set', results.value)
            }
            output.success(tStrings.commands.statsmodify.success)
          }
        } else if (results.option === 'add') {
          if (!subKey) {
            if (db.get(results.player, key) + results.value < 0) {
              output.error(tStrings.commands.statsmodify.cannotBeNegative)
            } else {
              db.set(results.player, key, 'add', results.value)
              output.success(tStrings.commands.statsmodify.success)
            }
          } else {
            if (db.getSub(results.player, key, subKey) + results.value < 0) {
              output.error(tStrings.commands.statsmodify.cannotBeNegative)
            } else {
              db.setSub(results.player, key, subKey, 'add', results.value)
              output.success(tStrings.commands.statsmodify.success)
            }
          }
        } else if (results.option === 'reduce') {
          if (!subKey) {
            if (db.get(results.player, key) - results.value < 0) {
              output.error(tStrings.commands.statsmodify.cannotBeNegative)
            } else {
              db.set(results.player, key, 'reduce', results.value)
              output.success(tStrings.commands.statsmodify.success)
            }
          } else {
            if (db.getSub(results.player, key, subKey) - results.value < 0) {
              output.error(tStrings.commands.statsmodify.cannotBeNegative)
            } else {
              db.setSub(results.player, key, subKey, 'reduce', results.value)
              output.success(tStrings.commands.statsmodify.success)
            }
          }
        }
      }
    } else if (results.delete) {
      if (!db.hasPlayer(results.player)) {
        output.error(tStrings.commands.statsmodify.noPlayerData)
      } else {
        if (db.deletePlayer(results.player)) {
          output.success(tStrings.commands.statsmodify.deleteSuccess)
        } else {
          output.error(tStrings.commands.statsmodify.deleteFailed)
        }
      }
    }
  })
  command2.setup()

  let command3 = mc.newCommand('ranking', tStrings.commands.ranking.description, PermType.Any)
  command3.optional('number', ParamType.Int)
  command3.overload(['number'])
  command3.setCallback((cmd, origin, output, results) => {
    if (origin.player) {
      showRanking(origin.player)
    } else {
      if (results.number == null) {
        let keysStr = ''
        for (let i = 0; i < rankingKeyList.length; i++) {
          keysStr += `\n${i}. ${rankingKeyList[i].text}`
        }
        output.success(tStrings.commands.ranking.useCommandToQuery + keysStr)
      } else {
        if (rankingKeyList.length > results.number && results.number >= 0) {
          let rankingStr = ''
          if (rankingKeyList[results.number].key === 'playTime') {
            rankingStr = formatRanking(db.getRanking(rankingKeyList[results.number].key), false, secToTime)
          } else if (['distanceMoved', 'damageTaken', 'damageDealt'].includes(rankingKeyList[results.number].key)) {
            rankingStr = formatRanking(db.getRanking(rankingKeyList[results.number].key), false, (x) => x.toFixed(2))
          } else {
            rankingStr = formatRanking(db.getRanking(rankingKeyList[results.number].key), false)
          }
          output.success(`${tStrings.ranking} - ${rankingKeyList[results.number].text}\n${rankingStr}`)
        } else {
          output.error(tStrings.commands.ranking.noSuchNumber)
        }
      }
    }
  })
  command3.setup()

  let command4 = mc.newCommand('statsbackup', tStrings.commands.statsbackup.description, PermType.GameMasters)
  command4.overload([])
  command4.setCallback((cmd, origin, output, results) => {
    if (db.dbBackup()) {
      output.success(tStrings.commands.statsbackup.success)
    } else {
      output.error(tStrings.commands.statsbackup.failed)
    }
  })
  command4.setup()

  let command5 = mc.newCommand('statsexport', tStrings.commands.statsexport.description, PermType.Console)
  command5.overload([])
  command5.setCallback((cmd, origin, output, results) => {
    if (exportStats()) {
      output.success(tStrings.commands.statsexport.success)
    } else {
      output.error(tStrings.commands.statsexport.failed)
    }
  })
  command5.setup()

  let command6 = mc.newCommand('statsmapping', tStrings.commands.statsmapping.description, PermType.GameMasters)
  command6.setEnum('list', ['list'])
  command6.setEnum('add', ['add'])
  command6.setEnum('remove', ['remove'])
  command6.setEnum('reload', ['reaload'])
  command6.setEnum('reloadall', ['realoadall'])
  command6.setEnum('option', ['mappings', 'numbers'])
  command6.mandatory('list', ParamType.Enum, 'list', 'list')
  command6.mandatory('option', ParamType.Enum, 'option', 'option', 1)
  command6.mandatory('add', ParamType.Enum, 'add', 'add')
  command6.mandatory('remove', ParamType.Enum, 'remove', 'remove')
  command6.mandatory('reload', ParamType.Enum, 'reload', 'reload')
  command6.mandatory('reloadall', ParamType.Enum, 'reloadall', 'reloadall')
  command6.mandatory('objective', ParamType.String)
  command6.mandatory('number', ParamType.Int)
  command6.mandatory('virtual', ParamType.Bool)
  command6.overload([])
  command6.overload(['list', 'option'])
  command6.overload(['add', 'objective', 'number', 'virtual'])
  command6.overload(['remove', 'objective'])
  command6.overload(['reload', 'objective'])
  command6.overload(['reloadall'])
  command6.setCallback((cmd, origin, output, results) => {
    const scoreboardMappings = db.getScoreboards()
    const iterator = scoreboardMappings[Symbol.iterator]()
    if (!origin.player && !results.list && !results.add && !results.remove) {
      output.error(tStrings.commands.statsmapping.specifyOption)
    } else if (results.list) { // 列出映射或统计键名
      if (results.option === 'mappings') {
        if (scoreboardMappings.size === 0) {
          output.success(tStrings.commands.statsmapping.noMapping)
        } else {
          let str = tStrings.commands.statsmapping.existMapping
          for (const item of iterator) {
            str += `\n${item[0]} -> ${getTextByKey(item[1].key)} *${item[1].virtual ? tStrings.commands.statsmapping.virtual : tStrings.commands.statsmapping.actual}`
          }
          output.success(str)
        }
      } else if (results.option === 'numbers') {
        let str = tStrings.commands.statsmapping.availableNumber
        for (let i = 0; i < scoreboardMappingKeys.length; i++) {
          str += `\n${i}. ${scoreboardMappingKeys[i].text}`
        }
        output.success(str)
      }
    } else if (results.add) { // 添加映射
      const allObjectives = mc.getAllScoreObjectives()
      if (scoreboardMappings.has(results.objective)) {
        output.error(tStrings.commands.statsmapping.objectiveMapped)
      } else if (!allObjectives.map(item => item.name).includes(results.objective)) {
        output.error(tStrings.commands.statsmapping.noSuchObjective)
      } else if (results.number < 0 || results.number >= scoreboardMappingKeys.length) {
        output.error(tStrings.commands.statsmapping.noSuchObjective)
      } else {
        if (db.addScoreboard(results.objective, scoreboardMappingKeys[results.number].key, results.virtual)) {
          output.success(tStrings.commands.statsmapping.addSuccess)
        } else {
          output.failed(tStrings.commands.statsmapping.addFailed)
        }
      }
    } else if (results.remove) { // 删除映射
      if (!scoreboardMappings.has(results.objective)) {
        output.error(tStrings.commands.statsmapping.objectiveNotMapped)
      } else {
        if (db.deleteScoreboard(results.objective)) {
          output.success(tStrings.commands.statsmapping.removeSuccess)
        } else {
          output.failed(tStrings.commands.statsmapping.removeFailed)
        }
      }
    } else if (results.reload) { // 重载计分项
      if (!scoreboardMappings.has(results.objective)) {
        output.error(tStrings.commands.statsmapping.objectiveNotMapped)
      } else {
        db.reloadScoreboard(results.objective)
        output.success(tStrings.commands.statsmapping.reloadSuccess)
      }
    } else if (results.reloadall) { // 重载所有计分项
      if (scoreboardMappings.size === 0) {
        output.error(tStrings.commands.statsmapping.noMapping)
      } else {
        db.reloadAllScoreboards()
        output.success(tStrings.commands.statsmapping.reloadSuccess)
      }
    } else {
      showMapping(origin.player)
    }
  })
  command6.setup()
  // ↑ 命令注册 ======================================================================

  db = new DataBase('./plugins/PlayerStatsTracker/data/', defaultPlayerData, databaseSaveInterval, backupLocation)
})

// ↓ API ======================================================================
ll.exports(getStats, 'PlayerStatsTracker', 'getStats')
ll.exports(getFormatedStats, 'PlayerStatsTracker', 'getFormatedStats')
ll.exports(getRanking, 'PlayerStatsTracker', 'getRanking')
ll.exports(getFormatedRanking, 'PlayerStatsTracker', 'getFormatedRanking')
ll.exports(getRankingKeyList, 'PlayerStatsTracker', 'getRankingKeyList')

function getFormatedStats(name) {
  if (!db.hasPlayer(name)) {
    return null
  }
  return formatStats(db.getPlayer(name), false)
}

function getStats(name) {
  if (!db.hasPlayer(name)) {
    return null
  }
  return db.getPlayer(name)
}

function getFormatedRanking(key) {
  if (key === 'playTime') {
    return formatRanking(db.getRanking(key), false, secToTime)
  } else {
    return formatRanking(db.getRanking(key), false)
  }
}

function getRanking(key) {
  if (rankingKeyList.includes(key)) {
    return db.getRanking(key)
  } else {
    return null
  }
}

function getRankingKeyList() {
  return rankingKeyList
}

function hasRankingKey(key) {
  for (let i = 0; i < rankingKeyList.length; i++) {
    if (rankingKeyList[i].key === key) {
      return true
    }
  }
  return false
}
// ↑ API ======================================================================

// ↓ 游戏内菜单 ======================================================================
function showStats(player, name) {
  let form = mc.newSimpleForm()
  form.setTitle(`${tStrings.stats} - ${name}`)
  form.setContent(formatStats(db.getPlayer(name), true))
  player.sendForm(form, () => {
  })
}

function showRanking(player) {
  let optionsForm = mc.newSimpleForm()
  let subOptionsForm = null
  let subOptionsFormId = -1
  optionsForm.setTitle(tStrings.ranking)
  for (let i = 0; i < rankingKeys.length; i++) {
    optionsForm.addButton(rankingKeys[i].text)
  }
  player.sendForm(optionsForm, optionsFormHandler)

  function optionsFormHandler(player, id) {
    if (id == null) { return }
    const keyItem = rankingKeys[id]
    subOptionsFormId = id
    subOptionsForm = mc.newSimpleForm()
    subOptionsForm.setTitle(`${tStrings.ranking} - ${keyItem.text}`)
    for (let i = 0; i < keyItem.keys.length; i++) {
      subOptionsForm.addButton(keyItem.keys[i].text)
    }
    player.sendForm(subOptionsForm, subOptionsFormHandler)
  }

  function subOptionsFormHandler(player, id) {
    if (id == null) {
      player.sendForm(optionsForm, optionsFormHandler)
    } else {
      const keyItem = rankingKeys[subOptionsFormId].keys[id]
      let rankingForm = mc.newSimpleForm()
      rankingForm.setTitle(`${tStrings.ranking} - ${keyItem.text}`)
      if (keyItem.key === 'playTime') {
        rankingForm.setContent(formatRanking(db.getRanking(keyItem.key), true, secToTime))
      } else if (['distanceMoved', 'damageTaken', 'damageDealt'].includes(keyItem.key)) {
        rankingForm.setContent(formatRanking(db.getRanking(keyItem.key), true, value => value.toFixed(2)))
      } else {
        rankingForm.setContent(formatRanking(db.getRanking(keyItem.key), true))
      }
      player.sendForm(rankingForm, rankingFormHandler)
    }
  }

  function rankingFormHandler(player, id) {
    player.sendForm(subOptionsForm, subOptionsFormHandler)
  }
}

function showMapping(player) {
  let optionsForm = mc.newSimpleForm()
  let addObjectiveArray = []
  let removeObjectiveArray = []
  let reloadObjectiveArray = []
  optionsForm.setTitle(tStrings.commands.statsmapping.formTitle)
  optionsForm.addButton(tStrings.commands.statsmapping.listMapping)
  optionsForm.addButton(tStrings.commands.statsmapping.addMapping)
  optionsForm.addButton(tStrings.commands.statsmapping.removeMapping)
  optionsForm.addButton(tStrings.commands.statsmapping.reloadMapping)
  optionsForm.addButton(tStrings.commands.statsmapping.reloadAllMapping)
  player.sendForm(optionsForm, optionsFormHandler)

  function optionsFormHandler(player, id) {
    if (id == null) { return }
    const scoreboardMappings = db.getScoreboards()
    const iterator = scoreboardMappings[Symbol.iterator]()
    switch (id) {
      case 0:
        let listForm = mc.newSimpleForm()
        listForm.setTitle(tStrings.commands.statsmapping.existMappingTitle)
        let str = ''
        for (const item of iterator) {
          str += `${item[0]} -> ${getTextByKey(item[1].key)} *${item[1].virtual ? tStrings.commands.statsmapping.virtual : tStrings.commands.statsmapping.actual}\n`
        }
        str = str === '' ? tStrings.commands.statsmapping.noMapping : str.substring(0, str.length - 1)
        listForm.setContent(str)
        player.sendForm(listForm, listFormHandler)
        break
      case 1:
        const objectiveArray = mc.getAllScoreObjectives()
        const mappingArray = Array.from(scoreboardMappings).map(item => item[0])
        let objectiveStringArray = []
        let keyStringArray = []
        addObjectiveArray = []
        for (let i = 0; i < objectiveArray.length; i++) {
          if (!mappingArray.includes(objectiveArray[i].name)) {
            objectiveStringArray.push(`${objectiveArray[i].name} : ${objectiveArray[i].displayName}`)
            addObjectiveArray.push(objectiveArray[i].name)
          }
        }
        if (objectiveStringArray.length === 0) {
          let addToastForm = mc.newSimpleForm()
          addToastForm.setTitle(tStrings.commands.statsmapping.addMapping)
          addToastForm.setContent(tStrings.commands.statsmapping.noObjectiveAvailable)
          player.sendForm(addToastForm, returnOptionsForm)
          return
        }
        for (let i = 0; i < rankingKeyList.length; i++) {
          if (!scoreboardMappingKeysExcept.includes(rankingKeyList[i])) {
            keyStringArray.push(rankingKeyList[i].text)
          }
        }
        let addForm = mc.newCustomForm()
        addForm.setTitle(tStrings.commands.statsmapping.addMapping)
        addForm.addDropdown(tStrings.commands.statsmapping.objective, objectiveStringArray)
        addForm.addDropdown(tStrings.stats, keyStringArray)
        addForm.addSwitch(tStrings.commands.statsmapping.virtual, false)
        addForm.addLabel(tStrings.commands.statsmapping.virtualDescription)
        player.sendForm(addForm, addFormHandler)
        break
      case 2:
        let removeMappingStringArray = []
        removeObjectiveArray = []
        for (const item of iterator) {
          removeMappingStringArray.push(`${item[0]} -> ${getTextByKey(item[1].key)} *${item[1].virtual ? tStrings.commands.statsmapping.virtual : tStrings.commands.statsmapping.actual}`)
          removeObjectiveArray.push(item[0])
        }
        if (removeMappingStringArray.length === 0) {
          let addToastForm = mc.newSimpleForm()
          addToastForm.setTitle(tStrings.commands.statsmapping.removeMapping)
          addToastForm.setContent(tStrings.commands.statsmapping.noMapping)
          player.sendForm(addToastForm, returnOptionsForm)
          return
        }
        let removeForm = mc.newCustomForm()
        removeForm.setTitle(tStrings.commands.statsmapping.removeMapping)
        removeForm.addDropdown(tStrings.commands.statsmapping.mapping, removeMappingStringArray)
        removeForm.addLabel('')
        player.sendForm(removeForm, removeFormHandler)
        break
      case 3:
        let reloadMappingStringArray = []
        reloadObjectiveArray = []
        for (const item of iterator) {
          reloadMappingStringArray.push(`${item[0]} -> ${getTextByKey(item[1].key)} *${item[1].virtual ? tStrings.commands.statsmapping.virtual : tStrings.commands.statsmapping.actual}`)
          reloadObjectiveArray.push(item[0])
        }
        let reloadForm = mc.newCustomForm()
        reloadForm.setTitle(tStrings.commands.statsmapping.reloadMapping)
        reloadForm.addLabel(tStrings.commands.statsmapping.reloadDescription)
        reloadForm.addDropdown(tStrings.commands.statsmapping.mapping, reloadMappingStringArray)
        reloadForm.addLabel('')
        player.sendForm(reloadForm, reloadFormHandler)
        break
      case 4:
        player.sendModalForm(tStrings.commands.statsmapping.reloadAllMapping, `${tStrings.commands.statsmapping.reloadDescription}§6${tStrings.commands.statsmapping.reloadAllWarn}`, tStrings.commands.statsmapping.confirm, tStrings.commands.statsmapping.cancel, reloadAllFormHandler)
        break
    }
  }

  function returnOptionsForm() {
    player.sendForm(optionsForm, optionsFormHandler)
  }

  function listFormHandler(player, id) {
    returnOptionsForm()
  }

  function addFormHandler(player, data) {
    if (data == null) {
      returnOptionsForm()
      return
    }
    if (db.addScoreboard(addObjectiveArray[data[0]], scoreboardMappingKeys[data[1]].key, data[2])) {
      player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§2${tStrings.commands.statsmapping.addSuccess}`)
    } else {
      player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§c${tStrings.commands.statsmapping.addFailed}`)
    }
    returnOptionsForm()
  }

  function removeFormHandler(player, data) {
    if (data == null) {
      returnOptionsForm()
      return
    }
    if (db.deleteScoreboard(removeObjectiveArray[data[0]])) {
      player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§2${tStrings.commands.statsmapping.removeSuccess}`)
    } else {
      player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§c${tStrings.commands.statsmapping.removeFailed}`)
    }
    returnOptionsForm()
  }

  function reloadFormHandler(player, data) {
    if (data == null) {
      returnOptionsForm()
      return
    }
    if (db.reloadScoreboard(reloadObjectiveArray[data[1]])) {
      player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§2${tStrings.commands.statsmapping.reloadSuccess}`)
    } else {
      player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§c${tStrings.commands.statsmapping.reloadFailed}`)
    }
    returnOptionsForm()
  }

  function reloadAllFormHandler(player, result) {
    if (result === true) {
      if (db.reloadAllScoreboards()) {
        player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§2${tStrings.commands.statsmapping.reloadSuccess}`)
      } else {
        player.sendToast(`§e${tStrings.commands.statsmapping.formTitle}`, `§c${tStrings.commands.statsmapping.reloadFailed}`)
      }
    }
    returnOptionsForm()
  }
}
// ↑ 游戏内菜单 ======================================================================

// ↓ Utils ======================================================================
function posToString(pos) {
  return [pos.x, ',', pos.y, ',', pos.z, ',', pos.dimid].join('')
}

function secToTime(sec) {
  const s = sec % 60
  const m = parseInt(sec / 60) % 60
  const h = parseInt(sec / 3600)
  return [h >= 10 ? h : '0' + h, ':', m >= 10 ? m : '0' + m, ':', s >= 10 ? s : '0' + s].join('')
}

function dateToString(date, format = 'YYYY-MM-DD hh:mm:ss') {
  return dateToDateString(date, dateToTimeString(date, format))
}

function dateToDateString(date, format = 'YYYY-MM-DD') {
  let Y = null
  let M = null
  let D = null
  if (autoTimezone) {
    Y = date.getFullYear()
    M = date.getMonth() + 1
    D = date.getDate()
  } else {
    const h = date.getUTCHours() + parseInt(timezoneOffset)
    let dateObj = date
    if (h >= 24) {
      dateObj = new Date(date.valueOf() + 86400000)
    } else if (h < 0) {
      dateObj = new Date(date.valueOf() - 86400000)
    }
    Y = dateObj.getUTCFullYear()
    M = dateObj.getUTCMonth() + 1
    D = dateObj.getUTCDate()
  }
  return format.replace('YYYY', Y).replace('MM', M < 10 ? '0' + M : M).replace('DD', D < 10 ? '0' + D : D).replace('M', M).replace('D', D)
}

function dateToTimeString(date, format = 'hh:mm:ss') {
  let h = null
  let m = null
  let s = null
  if (autoTimezone) {
    h = date.getHours()
    m = date.getMinutes()
    s = date.getSeconds()
  } else {
    h = date.getUTCHours() + parseInt(timezoneOffset)
    m = date.getUTCMinutes()
    s = date.getUTCSeconds()
    if (h >= 24) {
      h -= 24
    } else if (h < 0) {
      h += 24
    }
  }
  return format.replace('hh', h < 10 ? '0' + h : h).replace('mm', m < 10 ? '0' + m : m).replace('ss', s < 10 ? '0' + s : s).replace('h', h).replace('m', m).replace('s', s)
}

function getTextByKey(key) {
  for (let i = 0; i < rankingKeyList.length; i++) {
    if (rankingKeyList[i].key === key) {
      return rankingKeyList[i].text
    }
  }
  return null
}

function formatStats(stats, colorful) {
  const reg = /§./g
  const statsFormattedList = statsToFormattedList(stats)
  let str = ''

  for (let i = 0; i < statsFormattedList.length; i++) {
    str += `§6◁〖§r ${statsFormattedList[i].titleFormat}${statsFormattedList[i].title} §r§6〗▷§r\n`
    for (let j = 0; j < statsFormattedList[i].contents.length; j++) {
      str += `${statsFormattedList[i].contents[j].title}: ${statsFormattedList[i].contents[j].value}\n`
      if (statsFormattedList[i].contents[j].hasOwnProperty('subContents')) {
        for (let k = 0; k < statsFormattedList[i].contents[j].subContents.length; k++) {
          str += `  - ${statsFormattedList[i].contents[j].subContents[k].title}: ${statsFormattedList[i].contents[j].subContents[k].value}\n`
        }
      }
    }
    str += '\n'
  }
  str = str.substring(0, str.length - 2)
  return colorful ? str : str.replace(reg, '')
}

function formatRanking(ranking, colorful, func = str => str) {
  const reg = /§./g
  let str = ''
  let rank = 0
  let rankColor = 0
  let count = 0
  let prev = null
  for (let i = 0; i < ranking.length; i++) {
    count++
    if (prev !== ranking[i].data) {
      rank += count
      count = 0
      rankColor++
    }
    prev = ranking[i].data
    if (i !== 0) {
      str += '\n'
    }
    switch (rankColor) {
      case 1:
        str += `§g§l${rank}. ${ranking[i].name}: ${func(ranking[i].data)}§r`
        break
      case 2:
        str += `§7§l${rank}. ${ranking[i].name}: ${func(ranking[i].data)}§r`
        break
      case 3:
        str += `§6§l${rank}. ${ranking[i].name}: ${func(ranking[i].data)}§r`
        break
      default:
        str += `${rank}. ${ranking[i].name}: ${func(ranking[i].data)}`
    }
  }
  return colorful ? str : str.replace(reg, '')
}

function exportStats() {
  const timeObj = system.getTimeObj()
  const path = [exportLocation, '/', timeObj.Y, '-', timeObj.M < 10 ? '0' + timeObj.M : timeObj.M, '-', timeObj.D < 10 ? '0' + timeObj.D : timeObj.D, '_', timeObj.h < 10 ? '0' + timeObj.h : timeObj.h, '-', timeObj.m < 10 ? '0' + timeObj.m : timeObj.m, '-', timeObj.s < 10 ? '0' + timeObj.s : timeObj.s, '.csv'].join('')
  if (File.exists(path)) {
    return false
  } else {
    let exportContents = `\uFEFF"${tStrings.playerName}"`
    const titleTemplate = statsToFormattedList(defaultPlayerData)
    for (let i = 0; i < titleTemplate.length; i++) {
      for (let j = 0; j < titleTemplate[i].contents.length; j++) {
        exportContents += `,"${titleTemplate[i].contents[j].title}"`
        if (titleTemplate[i].contents[j].hasOwnProperty('subContents')) {
          for (let k = 0; k < titleTemplate[i].contents[j].subContents.length; k++) {
            exportContents += `,"${titleTemplate[i].contents[j].title}-${titleTemplate[i].contents[j].subContents[k].title}"`
          }
        }
      }
    }
    exportContents += '\n'

    const playersData = db.getPlayers()
    for (let p = 0; p < playersData.length; p++) {
      const playerDataFormattedList = statsToFormattedList(playersData[p].data)
      exportContents += `"${playersData[p].name}"`
      for (let i = 0; i < playerDataFormattedList.length; i++) {
        for (let j = 0; j < playerDataFormattedList[i].contents.length; j++) {
          exportContents += `,"${playerDataFormattedList[i].contents[j].value}"`
          if (playerDataFormattedList[i].contents[j].hasOwnProperty('subContents')) {
            for (let k = 0; k < playerDataFormattedList[i].contents[j].subContents.length; k++) {
              exportContents += `,"${playerDataFormattedList[i].contents[j].subContents[k].value}"`
            }
          }
        }
      }
      exportContents += '\n'
    }

    if (File.writeTo(path, exportContents)) {
      return true
    } else {
      return false
    }
  }
}
// ↑ Utils ======================================================================

// 更新最后在线时间和登录天数
function updateLastOnline(name) {
  if (dateToDateString(new Date(db.get(name, 'lastOnline'))) < dateToDateString(new Date())) {
    db.set(name, 'loginDays', 'add', 1)
  }
  db.set(name, 'lastOnline', 'set', Date.now())
}

// 更新移动距离
function updateDistanceMoved(player) {
  const lastPosition = player.getExtraData('lastPosition')
  const currentPosition = player.pos
  const aviating = player.isGliding
  const aviated = player.getExtraData('aviating')
  let ridingEntity = null
  if (aviating) {
    player.setExtraData('aviating', true)
  } else {
    player.delExtraData('aviating')
  }

  if (player.isRiding) {
    ridingEntity = player.getExtraData('riding')
  } else {
    player.delExtraData('riding')
  }
  if (!currentPosition) { return }
  player.setExtraData('lastPosition', currentPosition)
  if (lastPosition?.dimid !== currentPosition.dimid) { return }

  const distance = player.distanceTo(lastPosition)
  db.set(player.realName, 'distanceMoved', 'add', distance)
  if (player.isGliding && aviated) {
    db.setSub(player.realName, 'distanceMoved', 'aviate', 'add', distance)
  } else if (player.isRiding && ridingEntity !== null) {
    db.setSub(player.realName, 'distanceMoved', ridingEntity, 'add', distance)
  }
}

// 进入游戏
mc.listen('onJoin', (player) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  updateLastOnline(player.realName)
  player.setExtraData('playTimeTimer', setInterval(() => {
    db.set(player.realName, 'playTime', 'add', 1)
    updateLastOnline(player.realName)
  }, 1000))
  player.setExtraData('movementTimer', setInterval(() => {
    updateDistanceMoved(player)
  }, 200))
})

// 离开游戏
mc.listen('onLeft', (player) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  if (player.getExtraData('playTimeTimer')) {
    clearInterval(player.getExtraData('playTimeTimer'))
  }
  if (player.getExtraData('movementTimer')) {
    clearInterval(player.getExtraData('movementTimer'))
  }
  player.delExtraData('playTimeTimer')
  player.delExtraData('movementTimer')
  db.unmountPlayer(player.realName)
})

// 死亡
mc.listen('onPlayerDie', (player, source) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  db.set(player.realName, 'death', 'add', 1)
})

// 生物死亡
mc.listen('onMobDie', (mob, source, cause) => {
  if (source?.isPlayer()) {
    const player = source.toPlayer()
    if (!player.isSimulatedPlayer() && player.realName !== undefined) {
      db.set(player.realName, 'killed', 'add', 1)
      if (defaultPlayerData.subStats.killed.hasOwnProperty(mob.type)) {
        db.setSub(player.realName, 'killed', mob.type, 'add', 1)
      }
    }
  }
})

// 聊天
mc.listen('onChat', (player, msg) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  db.set(player.realName, 'chat', 'add', 1)
  const iterator = msg[Symbol.iterator]()
  let theChar = iterator.next()
  let count = 0
  while (!theChar.done) {
    count++
    theChar = iterator.next()
  }
  db.set(player.realName, 'chatChars', 'add', count)
})

// 跳跃
mc.listen('onJump', (player) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  db.set(player.realName, 'jumped', 'add', 1)
})

// 生物受伤
mc.listen('onMobHurt', (mob, source, damage, cause) => {
  if (mob?.isPlayer()) {
    const player = mob.toPlayer()
    if (!player.isSimulatedPlayer() && player.realName !== undefined) {
      db.set(player.realName, 'damageTaken', 'add', damage)
    }
  }
  if (source?.isPlayer()) {
    const player = source.toPlayer()
    if (!player.isSimulatedPlayer() && player.realName !== undefined) {
      db.set(player.realName, 'damageDealt', 'add', damage)
    }
  }
})

// 骑乘 尝试骑乘的实体 被骑乘的实体
mc.listen('onRide', (entity1, entity2) => {
  if (entity1?.isPlayer()) {
    const player = entity1.toPlayer()
    if (!player.isSimulatedPlayer() && player.realName !== undefined) {
      player.setExtraData('riding', entity2.type)
    }
  }
})

// 吃食物
mc.listen('onAte', (player, item) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  db.set(player.realName, 'ate', 'add', 1)
  if (defaultPlayerData.subStats.ate.hasOwnProperty(item.type)) {
    db.setSub(player.realName, 'ate', item.type, 'add', 1)
  }
})

// 消耗图腾
mc.listen('onConsumeTotem', (player) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  db.set(player.realName, 'totem', 'add', 1)
})

// 玩家对方快使用物品
mc.listen('onUseItemOn', (player, item, block, side, pos) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  const hoes = [
    'minecraft:wooden_hoe',
    'minecraft:stone_hoe',
    'minecraft:iron_hoe',
    'minecraft:diamond_hoe',
    'minecraft:golden_hoe',
    'minecraft:netherite_hoe'
  ]
  if (preFarmlandBlocks.includes(block.type) && hoes.includes(item.type)) {
    const blockPosStr = posToString(block.pos)
    setTimeout(() => {
      if (newFarmlands.has(blockPosStr)) {
        newFarmlands.delete(blockPosStr)
        db.set(player.realName, 'tilled', 'add', 1)
      }
    }, 5)
  } else if (cakes.includes(block.type)) {
    const blockPosStateStr = posToString(block.pos) + block.getBlockState()?.['bite_counter']
    setTimeout(() => {
      if (cakesAten.has(blockPosStateStr)) {
        cakesAten.delete(blockPosStateStr)
        db.set(player.realName, 'ate', 'add', 1)
      }
    }, 5)
  }
})

// 活塞推动
mc.listen('onPistonPush', (pistonPos, block) => {
  if (listenMovePlacedBlocks.includes(block.type)) {
    if (db.hasPlacedBlock(block.pos)) {
      db.deletePlacedBlock(block.pos)
      listenMovePlacedBlocksQueue.push(true)
    } else {
      listenMovePlacedBlocksQueue.push(false)
    }
  }
})

// 方块改变
mc.listen('onBlockChanged', (beforeBlock, afterBlock) => {
  if (beforeBlock.type === 'minecraft:moving_block' && listenMovePlacedBlocks.includes(afterBlock.type) && listenMovePlacedBlocksQueue.shift()) {
    db.addPlacedBlock(beforeBlock.pos)
  } else if (listenPlacedBlocks.includes(beforeBlock.type)) {
    if ((!redstoneOres.includes(beforeBlock.type) || !redstoneOres.includes(afterBlock.type)) && (!deepslateRedstoneOres.includes(beforeBlock.type) || !deepslateRedstoneOres.includes(afterBlock.type))) {
      setTimeout(() => {
        db.deletePlacedBlock(beforeBlock.pos)
      }, 5)
    }
  } else if (afterBlock.type === 'minecraft:farmland' && preFarmlandBlocks.includes(beforeBlock.type)) {
    const blockPosStr = posToString(beforeBlock.pos)
    newFarmlands.add(blockPosStr)
    setTimeout(() => {
      newFarmlands.delete(blockPosStr)
    }, 40)
  } else if (cakes.includes(beforeBlock.type) && (beforeBlock.getBlockState()?.['bite_counter'] ?? 0) + 1 === (afterBlock.getBlockState()?.['bite_counter'] ?? 7)) {
    const blockPosStateStr = posToString(beforeBlock.pos) + beforeBlock.getBlockState()?.['bite_counter']
    cakesAten.add(blockPosStateStr)
    setTimeout(() => {
      cakesAten.delete(blockPosStateStr)
    }, 40)
  }
})

// 破坏方块
mc.listen('onDestroyBlock', (player, block) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  const cropsGrownData = {
    'minecraft:wheat': [7],
    'minecraft:potatoes': [7],
    'minecraft:carrots': [7],
    'minecraft:beetroot': [7],
    'minecraft:pitcher_crop': [4],
    'minecraft:torchflower': [7],
    'minecraft:nether_wart': [3],
    'minecraft:cocoa': [8, 9, 10, 11]
  }
  const litRedstoneOres = [
    'minecraft:lit_redstone_ore',
    'minecraft:lit_deepslate_redstone_ore'
  ]
  db.set(player.realName, 'destroyed', 'add', 1)
  if (defaultPlayerData.subStats.harvested.hasOwnProperty(block.type)) {
    if (cropsGrownData.hasOwnProperty(block.type) && cropsGrownData[block.type].includes(block.tileData)) {
      db.set(player.realName, 'harvested', 'add', 1)
      db.setSub(player.realName, 'harvested', block.type, 'add', 1)
    } else if (!db.hasPlacedBlock(block.pos)) {
      db.set(player.realName, 'harvested', 'add', 1)
      db.setSub(player.realName, 'harvested', block.type, 'add', 1)
    }
    return
  } else if ((defaultPlayerData.subStats.overworldMined.hasOwnProperty(block.type) || litRedstoneOres.includes(block.type)) && !db.hasPlacedBlock(block.pos)) {
    db.set(player.realName, 'overworldMined', 'add', 1)
    if (redstoneOres.includes(block.type)) {
      db.setSub(player.realName, 'overworldMined', 'minecraft:redstone_ore', 'add', 1)
    } else if (deepslateRedstoneOres.includes(block.type)) {
      db.setSub(player.realName, 'overworldMined', 'minecraft:deepslate_redstone_ore', 'add', 1)
    } else {
      db.setSub(player.realName, 'overworldMined', block.type, 'add', 1)
    }
  } else if (defaultPlayerData.subStats.netherMined.hasOwnProperty(block.type) && !db.hasPlacedBlock(block.pos)) {
    db.set(player.realName, 'netherMined', 'add', 1)
    db.setSub(player.realName, 'netherMined', block.type, 'add', 1)
  }
})


// 放置方块
mc.listen('afterPlaceBlock', (player, block) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  db.set(player.realName, 'placed', 'add', 1)
  if (defaultPlayerData.subStats.planted.hasOwnProperty(block.type)) {
    db.set(player.realName, 'planted', 'add', 1)
    db.setSub(player.realName, 'planted', block.type, 'add', 1)
  }
  if (listenPlacedBlocks.includes(block.type)) {
    db.addPlacedBlock(block.pos)
  }
})

// 获得经验
mc.listen('onExperienceAdd', (player, exp) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  db.set(player.realName, 'expObtained', 'add', exp)
  const playerLevel = player.getLevel()
  if (playerLevel > db.get(player.realName, 'highestLevel')) {
    db.set(player.realName, 'highestLevel', 'set', playerLevel)
  }
})

// 钓鱼
mc.listen('onPlayerPullFishingHook', (player, entity, item) => {
  if (player.isSimulatedPlayer() || player.realName === undefined) { return }
  if (entity.type === 'minecraft:item') { // 钓鱼
    db.set(player.realName, 'fished', 'add', 1)
    if (fishingLootTable.fish.includes(item.type)) { // 鱼
      db.setSub(player.realName, 'fished', 'fish', 'add', 1)
    } else if (fishingLootTable.junk.includes(item.type) && !item.isEnchanted) { // 垃圾
      db.setSub(player.realName, 'fished', 'junk', 'add', 1)
    } else { // 宝藏
      db.setSub(player.realName, 'fished', 'treasure', 'add', 1)
    }
  } else { // 钩实体
    db.set(player.realName, 'hooked', 'add', 1)
  }
})

// ==============================================================================================

class DataBase {
  #kvdb
  #db
  #databaseSaveInterval
  #playerDataTemplate
  #placedBlocks
  #dbPath
  #backupFlag
  #mountQueue
  #unmountQueue
  #backupLocation
  #scoreboards

  #saveTimer

  constructor(dbPath, playerDataTemplate, databaseSaveInterval, backupLocation) {
    this.#databaseSaveInterval = databaseSaveInterval
    this.#backupFlag = false
    this.#playerDataTemplate = playerDataTemplate
    this.#dbPath = dbPath
    this.#kvdb = new KVDatabase(dbPath)
    this.#db = new Map()
    this.#mountQueue = []
    this.#unmountQueue = []
    this.#backupLocation = backupLocation
    if (!this.#kvdb) {
      return null
    }
    if (!this.#kvdb.get('data')) {
      this.#kvdb.set('data', {
        lastUpdate: Date.now(),
        placedBlocks: [],
        scoreboards: []
      })
    } else {
      if (this.#kvdb.get('data').lastUpdate > Date.now()) {
        this.#timeErr(this.#kvdb.get('data').lastUpdate)
        return null
      }
    }
    this.#placedBlocks = new Set(this.#kvdb.get('data').placedBlocks || [])
    this.#scoreboards = new Map(this.#kvdb.get('data').scoreboards || [])
    this.#createSaveTimer()
    setInterval(() => {
      this.#validateScoreboard()
    }, 3000)
  }

  #createSaveTimer() {
    this.#saveTimer = setInterval(() => {
      this.#dbSaveAll()
    }, this.#databaseSaveInterval)
  }

  #clearSaveTimer() {
    clearInterval(this.#saveTimer)
  }

  #timeErr(time) {
    logger.error(`Database update time: ${new Date(time).toLocaleString()}, your system time: ${new Date().toLocaleString()}, please update your system time and retry.`)
  }

  // 更新保存时间
  #dbUpdateTime() {
    let data = this.#kvdb.get('data')
    data.lastUpdate = Date.now()
    this.#kvdb.set('data', data)
  }

  // 数据载入内存
  #dbMount(name) {
    if (this.#backupFlag) {
      this.#mountQueue.push(name)
      this.#db.set(name, this.#cleanData(null))
    } else {
      this.#db.set(name, this.#cleanData(this.#kvdb.get(name)))
    }
  }

  // 保存并从内存中卸载
  #dbUnmount(name) {
    if (!this.#db.has(name)) { return }
    if (this.#backupFlag) {
      this.#unmountQueue.push(name)
    } else {
      if (name !== undefined) {
        this.#kvdb.set(name, this.#db.get(name))
      }
      this.#db.delete(name)
      this.#dbUpdateTime()
    }
  }

  // 保存所有内存中的数据(包括放置方块数据)
  #dbSaveAll() {
    for (let [key, value] of this.#db) {
      if (key === undefined) {
        this.#db.delete(key)
      } else {
        this.#kvdb.set(key, value)
      }
    }
    let data = this.#kvdb.get('data')
    data.placedBlocks = Array.from(this.#placedBlocks)
    data.scoreboards = Array.from(this.#scoreboards)
    data.lastUpdate = Date.now()
    this.#kvdb.set('data', data)
  }

  // 保存并卸载所有内存中的数据
  #dbUnmountAll() {
    for (let [key, value] of this.#db) {
      if (key !== undefined) {
        this.#kvdb.set(key, value)
      }
      this.#db.delete(key)
    }
    let data = this.#kvdb.get('data')
    data.placedBlocks = Array.from(this.#placedBlocks)
    data.scoreboards = Array.from(this.#scoreboards)
    data.lastUpdate = Date.now()
    this.#kvdb.set('data', data)
  }

  // 挂载并获取玩家
  #dbMountQuery(name) {
    if (this.#db.has(name)) {
      return this.#db.get(name)
    } else {
      this.#dbMount(name)
      return this.#db.get(name)
    }
  }

  // 获取玩家
  #dbQuery(name) {
    if (this.#db.has(name)) {
      return this.#db.get(name)
    } else {
      if (this.#backupFlag) {
        return this.#cleanData(null)
      } else {
        return this.#cleanData(this.#kvdb.get(name))
      }
    }
  }

  // 数据合并
  #dataAssign(obj1, obj2) {
    let assignedObj = {}
    Object.keys(obj1).forEach(key => {
      if (typeof obj1[key] === 'object') {
        if (obj2?.hasOwnProperty(key)) {
          assignedObj[key] = this.#dataAssign(obj1[key], obj2[key])
        } else {
          assignedObj[key] = this.#dataAssign(obj1[key], null)
        }
      } else {
        if (obj2?.hasOwnProperty(key)) {
          assignedObj[key] = obj1[key] + obj2[key]
        } else {
          assignedObj[key] = obj1[key]
        }
      }
    })
    if (obj2?.hasOwnProperty('lastOnline') && assignedObj.lastOnline < obj2.lastOnline) {
      assignedObj.lastOnline = obj2.lastOnline
    }
    return assignedObj
  }

  // 洗数据
  #cleanData(playerData) {
    return this.#dataAssign(this.#playerDataTemplate, playerData)
  }

  // 获取计分板
  getScoreboards() {
    return this.#scoreboards
  }

  // 通过统计键名获取计分项
  #getScoreboardsByKey(key) {
    let objectiveList = []
    for (let [objectiveValue, value] of this.#scoreboards) {
      if (value.key === key) {
        objectiveList.push(objectiveValue)
      }
    }
    return objectiveList
  }

  // 添加计分板映射
  addScoreboard(objective, key, virtual) {
    if (!this.#scoreboards.has(objective)) {
      this.#scoreboards.set(objective, { key, virtual })
      this.reloadScoreboard(objective)
      return true
    }
    return false
  }

  // 删除计分板映射
  deleteScoreboard(objective) {
    if (this.#scoreboards.has(objective)) {
      this.#scoreboards.delete(objective)
      return true
    }
    return false
  }

  // 设置计分项数据
  #setScoreboard(objective, name, value) {
    if (!this.#scoreboards.has(objective)) {
      return false
    } else {
      const scoreboardObjective = mc.getScoreObjective(objective)
      if (scoreboardObjective == null) {
        return false
      } else {
        if (this.#scoreboards.get(objective).virtual) {
          if (scoreboardObjective.setScore(name, value) === 0) {
            scoreboardObjective.setScore(name, value)
          }
          return true
        } else {
          const uuid = data.name2uuid(name)
          if (uuid) {
            mc.setPlayerScore(uuid, objective, value)
            return true
          }
        }
        return false
      }
    }
  }

  // 验证映射有效性
  #validateScoreboard() {
    const iterator = this.#scoreboards[Symbol.iterator]()
    for (const item of iterator) {
      if (!mc.getScoreObjective(item[0])) {
        this.#scoreboards.delete(item[0])
      }
    }
  }

  // 重载计分板映射
  reloadScoreboard(objective) {
    const key = this.#scoreboards.get(objective).key
    const players = this.getPlayerList()
    let leftPlayers = new Set([...data.getAllPlayerInfo().map(item => item.name), ...players])
    for (let i = 0; i < players.length; i++) {
      this.#setScoreboard(objective, players[i], this.get(players[i], key))
      leftPlayers.delete(players[i])
    }
    const leftPlayerList = Array.from(leftPlayers)
    for (let i = 0; i < leftPlayerList.length; i++) {
      this.#setScoreboard(objective, leftPlayerList[i], 0)
    }
    return true
  }

  // 重载全部计分板映射
  reloadAllScoreboards() {
    const iterator = this.#scoreboards[Symbol.iterator]()
    for (const item of iterator) {
      this.reloadScoreboard(item[0])
    }
    return true
  }

  // 获取方块放置记录
  getPlacedBlocks() {
    return this.#placedBlocks
  }

  // 设置新的方块放置记录
  addPlacedBlock(intPos) {
    return this.#placedBlocks.add([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 删除方块放置记录
  deletePlacedBlock(intPos) {
    return this.#placedBlocks.delete([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 查询是否存在方块放置记录
  hasPlacedBlock(intPos) {
    return this.#placedBlocks.has([intPos.x, ',', intPos.y, ',', intPos.z, ',', intPos.dimid].join(''))
  }

  // 获取有数据的玩家列表
  getPlayerList() {
    const playerSet = new Set([...this.#kvdb.listKey(), ...this.#db.keys()])
    playerSet.delete('data')
    return Array.from(playerSet)
  }

  // 查询是否有该玩家的数据
  hasPlayer(name) {
    return this.getPlayerList().includes(name)
  }

  // 获取玩家某一项统计
  get(name, key) {
    return this.#dbQuery(name)[key]
  }

  // 获取玩家某一子项统计
  getSub(name, key, subKey) {
    return this.#dbQuery(name).subStats[key][subKey]
  }

  // 获取玩家所有统计
  getPlayer(name) {
    return this.#dbQuery(name)
  }

  // 获取所有玩家的统计
  getPlayers() {
    let names = null
    if (this.#backupFlag) {
      names = Array.from(this.#db.keys())
    } else {
      names = this.getPlayerList()
    }
    let statsArray = []
    for (let i = 0; i < names.length; i++) {
      statsArray.push({ name: names[i], data: this.getPlayer(names[i]) })
    }
    return statsArray
  }

  // 获取某一项的排行
  getRanking(key) {
    function sort(items, left = 0, right = items.length - 1) {
      function swap(items, leftIndex, rightIndex) {
        let temp = items[leftIndex]
        items[leftIndex] = items[rightIndex]
        items[rightIndex] = temp
      }
      function partition(items, left, right) {
        let pivot = items[Math.floor((right + left) / 2)],
          i = left,
          j = right
        while (i <= j) {
          while (items[i].data > pivot.data) {
            i++
          }
          while (items[j].data < pivot.data) {
            j--
          }
          if (i <= j) {
            swap(items, i, j)
            i++
            j--
          }
        }
        return i
      }
      let index
      if (items.length > 1) {
        index = partition(items, left, right)
        if (left < index - 1) {
          sort(items, left, index - 1)
        }
        if (index < right) {
          sort(items, index, right)
        }
      }
      return items
    }
    const names = this.getPlayerList()
    let ranking = []
    for (let i = 0; i < names.length; i++) {
      ranking.push({ name: names[i], data: this.getPlayer(names[i])[key] })
    }
    return sort(ranking)
  }

  // 设置玩家某一项统计
  set(name, key, operator, value) {
    let playerData = this.#dbMountQuery(name)
    switch (operator) {
      case 'set':
        playerData[key] = value
        break
      case 'add':
        playerData[key] += value
        break
      case 'reduce':
        playerData[key] -= value
        break
      default:
        return false
    }
    this.#getScoreboardsByKey(key).forEach(ob => {
      this.#setScoreboard(ob, name, playerData[key])
    })
    return true
  }

  // 设置某一子项统计
  setSub(name, key, subKey, operator, value) {
    let playerData = this.#dbMountQuery(name)
    switch (operator) {
      case 'set':
        playerData.subStats[key][subKey] = value
        break
      case 'add':
        playerData.subStats[key][subKey] += value
        break
      case 'reduce':
        playerData.subStats[key][subKey] -= value
        break
      default:
        return false
    }
    this.#db.set(name, playerData)
    return true
  }

  // 删除某个玩家统计信息
  deletePlayer(name) {
    this.#db.delete(name)
    this.#kvdb.delete(name)
    this.#dbUpdateTime()
    const iterator = this.#scoreboards[Symbol.iterator]()
    for (const item of iterator) {
      this.#setScoreboard(item[0], name, 0)
    }
    return true
  }

  // 内存中卸载玩家数据
  unmountPlayer(name) {
    this.#dbUnmount(name)
  }

  // 数据库热备份
  dbBackup() {
    this.#clearSaveTimer()
    this.#backupFlag = true
    this.#dbSaveAll()
    this.#kvdb.close()

    let success = false
    const timeObj = system.getTimeObj()
    const path = [this.#backupLocation, '/', timeObj.Y, '-', timeObj.M < 10 ? '0' + timeObj.M : timeObj.M, '-', timeObj.D < 10 ? '0' + timeObj.D : timeObj.D, '_', timeObj.h < 10 ? '0' + timeObj.h : timeObj.h, '-', timeObj.m < 10 ? '0' + timeObj.m : timeObj.m, '-', timeObj.s < 10 ? '0' + timeObj.s : timeObj.s].join('')
    if (File.exists(path)) {
      success = false
    } else {
      if (!File.mkdir(path)) {
        success = false
      } else {
        if (File.copy(this.#dbPath, path)) {
          success = true
        } else {
          success = false
        }
      }
    }
    this.#kvdb = new KVDatabase(this.#dbPath)
    this.#backupFlag = false
    while (this.#mountQueue.length !== 0) {
      const name = this.#mountQueue.shift()
      this.#db.set(name, this.#dataAssign(this.#db.get(name), this.#kvdb.get(name)))
    }
    while (this.#unmountQueue.length !== 0) {
      this.#dbUnmount(this.#unmountQueue.shift())
    }
    this.#createSaveTimer()
    return success
  }
}