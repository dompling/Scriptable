// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: download;

const scripts = [
  {
    moduleName: "Env",
    url:
      "https://raw.githubusercontent.com/GideonSenku/Scriptable/master/Env.js",
  },
  {
    moduleName: "ZhihuMonitor",
    url:
      "https://raw.githubusercontent.com/evilbutcher/Scriptables/master/ZhihuMonitor.js",
  },
  {
    moduleName: "2YaInstall",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/2YaInstall.js",
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

class YaYaInstall {
  constructor() {
    this.request = new Request("");
    this.files = FileManager.iCloud();
    this.dict = this.files.documentsDirectory();
    this.defaultHeaders = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };
  }

  initFile = (fileName) => {
    const hasSuffix = fileName.lastIndexOf(".") + 1;
    return !hasSuffix ? `${fileName}.js` : fileName;
  };

  write = (fileName, content) => {
    let file = this.initFile(fileName);
    const filePath = `${this.dict}/${file}`;
    FileManager.iCloud().writeString(filePath, content);
    return true;
  };

  getStr = async ({ url, headers = {} }, callback = () => {}) => {
    this.request.url = url;
    this.request.method = "GET";
    this.request.headers = {
      ...headers,
      ...this.defaultHeaders,
    };
    const data = await this.request.loadString();
    callback(this.request.response, data);
    return data;
  };

  getFile = async ({ moduleName, url }) => {
    console.log(`开始下载文件: 🌝 ${moduleName}`);
    const header = `// Variables used by Scriptable.
  // These must be at the very top of the file. Do not edit.
  // icon-color: deep-gray; icon-glyph: file-code;\n`;
    const content = await this.getStr({ url });
    console.log(content);
    const fileHeader = content.includes("icon-color") ? `` : header;
    this.write(`${moduleName}`, `${fileHeader}${content}`);
    console.log(`文件下载完成: 🌚 ${moduleName}`);
  };

  install = () => {
    console.log("🔔更新脚本开始!");
    scripts.forEach(async (script) => {
      await this.getFile(script);
    });
    console.log("🔔更新脚本结束!");
  };
}
new YaYaInstall().install();
