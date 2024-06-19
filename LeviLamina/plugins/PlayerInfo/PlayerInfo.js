const pluginName = "PlayerInfo";
const dataPath = "plugins/PlayerInfo/data.json";
const DEBUG = false;
let dataFile = new JsonConfigFile(dataPath, '{ "uuid-index": [], "xuid-index": [], "name-index": [], "players": [] }');

ll.exports(uuid2name, "PLINFO", "uuid2name");
ll.exports(xuid2name, "PLINFO", "xuid2name");
ll.exports(name2uuid, "PLINFO", "name2uuid");
ll.exports(name2xuid, "PLINFO", "name2xuid");
ll.exports(getAllPlayerInfo, "PLINFO", "getAllPlayerInfo");

mc.listen("onServerStarted", () => {
    updateIndex();
});

mc.listen("onPreJoin", (pl) => {
    const uuid = pl.uuid;
    const xuid = pl.xuid;
    const realname = pl.realName;
    const uuidIdx = findUuidIndex(uuid);

    if (uuidIdx === -1) {
        insertNewPlayerInfo(uuid, xuid, realname);
    } else {
        // 更新最后登录时间
        updatePlayerInfo(uuid, [xuid, realname, null, getNow()]);
    }

    updateIndex();
});

mc.listen("onLeft", (pl) => {
    const uuid = pl.uuid;

    updatePlayerInfo(uuid, [null, null, null, getNow()]);

    updateIndex();
});

function uuid2name(uuid) {
    const uuidIdx = findUuidIndex(uuid);
    const realname = uuidIdx === -1 ? null : dataFile.get("players")[uuidIdx][2];

    if (DEBUG) {
        log("[" + pluginName + "] Name found for " + uuid + ": " + realname);
    }

    return realname;
}

function xuid2name(xuid) {
    const xuidIdx = findXuidIndex(xuid);
    const realname = xuidIdx === -1 ? null : dataFile.get("players")[xuidIdx][2];

    if (DEBUG) {
        log("[" + pluginName + "] Name found for " + xuid + ": " + realname);
    }

    return realname;
}

function name2uuid(name) {
    const nameIdx = findNameIndex(name);
    const uuid = nameIdx === -1 ? null : dataFile.get("players")[nameIdx][0];

    if (DEBUG) {
        log("[" + pluginName + "] UUID found for " + name + ": " + uuid);
    }

    return uuid;
}

function name2xuid(name) {
    const nameIdx = findNameIndex(name);
    const xuid = nameIdx === -1 ? null : dataFile.get("players")[nameIdx][1];

    if (DEBUG) {
        log("[" + pluginName + "] XUID found for " + name + ": " + xuid);
    }

    return xuid;
}

function getAllPlayerInfo() {
    refreshDataFile();

    const players = dataFile.get("players").map(player => {
        return {
            uuid: player[0],
            xuid: player[1],
            name: player[2],
            date: player[3],
            lastlogin: player[4]
        };
    });

    if (DEBUG) {
        log("[" + pluginName + "] All player info retrieved, total " + players.length + " players.");
    }

    return players;
}

function insertNewPlayerInfo(uuid, xuid, realname) {
    if (DEBUG) {
        log(realname);
    }
    
    const players = dataFile.get("players");
    const uuidIndex = dataFile.get("uuid-index");
    const xuidIndex = dataFile.get("xuid-index");
    const nameIndex = dataFile.get("name-index");
    const nowTime = getNow();

    const player = [uuid, xuid, realname, nowTime, nowTime];
    const index = players.push(player) - 1;

    uuidIndex.push(index);
    xuidIndex.push(index);
    nameIndex.push(index);

    dataFile.set("players", players);
    dataFile.set("uuid-index", uuidIndex);
    dataFile.set("xuid-index", xuidIndex);
    dataFile.set("name-index", nameIndex);

    if (DEBUG) {
        log("[" + pluginName + "] New player info inserted: " + JSON.stringify(player));
    }

    updateIndex();
}

/**
 * updatePlayerInfo() returns nothing
 * 根据uuid更新玩家信息
 * data: [xuid, name, date, lastlogin] 如果不需要更新，传入null
 *
 * @param {String} uuid
 * @param {Array} data
 */
function updatePlayerInfo(uuid, data) {
    refreshDataFile();

    const players = dataFile.get("players");

    const uuidIdx = findUuidIndex(uuid);
    const [xuid, realname, date, lastlogin] = data;

    if (uuidIdx === -1) {
        log("[" + pluginName + "] Player with uuid " + uuid + " not found.");
    } else {
        const player = players[uuidIdx];
        player[1] = xuid ? xuid : player[1];
        player[2] = realname ? realname : player[2];
        player[3] = date ? date : player[3];
        player[4] = lastlogin ? lastlogin : player[4];

        players[uuidIdx] = player;

        dataFile.set("players", players);

        if (DEBUG) {
            log("[" + pluginName + "] Player info updated: " + JSON.stringify(player));
        }
    }

    updateIndex();
}

// function updatePlayerInfo2(pl) { // Not tested
//     refreshDataFile();

//     const players = dataFile.get("players");
//     const uuid = pl.uuid;
//     const xuid = pl.xuid;
//     const name = pl.realName;
//     const uuidIdx = findUuidIndex(uuid);

//     if (uuidIdx === -1) {
//         insertNewPlayerInfo(uuid, xuid, name);
//     } else {
//         const player = players[uuidIdx];
//         player[1] = xuid;
//         player[2] = name;
//         player[4] = getNow();

//         players[uuidIdx] = player;

//         dataFile.set("players", players);
//     }

//     updateIndex();
// }

function updateIndex() {
    refreshDataFile();

	const players = dataFile.get("players");
    const playerCount = players.length;
    const uuidIdx = dataFile.get("uuid-index");
    const xuidIdx = dataFile.get("xuid-index");
    const nameIdx = dataFile.get("name-index");
    let indices;
    if (uuidIdx.length != playerCount || xuidIdx.length != playerCount || nameIdx.length != playerCount) { // 简单的数据长度校验
        indices = [[], [], []];

        for (let i = 0; i < playerCount; i++) { // 分配索引
            indices.forEach(index => index.push(i));
        }
    } else {
        indices = [uuidIdx, xuidIdx, nameIdx];
    }

    if (DEBUG) {
        log("[" + pluginName + "] Indices before sorting: " + JSON.stringify(indices));
    }

	indices.forEach((index, idx) => { // 根据uuid, xuid, name排序
		index.sort((a, b) => {
			return players[a][idx].localeCompare(players[b][idx]);
		});
	});

    if (DEBUG) {
        log("[" + pluginName + "] Indices after sorting: " + JSON.stringify(indices));
    }

	let [uuidIndex, xuidIndex, nameIndex] = indices;

	dataFile.set("uuid-index", uuidIndex);
	dataFile.set("xuid-index", xuidIndex);
	dataFile.set("name-index", nameIndex);
}

function findIndex(indexName, target) {
    refreshDataFile();

    const players = dataFile.get("players");
    const index = dataFile.get(indexName);
    const targetIndex = binarySearch(index.map(i => players[i][indexName === "uuid-index" ? 0 : indexName === "xuid-index" ? 1 : 2]), target);
    
    if (targetIndex === -1) {
        if (DEBUG) {
            log("[" + pluginName + "] " + indexName + " not found for " + target);
        }
        return -1;
    } else {
        if (DEBUG) {
            log("[" + pluginName + "] " + indexName + " found for " + target + " at " + targetIndex);
        }
        return index[targetIndex];
    }
}

function findUuidIndex(uuid) {
    return findIndex("uuid-index", uuid);
}

function findXuidIndex(xuid) {
    return findIndex("xuid-index", xuid);
}

function findNameIndex(name) {
    return findIndex("name-index", name);
}


function binarySearch(array, target) { // 二分查找
	let left = 0;
	let right = array.length - 1;

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);

		if (array[mid] === target) {
			return mid; // 找到目标，返回其索引
		}
		if (array[mid] < target) {
			left = mid + 1; // 继续在右半部分搜索
		} else {
			right = mid - 1; // 继续在左半部分搜索
		}
	}

	return -1; // 没有找到目标
}

function timestamp2Date(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function getNow() {
    return Date.now();
}

function refreshDataFile() {
    dataFile = new JsonConfigFile(dataPath);
    if (DEBUG) {
        log("[" + pluginName + "] Data file refreshed.");
    }
}