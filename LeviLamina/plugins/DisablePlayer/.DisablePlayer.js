// 常量和全局变量
const disabledPlayersFilePath = 'plugins/DisablePlayer/disabled-players.json';
const bannedDevicesFilePath = 'plugins/DisablePlayer/banned-devices.json';

// 初始化
initConfigFiles()

// 事件监听
const events = ['onPlayerCmd', 'onRespawn', 'onChat', 'onChangeDim', 'onJump', 'onSneak', 'onAttackEntity', 'onAttackBlock', 'onUseItem', 'onUseItemOn', 'onUseBucketPlace', 'onTakeItem', 'onStartDestroyBlock', 'onDestroyBlock', 'onPlaceBlock', 'onOpenContainer', 'onChangeSprinting', 'onUseRespawnAnchor', 'onOpenContainerScreen'];
events.forEach(event => {
    mc.listen(event, (pl) => {
        if (isDisabled(pl)) {
            if (isInExclusionList(pl.uuid)) return true;
            sendInfoForm(pl, event);
            return false;
        }
    });
});

mc.listen('onJoin', async (pl) => {
    const name = pl.realName;
    const deviceId = pl.getDevice().clientId;
    log("uuid:" + pl.uuid + ' clientId:' + deviceId);
    if (isInExclusionList(pl.uuid)) return;
    if (!isDisabled(pl)) { // 普通玩家进服务器
        if (isBannedDevice(deviceId)) { // 玩家使用被封禁的设备进入游戏
            const reason = '使用被封禁的设备';
            addToDisabledList(pl, reason);
            pl.setGameMode(2);

            // 记录到日志
            const content = `[${getDateAndTime()}] + ${name}
    info: ${reason}
    uuid: ${pl.uuid}
    xuid: ${pl.xuid}
    deviceid: ${deviceId}
    ip: ${pl.getDevice().ip}\n`;

            return;
        }

        // 检测云黑
        const result = await isBlackBeBanned(name);
        if (result) {
            addToDisabledList(pl, '云黑检测');
            if (!isBannedDevice(deviceId)) {
                addBannedDevice(deviceId);
            }
            log('检测到云黑玩家 ' + name);
            pl.setGameMode(2);
        } else {
            log(name + '通过云黑检测');
        }
    } else { // 被记录的玩家进入服务器
        const content = `[${getDateAndTime()}] + ${name}
    deviceid: ${deviceId}
    ip: ${pl.getDevice().ip}`;

        pl.setGameMode(2);
        if (!isBannedDevice(deviceId)) {
            addBannedDevice(deviceId);
        }
    }
});


// 函数
function initConfigFiles() {
    new JsonConfigFile(disabledPlayersFilePath, '{"exclusionList":[]}');
    new JsonConfigFile(bannedDevicesFilePath, '{"banned-devices":[]}');
}

function sendInfoForm(pl, event = '') {
    const disabledPlayersFile = new JsonConfigFile(disabledPlayersFilePath);
    const plinfo = disabledPlayersFile.get(pl.uuid);
    const reason = plinfo.reason ? plinfo.reason : '';
    const time = plinfo.time ? plinfo.time : '';
    let content = Format.Red + '你已被记录到黑名单, 无法进行大部分操作。\n如果你认为这是误封, 请加入群组申请封禁豁免。\n\n' + Format.Clear;
    content += '封禁原因: ' + reason + '\n';
    content += '封禁时间: ' + time + '\n';
    content += 'UUID: ' + pl.uuid + '\n';
    content += 'XUID: ' + pl.xuid + '\n';
    content += 'NAME: ' + pl.realName + '\n\n';
    content += '群号(QQ): xxxxxxxxx';

    const fm = mc.newSimpleForm();
    fm.setTitle(event + ' 已拦截');
    fm.setContent(content);

    pl.sendForm(fm, (pl, id) => {
        return;
    });
}

function isInExclusionList(uuid) {
    const disabledPlayersFile = new JsonConfigFile(disabledPlayersFilePath);
    const exclusionList = disabledPlayersFile.get('exclusionList');
    if (exclusionList.includes(uuid)) return true;
    return false;
}

function isBannedDevice(deviceId) {
    const bannedDevicesFile = new JsonConfigFile(bannedDevicesFilePath);
    const bannedDevices = bannedDevicesFile.get('banned-devices');
    if (bannedDevices.includes(deviceId)) return true;
    return false;
}

function addBannedDevice(deviceId) {
    const bannedDevicesFile = new JsonConfigFile(bannedDevicesFilePath);
    const bannedDevices = bannedDevicesFile.get('banned-devices');
    bannedDevices.push(deviceId);
    bannedDevicesFile.set('banned-devices', bannedDevices);
}

function isDisabled(pl) {
    const uuid = pl.uuid;
    const disabledPlayersFile = new JsonConfigFile(disabledPlayersFilePath);
    const playerJailData = disabledPlayersFile.get(uuid);
    if (!playerJailData) return false;
    return true;
}

function addToDisabledList(pl, reason = '') {
    const disabledPlayersFile = new JsonConfigFile(disabledPlayersFilePath);
    const uuid = pl.uuid;
    const name = pl.realName;
    const xuid = pl.xuid;
    const deviceId = pl.getDevice().deviceId;
    disabledPlayersFile.set(uuid, { 'name': name, 'xuid': xuid, 'reason': reason, 'time': getDateAndTime() });
}

function getDateAndTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = date.getDate();
    if (day < 10) day = "0" + day;
    var hour = date.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = date.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = date.getSeconds();
    if (second < 10) second = "0" + second;
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

async function isBlackBeBanned(realname) {
    // 代码来自：https://www.minebbs.com/resources/banpl-blackbe-mojangapi-geyserapi-gui.7131/
    // 云黑检查
    let BlackBeBanned = false;
    const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms, null));

    BlackBeBanned = await Promise.race([
        new Promise((resolve) => {
            network.httpGet("https://api.blackbe.work/openapi/v3/check/?name=" + encodeURIComponent(realname), (status, result) => {
                if(status === 200 && JSON.parse(result)
                    .status === 2000) {
                    resolve(true);
                } else {
                    resolve(false); // 如果状态不是200，立即解析为null
                }
            });
        }),
        timeout(30000) // 设置超时时间为30000ms（30秒）
    ]);

    return BlackBeBanned;
}