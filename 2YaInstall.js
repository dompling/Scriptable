// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: download;

//订阅地址
const subscriptionURL = 'https://raw.githubusercontent.com/dompling/Scriptable/master/install.json';

class YaYaInstall {
  constructor() {
    this.request = new Request('');
    this.files = FileManager.iCloud();
    this.rootPath = this.files.documentsDirectory();
    this.defaultHeaders = {
      Accept: '*/*',
      'Content-Type': 'application/json',
    };
  }

  saveFileName = (fileName) => {
    const hasSuffix = fileName.lastIndexOf('.') + 1;
    return !hasSuffix ? `${fileName}.js` : fileName;
  };

  write = (fileName, content) => {
    let file = this.saveFileName(fileName);
    const filePath = `${this.rootPath}/${file}`;
    FileManager.iCloud().writeString(filePath, content);
    return true;
  };

  fetchUrlString = async ({url, headers = {}}, callback = () => {}) => {
    this.request.url = url;
    this.request.method = 'GET';
    this.request.headers = {
      ...headers,
      ...this.defaultHeaders,
    };
    const data = await this.request.loadString();
    callback(this.request.response, data);
    return data;
  };

  saveFile = async ({moduleName, url}) => {
    const header = `// Variables used by Scriptable.
  // These must be at the very top of the file. Do not edit.
  // icon-color: deep-gray; icon-glyph: file-code;\n`;
    const content = await this.fetchUrlString({url});
    const fileHeader = content.includes('icon-color') ? `` : header;
    this.write(`${moduleName}`, `${fileHeader}${content}`);
  };

  install = async () => {
    console.log('🤖更新开始!');
    const req = new Request(subscriptionURL);
    const subscription = await req.loadJSON();
    const apps = subscription.apps;
    for (const script of apps) {
      await this.saveFile({moduleName: script.name, url: script.scriptURL});
      // console.log(script.moduleName + '：更新成功');
    }
    console.log('🤖更新结束!');
  };
}

await new YaYaInstall().install();
