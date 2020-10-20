// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: download;

// 安装引入 Env 包：https://raw.githubusercontent.com/GideonSenku/Scriptable/master/Env.scriptable
const scripts = [
  {
    moduleName: "Env",
    url:
      "https://raw.githubusercontent.com/GideonSenku/Scriptable/master/Env.js",
  },
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

const currentDate = new Date();
const request = new Request("");
const files = FileManager.iCloud();
const dict = files.documentsDirectory();
files.isDirectory(`${dict}/Env`) ? `` : files.createDirectory(`${dict}/Env`);
const defaultHeaders = {
  Accept: "*/*",
  "Content-Type": "application/json",
};
const initFile = (fileName) => {
  const hasSuffix = fileName.lastIndexOf(".") + 1;
  return !hasSuffix ? `${fileName}.js` : fileName;
};

const write = (fileName, content) => {
  let file = initFile(fileName);
  const filePath = `${dict}/${file}`;
  FileManager.iCloud().writeString(filePath, content);
  return true;
};

const getStr = async ({ url, headers = {} }, callback = () => {}) => {
  request.url = url;
  request.method = "GET";
  request.headers = {
    ...headers,
    ...defaultHeaders,
  };
  const data = await request.loadString();
  callback(request.response, data);
  return data;
};

const getFile = async ({ moduleName, url }) => {
  console.log(`开始下载文件: 🌝 ${moduleName}`);
  const header = `// Variables used by Scriptable.
  // These must be at the very top of the file. Do not edit.
  // icon-color: deep-gray; icon-glyph: file-code;\n`;
  const content = await getStr({ url });
  console.log(content);
  const fileHeader = content.includes("icon-color") ? `` : header;
  write(`${moduleName}`, `${fileHeader}${content}`);
  console.log(`文件下载完成: 🌚 ${moduleName}`);
};

function update() {
  console.log("🔔更新脚本开始!");
  scripts.forEach(async (script) => {
    await getFile(script);
  });
  console.log("🔔更新脚本结束!");
}
update();
