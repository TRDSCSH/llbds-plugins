const logFilePath = "logs/";
const bannedCommands = [
    "kill@e",
    "kill @e",
    "kill  @e",
    "kill   @e",
    "kill    @e",
    "kill     @e",
    "kill      @e",
    "kill       @e",
    "kill        @e"
];
const red = "§c";
const operationIsLoggedText = "\n§c行为已记录到日志§r";
const curFilename = "dangerousOperationsLog";
let dateStr = "";

mc.listen("onPlayerCmd", (pl, cmd) => {
    if (bannedCommands.includes(cmd)) {
        startCheck();
        let time = getTime();
        let line = "[" + time + "] " + "玩家 " + pl.realName + " 尝试使用指令: " + cmd;
        File.writeLine(logFilePath + curFilename + ".txt", line);
        pl.tell(red + "不允许使用危险指令!" + operationIsLoggedText);
        return false;
    }
});

function getYearAndMonth() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    return year + month;
}

function getDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = date.getDate();
    if (day < 10) day = "0" + day;
    return year + month + day;
}

function getDate2() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = date.getDate();
    if (day < 10) day = "0" + day;
    return year + "/" + month + "/" + day;
}

function getTime() {
    var date = new Date();
    var hour = date.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = date.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = date.getSeconds();
    if (second < 10) second = "0" + second;
    return hour + ":" + minute + ":" + second;
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

function fileExists(filename) {
    return File.readFrom(logFilePath + filename + ".txt");
}

function initFile(filename) {
    let header = "Server version: " + mc.getBDSVersion() + "\n" + "Time: " + getDateAndTime();
    File.writeLine(logFilePath + filename + ".txt", header);
}

function addDateLine(filename) {
    let line = "\n" + "--- " + getDate2() + " ---";
    File.writeLine(logFilePath + filename + ".txt", line);
}

function startCheck() {
    const date = getDate();
    if (dateStr != date) {
        dateStr = date;
        addDateLine(curFilename);
    }
}