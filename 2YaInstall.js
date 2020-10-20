// 安装引入 Env 包：https://raw.githubusercontent.com/GideonSenku/Scriptable/master/Env.scriptable
const scripts = [
  {
    moduleName: "Calendar",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/birthdayCountDown/Components/Calendar.js",
  },
  {
    moduleName: "Birthday",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/birthdayCountDown/index.js",
  },
];

// Install Scripts.js
const $ = importModule("Env");
function update() {
  log("🔔更新脚本开始!");
  scripts.forEach((script) => {
    $.getFile(script);
  });
  log("🔔更新脚本结束!");
}
update();
