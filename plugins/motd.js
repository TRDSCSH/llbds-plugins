let motd;

setInterval(() => {
    motd = `${getTimeStr(mc.getTime(0))} · ${mc.getWeather() ? (mc.getWeather() == 1 ? "雨" : "雷") : "晴"}`;
    mc.setMotd(motd);
}, 500);

function getTimeStr(time) {
    // 0-5500 早上 5500-7500 中午 7500-12000 下午 12000-13000 傍晚 13000-18000 晚上 18000-19000 午夜 19000-21500 深夜 21500-23000 凌晨 23000-25000 日出
    if (time > 0 && time <= 5500) {
        return "早上";
    } else if (time > 5500 && time <= 7500) {
        return "中午";
    } else if (time > 7500 && time <= 12000) {
        return "下午";
    } else if (time > 12000 && time <= 13000) {
        return "傍晚";
    } else if (time > 13000 && time <= 18000) {
        return "晚上";
    } else if (time > 18000 && time <= 19000) {
        return "午夜";
    } else if (time > 19000 && time <= 21500) {
        return "深夜";
    } else if (time > 21500 && time <= 23000) {
        return "凌晨";
    } else if (time > 23000 && time <= 25000) {
        return "日出";
    }
}