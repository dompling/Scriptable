// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: download;

const scripts = [
  {
    moduleName: "Env",
    url:
      "https://raw.githubusercontent.com/GideonSenku/Scriptable/master/Env.js",
    // 感谢G大的 EnvJS (https://github.com/GideonSenku)
  },
  {
    moduleName: "Install",
    url:
      "https://raw.githubusercontent.com/GideonSenku/Scriptable/master/Install%20Scripts.js",
    // 感谢G大的 脚本库安装包 (https://github.com/GideonSenku)
  },
  {
    moduleName: "「小件件」开发环境",
    url:
      "https://gitee.com/im3x/Scriptables/raw/v2-dev/Scripts/%E3%80%8C%E5%B0%8F%E4%BB%B6%E4%BB%B6%E3%80%8D%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83.js",
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
  {
    moduleName: "historyToDay",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/historyToDay/index.js",
  },
  {
    moduleName: "DmYY",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js",
  },
  {
    moduleName: "JDDou",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/JDDou.js",
  },
  {
    moduleName: "JDDouK",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/JDDouK.js",
  },
  {
    moduleName: "JDWuLiu",
    url:
      "https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/JDWuLiu.js",
  },
];

class YaYaInstall {
  constructor() {
    this.request = new Request("");
    this.files = FileManager.iCloud();
    this.rootPath = this.files.documentsDirectory();
    this.defaultHeaders = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };
  }

  saveFileName = (fileName) => {
    const hasSuffix = fileName.lastIndexOf(".") + 1;
    return !hasSuffix ? `${fileName}.js` : fileName;
  };

  write = (fileName, content) => {
    let file = this.saveFileName(fileName);
    const filePath = `${this.rootPath}/${file}`;
    FileManager.iCloud().writeString(filePath, content);
    return true;
  };

  fetchUrlString = async ({ url, headers = {} }, callback = () => {}) => {
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

  saveFile = async ({ moduleName, url }) => {
    const header = `// Variables used by Scriptable.
  // These must be at the very top of the file. Do not edit.
  // icon-color: deep-gray; icon-glyph: file-code;\n`;
    const content = await this.fetchUrlString({ url });
    const fileHeader = content.includes("icon-color") ? `` : header;
    this.write(`${moduleName}`, `${fileHeader}${content}`);
  };

  install = () => {
    console.log("🤖更新开始!");
    scripts.forEach(async (script) => {
      await this.saveFile(script);
    });
    console.log("🤖更新结束!");
  };
}
new YaYaInstall().install();
