const backupPath = "plugins/ChatBackup/"
let dateStr = "", curFilename = "";

mc.listen("onChat", function (pl, msg) {
    startCheck();
    let time = getTime();
    let line = "[" + time + "] [" + pl.realName + "] " + msg;
    File.writeLine(backupPath + curFilename + ".txt", line);
});

mc.listen("onJoin", function (pl) {
    startCheck();
    let time = getTime();
    let line = "[" + time + "] + " + pl.realName;
    File.writeLine(backupPath + curFilename + ".txt", line);
});

mc.listen("onLeft", function (pl) {
    startCheck();
    let time = getTime();
    let line = "[" + time + "] - " + pl.realName;
    File.writeLine(backupPath + curFilename + ".txt", line);
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
    return File.readFrom(backupPath + filename + ".txt");
}

function initFile(filename) {
    let header = "Server version: " + mc.getBDSVersion() + "\n" + "Backup start time: " + getDateAndTime();
    File.writeLine(backupPath + filename + ".txt", header);
}

function addDateLine(filename) {
    let line = "\n" + "--- " + getDate2() + " ---";
    File.writeLine(backupPath + filename + ".txt", line);
}

function startCheck() {
    let date = getDate(), yearAndMonth = getYearAndMonth(), fileNotExists = 0;
    if (!fileExists(yearAndMonth)) {
        initFile(yearAndMonth);
        fileNotExists = 1;
    }
    if (dateStr != date || fileNotExists) {
        dateStr = date;
        addDateLine(yearAndMonth);
    }
    curFilename = yearAndMonth;
}