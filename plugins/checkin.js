const red = "§c";
const yellow = "§e";
const purple = "§d";
const white = "§f";
const grey = "§7";
const blue = "§9";
const aqua = "§b";
const darkGreen = "§2";
const green = "§a";
const clear = "§r";
const bold = "§l";
const databasePath = "plugins/checkin/data/";
const database = new KVDatabase(databasePath);

mc.listen("onJoin", (pl) => {
    const playerXuid = pl.xuid;
    if (!isChecked(playerXuid, getCurrentYear(), getCurrentMonth(), getCurrentDate())) {
        showCheckinMenu(pl);
    }
});

mc.regPlayerCmd("checkin", "§r显示签到菜单", showCheckinMenu);

function showCheckinMenu(pl) {
    const playerXuid = pl.xuid;
    const consecutiveCheckinDays = getConsecutiveCheckinDays(playerXuid, getCurrentYear(), getCurrentMonth(), getCurrentDate());
    const isCheckedToday = isChecked(playerXuid, getCurrentYear(), getCurrentMonth(), getCurrentDate());
    const playerCheckinData = database.get(playerXuid);
    let lastCheckinDate = null;
    if (playerCheckinData) {
        lastCheckinDate = playerCheckinData.lastCheckinDate;
    }
    const addition = consecutiveCheckinDays * 60;
    const moneyCount = 500 + addition;
    const randomMoneyMin = 100 + addition;
    const randomMoneyMax = 1000 + addition;
    const label0 = `欢迎来到每日签到系统， ${pl.realName}！\n`;
    const label1 = `今天是 ${new Date().toLocaleDateString()} ， ${consecutiveCheckinDays > 0 ? `您已连续签到 ${consecutiveCheckinDays} 天！` : "欢迎加入游戏！"}`;
    const label2 = `${getCalendar(getCurrentYear(), getCurrentMonth(), getCurrentDate(), playerXuid)}`;
    const label4 = `${lastCheckinDate ? `上次签到: ${lastCheckinDate}` : ""}${isCheckedToday ? "" : "\n点击下面的按钮即可签到！"}`;
    const form = mc.newCustomForm()
        .setTitle("每日签到")
        .addLabel(label0)
        .addLabel(label1)
        .addLabel(label2)
        .addDropdown(isCheckedToday ? "明日签到奖励" : "选择你的签到奖励", [moneyCount + " 金币", `${randomMoneyMin} 到 ${randomMoneyMax} 之间的随机金币`])
        .addLabel(label4);
    pl.sendForm(form, (pl, data) => {
        if (data == null) {
            if (!isCheckedToday) pl.tell("§7[§6■§7]§r 签到菜单被关闭，使用“checkin”命令可再次打开。");
        } else {
            if (!isCheckedToday) {
                checkin(playerXuid, getCurrentYear(), getCurrentMonth(), getCurrentDate());
                if (data[3] == 0) {
                    pl.addMoney(moneyCount);
                    pl.tell(`§7[§a■§7]§r 签到成功！获得 ${moneyCount} 金币。`);
                } else if (data[3] == 1) {
                    let randomMoney = Math.floor(Math.random() * (randomMoneyMax - randomMoneyMin + 1) + randomMoneyMin);
                    pl.addMoney(randomMoney);
                    pl.tell(`§7[§a■§7]§r 签到成功！ 获得 ${randomMoney} 金币。`);
                }
            } else {
                pl.tell("§7[§c■§7]§r 今天已经签到过了！");
            }
        }
    });
}

/*
    数据库结构:
    {
        "playerXuid": {
            "playerName": "playerName", // 参考玩家名：String
            "lastCheckinDate": "2020-01-01 11:11:11", // 上次签到日期：String
            "2023":{
                "1": {
                    "1": true,
                    "2": true,
                    ...
                    "31": true
                },
                "2": { ... },
                ...
                "12": { ... }
            },
            "2024": {
                ...
            }
        }
    }
*/

function initPlayerCheckinData(playerXuid, currentDateText) {
    if (currentDateText == null) currentDateText = getCurrentDateAndTime();
    const playerName = data.xuid2name(playerXuid);
    const playerCheckinData = {
        "playerName": playerName,
        "lastCheckinDate": currentDateText
    }
    database.set(playerXuid, playerCheckinData);
}

function checkin(playerXuid, year, month, day) {
    if (year == null) year = getCurrentYear().toString();
    if (month == null) month = getCurrentMonth().toString();
    if (day == null) day = getCurrentDate().toString();
    let playerCheckinData = database.get(playerXuid);
    const currentDateText = getCurrentDateAndTime();
    if (playerCheckinData == null) {
        initPlayerCheckinData(playerXuid, currentDateText);
        playerCheckinData = database.get(playerXuid);
    }
    if (isChecked(playerXuid, year, month, day)) {
        return false;
    } else {
        playerCheckinData.lastCheckinDate = currentDateText;
        let yearData = playerCheckinData[year];
        if (yearData == null) {
            playerCheckinData[year.toString()] = {};
            yearData = playerCheckinData[year];
        }
        let monthData = yearData[month.toString()];
        if (monthData == null) {
            yearData[month.toString()] = {};
            monthData = yearData[month];
        }
        let dayData = monthData[day];
        if (dayData == null) {
            monthData[day.toString()] = true;
        }
        database.set(playerXuid, playerCheckinData);
    }
    return true;
}

function isChecked(xuid, year, month, day) {
    year = year.toString();
    month = month.toString();
    day = day.toString();
    const playerCheckinData = database.get(xuid);
    if (playerCheckinData == null) return false;
    const yearData = playerCheckinData[year];
    if (yearData == null) return false;
    const monthData = yearData[month];
    if (monthData == null) return false;
    const dayData = monthData[day];
    if (dayData == null) return false;
    return dayData;
}

function getConsecutiveCheckinDays(playerXuid, year, month, day) {
    const playerCheckinData = database.get(playerXuid);
    if (playerCheckinData == null) return 0;
    let consecutiveCheckinDays = 0;
    if (isChecked(playerXuid, year, month, day)) consecutiveCheckinDays++;
    day--;
    if (day == 0) {
        month--;
        if (month == 0) {
            year--;
            month = 12;
        }
        day = new Date(year, month, 0).getDate();
    }
    while (isChecked(playerXuid, year, month, day)) {
        consecutiveCheckinDays++;
        day--;
        if (day == 0) {
            month--;
            if (month == 0) {
                year--;
                month = 12;
            }
            day = new Date(year, month, 0).getDate();
        }
    }
    return consecutiveCheckinDays;
}

function getCalendar(year, month, day, playerXuid) {
    let checkedDays = [];
    const playerCheckinData = database.get(playerXuid);
    if (playerCheckinData != null) {
        const yearData = playerCheckinData[year.toString()];
        if (yearData != null) {
            const monthData = yearData[month.toString()];
            if (monthData != null) {
                checkedDays = Object.keys(monthData);
            }
        }
    }

    // 获取指定年月的第一天
    var firstDay = new Date(year, month - 1, 1);

    // 获取指定年月的总天数
    var lastDay = new Date(year, month, 0).getDate();

    // 获取指定年月的第一天是星期几
    var firstDayOfWeek = firstDay.getDay();

    // 定义星期几的数组
    var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 输出星期几
    var calendar = "丨 " + grey + weekdays.join(' ') + clear + '\n';

    // 表示当前日期
    var currentDate = new Date();
    var currentDay = day || currentDate.getDate();

    // 表示日期
    var date = 1;

    // 填充第一行的空白
    calendar += "丨 ";
    for (var i = 0; i < firstDayOfWeek; i++) {
        calendar += '    ';
    }

    // 输出日期
    for (var j = firstDayOfWeek; j < 7; j++) {
        if (date === currentDay) {
            if (checkedDays.includes(date.toString())) {
                calendar += green + (date < 10 ? ' ' : '') + date + clear + '  ';
            } else {
                calendar += aqua + bold + ' ' + (date < 10 ? ' ' : '') + date + ' ' + clear + '  ';
            }
        } else {
            if (date <= currentDay) {
                if (checkedDays.includes(date.toString())) {
                    calendar += darkGreen + (date < 10 ? ' ' : '') + date + clear + '  ';
                } else {
                    calendar += (date < 10 ? ' ' : '') + date + '  ';
                }
            } else {
                calendar += grey + (date < 10 ? ' ' : '') + date + clear + '  ';
            }
        }
        date++;
    }

    calendar += '\n';

    // 输出剩余的日期
    while (date <= lastDay) {
        for (var k = 0; k < 7; k++) {
            if (date <= lastDay) {
                if (k === 0) calendar += "丨 ";
                if (date === currentDay) {
                    if (checkedDays.includes(date.toString())) {
                        calendar += green + ' ' + (date < 10 ? ' ' : '') + date + ' ' + clear;
                    } else {
                        calendar += aqua + bold + ' ' + (date < 10 ? ' ' : '') + date + ' ' + clear;
                    }
                } else if (date < currentDay) {
                    if (checkedDays.includes(date.toString())) {
                        calendar += darkGreen + ' ' + (date < 10 ? ' ' : '') + date + ' ' + clear;
                    } else {
                        calendar += ' ' + (date < 10 ? ' ' : '') + date + ' ';
                    }
                } else {
                    calendar += grey + ' ' + (date < 10 ? ' ' : '') + date + ' ' + clear;
                }
            } else {
                if (k === 0) calendar += "丨 ";
                calendar += '    ';
            }
            date++;
        }
        calendar += '\n';
    }

    return calendar;
}

// 返回当前年份
function getCurrentYear() {
    var currentDate = new Date();
    return currentDate.getFullYear();
}

// 返回当前月份
function getCurrentMonth() {
    var currentDate = new Date();
    // 月份从 0 开始，需要加 1
    return currentDate.getMonth() + 1;
}

// 返回当前日期
function getCurrentDate() {
    var currentDate = new Date();
    return currentDate.getDate();
}

function getCurrentDateAndTime() {
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

/*
测试代码：
let database = {
    "114514": {
        "playerName": "playerName", // 参考玩家名：String
        "lastCheckinDate": "2020-01-01 11:11:11", // 上次签到日期：String
        "2023":{
            "1": {
                "1": true,
                "2": true,
                "31": true
            },
            "2": {
                "1": true,
                "2": true
            },
            "12": {
                "31": true
            }
        },
        "2024": {
            "1": {
                "1": true
            }
        }
    }
}
    
console.log(getConsecutiveCheckinDays("114514", 2024, 1, 2));

function isChecked(xuid, year, month, day) {
    year = year.toString();
    month = month.toString();
    day = day.toString();
    const playerCheckinData = database[xuid];
    if (playerCheckinData == null) return false;
    const yearData = playerCheckinData[year];
    if (yearData == null) return false;
    const monthData = yearData[month];
    if (monthData == null) return false;
    const dayData = monthData[day];
    if (dayData == null) return false;
    return dayData;
}

function getConsecutiveCheckinDays(playerXuid, year, month, day) {
    const playerCheckinData = database[playerXuid];
    if (playerCheckinData == null) return 0;
    let consecutiveCheckinDays = 0;
    if (isChecked(playerXuid, year, month, day)) consecutiveCheckinDays++;
    day--;
    if (day == 0) {
        month--;
        if (month == 0) {
            year--;
            month = 12;
        }
        day = new Date(year, month, 0).getDate();
    }
    while (isChecked(playerXuid, year, month, day)) {
        consecutiveCheckinDays++;
        day--;
        if (day == 0) {
            month--;
            if (month == 0) {
                year--;
                month = 12;
            }
            day = new Date(year, month, 0).getDate();
        }
    }
    return consecutiveCheckinDays;
}

*/